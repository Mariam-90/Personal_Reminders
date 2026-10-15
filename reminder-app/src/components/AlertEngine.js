import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReminders } from '../context/RemindersContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/I18nContext';
import useNow from '../hooks/useNow';
import useReminderActions from '../hooks/useReminderActions';
import { getCategory } from '../lib/categories';
import { dueTime, formatTime, reminderStatus } from '../lib/time';
import { playSound, speak } from '../lib/sounds';
import { uploadsUrl } from '../lib/api';

const SEEN_KEY = 'pr_seen_alerts';
const PRE_ALERT_MINUTES = 15;
const REPEAT_EVERY_MS = 25 * 1000;
const MAX_REPEATS = 6;

function loadSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

// Keys include the due time, so a snoozed reminder rings again at its new time.
const alertKey = (r, prefix = '') => `${prefix}${r._id}@${dueTime(r).toISOString()}`;

function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body, icon: `${process.env.PUBLIC_URL}/logo192.png`, lang: 'he', dir: 'rtl' });
  } catch {
    /* some mobile browsers only allow notifications from a service worker */
  }
}

/**
 * Watches the reminders and shows a full-screen alert when one is due:
 * sound + spoken task (or the user's recording), repeated until the user responds.
 */
export default function AlertEngine() {
  const { t } = useI18n();
  const { reminders } = useReminders();
  const { user } = useAuth();
  const toast = useToast();
  const now = useNow(5000);
  const actions = useReminderActions();
  const [seen, setSeen] = useState(loadSeen);

  const markSeen = useCallback((key) => {
    setSeen((prev) => {
      const next = new Set(prev).add(key);
      const list = [...next].slice(-300);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(list));
      } catch {
        /* ignore */
      }
      return new Set(list);
    });
  }, []);

  const active = useMemo(
    () => reminders.find((r) => reminderStatus(r, now) === 'due' && !seen.has(alertKey(r))),
    [reminders, now, seen]
  );

  // Gentle heads-up shortly before a reminder.
  useEffect(() => {
    reminders.forEach((r) => {
      if (r.isCompleted) return;
      const minutes = (dueTime(r) - now) / 60000;
      const key = alertKey(r, 'pre:');
      if (minutes > 0 && minutes <= PRE_ALERT_MINUTES && !seen.has(key)) {
        markSeen(key);
        const msg = t('alert.soon', { minutes: Math.ceil(minutes), task: r.task });
        toast(`⏳ ${msg}`, { type: 'info', duration: 10000 });
        if (document.hidden) notify(t('alert.soonTitle'), msg);
      }
    });
  }, [reminders, now, seen, markSeen, toast, t]);

  // Ring: sound, then the task out loud; repeat until handled.
  const stopRef = useRef(null);
  const speakTimer = useRef(null);
  const announce = useCallback(
    async (r) => {
      stopRef.current?.();
      clearTimeout(speakTimer.current);
      stopRef.current = await playSound(user?.soundName);
      speakTimer.current = setTimeout(() => {
        if (r.recordedTaskAudioFileName) {
          new Audio(uploadsUrl(r.recordedTaskAudioFileName)).play().catch(() => speak(r.task));
        } else {
          speak(t('alert.spoken', { task: r.task }));
        }
      }, 2500);
    },
    [user, t]
  );

  useEffect(() => {
    if (!active) return undefined;
    notify(t('alert.notifyTitle'), active.task);
    announce(active);
    let count = 1;
    const id = setInterval(() => {
      count += 1;
      if (count > MAX_REPEATS) clearInterval(id);
      else announce(active);
    }, REPEAT_EVERY_MS);
    return () => {
      clearInterval(id);
      clearTimeout(speakTimer.current);
      stopRef.current?.();
      window.speechSynthesis?.cancel();
    };
    // Only restart when a different alert becomes active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?._id, active?.snoozeUntil]);

  if (!active) return null;

  const cat = getCategory(active.category);
  const close = () => markSeen(alertKey(active));
  const handle = (fn) => () => {
    close();
    fn();
  };

  return (
    <div className="alert-screen" role="alertdialog" aria-modal="true" aria-label={t('alert.aria', { task: active.task })} style={{ '--cat': cat.color }}>
      <div className="alert-box">
        <div className="alert-ring" aria-hidden="true">{cat.emoji}</div>
        <div className="alert-kicker">{t('alert.timeIs')}</div>
        <div className="alert-task" dir="auto">{active.task}</div>
        <div className="alert-time">{formatTime(dueTime(active))}</div>
        <div className="alert-actions">
          <button type="button" className="btn btn-success btn-xl btn-block" onClick={handle(() => actions.onComplete(active._id))}>
            {t('alert.did')}
          </button>
          <div className="row">
            <button type="button" className="btn btn-ghost btn-xl" onClick={handle(() => actions.onSnooze(active._id, 10))}>
              {t('alert.snooze')}
            </button>
            <button type="button" className="btn btn-ghost btn-xl" onClick={() => announce(active)}>
              {t('alert.again')}
            </button>
          </div>
          <button type="button" className="btn btn-ghost btn-block" onClick={close}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
