const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  images: [String],
  ingredients: String,
  cookTime: String,
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Recipe', recipeSchema);
