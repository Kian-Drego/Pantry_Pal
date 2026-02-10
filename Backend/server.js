const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to PantryPal DB"))
  .catch(err => console.error("DB Connection Error:", err));

// Route Imports
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

// API Routes - Registered once correctly
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send("<h1>PantryPal API is Live!</h1><p>The backend is working perfectly.</p>");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));