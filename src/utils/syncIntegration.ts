import type { PomodoroSession } from '../types/timer';

export const initializeHistoryWithSync = async (): Promise<PomodoroSession[]> => {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error(`Failed to load history: ${response.status}`);
    const sessions = await response.json();
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
    }));
  } catch (error) {
    console.warn('Cloud history unavailable:', error);
    return [];
  }
};

export const saveSession = (session: PomodoroSession): void => {
  fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  }).then((response) => {
    if (response.ok) return;
    return fetch('/api/history', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
  }).catch((error) => {
    console.warn('Failed to save session remotely:', error);
  });
};

export const removeSession = (sessionId: string): void => {
  fetch(`/api/history?id=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  }).catch((error) => {
    console.warn('Failed to delete session remotely:', error);
  });
};
