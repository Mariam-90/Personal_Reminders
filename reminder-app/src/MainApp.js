import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Register from './Register';
import Login from './Login';
import AddReminder from './AddReminder';
import NavBar from './NavBar';
import ReminderTable from './ReminderTable';
import StatusView from './StatusView';
import CompletedTasksView from './CompletedTasksView';
import AudioSettings from './AudioSettings';
import AudioPlayer from './AudioPlayer';

function MainApp() {
  const [reminders, setReminders] = useState([]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState('add');
  const [playedReminders, setPlayedReminders] = useState(new Set());

  const [selectedAudio, setSelectedAudio] = useState(() => {

    return localStorage.getItem('selectedAudio') || 'reminder1.wav';
  });

  const alertAudioRef = useRef(null);
  const reminderAudioRef = useRef(null);

  // Fetch reminders for the user
  const fetchReminders = useCallback(async () => {
    if (user) {
      try {
        console.log(`Fetching reminders for user: ${user.username}`);
        const response = await axios.get(`http://localhost:5001/api/reminders/${user._id}`);
        setReminders(response.data);
      } catch (err) {
        console.error('Failed to fetch reminders:', err);
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
        const alertDate = new Date(reminderDate.getTime() - 30 * 60 * 1000);
  
        if (now >= alertDate && now < reminderDate && !reminder.isCompleted &&!reminder.isAlerted) {
          console.log('alerting user', alertDate);
          console.log('reminderDate user', reminderDate);
          console.log('!reminder.isAlerted', !reminder.isAlerted);
          triggerAudioPlayer(alertAudioRef, selectedAudio, true);
  
          axios.put(`http://localhost:5001/api/reminders/${reminder._id}`, { 
            isAlerted: true, 
            recurrence: reminder.recurrence, 
            audioPlayed: true 
          })
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
  
        if (reminder.isAlerted && reminder.recurrence && !reminder.hasNewReminder) {
          let nextExecutionDate;
          switch (reminder.recurrence) {
            case 'daily':
              nextExecutionDate = new Date(reminderDate.getTime() + (24 * 60 * 60 * 1000));
              break;
            case 'weekly':
              nextExecutionDate = new Date(reminderDate.getTime() + (7 * 24 * 60 * 60 * 1000));
              break;
            case 'monthly':
              nextExecutionDate = new Date(reminderDate);
              nextExecutionDate.setMonth(reminderDate.getMonth() + 1);
              break;
            default:
              throw new Error('Invalid recurrence type');
          }
  
          axios.post(`http://localhost:5001/api/reminders/${reminder.userId}`, {
            task: reminder.task,
            executionDate: nextExecutionDate,
            recurrence: reminder.recurrence,
            audioFileName: reminder.audioFileName,
            recordedTaskAudioFileName: reminder.recordedTaskAudioFileName
          })
          .then(response => {
            setReminders(prevReminders =>
              prevReminders.map(r =>
                r._id === reminder._id ? { ...r, hasNewReminder: true } : r
              ).concat(response.data)
            );
          })
          .catch(error => {
            console.error('Failed to create new reminder:', error);
          });
        }
      });
    }, 60000); // Check every minute
  
    return () => clearInterval(interval);
  }, [reminders, selectedAudio, playedReminders]);
  
  // Trigger audio playback
  const triggerAudioPlayer = (audioRef, audioFileName, isPredefined = false) => {
    if (audioRef.current && !playedReminders.has(audioFileName)) {
      audioRef.current.playAudio(audioFileName, isPredefined);
      setPlayedReminders(prev => new Set(prev.add(audioFileName)));
    }
  };
  

  const addReminder = async ({ task, date, time, audioFile, recurrence }) => {
    try {
      const formData = new FormData();
      formData.append('task', task);
      formData.append('date', date);
      formData.append('time', time);
      formData.append('recurrence', recurrence);
      formData.append('userId', user._id);
  
      if (audioFile) {
        if (audioFile instanceof Blob) {
          formData.append('recordedTaskAudioFile', audioFile);
        } else {
          formData.append('audioFile', audioFile);
        }
      }
  
      // Debugging: Log the FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
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
  

   



  // Mark a reminder as completed
  
      
  const completeReminder = async (id) => {
    try {
      const completionDate = new Date(); // יצירת תאריך ושעה נוכחיים
      await axios.put(`http://localhost:5001/api/reminders/${id}`, { isCompleted: true, completionDate });
      setReminders(prevReminders => 
        prevReminders.map(reminder => 
          reminder._id === id ? { ...reminder, isCompleted: true, completionDate } : reminder
        )
      );
    } catch (err) {
      console.error('Error completing reminder:', err.response?.data || err.message);
    }
  };
  

  // Handle audio settings save
  const handleAudioSettingsSave = ({ selectedAudio, customAudio }) => {
    const audioToUse = customAudio ? URL.createObjectURL(customAudio) : selectedAudio;
    setSelectedAudio(audioToUse);
    localStorage.setItem('selectedAudio', audioToUse);
    alert('הבחירה נשמרה בהצלחה!');
  };

  // Handle navigation clicks
  const handleNavClick = (view) => {
    if (view === 'logout') {
      setUser(null);
      localStorage.removeItem('user');
    } else {
      setView(view);
      if (view === 'view' || view === 'status') {
        fetchReminders();
      }
    }
  };

  // Handle user login
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
          <AudioSettings username={user.username} onSave={handleAudioSettingsSave} />
          {view === 'add' && <AddReminder userId={user._id} onAdd={addReminder} />}
          {view === 'view' && <ReminderTable reminders={reminders} onComplete={completeReminder} fetchReminders={fetchReminders} />}
          {view === 'status' && <StatusView reminders={reminders} />}
          {view === 'completed' && <CompletedTasksView reminders={reminders} />}

          <AudioPlayer ref={alertAudioRef} username={user.username} />
          <AudioPlayer ref={reminderAudioRef} username={user.username} />
        </div>
      )}
    </div>
  );
}

export default MainApp;
