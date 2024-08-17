const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const path = require('path');

module.exports = (upload) => {
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
        recordedTaskAudioFileName
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
      const { isCompleted, completionDate, recurrence } = req.body;

      const updateData = { isCompleted };

      if (isCompleted && !completionDate) {
        updateData.completionDate = new Date();
      } else if (completionDate) {
        updateData.completionDate = new Date(completionDate);
      }

      const updatedReminder = await Reminder.findByIdAndUpdate(id, updateData, { new: true });

      if (recurrence !== 'none' && isCompleted) {
        const nextExecutionDate = getNextExecutionDate(updatedReminder.executionDate, recurrence);

        const newReminder = new Reminder({
          task: updatedReminder.task,
          executionDate: nextExecutionDate,
          userId: updatedReminder.userId,
          recurrence: updatedReminder.recurrence,
          audioFileName: updatedReminder.audioFileName,
          recordedTaskAudioFileName: updatedReminder.recordedTaskAudioFileName
        });

        await newReminder.save();
      }

      res.status(200).json(updatedReminder);
    } catch (error) {
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

  function getNextExecutionDate(date, recurrence) {
    const newDate = new Date(date);
    if (recurrence === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (recurrence === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (recurrence === 'monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    return newDate;
  }

  return router;
};
