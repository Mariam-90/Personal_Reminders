import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AudioSettings from './AudioSettings';
import './Profile.css';

const API = 'http://localhost:5001/api/users';

const emptyProfile = {
  fullName: '',
  phone: '',
  notes: '',
  caregiverName: '',
  caregiverPhone: '',
  infoItems: [],
};

function Profile({ user, onAudioSave }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [largeText, setLargeText] = useState(localStorage.getItem('largeText') === 'true');

  useEffect(() => {
    axios
      .get(`${API}/${user._id}/profile`)
      .then((res) => setProfile({ ...emptyProfile, ...res.data }))
      .catch(() => setMessage({ text: 'לא ניתן לטעון את הפרטים', type: 'error' }));
  }, [user._id]);

  useEffect(() => {
    document.body.classList.toggle('large-text', largeText);
    localStorage.setItem('largeText', largeText);
  }, [largeText]);

  const setField = (field) => (e) => setProfile({ ...profile, [field]: e.target.value });

  const setItem = (index, field, value) => {
    const infoItems = profile.infoItems.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setProfile({ ...profile, infoItems });
  };

  const addItem = () => setProfile({ ...profile, infoItems: [...profile.infoItems, { label: '', value: '' }] });

  const removeItem = (index) =>
    setProfile({ ...profile, infoItems: profile.infoItems.filter((_, i) => i !== index) });

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API}/${user._id}/profile`, profile);
      setProfile({ ...emptyProfile, ...res.data });
      setMessage({ text: 'הפרטים נשמרו ✔', type: 'ok' });
    } catch (err) {
      setMessage({ text: 'השמירה נכשלה, נסו שוב', type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  return (
    <div className="profile-page">
      <h2>הפרופיל שלי</h2>
      <p className="profile-hello">שלום, {profile.fullName || user.username} 👋</p>

      <form className="profile-card" onSubmit={save}>
        <h3>הפרטים שלי</h3>
        <label>
          שם מלא
          <input type="text" value={profile.fullName} onChange={setField('fullName')} />
        </label>
        <label>
          טלפון
          <input type="tel" value={profile.phone} onChange={setField('phone')} />
        </label>
        <label>
          מידע חשוב עליי (תרופות, אלרגיות, כתובת...)
          <textarea rows="4" value={profile.notes} onChange={setField('notes')} />
        </label>

        <h3>מי עוזר לי ומזכיר לי</h3>
        <label>
          שם איש קשר / מטפל
          <input type="text" value={profile.caregiverName} onChange={setField('caregiverName')} />
        </label>
        <label>
          טלפון של איש הקשר
          <input type="tel" value={profile.caregiverPhone} onChange={setField('caregiverPhone')} />
        </label>

        <h3>עוד מידע</h3>
        {profile.infoItems.length === 0 && <p className="profile-empty">עדיין לא הוספתם מידע נוסף.</p>}
        {profile.infoItems.map((item, i) => (
          <div className="info-row" key={i}>
            <input
              type="text"
              placeholder="נושא (למשל: רופא משפחה)"
              value={item.label}
              onChange={(e) => setItem(i, 'label', e.target.value)}
            />
            <input
              type="text"
              placeholder="פרטים"
              value={item.value}
              onChange={(e) => setItem(i, 'value', e.target.value)}
            />
            <button type="button" className="remove-btn" onClick={() => removeItem(i)} title="מחיקה">
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="add-info-btn" onClick={addItem}>
          + הוספת מידע
        </button>

        <button type="submit" className="save-btn">שמירת הפרטים</button>
        {message.text && <div className={`profile-message ${message.type}`}>{message.text}</div>}
      </form>

      <div className="profile-card">
        <h3>צליל התזכורת</h3>
        <AudioSettings username={user.username} onSave={onAudioSave} />
      </div>

      <div className="profile-card">
        <h3>תצוגה</h3>
        <label className="toggle-row">
          <input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
          <span>הגדלת הטקסט בכל האפליקציה</span>
        </label>
      </div>
    </div>
  );
}

export default Profile;
