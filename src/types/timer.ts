export interface PomodoroSession {
  id: string;
  type: 'focus' | 'break';
  startTime: Date;
  endTime: Date;
  taskDescription?: string;
}

export interface TimerSettings {
  defaultFocusDuration: number; // in minutes (your 36 minutes)
  breakRatio: number; // fraction of focus time (1/3 = 0.333)
  minimumSessionDuration: number; // in minutes (your 2-minute rule)
}

export interface UserProgress {
  level: number;
  experience: number;
  experienceToNext: number;
  totalSessions: number;
  streakDays: number;
  longestStreak: number;
  todaySessions: number;
  lastSessionDate?: Date;
}

export type TimerAction = 
  | { type: 'START_SESSION'; sessionType: 'focus' | 'break'; startTime: Date; endTime: Date; taskDescription?: string }
  | { type: 'REMOVE_SESSION' } // cancels current session, no recording
  | { type: 'REMOVE_HISTORY_SESSION'; sessionId: string } // removes specific session from history
  | { type: 'ADJUST_TIME'; durationChange: number } // +3 or -5 minutes
  | { type: 'COMPLETE_SESSION' } // finishes session, gets recorded
  | { type: 'UPDATE_SETTINGS'; settings: Partial<TimerSettings> };