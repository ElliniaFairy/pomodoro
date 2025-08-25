import React from 'react';
import styled from 'styled-components';

interface GridProgressBarProps {
  sessionId: string;
  totalDuration: number; // in milliseconds
  elapsed: number; // in milliseconds  
  sessionType: 'focus' | 'break';
  rows?: number;
  cols?: number;
  style?: React.CSSProperties;
}

const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: -40px -40px;
`;

const Grid = styled.div<{ rows: number; cols: number }>`
  display: grid;
  grid-template-rows: repeat(${props => props.rows}, 1fr);
  grid-template-columns: repeat(${props => props.cols}, 1fr);
  gap: 2px;
  background: #1a1a1a;
  padding: 8px;
  border-radius: 8px;
  aspect-ratio: 2.5/1;
`;

const Block = styled.div<{ filled: boolean; sessionType: 'focus' | 'break' }>`
  background: ${props => {
    if (!props.filled) return '#333';
    return props.sessionType === 'focus' ? '#22c55e' : '#ff1493';
  }};
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const GridProgressBar: React.FC<GridProgressBarProps> = ({
  sessionId,
  totalDuration,
  elapsed,
  sessionType,
  rows = 20,
  cols = 50,
  style
}) => {
  const totalBlocks = rows * cols;
  const progressRatio = Math.min(elapsed / totalDuration, 1);
  const filledBlocks = Math.floor(progressRatio * totalBlocks);

  const shuffledBlocks = React.useMemo(() => {
    let blockRandomIndex = []
    for (let i = 0; i < totalBlocks; i++) {
      blockRandomIndex.push({i, random: Math.random()});
    }
    blockRandomIndex.sort((a, b) => a.random - b.random);
    return blockRandomIndex.map(block => block.i);
  }, [sessionId, totalBlocks]);

  const filledIndices = new Set(shuffledBlocks.slice(0, filledBlocks));

  return (
    <Container style={style}>
      <Grid rows={rows} cols={cols}>
        {Array.from({ length: totalBlocks }, (_, index) => (
          <Block
            key={index}
            filled={filledIndices.has(index)}
            sessionType={sessionType}
          />
        ))}
      </Grid>
    </Container>
  );
};

export default GridProgressBar;