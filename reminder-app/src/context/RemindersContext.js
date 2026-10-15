import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const RemindersContext = createContext(null);
const REFRESH_MS = 60 * 1000;

const sortByDate = (list) => [...list].sort((a, b) => new Date(a.executionDate) - new Date(b.executionDate));

export function RemindersProvider({ children }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/reminders');
      setReminders(sortByDate(res.data));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep in sync with the server (recurring reminders are created there).
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const replace = (updated) =>
    setReminders((list) => sortByDate(list.map((r) => (r._id === updated._id ? updated : r))));

  const add = useCallback(async ({ task, category, executionDate, recurrence, recording }) => {
    const form = new FormData();
    form.append('task', task);
    form.append('category', category);
    form.append('executionDate', executionDate.toISOString());
    form.append('recurrence', recurrence);
    if (recording) form.append('recording', recording, 'recording.webm');
    const res = await api.post('/reminders', form);
    setReminders((list) => sortByDate([...list, res.data]));
    return res.data;
  }, []);

  const update = useCallback(async (id, changes) => {
    const body = { ...changes };
    if (body.executionDate instanceof Date) body.executionDate = body.executionDate.toISOString();
    const res = await api.patch(`/reminders/${id}`, body);
    replace(res.data);
    return res.data;
  }, []);

  const complete = useCallback(async (id) => {
    const res = await api.post(`/reminders/${id}/complete`);
    setReminders((list) => {
      const next = list.map((r) => (r._id === id ? res.data.reminder : r));
      return sortByDate(res.data.next ? [...next, res.data.next] : next);
    });
    return res.data;
  }, []);

  const undo = useCallback(async (id) => {
    const res = await api.post(`/reminders/${id}/undo`);
    replace(res.data);
  }, []);

  const snooze = useCallback(async (id, minutes) => {
    const res = await api.post(`/reminders/${id}/snooze`, { minutes });
    replace(res.data);
    return res.data;
  }, []);

  const remove = useCallback(async (id) => {
    await api.delete(`/reminders/${id}`);
    setReminders((list) => list.filter((r) => r._id !== id));
  }, []);

  const value = useMemo(
    () => ({ reminders, loading, error, refresh, add, update, complete, undo, snooze, remove }),
    [reminders, loading, error, refresh, add, update, complete, undo, snooze, remove]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export const useReminders = () => useContext(RemindersContext);
