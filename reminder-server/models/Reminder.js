const mongoose = require('mongoose');

const RECURRENCES = ['none', 'daily', 'weekly', 'monthly'];

const ReminderSchema = new mongoose.Schema(
  {
    task: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, default: 'general', maxlength: 30 },
    executionDate: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isCompleted: { type: Boolean, default: false },
    completionDate: { type: Date },
    snoozeUntil: { type: Date, default: null },
    recurrence: { type: String, enum: RECURRENCES, default: 'none' },
    recordedTaskAudioFileName: { type: String, default: null },
    // Set once the next occurrence of a recurring reminder has been created.
    hasNewReminder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReminderSchema.statics.RECURRENCES = RECURRENCES;

module.exports = mongoose.model('Reminder', ReminderSchema);
