const router = require('express').Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');

/**
 * 1. Get all recipes (Homepage Feed)
 * Populates author and includes comment counts
 */
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 }) 
      .populate('author', 'username profilePic');
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
    
    if (req.body.author) {
      await User.findByIdAndUpdate(req.body.author, { $inc: { points: 10 } });
    }

    res.status(201).json({ message: "Recipe shared!", recipe: newRecipe });
  } catch (err) {
    res.status(400).json({ error: "Check all fields." });
  }
});

/**
 * 3. Toggle Like
 */
router.post('/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Not found" });

    const alreadyLiked = recipe.likedBy?.some(id => id.toString() === userId);
    const update = alreadyLiked 
      ? { $pull: { likedBy: userId }, $inc: { likes: -1 } }
      : { $addToSet: { likedBy: userId }, $inc: { likes: 1 } };

    const updated = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ likes: updated.likes, isLiked: !alreadyLiked, likedBy: updated.likedBy });
  } catch (err) {
    res.status(500).json({ error: "Like failed" });
  }
});

/**
 * 4. NEW: Toggle Save Recipe
 */
router.post('/save/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Not found" });

    const isSaved = recipe.saves?.some(id => id.toString() === userId);
    const update = isSaved 
      ? { $pull: { saves: userId } } 
      : { $addToSet: { saves: userId } };

    const updated = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ saves: updated.saves, isSaved: !isSaved });
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});

/**
 * 5. NEW: Add Comment
 */
router.post('/comment/:id', async (req, res) => {
  try {
    const { userId, username, text } = req.body;
    if (!text) return res.status(400).json({ error: "Comment text required" });

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId, username, text } } },
      { new: true }
    );
    res.json(updatedRecipe.comments);
  } catch (err) {
    res.status(500).json({ error: "Comment failed" });
  }
});

/**
 * 6. Search recipes
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
    }).populate('author', 'username');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

/**
 * 7. Delete a recipe
 */
router.delete('/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;