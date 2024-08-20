import React, { useState } from 'react';
import axios from 'axios';

const AudioSettings = ({ username, onSave }) => {
  const [selectedAudio, setSelectedAudio] = useState('reminder.wav'); 
  const [customAudio, setCustomAudio] = useState(null);

  const handleAudioChange = (event) => {
    setSelectedAudio(event.target.value);
  };

  const handleCustomAudioUpload = (event) => {
    setCustomAudio(event.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      if (customAudio) {
        formData.append('audioFile', customAudio);
        formData.append('audioType', 'custom');
      } else {
        formData.append('selectedAudio', selectedAudio);
        formData.append('audioType', 'predefined');
      }

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

      alert('הבחירה נשמרה בהצלחה!');
    } catch (error) {
      console.error('Error saving audio settings:', error);
      alert('אירעה שגיאה בשמירת העדפות האודיו.');
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
        <option value="blobbell.wav">Chime</option>
        <option value="blobre3.wav">Chime</option>
        
      </select>
      
      <button onClick={handleSave}>שמור בחירות</button>
    </div>
  );
};

export default AudioSettings;
