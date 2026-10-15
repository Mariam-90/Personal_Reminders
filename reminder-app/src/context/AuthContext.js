import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setUnauthorizedHandler, tokenStore } from '../lib/api';
import { forgetCustomSound } from '../lib/sounds';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'loading' while an existing token is being checked, then 'ready'.
  const [status, setStatus] = useState(tokenStore.get() ? 'loading' : 'ready');

  const logout = useCallback(() => {
    tokenStore.set(null);
    forgetCustomSound();
    setUser(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;
    api
      .get('/users/me')
      .then((res) => setUser(res.data))
      .catch(() => logout())
      .finally(() => setStatus('ready'));
  }, [logout]);

  const authenticate = useCallback(async (mode, credentials) => {
    const res = await api.post(`/auth/${mode}`, credentials);
    tokenStore.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const updateProfile = useCallback(async (changes) => {
    const res = await api.put('/users/me', changes);
    setUser(res.data);
    return res.data;
  }, []);

  const uploadSound = useCallback(async (file) => {
    const form = new FormData();
    form.append('sound', file);
    const res = await api.post('/users/me/sound', form);
    forgetCustomSound();
    setUser(res.data);
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login: (c) => authenticate('login', c),
      register: (c) => authenticate('register', c),
      logout,
      updateProfile,
      uploadSound,
    }),
    [user, status, authenticate, logout, updateProfile, uploadSound]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
