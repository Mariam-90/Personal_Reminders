import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider, useI18n } from './context/I18nContext';
import { ToastProvider } from './context/ToastContext';
import { RemindersProvider } from './context/RemindersContext';
import useHashRoute from './hooks/useHashRoute';
import Shell, { NAV_ITEMS } from './components/Shell';
import AlertEngine from './components/AlertEngine';
import AuthPage from './pages/AuthPage';
import TodayPage from './pages/TodayPage';
import AddReminderPage from './pages/AddReminderPage';
import RemindersPage from './pages/RemindersPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

const ROUTES = NAV_ITEMS.map((n) => n.id);

const PAGES = {
  today: TodayPage,
  add: AddReminderPage,
  reminders: RemindersPage,
  history: HistoryPage,
  profile: ProfilePage,
};

function SignedInApp() {
  const [route, navigate] = useHashRoute(ROUTES, 'today');
  const Page = PAGES[route];

  return (
    <RemindersProvider>
      <Shell route={route} navigate={navigate}>
        <Page navigate={navigate} />
        <AlertEngine />
      </Shell>
    </RemindersProvider>
  );
}

function Root() {
  const { user, status } = useAuth();
  const { t } = useI18n();
  if (status === 'loading') {
    return (
      <div className="splash">
        <div className="spinner" role="status" aria-label={t('app.loading')} />
      </div>
    );
  }
  return user ? <SignedInApp /> : <AuthPage />;
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
