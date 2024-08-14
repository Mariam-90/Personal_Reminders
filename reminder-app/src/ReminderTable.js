import React from 'react';

function ReminderTable({ reminders, onComplete }) {
  return (
    <div className="reminder-table-container">
      <h2>התזכורות שלי</h2>
      <table className="reminder-table">
        <thead>
          <tr>
            <th>משימה</th>
            <th>תאריך</th>
            <th>שעה</th>
            <th>אודיו</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <tr key={reminder._id}>
                <td>{reminder.task}</td>
                <td>{new Date(reminder.executionDate).toLocaleDateString('he-IL')}</td>
                <td>{new Date(reminder.executionDate).toLocaleTimeString('he-IL')}</td>
                <td>{reminder.audioFileName || 'ללא אודיו'}</td>
                <td>
                  {reminder.isCompleted ? (
                    'הושלמה'
                  ) : (
                    <button onClick={() => onComplete(reminder._id)}>סמן כהושלמה</button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">אין תזכורות להצגה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReminderTable;
