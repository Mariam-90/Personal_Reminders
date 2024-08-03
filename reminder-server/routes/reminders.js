const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// Get reminders by user email
router.get('/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    console.log(`Fetching reminders for user: ${userEmail}`); // הודעת קונסול
    const reminders = await Reminder.find({ userEmail });
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error.message); // הודעת קונסול
    res.status(400).json({ error: error.message });
  }
});

// Add new reminder
router.post('/', async (req, res) => {
  try {
    const newReminder = new Reminder(req.body);
    console.log('Adding new reminder:', newReminder); // הודעת קונסול
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    console.error('Error adding reminder:', error.message); // הודעת קונסול
    res.status(400).json({ error: error.message });
  }
});

// Update reminder by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating reminder with ID: ${id}`); // הודעת קונסול
    const updatedReminder = await Reminder.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error('Error updating reminder:', error.message); // הודעת קונסול
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
