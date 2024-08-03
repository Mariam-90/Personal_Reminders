const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    console.log('User found:', user);
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('Login successful');
      res.status(200).json(user);
    } else {
      console.log('Invalid credentials');
      res.status(400).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.log('Error during login:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
