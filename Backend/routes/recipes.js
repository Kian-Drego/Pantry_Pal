const router = require('express').Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');

/**
 * 1. Get all recipes for Homepage Feed
 */
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 }) 
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
    
    // Award 10 points to the user for posting a recipe
    if (req.body.author) {
      await User.findByIdAndUpdate(req.body.author, { $inc: { points: 10 } });
    }

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
 * 3. ATOMIC Toggle Like Logic (FIXED)
 */
router.post('/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    // SAFETY: If legacy recipe has no likedBy array, initialize it
    if (!recipe.likedBy) {
      recipe.likedBy = [];
    }

    // Check if user already liked using string comparison
    const alreadyLiked = recipe.likedBy.some(id => id.toString() === userId);

    let updatedRecipe;
    if (!alreadyLiked) {
      // LIKE: Use $addToSet to prevent duplicate IDs in the array
      updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { 
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 } 
        },
        { new: true }
      );
    } else {
      // UNLIKE: Use $pull to remove the specific user ID
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