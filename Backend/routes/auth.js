const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// 1. Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(400).json({ error: "Username or email already exists" });
  }
});

// 2. Login Route
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
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login error" });
  }
});

/**
 * 3. GET Profile Route
 */
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });

    const recipeCount = await Recipe.countDocuments({ author: req.params.id });
    
    res.json({ 
      user, 
      recipeCount, 
      followerCount: user.followers ? user.followers.length : 0, 
      followingCount: user.following ? user.following.length : 0 
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ error: "Could not fetch profile" });
  }
});

/**
 * 4. Update Profile Route
 */
router.put('/profile/:id', async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, bio, profilePic },
      { returnDocument: 'after' } 
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const recipeCount = await Recipe.countDocuments({ author: req.params.id });

    res.json({ 
      message: "Profile updated successfully", 
      user: updatedUser,
      recipeCount,
      followerCount: updatedUser.followers ? updatedUser.followers.length : 0,
      followingCount: updatedUser.following ? updatedUser.following.length : 0
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/**
 * 5. TOGGLE Follow/Unfollow Route
 * This single route handles both following and unfollowing.
 */
router.post('/follow/:id', async (req, res) => {
  try {
    const targetUserId = req.params.id; // Chef being followed
    const { currentUserId } = req.body; // Logged in user

    if (!currentUserId) return res.status(400).json({ error: "User ID required" });
    if (targetUserId === currentUserId) return res.status(400).json({ error: "You cannot follow yourself" });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Ensure we check IDs as strings to avoid Type mismatch bugs
    const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId);

    if (isFollowing) {
      // UNFOLLOW logic
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
      res.json({ success: true, message: "Unfollowed", isFollowing: false });
    } else {
      // FOLLOW logic
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
      res.json({ success: true, message: "Followed", isFollowing: true });
    }
  } catch (err) {
    console.error("Follow route error:", err);
    res.status(500).json({ success: false, error: "Server error during follow action" });
  }
});

module.exports = router;