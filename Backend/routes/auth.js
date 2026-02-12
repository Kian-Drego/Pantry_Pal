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
 * Returns the user data and dynamic counts for the profile page
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
      { new: true } 
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
 * 5. ATOMIC Follow/Unfollow Toggle Route
 * Uses $addToSet and $pull for high reliability
 */
router.post('/follow/:id', async (req, res) => {
  try {
    const targetUserId = req.params.id; // Person to follow
    const { currentUserId } = req.body; // Logged in user

    if (!currentUserId) return res.status(400).json({ error: "User ID required" });
    if (targetUserId === currentUserId) return res.status(400).json({ error: "Self-following not allowed" });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: "Chef not found" });

    // Check current state using string comparison
    const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId);

    if (isFollowing) {
      // Unfollow: Remove IDs from both records
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
      res.json({ message: "Unfollowed", isFollowing: false });
    } else {
      // Follow: Add IDs to both records ($addToSet prevents duplicates)
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
      res.json({ message: "Followed", isFollowing: true });
    }
  } catch (err) {
    console.error("Follow route error:", err);
    res.status(500).json({ error: "Follow action failed" });
  }
});

module.exports = router;