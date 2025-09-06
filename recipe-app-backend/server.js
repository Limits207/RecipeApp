const cors = require('cors');
// Enable CORS for local dev and LAN
const corsOptions = {
  origin: [
    'http://localhost:8082',
    'http://192.168.50.210:8082',
    'http://localhost:19006', // Expo web default
    'http://localhost:3000', // Common React dev port
    'http://192.168.50.210:3000',
    'http://192.168.50.210:8081',
  ],
  credentials: true,
};

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
require('dotenv').config();



const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded images statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/recipes', recipeRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
