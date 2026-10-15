import axios from 'axios';
import { t } from '../i18n';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const TOKEN_KEY = 'pr_token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable - stay logged in for this tab only */
    }
  },
};

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Lets AuthContext log the user out when the server rejects the token.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && tokenStore.get()) onUnauthorized();
    return Promise.reject(err);
  }
);

// Message in the user's language for any request error (the API sends a stable `code`).
export function errorMessage(err) {
  const data = err?.response?.data;
  if (data?.code) {
    const text = t(`errors.${data.code}`);
    if (text !== `errors.${data.code}`) return text;
  }
  if (data?.error) return data.error;
  if (err?.request && !err.response) return t('errors.network');
  return t('errors.generic');
}

export const uploadsUrl = (fileName) => `${API_URL}/uploads/${encodeURIComponent(fileName)}`;

export default api;
