const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Received data:', username, password); // Log received data for debugging
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json(user);
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.put('/updateAudioForUser/:username', upload.single('audioFile'), async (req, res) => {
  try {
    const { username } = req.params;
    let updateData = {};

    if (req.file) {
      updateData = {
        audioContentType: req.file.mimetype,
        audioData: req.file.buffer, // Store the audio binary data
      };
      console.log('Custom audio file uploaded for user:', username);
    } else if (req.body.selectedAudio) {
      updateData = {
        audioContentType: 'audio/wav', // Assuming the predefined files are WAV
        audioData: null,
      };
      console.log('Selected predefined audio for user:', username);
    }

    const updatedUser = await User.findOneAndUpdate({ username }, updateData, { new: true });

    if (!updatedUser) {
      console.error('User not found:', username);
      return res.status(404).send('User not found');
    }

    console.log('User audio settings updated successfully:', username);
    res.status(200).json({ message: 'User audio settings updated successfully' });
  } catch (error) {
    console.error('Error updating audio settings:', error.message);
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;
