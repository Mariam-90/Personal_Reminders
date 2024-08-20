import React from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';

function ReminderTable({ reminders, onComplete, fetchReminders }) {

  const handleDelete = async (reminderId) => {
    try {
      await axios.delete(`http://localhost:5001/api/reminders/${reminderId}`);
      fetchReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error.response ? error.response.data : error.message);
    }
  };

  const readTaskText = (taskText) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(taskText);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported');
    }
  };

  // סינון התזכורות להראות רק את אלו שעדיין לא הושלמו
  const incompleteReminders = reminders.filter(reminder => !reminder.isCompleted);

  return (
    <div className="reminder-table-container">
      <h2>התזכורות שלי</h2>
      <table className="reminder-table">
        <thead>
          <tr>
            <th>משימה</th>
            <th>תאריך</th>
            <th>שעה</th>
            <th>הקלטה</th>
            <th>סטטוס</th>
            <th>מחיקה</th>
            <th>הקרא טקסט</th>
          </tr>
        </thead>
        <tbody>
          {incompleteReminders.length > 0 ? (
            incompleteReminders.map((reminder) => (
              <tr key={reminder._id}>
                <td>
                  {reminder.task}
                  <button
                    onClick={() => readTaskText(reminder.task)}
                    aria-label="הקרא טקסט"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}
                  >
                    <FontAwesomeIcon icon={faVolumeUp} />
                  </button>
                </td>
                <td>{new Date(reminder.executionDate).toLocaleDateString('he-IL')}</td>
                <td>{new Date(reminder.executionDate).toLocaleTimeString('he-IL')}</td>
                <td>
                  {reminder.recordedTaskAudioFileName ? (
                    <audio controls>
                      <source src={`http://localhost:5001/uploads/${reminder.recordedTaskAudioFileName}`} type="audio/wav" />
                      הדפדפן שלך אינו תומך בהשמעת אודיו.
                    </audio>
                  ) : (
                    reminder.audioFileName ? (
                      <audio controls>
                        <source src={`http://localhost:5001/uploads/${reminder.audioFileName}`} type="audio/wav" />
                        הדפדפן שלך אינו תומך בהשמעת אודיו.
                      </audio>
                    ) : (
                      'אין הקלטה'
                    )
                  )}
                </td>
                <td>
                  {reminder.isCompleted ? 'הושלמה' : (
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
              <td colSpan="7">אין תזכורות להצגה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReminderTable;
