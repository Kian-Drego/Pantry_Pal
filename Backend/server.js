const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking for ${numCPUs} CPUs`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // Restart worker
    cluster.fork();
  });
} else {
  const app = express();

  // --- MIDDLEWARE ---
  app.use(compression({ threshold: 0 })); // Compress all responses
  app.use(cors());

  // Increased limit to 5mb to allow for Base64 profile picture uploads
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // --- DATABASE CONNECTION ---
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(`✅ Worker ${process.pid} connected to MongoDB`))
    .catch(err => {
      console.error(`❌ Worker ${process.pid} MongoDB Connection Error:`, err.message);
    });

  // --- ROOT & HEALTH CHECK ---
  app.get('/', (req, res) => {
    res.status(200).json({
      status: "Online",
      message: "PantryPal API is cooking... 🍳",
      timestamp: new Date(),
      worker: process.pid
    });
  });

  // --- ROUTES ---
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/recipes', require('./routes/recipes'));

  // Leaderboard Endpoint
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const User = require('./models/User');
      
      // Fetch top 10 users based on points
      const topUsers = await User.find()
        .sort({ points: -1 })
        .limit(10)
        .select('username points profilePic followers')
        .lean(); // Optimization: use .lean()

      // Transform data to return follower COUNT instead of the full array
      const leaderboardData = topUsers.map(user => ({
        _id: user._id,
        username: user.username,
        points: user.points,
        profilePic: user.profilePic,
        followerCount: user.followers ? user.followers.length : 0
      }));

      res.json(leaderboardData);
    } catch (err) {
      console.error("Leaderboard Error:", err);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // --- 404 HANDLER ---
  app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found. Check your URL/Method." });
  });

  // --- GLOBAL ERROR HANDLER ---
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on the server!" });
  });

  app.listen(PORT, () => console.log(`🚀 Worker ${process.pid} running on port ${PORT}`));
}
