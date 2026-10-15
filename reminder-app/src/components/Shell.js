import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { hasCaregiver, telLink } from '../lib/caregiver';
import LanguageMenu from './LanguageMenu';

export const NAV_ITEMS = [
  { id: 'today', icon: '🏠' },
  { id: 'reminders', icon: '📋' },
  { id: 'add', icon: '+', className: 'nav-add' },
  { id: 'history', icon: '📈' },
  { id: 'profile', icon: '👤' },
];

export default function Shell({ route, navigate, children }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const contactName = user.caregiverName || t('header.theContact');

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/today">
          <span className="brand-logo" aria-hidden="true">🔔</span>
          <span>{t('app.name')}</span>
        </a>
        <span className="spacer" />
        <nav className="nav" aria-label={t('nav.main')}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${item.className || ''} ${route === item.id ? 'active' : ''}`}
              aria-current={route === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{t(`nav.${item.id}`)}</span>
            </button>
          ))}
        </nav>
        <span className="spacer" />
        {hasCaregiver(user) && (
          <a className="btn btn-danger btn-sm" href={telLink(user.caregiverPhone)} title={t('header.callTitle', { name: contactName })}>
            📞 <span>{user.caregiverName ? t('header.callTo', { name: user.caregiverName }) : t('header.callHelp')}</span>
          </a>
        )}
        <LanguageMenu />
        <button type="button" className="icon-btn" onClick={logout} title={t('header.logout')} aria-label={t('header.logout')}>
          🚪
        </button>
      </header>


      <main>{children}</main>
    </div>
  );
}
