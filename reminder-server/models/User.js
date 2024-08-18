const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  audioContentType: { type: String, default: null },
  audioData: { type: Buffer, default: null },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
