import { useReducer, useEffect, useRef, useState } from 'react';
import type { PomodoroSession, TimerSettings, UserProgress, TimerAction } from '../types/timer';
import { addMinutes } from 'date-fns';
import { saveCurrentSession, loadCurrentSession, saveHistory, loadHistory, saveSettings, loadSettings, saveProgress, loadProgress } from '../utils/storage';
import { triggerSessionEndAlert, requestNotificationPermission } from '../utils/notifications';

interface AppState {
  currentSession: PomodoroSession | null;
  history: PomodoroSession[];
  settings: TimerSettings;
  progress: UserProgress;
}

const defaultSettings: TimerSettings = {
  defaultFocusDuration: 36,
  breakRatio: 1/3,
  minimumSessionDuration: 2,
};

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
  currentSession: loadCurrentSession(),
  history: loadHistory(),
  settings: loadSettings() || defaultSettings,
  progress: loadProgress() || defaultProgress,
});

function generateId(): string {
  return Date.now().toString();
}

function timerReducer(state: AppState, action: TimerAction): AppState {
  switch (action.type) {
    case 'START_SESSION': {
      // First, complete any current session with new session's start time
      const updatedHistory = state.currentSession 
        ? [...state.history, { ...state.currentSession, endTime: action.startTime }]
        : state.history;
      
      // Then create new session
      const newSession: PomodoroSession = {
        id: generateId(),
        type: action.sessionType,
        startTime: action.startTime,
        endTime: action.endTime,
        taskDescription: action.taskDescription,
      };

      return {
        ...state,
        currentSession: newSession,
        history: updatedHistory,
      };
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
      
      const completedSession = {
        ...state.currentSession,
        endTime: new Date(), // End at current time
      };
      
      return {
        ...state,
        currentSession: null,
        history: [...state.history, completedSession],
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

  // Save current session whenever it changes
  useEffect(() => {
    saveCurrentSession(state.currentSession);
  }, [state.currentSession]);

  // Save history whenever it changes
  useEffect(() => {
    saveHistory(state.history);
  }, [state.history]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress(state.progress);
  }, [state.progress]);
  return {
    currentSession: state.currentSession,
    history: state.history,
    settings: state.settings,
    progress: state.progress,
    isRunning,
    timeRemaining,
    startSession: (sessionType: 'focus' | 'break', options?: { startTime?: Date, endTime?: Date, duration?: number, taskDescription?: string }) => {
      let { startTime, endTime, taskDescription } = options ?? {};
      startTime = startTime || new Date();
      
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
            const lastFocusSession = [...state.history].reverse().find(session => session.type === 'focus');
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
      
      dispatch({
        type: 'START_SESSION',
        sessionType,
        startTime,
        endTime,
        taskDescription,
      });
    },
    adjustTime: (durationChange: number) => {
      dispatch({
        type: 'ADJUST_TIME',
        durationChange,
      });
    },
    completeSession: () => {
      dispatch({
        type: 'COMPLETE_SESSION',
      });
    },
    removeSession: () => {
      dispatch({
        type: 'REMOVE_SESSION',
      });
    },
    removeHistorySession: (sessionId: string) => {
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
