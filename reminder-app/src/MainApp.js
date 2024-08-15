import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Register from './Register';
import Login from './Login';
import AddReminder from './AddReminder';
import NavBar from './NavBar';
import ReminderTable from './ReminderTable';

function MainApp() {
  const [reminders, setReminders] = useState([]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState('add');
  const [audioFile, setAudioFile] = useState(null); // שמירה של שם קובץ האודיו האחרון

  const fetchReminders = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`http://localhost:5001/api/reminders/${user._id}`);
        setReminders(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const playAudio = (audioFileName) => {
    console.log('Trying to play:', audioFileName);
    if (typeof audioFileName !== 'string') {
      console.error('Invalid audio file name:', audioFileName);
      return;
    }
    
    const audioPath = `http://localhost:5001/uploads/${audioFileName}`;
    const audio = new Audio(audioPath);
  
    audio.play().catch(error => {
      console.error('Audio play failed:', error);
      console.error('Failed to load audio file from:', audioPath);
    });
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
  
      reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.executionDate);
        const alertDate = new Date(reminderDate.getTime() - 30 * 60 * 1000); // 30 דקות לפני הזמן שנקבע
  
        if (now >= alertDate && now < reminderDate && !reminder.isCompleted && !reminder.isAlerted) {
          playAudio(reminder.audioFileName || audioFile); // הפעלת הצליל
  
          // סימון התזכורת כהושמעה כדי למנוע צליל נוסף
          axios.put(`http://localhost:5001/api/reminders/${reminder._id}`, { isAlerted: true })
            .then(() => {
              setReminders(prevReminders =>
                prevReminders.map(r =>
                  r._id === reminder._id ? { ...r, isAlerted: true } : r
                )
              );
            })
            .catch(error => {
              console.error('Failed to update reminder:', error);
            });
        }
      });
    }, 60000); // בדיקה כל דקה
  
    return () => clearInterval(interval);
  }, [reminders, audioFile]);
  
  const addReminder = async ({ task, date, time, audioFile: newAudioFile }) => {
    try {
      const formData = new FormData();
      formData.append('task', task);
      formData.append('date', date);
      formData.append('time', time);
      formData.append('userId', user._id);
      
      // אם המשתמש העלה קובץ אודיו חדש, נשתמש בו ונעדכן את ה-state
      if (newAudioFile) {
        formData.append('audioFile', newAudioFile);
        setAudioFile(newAudioFile.name); // עדכון ה-state עם שם הקובץ בלבד
      } else if (audioFile) {
        formData.append('audioFile', audioFile);
      }
  
      const response = await axios.post(`http://localhost:5001/api/reminders/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setReminders([...reminders, response.data]);
    } catch (err) {
      console.error('Error in adding reminder:', err.response?.data || err.message);
    }
  };
  

  const completeReminder = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/reminders/${id}`, { isCompleted: true });
      setReminders(prevReminders => 
        prevReminders.map(reminder => 
          reminder._id === id ? { ...reminder, isCompleted: true } : reminder
        )
      );
    } catch (err) {
      console.error('Error completing reminder:', err);
    }
  };

  const handleNavClick = (view) => {
    if (view === 'logout') {
      setUser(null);
      localStorage.removeItem('user');
    } else {
      setView(view);
      if (view === 'view') {
        fetchReminders();
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <div>
      {!user ? (
        <div>
          {view === 'register' ? (
            <Register setUser={handleLogin} toggleView={() => setView('login')} />
          ) : (
            <Login setUser={handleLogin} toggleView={() => setView('register')} />
          )}
        </div>
      ) : (
        <div>
          <NavBar onNavClick={handleNavClick} activeView={view} />
          {view === 'add' && <AddReminder userId={user._id} onAdd={addReminder} />}
          {view === 'view' && <ReminderTable reminders={reminders} onComplete={completeReminder} fetchReminders={fetchReminders} />} {/* העברת הפונקציה ל-ReminderTable */}
          {view === 'status' && <div>Status View (TODO: Implement Status)</div>}
          {view === 'completed' && <div>Completed Tasks View (TODO: Implement Completed Tasks)</div>}
        </div>
      )}
    </div>
  );
}

export default MainApp;
