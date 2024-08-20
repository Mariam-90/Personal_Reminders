const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const path = require('path');

module.exports = (upload) => {
  // Add new reminder
  // Add new reminder
// Add new reminder
router.post('/:userId', upload.fields([{ name: 'audioFile' }, { name: 'recordedTaskAudioFile' }]), async (req, res) => {
  try {
    const { userId } = req.params;
    const { task, date, time, recurrence } = req.body;
    const executionDate = new Date(`${date}T${time}:00`);

    const audioFileName = req.files['audioFile'] ? req.files['audioFile'][0].filename : null;
    const recordedTaskAudioFileName = req.files['recordedTaskAudioFile'] ? req.files['recordedTaskAudioFile'][0].filename : null;

    const newReminder = new Reminder({
      task,
      executionDate,
      userId,
      isCompleted: false,
      recurrence,
      audioFileName,
      recordedTaskAudioFileName,
    });

    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

  // Update reminder by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isCompleted, completionDate, audioPlayed, recurrence } = req.body;

    const updateData = {};

    if (isCompleted) {
      updateData.isCompleted = true;
      updateData.completionDate = completionDate ? new Date(completionDate) : new Date();
    }

    // Find the existing reminder
    const existingReminder = await Reminder.findById(id);
    if (!existingReminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Create a new reminder only if it hasn't been created yet and recurrence is not 'none'
    if (audioPlayed && recurrence && recurrence !== 'none' && !existingReminder.hasNewReminder) {
      let nextExecutionDate;
      const reminderDate = new Date(existingReminder.executionDate);

      switch (recurrence) {
        case 'daily':
          nextExecutionDate = new Date(reminderDate.getTime() + (24 * 60 * 60 * 1000)); // Add one day
          break;
        case 'weekly':
          nextExecutionDate = new Date(reminderDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Add one week
          break;
        case 'monthly':
          nextExecutionDate = new Date(reminderDate);
          nextExecutionDate.setMonth(reminderDate.getMonth() + 1); // Add one month
          break;
        default:
          throw new Error('Invalid recurrence type');
      }

      const newReminder = new Reminder({
        task: existingReminder.task,
        executionDate: nextExecutionDate,
        userId: existingReminder.userId,
        recurrence: existingReminder.recurrence,
        audioFileName: existingReminder.audioFileName,
        recordedTaskAudioFileName: existingReminder.recordedTaskAudioFileName,
        isCompleted: false
      });

      await newReminder.save();
      updateData.hasNewReminder = true;
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error('Error in updating reminder:', error);
    res.status(400).json({ error: error.message });
  }
});

  // Delete reminder
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedReminder = await Reminder.findByIdAndDelete(id);
      if (!deletedReminder) {
        return res.status(404).json({ message: 'Reminder not found' });
      }
      res.status(200).json({ message: 'Reminder deleted', deletedReminder });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};
