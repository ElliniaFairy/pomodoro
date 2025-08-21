import React from 'react';
import useTimer from '../hooks/useTimer';
import TimerCountdown from './TimerCountdown';
import GridProgressBar from './GridProgressBar';
import SpaceshipControlPanel from './SpaceshipControlPanel';
import SessionHistory from './SessionHistory';
import BreakChecklist from './BreakChecklist';

const PomodoroTimer: React.FC = () => {
  const [checklistCompleted, setChecklistCompleted] = React.useState(false);
  
  const {
    currentSession,
    history,
    settings,
    isRunning,
    timeRemaining,
    startSession,
    adjustTime,
    completeSession,
    removeSession,
    removeHistorySession,
  } = useTimer();

  const handleStartFocus = () => {
    startSession('focus');
  };

  const handleStartBreak = () => {
    setChecklistCompleted(false);
    startSession('break');
  };

  const handleComplete = () => {
    completeSession();
  };

  const handleAbort = () => {
    removeSession();
  };

  const handleRetroactiveStart = (startTime: Date, sessionType: 'focus' | 'break') => {
    startSession(sessionType, { startTime });
  };

  const handleAdjustTime = (minutes: number) => {
    adjustTime(minutes);
  };

  const handleChecklistCompleted = () => {
    setChecklistCompleted(true);
  };

  const handleRemoveHistorySession = (sessionId: string) => {
    removeHistorySession(sessionId);
  };

  // Calculate total duration for progress bar
  const getTotalDuration = () => {
    if (!currentSession) return 0;
    return currentSession.endTime.getTime() - currentSession.startTime.getTime();
  };

  const getElapsed = () => {
    if (!currentSession) return 0;
    const now = new Date();
    return Math.max(0, now.getTime() - currentSession.startTime.getTime());
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0f0f0f', 
      height: '100vh', 
      width: '100vw',
      color: 'white',
      overflow: 'auto',
      margin: 0,
      boxSizing: 'border-box'
    }}>      
      {currentSession && (
        <>
          <TimerCountdown 
            timeRemaining={timeRemaining}
            sessionType={currentSession.type}
          />

          {currentSession.type === 'break' && !checklistCompleted ? (
            <BreakChecklist 
              onAllItemsCompleted={handleChecklistCompleted}
            />
          ) : (
            <GridProgressBar 
              sessionId={currentSession.id}
              totalDuration={getTotalDuration()}
              elapsed={getElapsed()}
              sessionType={currentSession.type}
            />
          )}
        </>
      )}

      <SpaceshipControlPanel 
        onStartFocus={handleStartFocus}
        onStartBreak={handleStartBreak}
        onComplete={handleComplete}
        onAbort={handleAbort}
        onRetroactiveStart={handleRetroactiveStart}
        onAdjustTime={handleAdjustTime}
        isRunning={isRunning}
        sessionType={currentSession?.type || null}
      />
      
      <SessionHistory 
        sessions={history} 
        onRemoveSession={handleRemoveHistorySession}
      />
    </div>
  );
};

export default PomodoroTimer;