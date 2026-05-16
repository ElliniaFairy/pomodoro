import React from 'react';
import styled, { keyframes, css } from 'styled-components';

interface SpaceshipControlPanelProps {
  onStartFocus: () => void;
  onStartBreak: () => void;
  onComplete: () => void;
  onAbort: () => void;
  onRetroactiveStart: (startTime: Date, sessionType: 'focus' | 'break') => void;
  onAdjustTime: (minutes: number) => void;
  isRunning: boolean;
  sessionType?: 'focus' | 'break' | null;
}

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px currentColor, inset 0 0 20px rgba(255,255,255,0.1); }
  50% { box-shadow: 0 0 40px currentColor, inset 0 0 30px rgba(255,255,255,0.2); }
`;

const hologramFlicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
  75% { opacity: 0.9; }
`;

const ControlPanel = styled.div`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border: 2px solid #00ffff;
  border-radius: 20px;
  padding: 30px;
  margin: 20px auto;
  max-width: 800px;
  position: relative;
  box-shadow:
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.1);

  @media (max-width: 640px) {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
    margin: 0;
    box-shadow: none;
    display: flex;
    flex-direction: column;
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff);
    border-radius: 20px;
    z-index: -1;
    animation: ${glowPulse} 3s ease-in-out infinite;

    @media (max-width: 640px) {
      display: none;
    }
  }
`;

const ControlSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 0;
    order: 2;
  }
`;

const ControlSectionIdle = styled(ControlSection)`
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
    margin-bottom: 0;
    order: 2;
  }
`;

const SpaceButton = styled.button<{
  variant?: 'primary' | 'danger' | 'secondary' | 'success';
  isActive?: boolean;
}>`
  background: ${props => {
    if (props.variant === 'danger') return 'linear-gradient(135deg, #ff1744 0%, #d50000 100%)';
    if (props.variant === 'secondary') return 'linear-gradient(135deg, #424242 0%, #212121 100%)';
    if (props.variant === 'success') return 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)';
    return 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)';
  }};

  border: 2px solid ${props => {
    if (props.variant === 'danger') return '#ff1744';
    if (props.variant === 'secondary') return '#666';
    if (props.variant === 'success') return '#00ff88';
    return '#00ffff';
  }};

  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  padding: 15px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  ${props => props.isActive && css`
    animation: ${glowPulse} 2s ease-in-out infinite;
    box-shadow: 0 0 30px currentColor;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.5), 0 0 30px currentColor;

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 640px) {
    padding: 10px 6px;
    font-size: 12px;
    letter-spacing: 0.3px;
    border-radius: 10px;
  }
`;

const AdjustmentPanel = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  animation: ${hologramFlicker} 4s ease-in-out infinite;

  @media (max-width: 640px) {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 4px 0 0;
    margin-top: 0;
    margin-bottom: 6px;
    animation: none;
    order: 1;
  }
`;

const AdjustLabel = styled.div`
  text-align: center;
  margin-bottom: 15px;
  color: #00ffff;

  @media (max-width: 640px) {
    font-size: 11px;
    margin-bottom: 8px;
  }
`;

const AdjustGrid = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }
`;

const AdjustButton = styled(SpaceButton)`
  min-width: 60px;
  padding: 10px;
  font-size: 14px;
  margin: 0 5px;

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
    margin: 0;
    padding: 8px 2px;
    font-size: 11px;
  }
`;

const RetroactivePanel = styled.div`
  background: rgba(255, 255, 0, 0.1);
  border: 1px solid rgba(255, 255, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  animation: ${hologramFlicker} 5s ease-in-out infinite;

  @media (max-width: 640px) {
    padding: 12px;
    margin-bottom: 10px;
  }
`;

const RetroactiveDesktop = styled.div`
  @media (max-width: 640px) {
    display: none;
  }
`;

const TimeInput = styled.input`
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #ffff00;
  border-radius: 8px;
  color: #ffff00;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: bold;
  padding: 10px;
  margin: 0 10px;
  width: 120px;
  text-align: center;

  &:focus {
    outline: none;
    box-shadow: 0 0 15px #ffff00;
  }

  @media (max-width: 640px) {
    width: 100%;
    margin: 0;
    padding: 8px;
    font-size: 14px;
    box-sizing: border-box;
  }
`;

const SpaceshipControlPanel: React.FC<SpaceshipControlPanelProps> = ({
  onStartFocus,
  onStartBreak,
  onComplete,
  onAbort,
  onRetroactiveStart,
  onAdjustTime,
  isRunning,
  sessionType
}) => {
  const [retroactiveTime, setRetroactiveTime] = React.useState('');

  const handleRetroactiveStart = (sessionType: 'focus' | 'break') => {
    if (retroactiveTime) {
      const [hours, minutes] = retroactiveTime.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);

      if (startTime > new Date()) {
        startTime.setDate(startTime.getDate() - 1);
      }

      onRetroactiveStart(startTime, sessionType);
      setRetroactiveTime('');
    }
  };

  const MainControlSection = sessionType ? ControlSection : ControlSectionIdle;

  return (
    <ControlPanel>
      <RetroactiveDesktop>
        <RetroactivePanel>
          <div style={{ textAlign: 'center', marginBottom: '15px', color: '#ffff00' }}>
            ⏰ Retroactive Launch Sequence ⏰
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <TimeInput
              type="time"
              value={retroactiveTime}
              onChange={(e) => setRetroactiveTime(e.target.value)}
              placeholder="18:14"
            />
            <SpaceButton
              onClick={() => handleRetroactiveStart('focus')}
              disabled={!retroactiveTime}
              style={{ marginLeft: '10px' }}
            >
              🎯 Focus at Time
            </SpaceButton>
            <SpaceButton
              onClick={() => handleRetroactiveStart('break')}
              disabled={!retroactiveTime}
              variant="secondary"
              style={{ marginLeft: '10px' }}
            >
              ☕ Break at Time
            </SpaceButton>
          </div>
        </RetroactivePanel>
      </RetroactiveDesktop>

      <MainControlSection>
        {!sessionType && (
          <>
            <SpaceButton onClick={onStartFocus}>
              🎯 Focus
            </SpaceButton>
            <SpaceButton onClick={onStartBreak} variant="secondary">
              ☕ Break
            </SpaceButton>
          </>
        )}
        {sessionType === 'focus' && (
          <SpaceButton onClick={onStartBreak} variant="secondary">
            ☕ Break
          </SpaceButton>
        )}
        {sessionType === 'break' && (
          <SpaceButton onClick={onStartFocus}>
            🎯 Focus
          </SpaceButton>
        )}
        {sessionType && (
          <>
            <SpaceButton onClick={onComplete} disabled={!isRunning} variant="success">
              ✅ Done
            </SpaceButton>
            <SpaceButton onClick={onAbort} variant="danger">
              🛑 Abort
            </SpaceButton>
          </>
        )}
      </MainControlSection>

      <AdjustmentPanel>
        <AdjustLabel>Adjust Time</AdjustLabel>
        <AdjustGrid>
          <AdjustButton onClick={() => onAdjustTime(-10)} variant="danger">-10m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(-3)} variant="danger">-3m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(-1)} variant="danger">-1m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(1)}>+1m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(3)}>+3m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(10)}>+10m</AdjustButton>
        </AdjustGrid>
      </AdjustmentPanel>
    </ControlPanel>
  );
};

export default SpaceshipControlPanel;