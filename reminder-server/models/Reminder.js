const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    reminderName: String,
    reminderDescription: String,
    executionDate: Date,
    userEmail: String,
    isCompleted: Boolean,
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
