import styled, { keyframes } from 'styled-components';

interface TaskDescriptionDisplayProps {
  description?: string;
  onClick?: () => void;
}


const DescriptionContainer = styled.div`
  padding: 0;
  margin: -20px auto 10px;
  max-width: 600px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #ffffff7c;
  cursor: pointer;

  @media (max-width: 640px) {
    margin: -4px auto 4px;
    font-size: 13px;
  }
`;

const TaskDescriptionDisplay: React.FC<TaskDescriptionDisplayProps> = ({
  description,
  onClick
}) => {
  return (
    <DescriptionContainer onClick={onClick}>
      {description!! ? description : '点此添加任务描述'}
    </DescriptionContainer>
  );
};

export default TaskDescriptionDisplay;
