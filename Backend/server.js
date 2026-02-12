const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 

// Increased limit to 5mb to allow for Base64 profile picture uploads
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// --- ROOT & HEALTH CHECK ---
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "Online", 
    message: "PantryPal API is cooking... 🍳",
    timestamp: new Date()
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
      .select('username points profilePic followers');
      
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));