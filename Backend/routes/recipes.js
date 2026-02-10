const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const jwt = require('jsonwebtoken');

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

// Create a new recipe
router.post('/', auth, async (req, res) => {
    const { title, description, ingredients, instructions } = req.body;

    try {
        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            instructions, // Added to match model
            author: req.user.id
        });

        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;