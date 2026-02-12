const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- FIXED MIDDLEWARE ORDER ---
// CORS must come first so every request is allowed before hitting routes
app.use(cors()); 
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    // process.exit(1); // Optional: keep it running to debug logs on Render
  });

// --- ROOT & HEALTH CHECK ---
// Visiting the base URL will now confirm if the server is up
app.get('/', (req, res) => res.send('PantryPal API is running... 🍳'));

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

// Leaderboard Endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    const User = require('./models/User');
    const topUsers = await User.find()
      .sort({ points: -1 })
      .limit(10)
      .select('username points profilePic followers');
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// --- ERROR HANDLING ---
// This prevents the server from crashing on unhandled routes
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));