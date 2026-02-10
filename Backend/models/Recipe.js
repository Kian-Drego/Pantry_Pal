const mongoose = require('mongoose');
const RecipeSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  ingredients: [String], // Array based on "Add Ingredient" button in create.html
  instructions: [String], // Array based on "Add Step" button in create.html
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Recipe', RecipeSchema);