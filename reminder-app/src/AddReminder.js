import React, { useState } from 'react';

function AddReminder({ userId, onAdd }) {
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  const handleAudioUpload = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() && date.trim() && time.trim()) {
      onAdd({ task, date, time, audioFile });
      setTask('');
      setDate('');
      setTime('');
      setAudioFile(null);
    }
  };

  return (
    <div>
      <h2>Add a new reminder</h2>
      <form onSubmit={handleSubmit}>
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
          {audioFile && <span> (הקובץ הנוכחי ישמש אם לא יעלה חדש)</span>}
        </label>
        <button type="submit">Add Reminder</button>
      </form>
    </div>
  );
}

export default AddReminder;
