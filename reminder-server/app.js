const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { uploadDir } = require('./middleware/upload');
const { apiError } = require('./lib/errors');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '100kb' }));

// Task recordings (file names are random, see middleware/upload.js)
app.use('/uploads', express.static(uploadDir, { maxAge: '7d' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reminders', require('./routes/reminders'));

app.use('/api', (req, res) => res.status(404).json(apiError('notFound')));

// Central error handler: multer limits, mongoose validation, everything else.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json(apiError('fileTooLarge'));
  }
  if (err.status === 400 && err.code) {
    return res.status(400).json(apiError(err.code));
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ ...apiError('validation'), error: err.message });
  }
  console.error(err);
  return res.status(500).json(apiError('serverError'));
});

module.exports = app;
