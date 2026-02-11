const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error(err); // ADD THIS LINE to see the error in your terminal
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, userId: user._id, username: user.username });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

// Ensure this says .post and NOT .get
router.post('/login', async (req, res) => {
    // ... login logic ...
});

module.exports = router;

// Backend/routes/auth.js

// Add this to your existing routes
router.put('/profile/:id', async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    
    // Find user by ID and update their information
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, bio, profilePic },
      { new: true } // Returns the updated document instead of the old one
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});