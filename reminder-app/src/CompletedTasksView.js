import React from 'react';
import './CompletedTasksView.css'; // ייבוא קובץ ה-CSS

function CompletedTasksView({ reminders }) {
  const completedReminders = reminders.filter(reminder => reminder.isCompleted);

  return (
    <div className="completed-tasks-view">
      <h2 className="completed-tasks-title">משימות שהושלמו</h2>
      <table className="completed-tasks-table">
        <thead>
          <tr>
            <th>משימה</th>
            <th>תאריך</th>
            <th>שעה</th>
            <th>שעת ביצוע</th> {/* הוספת עמודה לשעת הביצוע */}
          </tr>
        </thead>
        <tbody>
          {completedReminders.length > 0 ? (
            completedReminders.map(reminder => (
              <tr key={reminder._id}>
                <td>{reminder.task}</td>
                <td>{new Date(reminder.executionDate).toLocaleDateString('he-IL')}</td>
                <td>{new Date(reminder.executionDate).toLocaleTimeString('he-IL')}</td>
                <td>{reminder.completionDate ? new Date(reminder.completionDate).toLocaleTimeString('he-IL') : 'לא זמין'}</td> {/* בדיקה אם completionDate קיים */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">אין משימות שהושלמו</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CompletedTasksView;
