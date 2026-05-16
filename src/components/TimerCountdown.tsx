import React from 'react';
import styled from 'styled-components';

interface TimerCountdownProps {
  timeRemaining: number; // in milliseconds
  sessionType: 'focus' | 'break';
  onClick?: () => void;
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

  @media (max-width: 640px) {
    padding: 6px 12px 2px;
  }
`;

const TimeDisplay = styled.div<{ isOvertime: boolean; sessionType: 'focus' | 'break' }>`
  font-size: 5rem;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  color: ${props => {
    if (props.isOvertime) return '#ff4444';
    return props.sessionType === 'focus' ? '#22c55e' : '#ff1493';
  }};
  padding: -20px;
  text-shadow: 0 0 10px currentColor;

  @media (max-width: 640px) {
    font-size: 3.5rem;
  }
`;

/** The pomodoro timer display. */
const TimerCountdown: React.FC<TimerCountdownProps> = ({
  timeRemaining,
  sessionType,
  onClick
}) => {
  const { display } = formatTime(timeRemaining);
  const isOvertime = timeRemaining < 0;

  return (
    <Container onClick={onClick}>
      <TimeDisplay isOvertime={isOvertime} sessionType={sessionType}>
        {isOvertime ? '+' : ''}{display}
      </TimeDisplay>
    </Container>
  );
};

export default TimerCountdown;