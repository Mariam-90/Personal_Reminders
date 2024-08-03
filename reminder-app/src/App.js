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
  const [error, setError] = useState('');
  const [showReminders, setShowReminders] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [audio] = useState(new Audio('/reminder.mp3')); // הוספת צליל תזכורת

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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.executionDate);
        if (reminderDate <= now) {
          audio.play();
          // הסרה או עדכון של התזכורת שהושמעה
          setReminders(prevReminders => prevReminders.filter(r => r._id !== reminder._id));
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reminders, audio]);

  const addReminder = async (e) => {
    e.preventDefault();
    if (task.trim() && date.trim() && time.trim()) {
      try {
        const newReminder = { task, date, time };
        console.log("Reminder to be added: ", newReminder);
        const response = await axios.post(`http://localhost:5000/api/reminders/${user._id}`, newReminder);
        console.log("Added reminder response: ", response.data);
        setReminders([...reminders, response.data]);
        setTask('');
        setDate('');
        setTime('');
      } catch (err) {
        console.error(err);
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
