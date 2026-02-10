const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json("User created");
  } catch (err) { 
    res.status(500).json({ message: "Server error during registration" }); 
  }
});

// Login User
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json("User created");
  } catch (err) { 
    // Generic message to avoid leaking database details
    res.status(500).json({ message: "Server error during registration" }); 
  }
});

module.exports = router;