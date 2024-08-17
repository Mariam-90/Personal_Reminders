import React, { useState } from 'react';

const AudioSettings = ({ onSave }) => {
  const [selectedAudio, setSelectedAudio] = useState('default.wav'); // Default audio selection
  const [customAudio, setCustomAudio] = useState(null);

  const handleAudioChange = (event) => {
    setSelectedAudio(event.target.value);
    console.log(`Selected predefined audio: ${event.target.value}`);
  };

  const handleCustomAudioUpload = (event) => {
    setCustomAudio(event.target.files[0]);
    console.log(`Uploaded custom audio file: ${event.target.files[0]?.name}`);
  };

  const handleSave = () => {
    console.log('Saving audio settings...');
    console.log(`Selected audio: ${selectedAudio}`);
    if (customAudio) {
      console.log(`Custom audio file to use: ${customAudio.name}`);
    } else {
      console.log('No custom audio file selected.');
    }
    onSave({ selectedAudio, customAudio });
  };

  return (
    <div>
      <h2>בחר צליל עבור כל התזכורות שלך</h2>
      <select value={selectedAudio} onChange={handleAudioChange}>
        <option value="reminder.wav">צליל ברירת מחדל</option>
        <option value="reminder1.wav">Beep</option>
        <option value="reminder2.wav">Alert</option>
        <option value="reminder3.wav">Chime</option>
        {/* Add more predefined audio files here */}
      </select>
      <br />
      <label>
        או העלה קובץ אודיו מותאם אישית:
        <input type="file" accept="audio/*" onChange={handleCustomAudioUpload} />
      </label>
      <br />
      <button onClick={handleSave}>שמור בחירות</button>
    </div>
  );
};

export default AudioSettings;
