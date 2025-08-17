import React from 'react';
import useTimer from '../hooks/useTimer';
import TimerCountdown from './TimerCountdown';
import GridProgressBar from './GridProgressBar';
import SpaceshipControlPanel from './SpaceshipControlPanel';
import SessionHistory from './SessionHistory';

const PomodoroTimer: React.FC = () => {
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
  } = useTimer();

  const handleStartFocus = () => {
    startSession('focus');
  };

  const handleStartBreak = () => {
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

          <GridProgressBar 
            sessionId={currentSession.id}
            totalDuration={getTotalDuration()}
            elapsed={getElapsed()}
            sessionType={currentSession.type}
          />
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
      
      <SessionHistory sessions={history} />
      
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        color: '#666', 
        fontSize: '14px' 
      }}>
        ✨ All systems operational - Ready for productivity missions ✨
      </div>
    </div>
  );
};

export default PomodoroTimer;