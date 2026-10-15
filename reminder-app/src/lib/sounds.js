import api from './api';
import { getLanguage } from '../i18n';

// `name` is the i18n key under "sounds".
export const SOUNDS = [
  { id: 'reminder.wav', name: 'classic', emoji: '🔔' },
  { id: 'reminder1.wav', name: 'beep', emoji: '📟' },
  { id: 'reminder2.wav', name: 'alert', emoji: '🚨' },
  { id: 'reminder3.wav', name: 'chime', emoji: '🎐' },
  { id: 'blobbell.wav', name: 'bell', emoji: '🛎️' },
  { id: 'blobre3.wav', name: 'ting', emoji: '✨' },
];

const publicSound = (id) => `${process.env.PUBLIC_URL}/${id}`;

let customUrl = null;

// The custom sound is behind auth, so it is fetched once and kept as a blob URL.
async function resolveSoundUrl(soundName) {
  if (soundName !== 'custom') return publicSound(soundName || SOUNDS[0].id);
  if (!customUrl) {
    try {
      const res = await api.get('/users/me/sound', { responseType: 'blob' });
      customUrl = URL.createObjectURL(res.data);
    } catch {
      return publicSound(SOUNDS[0].id);
    }
  }
  return customUrl;
}

export function forgetCustomSound() {
  if (customUrl) URL.revokeObjectURL(customUrl);
  customUrl = null;
}

/**
 * Plays a sound. Returns a stop() function.
 * Browsers may block audio until the user has interacted with the page; that is reported, not thrown.
 */
export async function playSound(soundName, { loop = false } = {}) {
  const audio = new Audio(await resolveSoundUrl(soundName));
  audio.loop = loop;
  try {
    await audio.play();
  } catch {
    /* autoplay blocked - the alert screen offers a play button */
  }
  return () => {
    audio.pause();
    audio.currentTime = 0;
  };
}

export function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getLanguage().speech;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
