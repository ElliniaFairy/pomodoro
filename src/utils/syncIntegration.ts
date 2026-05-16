import type { PomodoroSession } from '../types/timer';

export const initializeCurrentSessionWithSync = async (): Promise<PomodoroSession | null> => {
  try {
    const response = await fetch('/api/current-session');
    if (!response.ok) throw new Error(`Failed to load current session: ${response.status}`);
    const session = await response.json();
    if (!session) return null;
    return {
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      updatedAt: session.updatedAt ? new Date(session.updatedAt) : undefined,
    };
  } catch (error) {
    console.warn('Current session unavailable:', error);
    return null;
  }
};

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

export const saveCurrentSession = async (session: PomodoroSession): Promise<PomodoroSession | null> => {
  const response = await fetch('/api/current-session', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  if (!response.ok) throw new Error(`Failed to save current session: ${response.status}`);
  const saved = await response.json();
  if (!saved) return null;
  return {
    ...saved,
    startTime: new Date(saved.startTime),
    endTime: new Date(saved.endTime),
    updatedAt: saved.updatedAt ? new Date(saved.updatedAt) : undefined,
  };
};

export const removeCurrentSession = (): Promise<void> =>
  fetch('/api/current-session', { method: 'DELETE' }).then((response) => {
    if (!response.ok) throw new Error(`Failed to delete current session: ${response.status}`);
  });

export const removeSession = (sessionId: string): void => {
  fetch(`/api/history?id=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  }).catch((error) => {
    console.warn('Failed to delete session remotely:', error);
  });
};
