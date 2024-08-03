const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    task: { type: String, required: true },
    executionDate: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isCompleted: { type: Boolean, default: false }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
