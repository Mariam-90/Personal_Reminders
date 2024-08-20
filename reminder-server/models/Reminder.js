const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  task: { type: String, required: true },
  executionDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isCompleted: { type: Boolean, default: false },
  recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
  audioFileName: { type: String, default: 'reminder.wav' },
  recordedTaskAudioFileName: { type: String, default: null },
  hasNewReminder: { type: Boolean, default: false }  // New field to track new reminder creation
});

module.exports = mongoose.model('Reminder', ReminderSchema);
