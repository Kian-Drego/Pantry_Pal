const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
      res.json({ token, userId: user._id, username: user.username });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

/**
 * FIX 1: GET Profile Route
 * This allows the frontend to fetch current data when the page is refreshed.
 */
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });

    // Dynamic counts from the database
    const recipeCount = await Recipe.countDocuments({ author: req.params.id });
    
    // Followers/Following arrays from your User model
    const followerCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    res.json({ 
      user, 
      recipeCount, 
      followerCount, 
      followingCount 
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile" });
  }
});

/**
 * FIX 2: Enhanced Update Profile Route
 * Now returns updated follower/following counts so the UI stays in sync.
 */
router.put('/profile/:id', async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, bio, profilePic },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const recipeCount = await Recipe.countDocuments({ author: req.params.id });
    const followerCount = updatedUser.followers ? updatedUser.followers.length : 0;
    const followingCount = updatedUser.following ? updatedUser.following.length : 0;

    res.json({ 
      message: "Profile updated successfully", 
      user: updatedUser,
      recipeCount,
      followerCount,
      followingCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;