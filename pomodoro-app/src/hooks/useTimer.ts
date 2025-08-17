import { useReducer, useEffect, useRef, useState } from 'react';
import type { PomodoroSession, TimerSettings, UserProgress, TimerAction } from '../types/timer';
import { addMinutes } from 'date-fns';

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

const initialState: AppState = {
  currentSession: null,
  history: [],
  settings: defaultSettings,
  progress: defaultProgress,
};

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
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const [, forceUpdate] = useState(0);
  
  const isRunning = !!state.currentSession;
  
  /**
   * Time remaining in milliseconds for current session (can be negative for overtime)
   */
  const timeRemaining = state.currentSession ? state.currentSession.endTime.getTime() - new Date().getTime() : 0;

  // Update timer every second when session is active
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);
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
      endTime = endTime || addMinutes(startTime, options?.duration ?? (sessionType === 'focus' 
        ? state.settings.defaultFocusDuration
        : state.settings.defaultFocusDuration * state.settings.breakRatio));
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
    updateSettings: (settings: Partial<TimerSettings>) => {
      dispatch({
        type: 'UPDATE_SETTINGS',
        settings,
      });
    },
  }
}

export default useTimer;
