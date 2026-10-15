import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../lib/api';

export default function AuthPage() {
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
      setError('יש למלא שם משתמש וסיסמה');
      return;
    }
    if (isRegister && form.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
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
      <div className="auth-card">
        <div className="auth-hero">
          <div className="brand-logo" aria-hidden="true">🔔</div>
          <h1>
            <span className="grad-text">התזכורות שלי</span>
          </h1>
          <p>עוזר אישי שמזכיר לך בדיוק מה לעשות, בזמן.</p>
        </div>

        <form className="card stack" onSubmit={submit} noValidate>
          <div className="segmented" role="tablist">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'active' : ''} onClick={() => switchMode('login')}>
              כניסה
            </button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'active' : ''} onClick={() => switchMode('register')}>
              הרשמה
            </button>
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          {isRegister && (
            <label className="field">
              <span className="field-label">איך לקרוא לך?</span>
              <input className="input" value={form.fullName} onChange={set('fullName')} autoComplete="name" placeholder="למשל: סבתא רחל" />
            </label>
          )}

          <label className="field">
            <span className="field-label">שם משתמש</span>
            <input className="input" value={form.username} onChange={set('username')} autoComplete="username" dir="ltr" autoCapitalize="none" />
          </label>

          <label className="field">
            <span className="field-label">סיסמה</span>
            <div className="input-with-btn">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                dir="ltr"
              />
              <button type="button" className="icon-btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'הסתרת סיסמה' : 'הצגת סיסמה'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {isRegister && <span className="field-hint">לפחות 6 תווים</span>}
          </label>

          <button className="btn btn-primary btn-block btn-xl" type="submit" disabled={busy}>
            {busy ? 'רגע…' : isRegister ? 'יצירת חשבון' : 'כניסה'}
          </button>
        </form>
      </div>
    </main>
  );
}
