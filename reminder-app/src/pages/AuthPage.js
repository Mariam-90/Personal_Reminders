import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import LanguageMenu from '../components/LanguageMenu';
import { errorMessage } from '../lib/api';

export default function AuthPage() {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', fullName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError(t('auth.fillAll'));
      return;
    }
    if (isRegister && form.password.length < 6) {
      setError(t('errors.passwordShort'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await (isRegister ? register(form) : login(form));
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth-lang">
        <LanguageMenu />
      </div>
      <div className="auth-card">
        <div className="auth-hero">
          <div className="auth-brand">
            <div className="brand-logo" aria-hidden="true">🔔</div>
            <h1>{t('app.name')}</h1>
          </div>
          <p>{t('app.tagline')}</p>
        </div>

        <form className="card stack" onSubmit={submit} noValidate>
          <div className="segmented" role="tablist">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'active' : ''} onClick={() => switchMode('login')}>
              {t('auth.login')}
            </button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'active' : ''} onClick={() => switchMode('register')}>
              {t('auth.register')}
            </button>
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          {isRegister && (
            <label className="field">
              <span className="field-label">{t('auth.nameLabel')}</span>
              <input className="input" value={form.fullName} onChange={set('fullName')} autoComplete="name" placeholder={t('auth.namePlaceholder')} />
            </label>
          )}

          <label className="field">
            <span className="field-label">{t('auth.username')}</span>
            <input className="input" value={form.username} onChange={set('username')} autoComplete="username" dir="ltr" autoCapitalize="none" />
          </label>

          <label className="field">
            <span className="field-label">{t('auth.password')}</span>
            <div className="input-with-btn">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                dir="ltr"
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {isRegister && <span className="field-hint">{t('auth.minPassword')}</span>}
          </label>

          <button className="btn btn-primary btn-block btn-xl" type="submit" disabled={busy}>
            {busy ? t('common.wait') : isRegister ? t('auth.createAccount') : t('auth.login')}
          </button>
        </form>
      </div>
    </main>
  );
}
