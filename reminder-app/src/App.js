import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import Register from './Register';
import Login from './Login';

function App() {
  const [reminders, setReminders] = useState([]);
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [user, setUser] = useState(null);
  const [showReminders, setShowReminders] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [audioFile, setAudioFile] = useState(null); // הוספת סטייט לקובץ האודיו

  const fetchReminders = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`http://localhost:5000/api/reminders/${user._id}`);
        setReminders(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAudioUpload = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const playAudio = (audioFileName) => {
    const audioPath = `http://localhost:5000/uploads/${audioFileName}`;
    console.log(`Attempting to play audio from path: ${audioPath}`);
    const audio = new Audio(audioPath);
    audio.play().catch(error => {
      console.error('Audio play failed:', error);
      console.error(`Failed to load audio file from path: ${audioPath}`);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.executionDate);
        const alertDate = new Date(reminderDate.getTime() - 30 * 60 * 1000);
        if (alertDate <= now && !reminder.isCompleted) {
          playAudio(reminder.audioFileName);
          // הסרה או עדכון של התזכורת שהושמעה
          axios.put(`http://localhost:5000/api/reminders/${reminder._id}`, { isCompleted: true })
            .then(response => {
              setReminders(prevReminders => prevReminders.filter(r => r._id !== reminder._id));
            })
            .catch(error => {
              console.error('Failed to update reminder:', error);
            });
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reminders]);

  const addReminder = async (e) => {
    e.preventDefault();
    if (task.trim() && date.trim() && time.trim()) {
      try {
        const formData = new FormData();
        formData.append('task', task);
        formData.append('date', date);
        formData.append('time', time);
        formData.append('userId', user._id);
        if (audioFile) {
          formData.append('audioFile', audioFile);
        }
        console.log('FormData before sending:', formData);
        const response = await axios.post(`http://localhost:5000/api/reminders/${user._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Added reminder response:', response.data);
        setReminders([...reminders, response.data]);
        setTask('');
        setDate('');
        setTime('');
        setAudioFile(null);
      } catch (err) {
        console.error('Error in adding reminder:', err.response.data);
      }
    }
  };

  const toggleShowReminders = () => {
    setShowReminders(!showReminders);
  };

  const toggleView = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Personal Reminder App</h1>
      </header>
      <main>
        {!user ? (
          <div>
            {showRegister ? (
              <Register setUser={setUser} toggleView={toggleView} />
            ) : (
              <Login setUser={setUser} toggleView={toggleView} />
            )}
          </div>
        ) : (
          <div>
            <div>
              <h2>Add a new reminder</h2>
              <form onSubmit={addReminder}>
                <label>
                  Task:
                  <input 
                    type="text" 
                    value={task} 
                    onChange={(e) => setTask(e.target.value)} 
                  />
                </label>
                <label>
                  Date:
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </label>
                <label>
                  Time:
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                  />
                </label>
                <label>
                  Audio:
                  <input 
                    type="file" 
                    accept="audio/*"
                    onChange={handleAudioUpload} 
                  />
                </label>
                <button type="submit">Add Reminder</button>
              </form>
            </div>
            <div>
              <button onClick={toggleShowReminders}>
                {showReminders ? 'Hide Reminders' : 'Show Reminders'}
              </button>
              <div className={`reminder-container ${showReminders ? 'show' : ''}`}>
                <h2>Your Reminders</h2>
                <ul>
                  {reminders.map((reminder) => (
                    <li key={reminder._id}>
                      <span className="reminder-item">
                        {reminder.task}
                        <span className="reminder-date">{new Date(reminder.executionDate).toLocaleDateString()}</span>
                        <span className="reminder-time">{new Date(reminder.executionDate).toLocaleTimeString()}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
