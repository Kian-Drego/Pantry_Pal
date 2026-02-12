const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  ingredients: [String],
  instructions: [String],
  prepTime: String,
  cookTime: String,
  image: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  /**
   * LIKE SYSTEM FIX
   * likes: The total count for fast display
   * likedBy: Array of User IDs to prevent duplicate likes
   */
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  category: String,
  createdAt: { type: Date, default: Date.now }
});

// Indexing author and title for faster feed loading and searching
RecipeSchema.index({ author: 1 });
RecipeSchema.index({ title: 'text' });

module.exports = mongoose.model('Recipe', RecipeSchema);