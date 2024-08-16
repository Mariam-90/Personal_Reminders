import React from 'react';
import './StatusView.css'; // נייבא את קובץ ה-CSS

function StatusView({ reminders }) {
  return (
    <div className="status-view">
      <h2 className="status-title">מעקב אחרי תזכורות</h2>
      <table className="status-table">
        <thead>
          <tr>
            <th>משימה</th>
            <th>תאריך</th>
            <th>שעה</th>
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
                <td className={reminder.isCompleted ? 'completed' : 'not-completed'}>
                  {reminder.isCompleted ? 'הושלמה' : 'לא הושלמה'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">אין תזכורות להצגה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StatusView;
