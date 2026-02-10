const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const jwt = require('jsonwebtoken');

// MIDDLEWARE: Verifies the JWT token to see who is logged in
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// @route   POST /api/recipes
// @desc    Create a new recipe
router.post('/', auth, async (req, res) => {
    const { title, description, ingredients } = req.body;

    try {
        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            author: req.user.id // Taken from the JWT token
        });

        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   GET /api/recipes
// @desc    Get all recipes for the Fresh Feed
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('author', 'username') // Joins with User model to get the chef's name
            .sort({ createdAt: -1 }); // Newest first
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;