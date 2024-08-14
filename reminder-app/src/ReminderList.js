// ReminderList.js
import React from 'react';

function ReminderList({ reminders, onDelete }) {
  return (
    <div className="reminder-container">
      <h2>Your Reminders</h2>
      <ul>
        {reminders.map((reminder) => (
          <li key={reminder._id}>
            <span className="reminder-item">
              {reminder.task}
              <span className="reminder-date">{new Date(reminder.executionDate).toLocaleDateString()}</span>
              <span className="reminder-time">{new Date(reminder.executionDate).toLocaleTimeString()}</span>
            </span>
            <button onClick={() => onDelete(reminder._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReminderList;
