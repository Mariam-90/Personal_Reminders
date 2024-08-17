import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Register from './Register';
import Login from './Login';
import AddReminder from './AddReminder';
import NavBar from './NavBar';
import ReminderTable from './ReminderTable';
import StatusView from './StatusView';
import CompletedTasksView from './CompletedTasksView';
import AudioSettings from './AudioSettings';

function MainApp() {
  const [reminders, setReminders] = useState([]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState('add');
  const [selectedAudio, setSelectedAudio] = useState(() => {
    return localStorage.getItem('selectedAudio') || 'default.wav';
  });

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
    const audioPath = `http://localhost:5001/uploads/${audioFileName || selectedAudio}`;
    const audio = new Audio(audioPath);
    audio.play().catch(error => {
      console.error('Audio play failed:', error);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.executionDate);
        const alertDate = new Date(reminderDate.getTime() - 30 * 60 * 1000);
        if (now >= alertDate && now < reminderDate && !reminder.isCompleted && !reminder.isAlerted) {
          playAudio(reminder.recordedTaskAudioFileName || reminder.audioFileName);
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
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders, selectedAudio]);

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
      const completionDate = new Date();
      await axios.put(`http://localhost:5001/api/reminders/${id}`, { isCompleted: true, completionDate });
      setReminders(prevReminders => 
        prevReminders.map(reminder => 
          reminder._id === id ? { ...reminder, isCompleted: true, completionDate } : reminder
        )
      );
    } catch (err) {
      console.error('Error completing reminder:', err);
    }
  };

  const handleAudioSettingsSave = ({ selectedAudio, customAudio }) => {
    const audioToUse = customAudio ? URL.createObjectURL(customAudio) : selectedAudio;
    setSelectedAudio(audioToUse);
    localStorage.setItem('selectedAudio', audioToUse);
  };

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
          <AudioSettings onSave={handleAudioSettingsSave} />
          {view === 'add' && <AddReminder userId={user._id} onAdd={addReminder} />}
          {view === 'view' && <ReminderTable reminders={reminders} onComplete={completeReminder} fetchReminders={fetchReminders} />}
          {view === 'status' && <StatusView reminders={reminders} />}
          {view === 'completed' && <CompletedTasksView reminders={reminders} />}
        </div>
      )}
    </div>
  );
}

export default MainApp;
