const router = require('express').Router();
const Recipe = require('../models/Recipe');

// 1. Get all recipes (Enhanced with likedBy population if needed)
router.get('/', async (req, res) => {
  try {
    // We populate author to show @username and follow status
    const recipes = await Recipe.find().populate('author', 'username followers');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch recipes" });
  }
});

// 2. Create new recipe
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json({
      message: "Recipe shared successfully!",
      recipe: newRecipe
    });
  } catch (err) {
    console.error("Recipe Post Error:", err);
    res.status(400).json({ error: "Could not post recipe." });
  }
});

/**
 * 3. NEW: Toggle Like Route
 * Handles the logic for liking and unliking a recipe.
 */
router.post('/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    // Initialize likedBy array if it doesn't exist (schema safety)
    if (!recipe.likedBy) recipe.likedBy = [];

    const index = recipe.likedBy.indexOf(userId);

    if (index === -1) {
      // User hasn't liked yet -> Add like
      recipe.likedBy.push(userId);
      recipe.likes = (recipe.likes || 0) + 1;
    } else {
      // User already liked -> Remove like (Unlike)
      recipe.likedBy.splice(index, 1);
      recipe.likes = Math.max(0, (recipe.likes || 1) - 1);
    }

    await recipe.save();
    res.json({ 
      likes: recipe.likes, 
      isLiked: index === -1,
      likedBy: recipe.likedBy 
    });
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ error: "Action failed" });
  }
});

// 4. Search recipes
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const results = await Recipe.find({
      $or: [
        { title: new RegExp(q, 'i') }, 
        { ingredients: new RegExp(q, 'i') }
      ]
    }).populate('author', 'username followers');
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// 5. Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) return res.status(404).json({ error: "Recipe not found" });
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete recipe" });
  }
});

module.exports = router;