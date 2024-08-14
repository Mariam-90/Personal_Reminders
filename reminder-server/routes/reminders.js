const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const fs = require('fs');
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
      const { userId } = req.params;
      const { task, date, time, recurrence, audioFile } = req.body; // קבלת שם קובץ הצליל אם נשלח
      const executionDate = new Date(`${date}T${time}:00`);

      if (isNaN(executionDate.getTime())) {
        throw new Error("Invalid date or time format");
      }

      let audioFileName = null;
      if (req.file) {
        audioFileName = req.file.filename;
        console.log(`File saved as ${audioFileName}`);
      } else if (audioFile) {
        // אם לא נשלח קובץ חדש, השתמש בשם קובץ הצליל שנשמר קודם לכן
        audioFileName = audioFile;
      }

      const newReminder = new Reminder({ 
        task, 
        executionDate, 
        userId, 
        isCompleted: false, 
        audioFileName,
        recurrence
      });

      await newReminder.save();
      res.status(201).json(newReminder);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  // Update reminder by ID
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (updateData.isCompleted) {
        updateData.completionDate = new Date();  // שמירת זמן הביצוע
      }

      const updatedReminder = await Reminder.findByIdAndUpdate(id, updateData, { new: true });
      res.status(200).json(updatedReminder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get weekly summary
  router.get('/summary/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
      const reminders = await Reminder.find({
        userId,
        executionDate: { $gte: oneWeekAgo }
      });
  
      const summary = reminders.map(reminder => ({
        task: reminder.task,
        executionDate: reminder.executionDate,
        isCompleted: reminder.isCompleted,
        completionDate: reminder.completionDate
      }));
  
      res.status(200).json(summary);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete reminder
// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received delete request for ID:', id); // Log the ID
    const deletedReminder = await Reminder.findByIdAndDelete(id);
    if (!deletedReminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.status(200).json({ message: 'Reminder deleted', deletedReminder });
  } catch (error) {
    console.error('Error while deleting reminder:', error.message);
    res.status(400).json({ error: error.message });
  }
});


  
  
  
  
  
  return router;
};
