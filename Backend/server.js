const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:');
    console.error(err.message);
    process.exit(1); // Stop the server if the database isn't ready
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

// Leaderboard Endpoint (Direct for simplicity)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const topUsers = await require('./models/User').find()
      .sort({ points: -1 })
      .limit(10)
      .select('username points profilePic');
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));