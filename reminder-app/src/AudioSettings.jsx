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

  const handlePreview = () => {
    const audio = new Audio(`${process.env.PUBLIC_URL}/${selectedAudio}`);
    audio.play().catch((err) => console.error('Preview failed:', err));
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
        <option value="reminder.wav">ברירת מחדל</option>
        <option value="reminder1.wav">ביפ</option>
        <option value="reminder2.wav">התראה</option>
        <option value="reminder3.wav">צלצול</option>
        <option value="blobbell.wav">פעמון</option>
        <option value="blobre3.wav">טינג</option>
      </select>
      <button type="button" className="preview-btn" onClick={handlePreview} title="האזנה לצליל">▶ האזן</button>
      <button onClick={handleSave}>שמור בחירות</button>
    </div>
  );
};

export default AudioSettings;
