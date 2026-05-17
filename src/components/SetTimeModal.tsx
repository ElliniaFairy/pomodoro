import { useState, useEffect } from 'react';
import styled from 'styled-components';

interface SetTimeModalProps {
  currentRemainingMs: number;
  onSetTime: (minutes: number) => void;
  onClose: () => void;
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
`;

const ModalPanel = styled.div`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border: 2px solid #00ffff;
  border-radius: 20px;
  padding: 30px 40px;
  max-width: 400px;
  width: 90%;
  position: relative;

  @media (max-width: 640px) {
    padding: 20px 24px;
    width: auto;
    margin: 0 32px;
  }
`;

const ModalTitle = styled.div`
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  margin: 0 0 20px;
  font-weight: bold;
  color: #00ffff;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media (max-width: 640px) {
    font-size: 16px;
    margin: 0 0 16px;
    letter-spacing: 1px;
  }
`;

const TimeInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const TimeInput = styled.input`
  width: 100px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #00ffff;
  border-radius: 12px;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: bold;
  padding: 12px;
  text-align: center;
  box-sizing: border-box;

  &:focus {
    outline: none;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  }

  &::placeholder {
    color: rgba(0, 255, 255, 0.3);
  }
`;

const TimeUnit = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: rgba(0, 255, 255, 0.5);
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;

  @media (max-width: 640px) {
    gap: 16px;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  border: 2px solid #00ffff;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  padding: 10px 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  @media (max-width: 640px) {
    background: rgba(0, 255, 255, 0.15);
    border: 1px solid rgba(0, 255, 255, 0.4);
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
  }
`;

const CancelButton = styled(SubmitButton)`
  background: linear-gradient(135deg, #424242 0%, #212121 100%);
  border-color: #666;

  @media (max-width: 640px) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

function SetTimeModal({ currentRemainingMs, onSetTime, onClose }: SetTimeModalProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const currentMinutes = Math.max(0, Math.ceil(currentRemainingMs / 60000));
  const [minutes, setMinutes] = useState(currentMinutes.toString());

  const handleSubmit = () => {
    const m = parseInt(minutes) || 0;
    onSetTime(m);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Backdrop onClick={onClose}>
      <ModalPanel onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <ModalTitle>Set Remaining Time</ModalTitle>
        <TimeInputRow>
          <TimeInput
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          <TimeUnit>min</TimeUnit>
        </TimeInputRow>
        <ButtonContainer>
          <SubmitButton onClick={handleSubmit}>
            {isMobile ? 'Set' : '✅ Set'}
          </SubmitButton>
          <CancelButton onClick={onClose}>
            {isMobile ? 'Cancel' : '❌ Cancel'}
          </CancelButton>
        </ButtonContainer>
      </ModalPanel>
    </Backdrop>
  );
}

export default SetTimeModal;
