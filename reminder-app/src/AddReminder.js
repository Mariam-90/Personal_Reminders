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
      setAudioFile(null); // נשמור רק אם המשתמש מעלה קובץ חדש
      setRecurrence('none');
    }
  };

  return (
    <div>
      <h2>הוסף תזכורת חדשה</h2>
      <form onSubmit={handleSubmit}>
        <label>
          מְשִׁימָה:
          <input type="text" value={task} onChange={(e) => setTask(e.target.value)} />
        </label>
        <br />
        <label>
          תַאֲרִיך:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <br />
        <label>
          זְמַן:
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <br />
        <label>
          שֶׁמַע:
          <input type="file" accept="audio/*" onChange={handleAudioUpload} />
          {audioFile && <span> (הקובץ הנוכחי ישמש אם לא יעלה חדש)</span>}
        </label>
        <br />
        <label>
          הִשָׁנוּת:
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            <option value="none"> חד פעמי</option>
            <option value="daily">יוֹמִי</option>
            <option value="weekly">שבועי</option>
            <option value="monthly">חודשי</option>
          </select>
        </label>
        <br />
        <button type="submit">הוספת תזכורת</button>
      </form>
    </div>
  );
}

export default AddReminder;
