const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed
  googleId: { type: String },
  appleId: { type: String },
  likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
});

module.exports = mongoose.model('User', userSchema);
