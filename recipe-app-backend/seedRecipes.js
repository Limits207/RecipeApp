// Usage: node seedRecipes.js
// Place this file in your recipe-app-backend folder and run with: node seedRecipes.js


// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';




const recipes = [
  {
    title: 'Spaghetti Carbonara',
    ingredients: ['Spaghetti', 'Eggs', 'Pancetta', 'Parmesan Cheese', 'Black Pepper'],
    ethnicity: 'Italian',
    cookTime: '30 min',
  },
  {
    title: 'Chicken Tikka Masala',
    ingredients: ['Chicken', 'Yogurt', 'Tomato Sauce', 'Garam Masala', 'Garlic', 'Ginger'],
    ethnicity: 'Indian',
    cookTime: '1 hr',
  },
  {
    title: 'Beef Tacos',
    ingredients: ['Tortillas', 'Ground Beef', 'Cheddar Cheese', 'Lettuce', 'Tomato', 'Sour Cream'],
    ethnicity: 'Mexican',
    cookTime: '25 min',
  },
  {
    title: 'Sushi Rolls',
    ingredients: ['Sushi Rice', 'Nori', 'Salmon', 'Avocado', 'Cucumber'],
    ethnicity: 'Japanese',
    cookTime: '50 min',
  },
  {
    title: 'Pad Thai',
    ingredients: ['Rice Noodles', 'Shrimp', 'Eggs', 'Bean Sprouts', 'Peanuts', 'Tamarind Paste'],
    ethnicity: 'Thai',
    cookTime: '40 min',
  },
  {
    title: 'Greek Salad',
    ingredients: ['Cucumber', 'Tomato', 'Feta Cheese', 'Olives', 'Red Onion', 'Olive Oil'],
    ethnicity: 'Greek',
    cookTime: '15 min',
  },
  {
    title: 'Ratatouille',
    ingredients: ['Eggplant', 'Zucchini', 'Bell Pepper', 'Tomato', 'Onion', 'Garlic'],
    ethnicity: 'French',
    cookTime: '1 hr',
  },
  {
    title: 'Jollof Rice',
    ingredients: ['Rice', 'Tomato Paste', 'Onion', 'Bell Pepper', 'Chicken', 'Spices'],
    ethnicity: 'West African',
    cookTime: '1 hr',
  },
  {
    title: 'Falafel Wrap',
    ingredients: ['Falafel', 'Pita Bread', 'Lettuce', 'Tomato', 'Tahini Sauce'],
    ethnicity: 'Middle Eastern',
    cookTime: '35 min',
  },
  {
    title: 'Pho',
    ingredients: ['Rice Noodles', 'Beef', 'Broth', 'Bean Sprouts', 'Basil', 'Lime'],
    ethnicity: 'Vietnamese',
    cookTime: '2 hr',
  },
  {
    title: 'Poutine',
    ingredients: ['French Fries', 'Cheese Curds', 'Gravy'],
    ethnicity: 'Canadian',
    cookTime: '30 min',
  },
  {
    title: 'Paella',
    ingredients: ['Rice', 'Saffron', 'Seafood', 'Chicken', 'Peas', 'Bell Pepper'],
    ethnicity: 'Spanish',
    cookTime: '1 hr 15 min',
  },
  {
    title: 'Ceviche',
    ingredients: ['Fish', 'Lime Juice', 'Onion', 'Cilantro', 'Chili Pepper'],
    ethnicity: 'Peruvian',
    cookTime: '20 min',
  },
  {
    title: 'Borscht',
    ingredients: ['Beetroot', 'Cabbage', 'Potato', 'Carrot', 'Sour Cream'],
    ethnicity: 'Ukrainian',
    cookTime: '1 hr',
  },
  {
    title: 'Kimchi Stew',
    ingredients: ['Kimchi', 'Pork', 'Tofu', 'Scallions', 'Gochugaru'],
    ethnicity: 'Korean',
    cookTime: '45 min',
  },
  {
    title: 'Baklava',
    ingredients: ['Phyllo Dough', 'Nuts', 'Honey', 'Butter', 'Sugar'],
    ethnicity: 'Turkish',
    cookTime: '1 hr 30 min',
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Recipe.deleteMany({});
  await Recipe.insertMany(recipes);
  console.log('Sample recipes inserted!');
  mongoose.disconnect();
}

seed();
