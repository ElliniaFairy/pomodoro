import { useReducer, useEffect, useRef, useState } from 'react';
import type { PomodoroSession, TimerSettings, UserProgress, TimerAction } from '../types/timer';
import { addMinutes } from 'date-fns';
import { saveSettings, loadSettings } from '../utils/storage';
import { saveSession, initializeHistoryWithSync, removeSession as removeRemoteSession, initializeCurrentSessionWithSync, saveCurrentSession as saveRemoteCurrentSession, removeCurrentSession as removeRemoteCurrentSession } from '../utils/syncIntegration';
import { triggerSessionEndAlert, requestNotificationPermission } from '../utils/notifications';

interface AppState {
  currentSession: PomodoroSession | null;
  history: PomodoroSession[];
  settings: TimerSettings;
}

const defaultSettings: TimerSettings = {
  defaultFocusDuration: 36,
  breakRatio: 1/3,
  minimumSessionDuration: 2,
};

// Reserved for future use
const defaultProgress: UserProgress = {
  level: 1,
  experience: 0,
  experienceToNext: 100,
  totalSessions: 0,
  streakDays: 0,
  longestStreak: 0,
  todaySessions: 0
};

const createInitialState = (): AppState => ({
  currentSession: null,
  history: [], // Will be initialized async
  settings: loadSettings() || defaultSettings,
});

function generateId(): string {
  return Date.now().toString();
}

function timerReducer(state: AppState, action: TimerAction): AppState {
  switch (action.type) {
    case 'START_SESSION': {
      const updatedHistory = action.completedSession
        ? [action.completedSession, ...state.history]
        : state.history;

      return {
        ...state,
        currentSession: action.session,
        history: updatedHistory,
      };
    }

    case 'ADD_DESCRIPTION': {
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          taskDescription: action.description
        }
      }
    }

    case 'ADJUST_TIME': {
      if (!state.currentSession || !state.currentSession.endTime) return state;
      
      const now = new Date();
      const currentEndTime = state.currentSession.endTime;
      
      let newEndTime: Date;
      if (currentEndTime > now) {
        // Timer is still running - adjust from planned end time
        newEndTime = addMinutes(currentEndTime, action.durationChange);
      } else {
        // Timer has finished - adjust from now, minimum 1 minute
        const adjustmentMinutes = Math.max(action.durationChange, 1);
        newEndTime = addMinutes(now, adjustmentMinutes);
      }
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          endTime: newEndTime,
        },
      };
    }

    case 'COMPLETE_SESSION': {
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: null,
        history: [action.session, ...state.history],
      };
    }

    case 'REMOVE_SESSION': {
      return {
        ...state,
        currentSession: null,
      };
    }

    case 'REMOVE_HISTORY_SESSION': {
      return {
        ...state,
        history: state.history.filter(session => session.id !== action.sessionId),
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    }

    case 'INITIALIZE_CURRENT_SESSION': {
      return {
        ...state,
        currentSession: action.session,
      };
    }

    case 'INITIALIZE_HISTORY': {
      return {
        ...state,
        history: action.history,
      };
    }

    default:
      return state;
  }
}

function useTimer() {
  const [state, dispatch] = useReducer(timerReducer, createInitialState());
  const [, forceUpdate] = useState(0);
  const prevTimeRemainingRef = useRef<number>(0);
  
  const isRunning = !!state.currentSession;
  
  /**
   * Time remaining in milliseconds for current session (can be negative for overtime)
   */
  const timeRemaining = state.currentSession ? state.currentSession.endTime.getTime() - new Date().getTime() : 0;

  // Initialize history with sync on mount
  useEffect(() => {
    const initRemoteState = async () => {
      const [history, currentSession] = await Promise.all([
        initializeHistoryWithSync(),
        initializeCurrentSessionWithSync(),
      ]);
      dispatch({ type: 'INITIALIZE_HISTORY', history });
      dispatch({ type: 'INITIALIZE_CURRENT_SESSION', session: currentSession });
    };
    initRemoteState();
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Update timer every second when session is active
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Check if timer just hit zero and trigger notification
  useEffect(() => {
    const prevTimeRemaining = prevTimeRemainingRef.current;
    prevTimeRemainingRef.current = timeRemaining;

    // If we crossed from positive to negative (timer just hit zero)
    if (state.currentSession && prevTimeRemaining > 0 && timeRemaining <= 0) {
      triggerSessionEndAlert(state.currentSession.type);
    }
  }, [timeRemaining, state.currentSession]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  return {
    currentSession: state.currentSession,
    history: state.history,
    settings: state.settings,
    isRunning,
    timeRemaining,
    startSession: (sessionType: 'focus' | 'break', options?: { startTime?: Date, endTime?: Date, duration?: number, taskDescription?: string }) => {
      let { startTime, endTime, taskDescription } = options ?? {};
      startTime = startTime || new Date();
      const completedSession = state.currentSession
        ? { ...state.currentSession, endTime: startTime }
        : undefined;
      if (completedSession) {
        saveSession(completedSession);
      }
      
      if (!endTime && !options?.duration) {
        if (sessionType === 'focus') {
          endTime = addMinutes(startTime, state.settings.defaultFocusDuration);
        } else {
          // Break session: calculate duration based on actual focus time (1/3 of what was actually worked)
          let breakDuration = state.settings.defaultFocusDuration * state.settings.breakRatio; // fallback default
          
          if (state.currentSession && state.currentSession.type === 'focus') {
            // Currently in focus session - use actual time worked so far
            const actualFocusDuration = (startTime.getTime() - new Date(state.currentSession.startTime).getTime()) / (1000 * 60); // in minutes
            breakDuration = actualFocusDuration * state.settings.breakRatio;
          } else if (state.history.length > 0) {
            // Not in focus session - use last completed focus session duration
            const lastFocusSession = state.history.find(session => session.type === 'focus');
            if (lastFocusSession) {
              const actualFocusDuration = (new Date(lastFocusSession.endTime).getTime() - new Date(lastFocusSession.startTime).getTime()) / (1000 * 60); // in minutes
              breakDuration = actualFocusDuration * state.settings.breakRatio;
            }
          }
          
          endTime = addMinutes(startTime, breakDuration);
        }
      } else if (!endTime) {
        endTime = addMinutes(startTime, options?.duration ?? 0);
      }

      const newSession: PomodoroSession = {
        id: generateId(),
        type: sessionType,
        startTime,
        endTime,
        taskDescription,
      };

      saveRemoteCurrentSession(newSession)
        .then((savedSession) => {
          if (!savedSession) return;
          dispatch({ type: 'INITIALIZE_CURRENT_SESSION', session: savedSession });
        })
        .catch((error) => {
          console.warn('Failed to save current session remotely:', error);
        });
      
      dispatch({
        type: 'START_SESSION',
        session: newSession,
        completedSession,
      });
    },
    addDescription: (description: string) => {
      if (!state.currentSession) return;
      const updatedSession = {
        ...state.currentSession,
        taskDescription: description,
      };
      saveRemoteCurrentSession(updatedSession)
        .then((savedSession) => {
          if (!savedSession) return;
          dispatch({ type: 'INITIALIZE_CURRENT_SESSION', session: savedSession });
        })
        .catch((error) => {
          console.warn('Failed to save current session remotely:', error);
        });
      dispatch({
        type: 'ADD_DESCRIPTION',
        description
      })
    },
    adjustTime: (durationChange: number) => {
      if (!state.currentSession || !state.currentSession.endTime) return;
      const now = new Date();
      const currentEndTime = state.currentSession.endTime;
      const endTime = currentEndTime > now
        ? addMinutes(currentEndTime, durationChange)
        : addMinutes(now, Math.max(durationChange, 1));
      saveRemoteCurrentSession({
        ...state.currentSession,
        endTime,
      }).then((savedSession) => {
        if (!savedSession) return;
        dispatch({ type: 'INITIALIZE_CURRENT_SESSION', session: savedSession });
      }).catch((error) => {
        console.warn('Failed to save current session remotely:', error);
      });
      dispatch({
        type: 'ADJUST_TIME',
        durationChange,
      });
    },
    completeSession: () => {
      if (!state.currentSession) return;

      const completedSession = {
        ...state.currentSession,
        endTime: new Date(),
      };

      saveSession(completedSession);
      removeRemoteCurrentSession().catch((error) => {
        console.warn('Failed to delete current session remotely:', error);
      });
      dispatch({
        type: 'COMPLETE_SESSION',
        session: completedSession,
      });
    },
    removeSession: () => {
      removeRemoteCurrentSession().catch((error) => {
        console.warn('Failed to delete current session remotely:', error);
      });
      dispatch({
        type: 'REMOVE_SESSION',
      });
    },
    removeHistorySession: (sessionId: string) => {
      removeRemoteSession(sessionId);
      
      dispatch({
        type: 'REMOVE_HISTORY_SESSION',
        sessionId,
      });
    },
    updateSettings: (settings: Partial<TimerSettings>) => {
      dispatch({
        type: 'UPDATE_SETTINGS',
        settings,
      });
    },
  }
}

export default useTimer;
