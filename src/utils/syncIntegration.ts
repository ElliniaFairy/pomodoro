import type { PomodoroSession } from '../types/timer';
import { loadHistory, saveHistory } from './storage';
import { 
  loadRemoteDocument, 
  mergeSessionDocuments, 
  syncRemoteData, 
  isSyncConfigured, 
  type SyncDocument 
} from './sync';

// Deletion tracking in localStorage
const DELETION_LOG_KEY = 'pomodoro_deleted_sessions';

const loadDeletionLog = (): string[] => {
  try {
    const stored = localStorage.getItem(DELETION_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDeletionLog = (deletedIds: string[]): void => {
  try {
    localStorage.setItem(DELETION_LOG_KEY, JSON.stringify(deletedIds));
  } catch (error) {
    console.error('Failed to save deletion log:', error);
  }
};

// Initialize history with cloud sync on app startup
export const initializeHistoryWithSync = async (): Promise<PomodoroSession[]> => {
  try {
    // Always load local sessions first
    const localSessions = loadHistory();
    
    // If sync is not configured, just return local sessions
    if (!isSyncConfigured()) {
      return localSessions;
    }
    
    // Try to load remote data and merge
    try {
      const remoteDocument = await loadRemoteDocument();
      if (remoteDocument) {
        const localDocument: SyncDocument = {
          sessions: localSessions,
          deletedSessionIds: loadDeletionLog(),
          updatedAt: Date.now()
        };
        
        const mergedDocument = mergeSessionDocuments(localDocument, remoteDocument);
        
        // Save merged result back to localStorage
        saveHistory(mergedDocument.sessions);
        saveDeletionLog(mergedDocument.deletedSessionIds);
        
        console.log(`Sync: Merged ${localSessions.length} local + ${remoteDocument.sessions.length} remote sessions → ${mergedDocument.sessions.length} total`);
        return mergedDocument.sessions;
      }
    } catch (syncError) {
      console.warn('Cloud sync unavailable, using local data only:', syncError);
    }
    
    return localSessions;
  } catch (error) {
    console.error('Failed to initialize history with sync:', error);
    // Fallback to local sessions
    return loadHistory();
  }
};

// Enhanced save that also syncs to cloud
export const saveHistoryWithSync = (sessions: PomodoroSession[]): void => {
  // Always save locally first (using existing function)
  saveHistory(sessions);
  
  // If sync is configured, queue remote sync
  if (isSyncConfigured()) {
    syncRemoteData({ 
      sessions, 
      deletedSessionIds: loadDeletionLog() 
    }).catch(error => {
      console.warn('Failed to queue remote sync:', error);
    });
  }
};

// Function to handle session deletion with sync
export const removeSessionWithSync = (sessionId: string): void => {
  // Add to deletion log
  const currentDeletions = loadDeletionLog();
  const updatedDeletions = [...currentDeletions, sessionId];
  saveDeletionLog(updatedDeletions);
  
  // Remove from local history
  const currentSessions = loadHistory();
  const updatedSessions = currentSessions.filter(session => session.id !== sessionId);
  saveHistoryWithSync(updatedSessions);
};