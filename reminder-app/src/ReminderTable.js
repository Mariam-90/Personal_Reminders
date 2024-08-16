import React from 'react';
import axios from 'axios';

function ReminderTable({ reminders, onComplete, fetchReminders }) {
  
  const handleDelete = async (reminderId) => {
    try {
      console.log('Deleting reminder:', reminderId);
      const response = await axios.delete(`http://localhost:5001/api/reminders/${reminderId}`);
      console.log('Deleted reminder:', response.data);
      fetchReminders(); // קורא לפונקציה לאחר המחיקה כדי לעדכן את הרשימה
    } catch (error) {
      console.error('Failed to delete reminder:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="reminder-table-container">
      <h2>התזכורות שלי</h2>
      <table className="reminder-table">
        <thead>
          <tr>
            <th>משימה</th>
            <th>תאריך</th>
            <th>שעה</th>
            <th>סטטוס</th>
            <th>מחיקה</th>
          </tr>
        </thead>
        <tbody>
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <tr key={reminder._id}>
                <td>{reminder.task}</td>
                <td>{new Date(reminder.executionDate).toLocaleDateString('he-IL')}</td>
                <td>{new Date(reminder.executionDate).toLocaleTimeString('he-IL')}</td>
                

                <td>
                  {reminder.isCompleted ? (
                    'הושלמה'
                  ) : (
                    <button onClick={() => onComplete(reminder._id)}>סמן כהושלמה</button>
                  )}
                </td>
                <td>
                  <button onClick={() => handleDelete(reminder._id)}>מחק</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">אין תזכורות להצגה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReminderTable;
