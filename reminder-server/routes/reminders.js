const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const path = require('path');

module.exports = (upload) => {
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
  router.post('/:userId', upload.single('audioFile'), async (req, res) => {
    try {
      console.log('Request body:', req.body); // הוסף לוגים
      console.log('Request file:', req.file); // הוסף לוגים

      const { userId } = req.params;
      const { task, date, time } = req.body;
      const executionDate = new Date(`${date}T${time}:00`);
      if (isNaN(executionDate.getTime())) {
        throw new Error("Invalid date or time format");
      }

      let audioFileName = null;
      if (req.file) {
        audioFileName = req.file.filename;
        console.log(`File saved as ${audioFileName}`);
      }

      console.log('Creating reminder with task:', task);

      const newReminder = new Reminder({ task, executionDate, userId, isCompleted: false, audioFileName });
      await newReminder.save();
      res.status(201).json(newReminder);
    } catch (error) {
      console.error('Error:', error.message); // הוסף לוגים
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

  return router;
};
