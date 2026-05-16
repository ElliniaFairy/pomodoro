import React, { useState } from 'react';

interface BreakChecklistProps {
  onAllItemsCompleted: () => void;
  style?: React.CSSProperties;
}

const CHECKLIST_ITEMS_PRIVATE = [
  "把任务结束时还想做的事和还有的心流录入便笺中",
  "将刚才这个番茄学到的东西写到Obsidian中", 
  "爱时间记录",
  "Ticktick中的习惯",
  "补水",
  "上厕所"
];


const CHECKLIST_ITEMS_WORK = [
  "把刚才这个番茄做的事录入Google Calendar中",  
  "把接下来番茄想做的事录入Google Calendar或ClickUp中",
  "检查下一步的会议，需要时设置闹钟进行nextTick polling",
  "将刚才这个番茄学到的工作随想和笔记录入Slack中",
  "添加爱时间中的时间记录",
  "添加Ticktick中的番茄数",
  "上厕所",
  "饮水机补水",
];


const BreakChecklist: React.FC<BreakChecklistProps> = ({ onAllItemsCompleted, style }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [isCompleting, setIsCompleting] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode') || 'private';
  const currentChecklist = mode === 'work' ? CHECKLIST_ITEMS_WORK : CHECKLIST_ITEMS_PRIVATE;

  const handleToggle = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);

    if (newChecked.size === currentChecklist.length) {
      setIsCompleting(true);
      setTimeout(() => {
        onAllItemsCompleted();
      }, 2500);
    }
  };

  const itemCount = currentChecklist.length;
  const columns = 2;
  const rows = Math.ceil(itemCount / columns);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      rowGap: isMobile ? '6px' : '20px',
      columnGap: isMobile ? '8px' : '40px',
      maxWidth: '800px',
      margin: '0 auto',
      padding: isMobile ? '4px 0 8px' : '20px',
      height: isMobile ? 'auto' : `${rows * 100}px`,
      opacity: isCompleting ? 0 : 1,
      transition: isCompleting ? 'opacity 2s ease-in-out 0.5s' : 'none',
      ...style
    }}>
      {currentChecklist.map((item, index) => (
        <div
          key={index}
          onClick={() => handleToggle(index)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '6px 8px' : '15px',
            border: `2px solid ${
              isCompleting ? '#ffd700' :
              checkedItems.has(index) ? '#00ff88' : '#ff4444'
            }`,
            borderRadius: isMobile ? '8px' : '12px',
            cursor: 'pointer',
            backgroundColor:
              isCompleting ? 'rgba(255, 215, 0, 0.3)' :
              checkedItems.has(index) ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)',
            fontSize: isMobile ? '13px' : '20px',
            textAlign: 'center',
            color:
              isCompleting ? '#ffd700' :
              checkedItems.has(index) ? '#00ff88' : '#ff4444',
            fontWeight: '500',
            fontFamily: 'Hiragino Sans GB',
            transition: 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            lineHeight: isMobile ? '1.2' : 'normal',
            minHeight: isMobile ? '40px' : 'auto',
            transform:
              isCompleting ? 'scale(1.05)' :
              checkedItems.has(index) ? 'scale(1.02)' : 'scale(1)',
            boxShadow:
              isCompleting ? '0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.3)' :
              checkedItems.has(index)
                ? '0 0 20px rgba(0, 255, 136, 0.4), inset 0 0 20px rgba(0, 255, 136, 0.1)'
                : '0 0 10px rgba(255, 68, 68, 0.3), inset 0 0 10px rgba(255, 68, 68, 0.1)',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default BreakChecklist;