const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to PantryPal DB"))
  .catch(err => console.error(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

app.listen(5000, () => console.log("Server running on port 5000"));
app.get('/', (req, res) => {
    res.send("<h1>PantryPal API is Live!</h1><p>The backend is working perfectly.</p>");
});
// Add these to server.js
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
	