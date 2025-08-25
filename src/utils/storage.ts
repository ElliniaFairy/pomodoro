import type { PomodoroSession, TimerSettings, UserProgress } from '../types/timer';

const STORAGE_KEYS = {
  CURRENT_SESSION: 'pomodoro_current_session',
  HISTORY: 'pomodoro_history',
  SETTINGS: 'pomodoro_settings',
  PROGRESS: 'pomodoro_progress'
};

// Current session storage
export const saveCurrentSession = (currentSession: PomodoroSession | null): void => {
  try {
    const serialized = JSON.stringify(currentSession);
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, serialized);
  } catch (error) {
    console.error('Failed to save current session:', error);
  }
};

export const loadCurrentSession = (): PomodoroSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!stored || stored === 'null') return null;
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return {
      ...parsed,
      startTime: new Date(parsed.startTime),
      endTime: new Date(parsed.endTime)
    };
  } catch (error) {
    console.error('Failed to load current session:', error);
    return null;
  }
};

// Session history storage
export const saveHistory = (history: PomodoroSession[]): void => {
  try {
    const serialized = JSON.stringify(history);
    localStorage.setItem(STORAGE_KEYS.HISTORY, serialized);
  } catch (error) {
    console.error('Failed to save session history:', error);
  }
};

export const loadHistory = (): PomodoroSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime)
    }));
  } catch (error) {
    console.error('Failed to load session history:', error);
    return [];
  }
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

// Progress storage
export const saveProgress = (progress: UserProgress): void => {
  try {
    const serialized = JSON.stringify(progress);
    localStorage.setItem(STORAGE_KEYS.PROGRESS, serialized);
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const loadProgress = (): UserProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Convert date string back to Date object if it exists
    return {
      ...parsed,
      lastSessionDate: parsed.lastSessionDate ? new Date(parsed.lastSessionDate) : undefined
    };
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
};