import React from 'react';
import styled from 'styled-components';
import useTimer from '../hooks/useTimer';
import TimerCountdown from './TimerCountdown';
import GridProgressBar from './GridProgressBar';
import SpaceshipControlPanel from './SpaceshipControlPanel';
import SessionHistory from './SessionHistory';
import BreakChecklist from './BreakChecklist';
import AddDescriptionModal from './AddDescriptionModal';
import TaskDescriptionDisplay from './TaskDescriptionDisplay';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #0f0f0f;
  min-height: 100dvh;
  width: 100%;
  color: white;
  overflow: auto;
  margin: 0;
  box-sizing: border-box;

  @media (max-width: 640px) {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }
`;

const ScrollArea = styled.div`
  @media (max-width: 640px) {
    flex: 1;
    overflow-y: auto;
    padding: 10px 10px 0;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
`;

const BottomDock = styled.div`
  @media (max-width: 640px) {
    flex-shrink: 0;
    padding: 6px 10px 20px;
    padding-bottom: max(20px, calc(env(safe-area-inset-bottom) + 10px));
    border-top: 1px solid rgba(0, 255, 255, 0.15);
    background: #0f0f0f;
  }
`;

const HistoryGrow = styled.div`
  @media (max-width: 640px) {
    margin-top: auto;
    max-height: 60vh;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
  }
`;

const MobileRetroSection = styled.div`
  display: none;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 640px) {
    display: block;
  }
`;

const RetroLink = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 0, 0.3);
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  padding: 6px 0;
  cursor: pointer;
  width: 100%;
  text-align: center;
  letter-spacing: 0.5px;
`;

const RetroPanel = styled.div`
  background: rgba(255, 255, 0, 0.08);
  border: 1px solid rgba(255, 255, 0, 0.25);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 4px;
`;

const RetroTimeInput = styled.input`
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #ffff00;
  border-radius: 8px;
  color: #ffff00;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: bold;
  padding: 8px;
  width: 100%;
  text-align: center;
  box-sizing: border-box;

  &:focus {
    outline: none;
    box-shadow: 0 0 15px #ffff00;
  }
`;

const RetroRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const RetroButton = styled.button<{ variant?: 'secondary' }>`
  background: ${props => props.variant === 'secondary'
    ? 'linear-gradient(135deg, #424242 0%, #212121 100%)'
    : 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)'};
  border: 2px solid ${props => props.variant === 'secondary' ? '#666' : '#00ffff'};
  border-radius: 10px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  padding: 10px 6px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.3px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  );
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const PomodoroTimer: React.FC = () => {
  const [checklistCompleted, setChecklistCompleted] = React.useState(false);
  const [isDescriptionModalOpened, setIsDescriptionModalOpened] = React.useState(false);
  const [showMobileRetro, setShowMobileRetro] = React.useState(false);
  const [mobileRetroTime, setMobileRetroTime] = React.useState('');
  const isMobile = useIsMobile();
  
  const {
    currentSession,
    history,
    settings,
    isRunning,
    timeRemaining,
    startSession,
    adjustTime,
    addDescription,
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

  const handleOpenAddDescriptionModal = () => {
    setIsDescriptionModalOpened(true)
  }

  const mobileRetroHandler = (type: 'focus' | 'break') => {
    if (mobileRetroTime) {
      const [h, m] = mobileRetroTime.split(':').map(Number);
      const t = new Date();
      t.setHours(h, m, 0, 0);
      if (t > new Date()) t.setDate(t.getDate() - 1);
      handleRetroactiveStart(t, type);
      setMobileRetroTime('');
      setShowMobileRetro(false);
    }
  };

  return (
    <PageContainer>
      <ScrollArea>
        {currentSession && (
          <>
            <TimerCountdown
              timeRemaining={timeRemaining}
              sessionType={currentSession.type}
            />

            {isDescriptionModalOpened &&
              (<AddDescriptionModal
                originalDescription={currentSession.taskDescription}
                addDescription={addDescription}
                onClose={() => {setIsDescriptionModalOpened(false)}}
              />)
            }

            <TaskDescriptionDisplay
              description={currentSession.taskDescription}
              onClick={handleOpenAddDescriptionModal}
            />

            {currentSession.type === 'break' && !checklistCompleted ? (
              <BreakChecklist
                onAllItemsCompleted={handleChecklistCompleted}
              />
            ) : !isMobile ? (
              <GridProgressBar
                sessionId={currentSession.id}
                totalDuration={getTotalDuration()}
                elapsed={getElapsed()}
                sessionType={currentSession.type}
              />
            ) : null}
          </>
        )}

        {!isMobile && (
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
        )}

        <HistoryGrow>
          <SessionHistory
            sessions={history}
            onRemoveSession={handleRemoveHistorySession}
          />
        </HistoryGrow>
      </ScrollArea>

      {isMobile && (
        <BottomDock>
          <MobileRetroSection>
            {showMobileRetro ? (
              <RetroPanel>
                <RetroTimeInput
                  type="time"
                  value={mobileRetroTime}
                  onChange={(e) => setMobileRetroTime(e.target.value)}
                />
                <RetroRow>
                  <RetroButton onClick={() => mobileRetroHandler('focus')} disabled={!mobileRetroTime}>
                    🎯 Focus at Time
                  </RetroButton>
                  <RetroButton variant="secondary" onClick={() => mobileRetroHandler('break')} disabled={!mobileRetroTime}>
                    ☕ Break at Time
                  </RetroButton>
                </RetroRow>
                <RetroLink onClick={() => setShowMobileRetro(false)}>close</RetroLink>
              </RetroPanel>
            ) : (
              <RetroLink onClick={() => setShowMobileRetro(true)}>
                ⏰ retroactive start
              </RetroLink>
            )}
          </MobileRetroSection>

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
        </BottomDock>
      )}
    </PageContainer>
  );
};

export default PomodoroTimer;