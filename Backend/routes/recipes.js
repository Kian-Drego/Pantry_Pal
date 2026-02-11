const router = require('express').Router();
const Recipe = require('../models/Recipe');

// Get all recipes for Homepage Feed
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author', 'username');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch recipes" });
  }
});

/**
 * FIX: Create new recipe
 * This logic ensures the 'author' field is correctly saved so it appears
 * on the user's profile and updates their recipe count.
 */
router.post('/', async (req, res) => {
  try {
    // req.body should include: title, description, image, ingredients, instructions, and author (userId)
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    
    res.status(201).json({
      message: "Recipe shared successfully!",
      recipe: newRecipe
    });
  } catch (err) {
    console.error("Recipe Post Error:", err);
    res.status(400).json({ error: "Could not post recipe. Ensure all fields are filled." });
  }
});

// Search recipes
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const results = await Recipe.find({
      $or: [
        { title: new RegExp(q, 'i') }, 
        { ingredients: new RegExp(q, 'i') }
      ]
    }).populate('author', 'username');
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;