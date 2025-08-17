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
  }
`;

const ControlSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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
  font-family: system-ui, -apple-system, sans-serif;
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
`;

const AdjustmentPanel = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  animation: ${hologramFlicker} 4s ease-in-out infinite;
`;

const AdjustButton = styled(SpaceButton)`
  min-width: 60px;
  padding: 10px;
  font-size: 14px;
  margin: 0 5px;
`;

const StatusDisplay = styled.div<{ sessionType?: 'focus' | 'break' | null }>`
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  color: ${props => {
    if (props.sessionType === 'focus') return '#00ff00';
    if (props.sessionType === 'break') return '#ff00ff';
    return '#00ffff';
  }};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px currentColor;
`;

const RetroactivePanel = styled.div`
  background: rgba(255, 255, 0, 0.1);
  border: 1px solid rgba(255, 255, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  animation: ${hologramFlicker} 5s ease-in-out infinite;
`;

const TimeInput = styled.input`
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #ffff00;
  border-radius: 8px;
  color: #ffff00;
  font-family: system-ui, -apple-system, sans-serif;
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

  const getStatusText = () => {
    if (!sessionType) return 'System Ready';
    if (isRunning) return `${sessionType} Session Active`;
    return `${sessionType} Session Complete`;
  };

  const handleRetroactiveStart = (sessionType: 'focus' | 'break') => {
    if (retroactiveTime) {
      const [hours, minutes] = retroactiveTime.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);
      
      // If time is in the future, set it to yesterday
      if (startTime > new Date()) {
        startTime.setDate(startTime.getDate() - 1);
      }
      
      onRetroactiveStart(startTime, sessionType);
      setRetroactiveTime('');
    }
  };

  return (
    <ControlPanel>
      <StatusDisplay sessionType={sessionType}>
        🚀 {getStatusText()} 🚀
      </StatusDisplay>

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
      
      <ControlSection>
        {!sessionType && (
          <>
            <SpaceButton onClick={onStartFocus}>
              🎯 Engage Focus
            </SpaceButton>
            
            <SpaceButton onClick={onStartBreak} variant="secondary">
              ☕ Break Protocol
            </SpaceButton>
          </>
        )}
        
        {sessionType === 'focus' && (
          <SpaceButton 
            onClick={onStartBreak}
            variant="secondary"
          >
            ☕ Start Break
          </SpaceButton>
        )}
        
        {sessionType === 'break' && (
          <SpaceButton 
            onClick={onStartFocus}
          >
            🎯 Start Focus
          </SpaceButton>
        )}
        
        {sessionType && (
          <>
            <SpaceButton 
              onClick={onComplete}
              disabled={!isRunning}
              variant="success"
            >
              ✅ COMPLETE
            </SpaceButton>
            
            <SpaceButton 
              onClick={onAbort}
              variant="danger"
            >
              🛑 Abort Mission
            </SpaceButton>
          </>
        )}
      </ControlSection>

      <AdjustmentPanel>
        <div style={{ textAlign: 'center', marginBottom: '15px', color: '#00ffff' }}>
          ⚡ Time Adjustment Matrix ⚡
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <AdjustButton onClick={() => onAdjustTime(-10)} variant="danger">-10m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(-3)} variant="danger">-3m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(-1)} variant="danger">-1m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(1)}>+1m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(3)}>+3m</AdjustButton>
          <AdjustButton onClick={() => onAdjustTime(10)}>+10m</AdjustButton>
        </div>
      </AdjustmentPanel>
    </ControlPanel>
  );
};

export default SpaceshipControlPanel;