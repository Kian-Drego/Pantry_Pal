const router = require('express').Router();
const Recipe = require('../models/Recipe');

// Get all recipes for Homepage Feed
router.get('/', async (req, res) => {
  const recipes = await Recipe.find().populate('author', 'username');
  res.json(recipes);
});

// Create new recipe
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ error: "Could not post recipe" });
  }
});

// Search recipes
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const results = await Recipe.find({
    $or: [{ title: new RegExp(q, 'i') }, { ingredients: new RegExp(q, 'i') }]
  });
  res.json(results);
});

module.exports = router;