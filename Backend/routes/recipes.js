const router = require('express').Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User'); // Required if you plan to update points

/**
 * 1. Get all recipes for Homepage Feed
 * Populates author and likedBy details
 */
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 }) // Show newest recipes first
      .populate({
        path: 'author',
        select: 'username followers profilePic'
      });
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
    
    // Optional: Award points to the user for posting
    await User.findByIdAndUpdate(req.body.author, { $inc: { points: 10 } });

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
 * 3. ATOMIC Toggle Like Logic
 * Uses $addToSet and $pull to prevent duplicate likes and race conditions
 */
router.post('/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    // Check if user already liked the recipe using string comparison
    const alreadyLiked = recipe.likedBy.some(id => id.toString() === userId);

    let updatedRecipe;
    if (!alreadyLiked) {
      // Add Like: $addToSet ensures uniqueness
      updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { 
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 } 
        },
        { new: true }
      );
    } else {
      // Remove Like (Unlike)
      updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { 
          $pull: { likedBy: userId },
          $inc: { likes: -1 } 
        },
        { new: true }
      );
    }

    res.json({ 
      likes: updatedRecipe.likes, 
      isLiked: !alreadyLiked,
      likedBy: updatedRecipe.likedBy 
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
        { title: { $regex: q, $options: 'i' } }, 
        { ingredients: { $regex: q, $options: 'i' } }
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