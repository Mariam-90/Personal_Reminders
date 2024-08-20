import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faEdit } from '@fortawesome/free-solid-svg-icons';

function ReminderTable({ reminders, onComplete, fetchReminders }) {
  const [editingReminder, setEditingReminder] = useState(null);
  const [updatedTask, setUpdatedTask] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');
  const [updatedTime, setUpdatedTime] = useState('');

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

  const startEditing = (reminder) => {
    setEditingReminder(reminder._id);
    setUpdatedTask(reminder.task);
    setUpdatedDate(reminder.executionDate.split('T')[0]);
    setUpdatedTime(reminder.executionDate.split('T')[1].slice(0, 5));
  };

  const saveUpdates = async (id) => {
    try {
      console.log("Saving updates:", { id, updatedTask, updatedDate, updatedTime });
      await axios.put(`http://localhost:5001/api/reminders/update-details/${id}`, {
        task: updatedTask,
        date: updatedDate,
        time: updatedTime,
      });
      setEditingReminder(null);
      fetchReminders();
    } catch (error) {
      console.error('Failed to update reminder:', error.response ? error.response.data : error.message);
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
            <th>עדכון</th>
            <th>מחיקה</th>
            <th>הקרא טקסט</th>
          </tr>
        </thead>
        <tbody>
          {incompleteReminders.length > 0 ? (
            incompleteReminders.map((reminder) => (
              <tr key={reminder._id}>
                <td>
                  {editingReminder === reminder._id ? (
                    <input
                      type="text"
                      value={updatedTask}
                      onChange={(e) => setUpdatedTask(e.target.value)}
                    />
                  ) : (
                    <span>{reminder.task}</span>
                  )}
                </td>
                <td>
                  {editingReminder === reminder._id ? (
                    <input
                      type="date"
                      value={updatedDate}
                      onChange={(e) => setUpdatedDate(e.target.value)}
                    />
                  ) : (
                    new Date(reminder.executionDate).toLocaleDateString('he-IL')
                  )}
                </td>
                <td>
                  {editingReminder === reminder._id ? (
                    <input
                      type="time"
                      value={updatedTime}
                      onChange={(e) => setUpdatedTime(e.target.value)}
                    />
                  ) : (
                    new Date(reminder.executionDate).toLocaleTimeString('he-IL')
                  )}
                </td>
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
                  {editingReminder === reminder._id ? (
                    <button onClick={() => saveUpdates(reminder._id)}>שמור</button>
                  ) : (
                    <button onClick={() => startEditing(reminder)}>עדכן</button>
                  )}
                </td>
                <td>
                  <button onClick={() => handleDelete(reminder._id)}>מחק</button>
                </td>
                <td>
                  <button
                    onClick={() => readTaskText(reminder.task)}
                    aria-label="הקרא טקסט"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <FontAwesomeIcon icon={faVolumeUp} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">אין תזכורות להצגה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReminderTable;
