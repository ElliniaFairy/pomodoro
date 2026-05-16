import type { TimerSettings } from '../types/timer';

const STORAGE_KEYS = {
  SETTINGS: 'pomodoro_settings',
};

// Settings storage
export const saveSettings = (settings: TimerSettings): void => {
  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, serialized);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadSettings = (): TimerSettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
};
