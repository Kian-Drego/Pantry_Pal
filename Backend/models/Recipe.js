const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Recipe title is required'],
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  ingredients: {
    type: [String],
    default: []
  },
  instructions: {
    type: [String],
    default: []
  },
  image: { 
    type: String,
    default: '' // Useful for frontend default image logic
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Author is required']
  },
  
  // LIKE SYSTEM
  likes: { 
    type: Number, 
    default: 0 
  },
  likedBy: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: []
  },
  
  // SAVE SYSTEM
  saves: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: []
  },
  
  // COMMENTS SYSTEM
  comments: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

/**
 * INDEXING
 * Improves performance for searching by title and 
 * filtering by author (which we use in Analytics)
 */
RecipeSchema.index({ author: 1 });
RecipeSchema.index({ title: 'text' });

module.exports = mongoose.model('Recipe', RecipeSchema);