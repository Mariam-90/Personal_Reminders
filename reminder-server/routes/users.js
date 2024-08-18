const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
      // אם המשתמש העלה קובץ אודיו
      updateData = {
        audioContentType: req.file.mimetype,
        audioData: req.file.buffer, // שמירת הקובץ בפורמט בינארי
      };
      console.log(`Audio file uploaded for user ${username}:`, req.file.originalname);
    } else if (req.body.selectedAudio) {
      // אם המשתמש בחר קובץ מוגדר מראש
      updateData = {
        audioContentType: 'predefined', // סוג הצליל יהיה "predefined"
        audioData: req.body.selectedAudio, // שמירת שם הקובץ כטקסט ולא כנתונים בינאריים
      };
      console.log(`Predefined audio selected for user ${username}:`, req.body.selectedAudio);
    }

    console.log(`Updating user ${username} with data:`, updateData);

    const updatedUser = await User.findOneAndUpdate({ username }, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    res.status(200).json({ message: 'User audio settings updated successfully' });
  } catch (error) {
    console.error('Error updating audio settings:', error);
    res.status(400).json({ error: error.message });
  }
});



// בשרת users.js
router.get('/:username/audio', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (!user.audioData || !user.audioContentType) {
      return res.status(404).send('Audio not found');
    }

    res.set('Content-Type', user.audioContentType);
    res.send(user.audioData);
  } catch (error) {
    console.error('Error fetching audio data:', error);
    res.status(500).json({ error: 'Error fetching audio data' });
  }
});


module.exports = router;
