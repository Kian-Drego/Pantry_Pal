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
 * GET Profile Route
 */
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });

    const recipeCount = await Recipe.countDocuments({ author: req.params.id });
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
 * Update Profile Route
 */
router.put('/profile/:id', async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, bio, profilePic },
      { new: true } 
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

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

/**
 * FIXED: Follow/Unfollow Toggle Route
 */
router.post('/follow/:id', async (req, res) => {
  try {
    const targetUserId = req.params.id; // The user to be followed
    const { currentUserId } = req.body; // The logged-in user

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // FIX: Convert IDs to strings to ensure comparison works
    const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId);

    if (isFollowing) {
      // Unfollow Logic: Use filter to ensure specific string matching
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      
      await targetUser.save();
      await currentUser.save();
      
      return res.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow Logic: Push strings
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
      
      await targetUser.save();
      await currentUser.save();
      
      return res.json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ error: "Follow action failed" });
  }
});

module.exports = router;