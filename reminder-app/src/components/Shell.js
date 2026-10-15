import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasCaregiver, telLink } from '../lib/caregiver';

export const NAV_ITEMS = [
  { id: 'today', label: 'היום', icon: '🏠' },
  { id: 'reminders', label: 'תזכורות', icon: '📋' },
  { id: 'add', label: 'הוספה', icon: '+', className: 'nav-add' },
  { id: 'history', label: 'היסטוריה', icon: '📈' },
  { id: 'profile', label: 'פרופיל', icon: '👤' },
];

export default function Shell({ route, navigate, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/today">
          <span className="brand-logo" aria-hidden="true">🔔</span>
          <span>התזכורות שלי</span>
        </a>
        <span className="spacer" />
        {hasCaregiver(user) && (
          <a className="btn btn-danger btn-sm" href={telLink(user.caregiverPhone)} title={`התקשרות ל${user.caregiverName || 'איש הקשר'}`}>
            📞 <span>{user.caregiverName ? `חייג ל${user.caregiverName}` : 'חיוג לעזרה'}</span>
          </a>
        )}
        <button type="button" className="icon-btn" onClick={logout} title="יציאה" aria-label="יציאה">
          🚪
        </button>
      </header>

      <nav className="nav" aria-label="ניווט ראשי">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${item.className || ''} ${route === item.id ? 'active' : ''}`}
            aria-current={route === item.id ? 'page' : undefined}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <main>{children}</main>
    </div>
  );
}
