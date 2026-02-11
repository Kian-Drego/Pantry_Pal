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