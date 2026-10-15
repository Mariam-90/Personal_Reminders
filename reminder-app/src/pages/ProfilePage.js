import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import usePreferences from '../hooks/usePreferences';
import Switch from '../components/Switch';
import LanguagePicker from '../components/LanguagePicker';
import { errorMessage } from '../lib/api';
import { playSound, SOUNDS } from '../lib/sounds';
import { hasCaregiver, telLink, whatsappLink } from '../lib/caregiver';

const DETAILS = ['fullName', 'phone', 'notes', 'caregiverName', 'caregiverPhone', 'infoItems'];
const pickDetails = (user) => Object.fromEntries(DETAILS.map((k) => [k, user[k] ?? (k === 'infoItems' ? [] : '')]));

function SoundPicker() {
  const { t } = useI18n();
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
      toast(t('profile.soundSaved'));
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
      toast(t('profile.customSaved'));
      preview('custom');
    } catch (err) {
      toast(errorMessage(err), { type: 'error' });
    }
  };

  const options = user.hasCustomSound ? [...SOUNDS, { id: 'custom', name: 'custom', emoji: '🎵' }] : SOUNDS;

  return (
    <div className="card">
      <h2 className="card-title">{t('profile.sound')}</h2>
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
            {t(`sounds.${s.name}`)}
            <span className="s-play">{user.soundName === s.id ? t('profile.chosen') : t('profile.tapToHear')}</span>
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          {t('profile.uploadSound')}
        </button>
        <span className="field-hint">{t('profile.uploadHint')}</span>
        <input ref={fileRef} type="file" accept="audio/*" hidden onChange={upload} />
      </div>
    </div>
  );
}

function NotificationsSetting() {
  const { t } = useI18n();
  const toast = useToast();
  const supported = 'Notification' in window;
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');

  const ask = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') toast(t('profile.notifEnabled'));
  };

  if (!supported) return null;
  return (
    <div className="switch-row" style={{ cursor: 'default' }}>
      <span className="switch-text">
        {t('profile.notifications')}
        <small>
          {permission === 'granted' ? t('profile.notifOn') : permission === 'denied' ? t('profile.notifDenied') : t('profile.notifAsk')}
        </small>
      </span>
      {permission === 'default' && (
        <button type="button" className="btn btn-accent btn-sm" onClick={ask}>
          {t('profile.enable')}
        </button>
      )}
      {permission === 'granted' && <span className="badge badge-ok">{t('profile.active')}</span>}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useI18n();
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
      toast(t('profile.saved'));
    } catch (err) {
      toast(errorMessage(err), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <h1 className="page-title">
        <span className="grad-text">{t('profile.title')}</span>
      </h1>
      <p className="page-sub">
        {t('profile.loggedAs')} <strong dir="ltr">{user.username}</strong>
      </p>

      <form className="stack" onSubmit={save}>
        <div className="card stack">
          <h2 className="card-title">{t('profile.details')}</h2>
          <label className="field">
            <span className="field-label">{t('profile.fullName')}</span>
            <input className="input" value={details.fullName} onChange={set('fullName')} maxLength={100} autoComplete="name" />
          </label>
          <label className="field">
            <span className="field-label">{t('profile.phone')}</span>
            <input className="input" type="tel" value={details.phone} onChange={set('phone')} maxLength={30} dir="ltr" autoComplete="tel" />
          </label>
          <label className="field">
            <span className="field-label">{t('profile.notes')}</span>
            <textarea className="textarea" value={details.notes} onChange={set('notes')} maxLength={2000} placeholder={t('profile.notesPlaceholder')} />
          </label>
        </div>

        <div className="card stack">
          <h2 className="card-title">{t('profile.helper')}</h2>
          <p style={{ color: 'var(--muted)' }}>{t('profile.helperText')}</p>
          <div className="when-grid">
            <label className="field">
              <span className="field-label">{t('profile.name')}</span>
              <input className="input" value={details.caregiverName} onChange={set('caregiverName')} maxLength={100} />
            </label>
            <label className="field">
              <span className="field-label">{t('profile.phone')}</span>
              <input className="input" type="tel" value={details.caregiverPhone} onChange={set('caregiverPhone')} maxLength={30} dir="ltr" />
            </label>
          </div>
          {hasCaregiver(user) && (
            <div className="row">
              <a className="btn btn-ghost btn-sm" href={telLink(user.caregiverPhone)}>
                {t('profile.call')}
              </a>
              <a
                className="btn btn-ghost btn-sm"
                target="_blank"
                rel="noreferrer"
                href={whatsappLink(user.caregiverPhone, t('profile.hello', { name: user.caregiverName || '', me: user.fullName || user.username }))}
              >
                {t('profile.whatsapp')}
              </a>
            </div>
          )}
        </div>

        <div className="card stack">
          <h2 className="card-title">{t('profile.moreInfo')}</h2>
          {details.infoItems.length === 0 && <p style={{ color: 'var(--faint)' }}>{t('profile.moreInfoHint')}</p>}
          {details.infoItems.map((item, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="info-row" key={i}>
              <input className="input" placeholder={t('profile.topic')} value={item.label} onChange={(e) => setItem(i, 'label', e.target.value)} maxLength={100} />
              <input className="input" placeholder={t('profile.detail')} value={item.value} onChange={(e) => setItem(i, 'value', e.target.value)} maxLength={500} />
              <button type="button" className="icon-btn" onClick={() => removeItem(i)} aria-label={t('profile.removeRow')}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addItem} style={{ alignSelf: 'flex-start' }}>
            {t('profile.addRow')}
          </button>
        </div>

        <button type="submit" className="btn btn-primary btn-xl btn-block" disabled={busy || !dirty}>
          {busy ? t('common.saving') : dirty ? t('profile.saveDetails') : t('profile.allSaved')}
        </button>
      </form>

      <h2 className="section-label">{t('profile.settings')}</h2>
      <div className="stack">
        <div className="card">
          <h2 className="card-title">🌐 {t('language.label')}</h2>
          <p className="field-hint" style={{ marginBottom: 12 }}>{t('language.hint')}</p>
          <LanguagePicker />
        </div>

        <SoundPicker />

        <div className="card">
          <h2 className="card-title">{t('profile.display')}</h2>
          <Switch label={t('profile.largeText')} hint={t('profile.largeTextHint')} checked={prefs.largeText} onChange={(v) => setPref('largeText', v)} />
          <Switch label={t('profile.highContrast')} hint={t('profile.highContrastHint')} checked={prefs.highContrast} onChange={(v) => setPref('highContrast', v)} />
          <NotificationsSetting />
        </div>

        <button type="button" className="btn btn-danger btn-block" onClick={logout}>
          {t('profile.logout')}
        </button>
      </div>
    </section>
  );
}
