const router = require('express').Router();
const Recipe = require('../models/Recipe');

/**
 * 1. Get all recipes for Homepage Feed
 * Populates author details (including followers for the 'Follow' button logic)
 * and likedBy IDs (for the 'Heart' icon state).
 */
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate({
        path: 'author',
        select: 'username followers profilePic'
      })
      .populate('likedBy', '_id'); 
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch recipes" });
  }
});

/**
 * 2. Create new recipe
 */
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
    res.status(400).json({ error: "Could not post recipe. Ensure all fields are filled." });
  }
});

/**
 * 3. Toggle Like Logic
 * Uses .toString() to ensure the comparison between Frontend strings 
 * and Mongoose ObjectIds works perfectly.
 */
router.post('/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    if (!recipe.likedBy) recipe.likedBy = [];

    // Check if user already liked the recipe
    const alreadyLiked = recipe.likedBy.some(id => id.toString() === userId);

    if (!alreadyLiked) {
      // Add Like
      recipe.likedBy.push(userId);
      recipe.likes = (recipe.likes || 0) + 1;
    } else {
      // Remove Like (Unlike)
      recipe.likedBy = recipe.likedBy.filter(id => id.toString() !== userId);
      recipe.likes = Math.max(0, (recipe.likes || 1) - 1);
    }

    await recipe.save();
    res.json({ 
      likes: recipe.likes, 
      isLiked: !alreadyLiked,
      likedBy: recipe.likedBy 
    });
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ error: "Action failed" });
  }
});

/**
 * 4. Search recipes
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const results = await Recipe.find({
      $or: [
        { title: new RegExp(q, 'i') }, 
        { ingredients: new RegExp(q, 'i') }
      ]
    }).populate('author', 'username followers profilePic');
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

/**
 * 5. Delete a recipe
 */
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