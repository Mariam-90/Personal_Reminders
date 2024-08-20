import React, { useState, useRef } from 'react';

function AddReminder({ onAdd, selectedAudio }) {
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleVoiceInput = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            setRecordedAudio(audioBlob);
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedAudioFile = recordedAudio || selectedAudio;
    onAdd({ 
      task, 
      date, 
      time, 
      audioFile: selectedAudioFile, 
      recurrence,
      hasNewReminder: false  // Adding the hasNewReminder field
    });
    setTask('');
    setDate('');
    setTime('');
    setRecurrence('none');
    setRecordedAudio(null);
  };

  return (
    <div>
      <h2>הוסף תזכורת חדשה</h2>
      <form onSubmit={handleSubmit}>
        <label>משימה:</label>
        <input type="text" value={task} onChange={(e) => setTask(e.target.value)} />
        <br />
        <label>תאריך:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <br />
        <label>זמן:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <br />
        <label>חזרתיות:</label>
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
          <option value="none">חד פעמי</option>
          <option value="daily">יומי</option>
          <option value="weekly">שבועי</option>
          <option value="monthly">חודשי</option>
        </select>
        <br />
        <label>
          או הקלטה קולית:
          <button type="button" onClick={handleVoiceInput}>
            {isRecording ? 'עצור הקלטה' : 'הקלט משימה 🎤'}
          </button>
        </label>
        {recordedAudio && (
          <div>
            <audio controls src={URL.createObjectURL(recordedAudio)}></audio>
          </div>
        )}
        <br />
        <button type="submit">הוספת תזכורת</button>
      </form>
    </div>
  );
}

export default AddReminder;
