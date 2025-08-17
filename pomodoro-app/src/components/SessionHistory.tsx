import React from 'react';
import styled from 'styled-components';
import type { PomodoroSession } from '../types/timer';
import { format, formatDuration, intervalToDuration } from 'date-fns';

interface SessionHistoryProps {
  sessions: PomodoroSession[];
}

const Container = styled.div`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border: 2px solid #00ffff;
  border-radius: 15px;
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
`;

const Title = styled.h2`
  color: #00ffff;
  text-align: center;
  font-family: system-ui, -apple-system, sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px currentColor;
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
`;

const SessionCard = styled.div<{ sessionType: 'focus' | 'break' }>`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${props => props.sessionType === 'focus' ? '#22c55e' : '#ff1493'};
  border-radius: 8px;
  padding: 15px;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 15px;
  align-items: center;
`;

const SessionType = styled.div<{ sessionType: 'focus' | 'break' }>`
  width: 60px;
  height: 30px;
  background: ${props => props.sessionType === 'focus' ? '#22c55e' : '#ff1493'};
  color: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
`;

const SessionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TimeRange = styled.div`
  color: #e5e7eb;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
`;

const TaskDescription = styled.div`
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
`;

const Duration = styled.div<{ sessionType: 'focus' | 'break' }>`
  color: ${props => props.sessionType === 'focus' ? '#22c55e' : '#ff1493'};
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
`;

const Stats = styled.div`
  text-align: right;
  font-size: 12px;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 40px;
`;

function formatSessionDuration(startTime: Date, endTime: Date): string {
  const duration = intervalToDuration({ start: startTime, end: endTime });
  const hours = duration.hours || 0;
  const minutes = duration.minutes || 0;
  const seconds = duration.seconds || 0;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
  );

  const todaySessions = sortedSessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.endTime);
    return sessionDate.toDateString() === today.toDateString();
  });

  const totalFocusTime = todaySessions
    .filter(s => s.type === 'focus')
    .reduce((total, session) => {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      return total + duration;
    }, 0);

  const totalSessions = todaySessions.length;
  const focusSessions = todaySessions.filter(s => s.type === 'focus').length;
  const breakSessions = todaySessions.filter(s => s.type === 'break').length;

  return (
    <Container>
      <Title>🎯 Mission Log 🎯</Title>
      
      {totalSessions > 0 && (
        <Stats style={{ marginBottom: '20px', textAlign: 'center' }}>
          Today: {focusSessions} focus • {breakSessions} breaks • {formatSessionDuration(new Date(0), new Date(totalFocusTime))} total focus
        </Stats>
      )}

      <SessionList>
        {sortedSessions.length === 0 ? (
          <EmptyState>
            No missions completed yet. Start your first session! 🚀
          </EmptyState>
        ) : (
          sortedSessions.slice(0, 10).map((session) => (
            <SessionCard key={session.id} sessionType={session.type}>
              <SessionType sessionType={session.type}>
                {session.type === 'focus' ? '🎯' : '☕'}
              </SessionType>
              
              <SessionDetails>
                <TimeRange>
                  {format(new Date(session.startTime), 'HH:mm')} → {format(new Date(session.endTime), 'HH:mm')}
                </TimeRange>
                {session.taskDescription && (
                  <TaskDescription>{session.taskDescription}</TaskDescription>
                )}
              </SessionDetails>
              
              <Duration sessionType={session.type}>
                {formatSessionDuration(new Date(session.startTime), new Date(session.endTime))}
              </Duration>
              
              <Stats>
                {format(new Date(session.endTime), 'MMM d')}
              </Stats>
            </SessionCard>
          ))
        )}
      </SessionList>
    </Container>
  );
};

export default SessionHistory;