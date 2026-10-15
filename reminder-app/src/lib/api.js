import axios from 'axios';

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

// Human (Hebrew) message for any request error.
export function errorMessage(err, fallback = 'משהו השתבש, נסו שוב') {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.request && !err.response) return 'אין חיבור לשרת. בדקו שהשרת פועל.';
  return fallback;
}

export const uploadsUrl = (fileName) => `${API_URL}/uploads/${encodeURIComponent(fileName)}`;

export default api;
