import React, { useState } from 'react';
import axios from 'axios';

const AudioSettings = ({ username, onSave }) => {
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

  const handleSave = async () => {
    try {
      console.log('Saving audio settings...');
      console.log(`Selected audio: ${selectedAudio}`);

      const formData = new FormData();

      if (customAudio) {
        formData.append('audioFile', customAudio);
      } else {
        formData.append('selectedAudio', selectedAudio);
      }

      // Save audio setting to the server using the username
      await axios.put(
        `http://localhost:5001/api/users/updateAudioForUser/${username}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onSave({ selectedAudio, customAudio });
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
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
