const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Ensure Recipe model is imported correctly to avoid "Recipe is not defined" errors
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
    console.error("Register Error:", err);
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
    console.error("Login Error:", err);
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

    // Ensure Recipe model is correctly referenced here
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
 * Update Profile Route
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
 * FIXED: Follow/Unfollow Toggle Route
 */
router.post('/follow/:id', async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { currentUserId } = req.body;

    if (!currentUserId) {
        return res.status(400).json({ error: "Current User ID is required" });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Safety check for arrays
    if (!targetUser.followers) targetUser.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId);

    if (isFollowing) {
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      await targetUser.save();
      await currentUser.save();
      return res.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
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