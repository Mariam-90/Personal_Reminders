const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  audioContentType: { type: String, default: null },
  audioData: { type: Buffer, default: null },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  notes: { type: String, default: '' },
  caregiverName: { type: String, default: '' },
  caregiverPhone: { type: String, default: '' },
  infoItems: [{ label: { type: String, default: '' }, value: { type: String, default: '' } }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
