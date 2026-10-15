import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import usePreferences from '../hooks/usePreferences';
import Switch from '../components/Switch';
import { errorMessage } from '../lib/api';
import { playSound, SOUNDS } from '../lib/sounds';
import { hasCaregiver, telLink, whatsappLink } from '../lib/caregiver';

const DETAILS = ['fullName', 'phone', 'notes', 'caregiverName', 'caregiverPhone', 'infoItems'];
const pickDetails = (user) => Object.fromEntries(DETAILS.map((k) => [k, user[k] ?? (k === 'infoItems' ? [] : '')]));

function SoundPicker() {
  const { user, updateProfile, uploadSound } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const stopRef = useRef(null);

  useEffect(() => () => stopRef.current?.(), []);

  const preview = async (id) => {
    stopRef.current?.();
    stopRef.current = await playSound(id);
  };

  const choose = async (id) => {
    preview(id);
    if (id === user.soundName) return;
    try {
      await updateProfile({ soundName: id });
      toast('הצליל נשמר 🔔');
    } catch (err) {
      toast(errorMessage(err), { type: 'error' });
    }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await uploadSound(file);
      toast('הצליל האישי נשמר 🎵');
      preview('custom');
    } catch (err) {
      toast(errorMessage(err), { type: 'error' });
    }
  };

  const options = user.hasCustomSound ? [...SOUNDS, { id: 'custom', label: 'הצליל שלי', emoji: '🎵' }] : SOUNDS;

  return (
    <div className="card">
      <h2 className="card-title">🔔 צליל התזכורת</h2>
      <div className="sound-grid">
        {options.map((s) => (
          <button
            type="button"
            key={s.id}
            className={`sound ${user.soundName === s.id ? 'active' : ''}`}
            onClick={() => choose(s.id)}
            aria-pressed={user.soundName === s.id}
          >
            <span className="s-emoji" aria-hidden="true">{s.emoji}</span>
            {s.label}
            <span className="s-play">{user.soundName === s.id ? '✔ נבחר' : '▶ לחצו לשמיעה'}</span>
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          ⬆️ העלאת צליל אישי
        </button>
        <span className="field-hint">למשל הקלטה של קול מוכר (עד 5MB)</span>
        <input ref={fileRef} type="file" accept="audio/*" hidden onChange={upload} />
      </div>
    </div>
  );
}

function NotificationsSetting() {
  const toast = useToast();
  const supported = 'Notification' in window;
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');

  const ask = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') toast('התראות הופעלו ✔');
  };

  if (!supported) return null;
  return (
    <div className="switch-row" style={{ cursor: 'default' }}>
      <span className="switch-text">
        התראות בדפדפן
        <small>
          {permission === 'granted'
            ? 'פעיל: תקבלו התראה גם כשהחלון ברקע'
            : permission === 'denied'
              ? 'נחסם בדפדפן. אפשר להפעיל מחדש בהגדרות האתר.'
              : 'כדי לקבל התראה גם כשהחלון ברקע'}
        </small>
      </span>
      {permission === 'default' && (
        <button type="button" className="btn btn-accent btn-sm" onClick={ask}>
          הפעלה
        </button>
      )}
      {permission === 'granted' && <span className="badge badge-ok">✔ פעיל</span>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const [prefs, setPref] = usePreferences();
  const [details, setDetails] = useState(() => pickDetails(user));
  const [busy, setBusy] = useState(false);

  const dirty = JSON.stringify(details) !== JSON.stringify(pickDetails(user));
  const set = (field) => (e) => setDetails({ ...details, [field]: e.target.value });

  const setItem = (index, field, value) =>
    setDetails({ ...details, infoItems: details.infoItems.map((it, i) => (i === index ? { ...it, [field]: value } : it)) });
  const addItem = () => setDetails({ ...details, infoItems: [...details.infoItems, { label: '', value: '' }] });
  const removeItem = (index) => setDetails({ ...details, infoItems: details.infoItems.filter((_, i) => i !== index) });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await updateProfile(details);
      setDetails(pickDetails(saved));
      toast('הפרטים נשמרו ✔');
    } catch (err) {
      toast(errorMessage(err), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <h1 className="page-title">
        <span className="grad-text">הפרופיל שלי</span>
      </h1>
      <p className="page-sub">
        מחוברים בתור <strong dir="ltr">{user.username}</strong>
      </p>

      <form className="stack" onSubmit={save}>
        <div className="card stack">
          <h2 className="card-title">🙂 הפרטים שלי</h2>
          <label className="field">
            <span className="field-label">שם מלא</span>
            <input className="input" value={details.fullName} onChange={set('fullName')} maxLength={100} autoComplete="name" />
          </label>
          <label className="field">
            <span className="field-label">טלפון</span>
            <input className="input" type="tel" value={details.phone} onChange={set('phone')} maxLength={30} dir="ltr" autoComplete="tel" />
          </label>
          <label className="field">
            <span className="field-label">מידע חשוב עליי</span>
            <textarea className="textarea" value={details.notes} onChange={set('notes')} maxLength={2000} placeholder="תרופות קבועות, אלרגיות, כתובת…" />
          </label>
        </div>

        <div className="card stack">
          <h2 className="card-title">🤝 מי עוזר לי</h2>
          <p style={{ color: 'var(--muted)' }}>בן משפחה או מטפל. יופיע כפתור חיוג מהיר, ואפשר לשלוח לו הודעה כשמפספסים תזכורת.</p>
          <div className="when-grid">
            <label className="field">
              <span className="field-label">שם</span>
              <input className="input" value={details.caregiverName} onChange={set('caregiverName')} maxLength={100} />
            </label>
            <label className="field">
              <span className="field-label">טלפון</span>
              <input className="input" type="tel" value={details.caregiverPhone} onChange={set('caregiverPhone')} maxLength={30} dir="ltr" />
            </label>
          </div>
          {hasCaregiver(user) && (
            <div className="row">
              <a className="btn btn-ghost btn-sm" href={telLink(user.caregiverPhone)}>
                📞 חיוג
              </a>
              <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={whatsappLink(user.caregiverPhone, `היי ${user.caregiverName || ''}, זה ${user.fullName || user.username} 🙂`)}>
                💬 וואטסאפ
              </a>
            </div>
          )}
        </div>

        <div className="card stack">
          <h2 className="card-title">📝 עוד מידע</h2>
          {details.infoItems.length === 0 && <p style={{ color: 'var(--faint)' }}>למשל: רופא משפחה, קופת חולים, מספר חירום.</p>}
          {details.infoItems.map((item, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="info-row" key={i}>
              <input className="input" placeholder="נושא" value={item.label} onChange={(e) => setItem(i, 'label', e.target.value)} maxLength={100} />
              <input className="input" placeholder="פרטים" value={item.value} onChange={(e) => setItem(i, 'value', e.target.value)} maxLength={500} />
              <button type="button" className="icon-btn" onClick={() => removeItem(i)} aria-label="מחיקת השורה">
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addItem} style={{ alignSelf: 'flex-start' }}>
            + הוספת שורה
          </button>
        </div>

        <button type="submit" className="btn btn-primary btn-xl btn-block" disabled={busy || !dirty}>
          {busy ? 'שומר…' : dirty ? 'שמירת הפרטים' : '✔ הכל שמור'}
        </button>
      </form>

      <h2 className="section-label">הגדרות</h2>
      <div className="stack">
        <SoundPicker />

        <div className="card">
          <h2 className="card-title">👓 תצוגה והתראות</h2>
          <Switch label="טקסט גדול" hint="מגדיל את כל הכתב באפליקציה" checked={prefs.largeText} onChange={(v) => setPref('largeText', v)} />
          <Switch label="ניגודיות גבוהה" hint="קווים וכתב בהירים יותר" checked={prefs.highContrast} onChange={(v) => setPref('highContrast', v)} />
          <NotificationsSetting />
        </div>

        <button type="button" className="btn btn-danger btn-block" onClick={logout}>
          🚪 יציאה מהחשבון
        </button>
      </div>
    </section>
  );
}
