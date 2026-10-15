import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import { applyPreferences } from './hooks/usePreferences';

// Apply large text / contrast before the first paint.
applyPreferences();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
