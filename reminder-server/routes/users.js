const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { memoryUpload } = require('../middleware/upload');

const router = express.Router();
router.use(requireAuth);

const PREDEFINED_SOUNDS = ['reminder.wav', 'reminder1.wav', 'reminder2.wav', 'reminder3.wav', 'blobbell.wav', 'blobre3.wav'];
const TEXT_FIELDS = { fullName: 100, phone: 30, notes: 2000, caregiverName: 100, caregiverPhone: 30 };

async function loadUser(req, res) {
  const user = await User.findById(req.userId);
  if (!user) res.status(404).json({ error: 'המשתמש לא נמצא' });
  return user;
}

router.get('/me', async (req, res, next) => {
  try {
    const user = await loadUser(req, res);
    if (user) res.json(user.toPublic());
  } catch (err) {
    next(err);
  }
});

router.put('/me', async (req, res, next) => {
  try {
    const user = await loadUser(req, res);
    if (!user) return undefined;

    Object.entries(TEXT_FIELDS).forEach(([field, max]) => {
      if (typeof req.body[field] === 'string') user[field] = req.body[field].trim().slice(0, max);
    });

    if (Array.isArray(req.body.infoItems)) {
      user.infoItems = req.body.infoItems
        .slice(0, 50)
        .map((item) => ({
          label: String(item?.label || '').trim().slice(0, 100),
          value: String(item?.value || '').trim().slice(0, 500),
        }))
        .filter((item) => item.label || item.value);
    }

    if (req.body.soundName !== undefined) {
      const { soundName } = req.body;
      if (soundName === 'custom' && !user.toPublic().hasCustomSound) {
        return res.status(400).json({ error: 'עדיין לא הועלה צליל אישי' });
      }
      if (soundName !== 'custom' && !PREDEFINED_SOUNDS.includes(soundName)) {
        return res.status(400).json({ error: 'צליל לא מוכר' });
      }
      user.soundName = soundName;
    }

    await user.save();
    return res.json(user.toPublic());
  } catch (err) {
    return next(err);
  }
});

// Upload a personal reminder sound (e.g. a family member's voice).
router.post('/me/sound', memoryUpload.single('sound'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'לא נבחר קובץ' });
    const user = await loadUser(req, res);
    if (!user) return undefined;

    user.audioData = req.file.buffer;
    user.audioContentType = req.file.mimetype;
    user.soundName = 'custom';
    await user.save();
    return res.json(user.toPublic());
  } catch (err) {
    return next(err);
  }
});

router.get('/me/sound', async (req, res, next) => {
  try {
    const user = await loadUser(req, res);
    if (!user) return undefined;
    if (!user.toPublic().hasCustomSound) return res.status(404).json({ error: 'אין צליל אישי' });
    res.set('Content-Type', user.audioContentType);
    return res.send(user.audioData);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
