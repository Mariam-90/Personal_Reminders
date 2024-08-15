import React, { useState } from 'react';

function AddReminder({ userId, onAdd }) {
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [audioFile, setAudioFile] = useState(null);

  const handleAudioUpload = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() && date.trim() && time.trim()) {
      onAdd({ task, date, time, audioFile, recurrence });
      setTask('');
      setDate('');
      setTime('');
      setAudioFile(null); // נמחוק את קובץ האודיו מה-state רק אם המשתמש מעלה קובץ חדש
      setRecurrence('none');
    }
  };

  return (
    <div>
      <h2>Add a new reminder</h2>
      <form onSubmit={handleSubmit}>
        {/* שאר השדות */}
        <label>
          Task:
          <input type="text" value={task} onChange={(e) => setTask(e.target.value)} />
        </label>
        <br />
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <br />
        <label>
          Time:
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <br />
        <label>
          Audio:
          <input type="file" accept="audio/*" onChange={handleAudioUpload} />
          {audioFile && <span> (הקובץ הנוכחי ישמש אם לא יעלה חדש)</span>}
        </label>
        <br />
        <label>
          Recurrence:
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            <option value="none">No Recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <br />
        <button type="submit">Add Reminder</button>
      </form>
    </div>
  );
}

export default AddReminder;
