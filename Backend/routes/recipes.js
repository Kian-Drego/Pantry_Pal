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
 * Create new recipe
 * Ensures the 'author' field is saved so it updates the user's recipe count.
 */
router.post('/', async (req, res) => {
  try {
    // req.body includes: title, description, image, ingredients, instructions, and author (userId)
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

// Delete a recipe
// This endpoint is called from the profile page to remove a user's own post
router.delete('/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    
    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete recipe" });
  }
});

module.exports = router;