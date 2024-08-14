import React from 'react';

function ReminderList({ reminders, markAsCompleted, deleteReminder }) {
  return (
    <ul>
      {reminders.filter(reminder => !reminder.isCompleted).map((reminder) => (
        <li key={reminder._id}>
          <span className="reminder-item">
            {reminder.task}
            <span className="reminder-date">{new Date(reminder.executionDate).toLocaleDateString()}</span>
            <span className="reminder-time">{new Date(reminder.executionDate).toLocaleTimeString()}</span>
            <button onClick={() => markAsCompleted(reminder._id)} style={{ marginLeft: '10px', backgroundColor: reminder.isCompleted ? 'green' : 'orange' }}>
              {reminder.isCompleted ? 'Completed' : 'Mark as Completed'}
            </button>
            <button onClick={() => deleteReminder(reminder._id)} style={{ marginLeft: '10px', backgroundColor: 'red' }}>
              Delete
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default ReminderList;
