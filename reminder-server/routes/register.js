const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    console.log('User registered successfully:', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.log('Error during registration:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
