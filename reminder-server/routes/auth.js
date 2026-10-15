const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { apiError } = require('../lib/errors');

const router = express.Router();

// Slow down password guessing.
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: apiError('tooManyAttempts'),
    skip: () => process.env.NODE_ENV === 'test',
  })
);

const USERNAME_RE = /^[\p{L}\p{N}_.-]{3,30}$/u;

router.post('/register', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const fullName = String(req.body.fullName || '').trim().slice(0, 100);

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json(apiError('usernameInvalid'));
    }
    if (password.length < 6) {
      return res.status(400).json(apiError('passwordShort'));
    }
    if (await User.exists({ username })) {
      return res.status(409).json(apiError('usernameTaken'));
    }

    const user = await User.create({ username, fullName, password: await bcrypt.hash(password, 10) });
    return res.status(201).json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json(apiError('badCredentials'));
    }
    return res.json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
