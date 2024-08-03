const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { parseISO, isValid } = require('date-fns');

// Get reminders by user ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reminders = await Reminder.find({ userId });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add new reminder
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { task, description, date, time } = req.body;
    const executionDate = new Date(`${date}T${time}:00`);
    if (isNaN(executionDate.getTime())) {
      throw new Error("Invalid date or time format");
    }
    const newReminder = new Reminder({ task, description, executionDate, userId, isCompleted: false });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Update reminder by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReminder = await Reminder.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
