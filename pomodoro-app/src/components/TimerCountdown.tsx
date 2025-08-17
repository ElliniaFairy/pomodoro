import React from 'react';
import styled from 'styled-components';

interface TimerCountdownProps {
  timeRemaining: number; // in milliseconds
  sessionType: 'focus' | 'break';
}

function formatTime(milliseconds: number): { minutes: number; seconds: number; display: string } {
  const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return { minutes, seconds, display };
}

const Container = styled.div`
  text-align: center;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
`;

const TimeDisplay = styled.div<{ isOvertime: boolean; sessionType: 'focus' | 'break' }>`
  font-size: 5rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: ${props => {
    if (props.isOvertime) return '#ff4444';
    return props.sessionType === 'focus' ? '#22c55e' : '#ff1493';
  }};
  padding: -20px;
  text-shadow: 0 0 10px currentColor;
`;

const TimerCountdown: React.FC<TimerCountdownProps> = ({
  timeRemaining,
  sessionType
}) => {
  const { display } = formatTime(timeRemaining);
  const isOvertime = timeRemaining < 0;

  return (
    <Container>
      <TimeDisplay isOvertime={isOvertime} sessionType={sessionType}>
        {isOvertime ? '+' : ''}{display}
      </TimeDisplay>
    </Container>
  );
};

export default TimerCountdown;