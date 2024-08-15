const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    task: { type: String, required: true },
    executionDate: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isCompleted: { type: Boolean, default: false },
    hasPlayedAudio: { type: Boolean, default: false },
    hasSpokenText: { type: Boolean, default: false },
    recurrence: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' } // שדה חדש לחזרתיות
});


const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
