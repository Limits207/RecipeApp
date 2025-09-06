const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  images: [String],
  ingredients: [String],
  cookTime: String,
  ethnicity: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Recipe', recipeSchema);
