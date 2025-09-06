const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Set up multer for image uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });


// Get all recipes
router.get('/', async (req, res) => {
  const recipes = await Recipe.find();
  res.json(recipes);
});

// Get a single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipe', error: err.message });
  }
});

// Create a new recipe (with multiple images)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    const { title, ingredients, cookTime, ethnicity } = req.body;
    const imageFiles = req.files || [];
    const images = imageFiles.map(f => `/uploads/${f.filename}`);
    const recipe = await Recipe.create({
      title,
      ingredients,
      cookTime,
      images,
      ethnicity,
    });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create recipe', error: err.message });
  }
});


// Like a recipe (auth required)
router.post('/:id/like', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    const recipe = await Recipe.findById(req.params.id);
    if (!user || !recipe) return res.status(404).json({ message: 'Not found' });
    if (recipe.likedBy.includes(user._id)) return res.status(400).json({ message: 'Already liked' });
    recipe.likes++;
    recipe.likedBy.push(user._id);
    user.likedRecipes.push(recipe._id);
    await recipe.save();
    await user.save();
    res.json({ likes: recipe.likes });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Unlike a recipe (auth required)
router.post('/:id/unlike', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    const recipe = await Recipe.findById(req.params.id);
    console.log('UNLIKE DEBUG:', {
      userId: decoded.id,
      recipeId: req.params.id,
      userFound: !!user,
      recipeFound: !!recipe,
      recipeLikedBy: recipe?.likedBy,
      userLikedRecipes: user?.likedRecipes,
      includes: recipe?.likedBy?.map(id => id.toString()).includes(user?._id?.toString()),
    });
    if (!user || !recipe) return res.status(404).json({ message: 'Not found' });
  const userIdStr = user._id.toString();
  const recipeIdStr = recipe._id.toString();
  const likedByStrs = recipe.likedBy.map(id => id.toString());
  const userLikedRecipesStrs = user.likedRecipes.map(id => id.toString());
  // Allow unlike if either likedBy or likedRecipes contains the user/recipe
  // Always clean up both sides, even if only one side contains the reference
  const wasLiked = likedByStrs.includes(userIdStr) || userLikedRecipesStrs.includes(recipeIdStr);
  if (wasLiked && recipe.likes > 0) {
    recipe.likes = recipe.likes - 1;
  }
  recipe.likedBy = recipe.likedBy.filter(id => id.toString() !== userIdStr);
  user.likedRecipes = user.likedRecipes.filter(id => id.toString() !== recipeIdStr);
    await recipe.save();
    await user.save();
    res.json({ likes: recipe.likes });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
