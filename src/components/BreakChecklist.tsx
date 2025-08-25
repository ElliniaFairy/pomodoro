import React, { useState } from 'react';

interface BreakChecklistProps {
  onAllItemsCompleted: () => void;
  style?: React.CSSProperties;
}

const CHECKLIST_ITEMS = [
  "把任务结束时还想做的事和还有的心流录入时间表中",
  "将刚才这个番茄学到的东西写到Obsidian中", 
  "添加爱时间中的时间记录",
  "看Ticktick中的习惯与杂项，进行quick tick check",
  "补水",
  "上厕所"
];

const BreakChecklist: React.FC<BreakChecklistProps> = ({ onAllItemsCompleted, style }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [isCompleting, setIsCompleting] = useState(false);
  
  const handleToggle = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
    
    if (newChecked.size === CHECKLIST_ITEMS.length) {
      setIsCompleting(true);
      setTimeout(() => {
        onAllItemsCompleted();
      }, 2500); // 0.5s + 2s
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      rowGap: '20px',
      columnGap: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      height: '300px',
      opacity: isCompleting ? 0 : 1,
      transition: isCompleting ? 'opacity 2s ease-in-out 0.5s' : 'none',
      ...style
    }}>
      {CHECKLIST_ITEMS.map((item, index) => (
        <div
          key={index}
          onClick={() => handleToggle(index)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            border: `2px solid ${
              isCompleting ? '#ffd700' : 
              checkedItems.has(index) ? '#00ff88' : '#ff4444'
            }`,
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor: 
              isCompleting ? 'rgba(255, 215, 0, 0.3)' :
              checkedItems.has(index) ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)',
            fontSize: '20px',
            textAlign: 'center',
            color: 
              isCompleting ? '#ffd700' :
              checkedItems.has(index) ? '#00ff88' : '#ff4444',
            fontWeight: '500',
            fontFamily: 'Hiragino Sans GB',
            transition: 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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