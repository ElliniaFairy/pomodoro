import type { PomodoroSession } from '../types/timer';

// Sync configuration interfaces
export interface SyncConfig {
  githubToken: string;
  gistId: string;
  filename: string;
}

export interface SyncDocument {
  sessions: PomodoroSession[];
  deletedSessionIds: string[];
  updatedAt: number;
}

export interface SyncStatus {
  isEnabled: boolean;
  isSyncing: boolean;
  lastSyncTime?: Date;
  error?: string;
}

// Storage keys for sync configuration
const SYNC_STORAGE_KEYS = {
  GITHUB_TOKEN: 'pomodoro_sync_github_token',
  GIST_ID: 'pomodoro_sync_gist_id',
  FILENAME: 'pomodoro_sync_filename',
  LAST_SYNC: 'pomodoro_sync_last_sync',
} as const;

const DEFAULT_FILENAME = 'pomodoro.json';
const DEFAULT_DOCUMENT: SyncDocument = { 
  sessions: [], 
  deletedSessionIds: [],
  updatedAt: 0 
};

// Configuration management
export const saveSyncConfig = (config: Partial<SyncConfig>): void => {
  try {
    if (config.githubToken !== undefined) {
      localStorage.setItem(SYNC_STORAGE_KEYS.GITHUB_TOKEN, config.githubToken);
    }
    if (config.gistId !== undefined) {
      localStorage.setItem(SYNC_STORAGE_KEYS.GIST_ID, config.gistId);
    }
    if (config.filename !== undefined) {
      localStorage.setItem(SYNC_STORAGE_KEYS.FILENAME, config.filename);
    }
  } catch (error) {
    console.error('Failed to save sync config:', error);
  }
};

export const loadSyncConfig = (): SyncConfig | null => {
  try {
    const githubToken = localStorage.getItem(SYNC_STORAGE_KEYS.GITHUB_TOKEN);
    const gistId = localStorage.getItem(SYNC_STORAGE_KEYS.GIST_ID);
    const filename = localStorage.getItem(SYNC_STORAGE_KEYS.FILENAME) || DEFAULT_FILENAME;
    
    if (!githubToken || !gistId) {
      return null;
    }
    
    return { githubToken, gistId, filename };
  } catch (error) {
    console.error('Failed to load sync config:', error);
    return null;
  }
};

export const clearSyncConfig = (): void => {
  try {
    Object.values(SYNC_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear sync config:', error);
  }
};

// GitHub Gist API functions
export const loadRemoteDocument = async (): Promise<SyncDocument | null> => {
  const config = loadSyncConfig();
  if (!config) return null;

  try {
    const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
      headers: {
        'Authorization': `Bearer ${config.githubToken}`,
        'Accept': 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Gist: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const file = data.files?.[config.filename];
    
    if (!file || !file.content) {
      return DEFAULT_DOCUMENT;
    }
    
    const parsed = JSON.parse(file.content);
    
    // Convert date strings back to Date objects
    return {
      ...parsed,
      sessions: parsed.sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime)
      }))
    };
  } catch (error) {
    console.error('Failed to load remote document:', error);
    throw error;
  }
};

export const saveRemoteDocument = async (document: SyncDocument): Promise<boolean> => {
  const config = loadSyncConfig();
  if (!config) return false;

  try {
    const body = {
      files: {
        [config.filename]: {
          content: JSON.stringify(document, null, 2)
        }
      }
    };

    const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${config.githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to save Gist: ${response.status} ${response.statusText}`);
    }

    // Update last sync time
    localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Failed to save remote document:', error);
    throw error;
  }
};

// Merge logic for handling conflicts between PCs
export const mergeSessionDocuments = (local: SyncDocument, remote: SyncDocument): SyncDocument => {
  // Create a map to deduplicate sessions by ID
  const sessionMap = new Map<string, PomodoroSession>();
  
  // Merge deletion logs - combine all deleted IDs
  const mergedDeletedIds = new Set([
    ...(local.deletedSessionIds || []),
    ...(remote.deletedSessionIds || [])
  ]);
  
  // Add all sessions from both documents
  [...local.sessions, ...remote.sessions].forEach(session => {
    // Skip sessions that have been deleted
    if (mergedDeletedIds.has(session.id)) {
      return;
    }
    
    const existing = sessionMap.get(session.id);
    // Keep the session with the earlier end time (assuming manual corrections shorten sessions)
    if (!existing || new Date(session.endTime).getTime() < new Date(existing.endTime).getTime()) {
      sessionMap.set(session.id, session);
    }
  });

  // Sort sessions by start time (newest first)
  const mergedSessions = Array.from(sessionMap.values())
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return {
    sessions: mergedSessions,
    deletedSessionIds: Array.from(mergedDeletedIds),
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0)
  };
};

// Immediate sync functionality
export const syncRemoteData = async (document: { sessions: PomodoroSession[], deletedSessionIds?: string[] }): Promise<void> => {
  try {
    const syncDocument: SyncDocument = {
      sessions: document.sessions,
      deletedSessionIds: document.deletedSessionIds || [],
      updatedAt: Date.now()
    };
    await saveRemoteDocument(syncDocument);
  } catch (error) {
    console.warn('Remote sync failed:', error);
  }
};

// Utility function to check if sync is configured
export const isSyncConfigured = (): boolean => {
  return loadSyncConfig() !== null;
};

// Get last sync time
export const getLastSyncTime = (): Date | null => {
  try {
    const lastSyncStr = localStorage.getItem(SYNC_STORAGE_KEYS.LAST_SYNC);
    return lastSyncStr ? new Date(lastSyncStr) : null;
  } catch {
    return null;
  }
};