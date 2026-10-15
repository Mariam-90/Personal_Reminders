import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RemindersProvider } from './context/RemindersContext';
import useHashRoute from './hooks/useHashRoute';
import Shell, { NAV_ITEMS } from './components/Shell';
import AlertEngine from './components/AlertEngine';
import AuthPage from './pages/AuthPage';
import TodayPage from './pages/TodayPage';
import AddReminderPage from './pages/AddReminderPage';
import RemindersPage from './pages/RemindersPage';

const ROUTES = NAV_ITEMS.map((n) => n.id);

const PAGES = {
  today: TodayPage,
  add: AddReminderPage,
  reminders: RemindersPage,
};

function ComingSoon() {
  return (
    <section className="page">
      <div className="card empty">
        <div className="empty-emoji">🛠️</div>
        <h3>בקרוב</h3>
      </div>
    </section>
  );
}

function SignedInApp() {
  const [route, navigate] = useHashRoute(ROUTES, 'today');
  const Page = PAGES[route] || ComingSoon;

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
  if (status === 'loading') {
    return (
      <div className="splash">
        <div className="spinner" role="status" aria-label="טוען" />
      </div>
    );
  }
  return user ? <SignedInApp /> : <AuthPage />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ToastProvider>
  );
}
