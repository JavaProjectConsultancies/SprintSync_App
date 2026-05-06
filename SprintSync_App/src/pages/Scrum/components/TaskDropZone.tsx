import React from 'react';
import { useDrop } from 'react-dnd';
import { Task, Issue } from '../../../types/api';

export const TaskDropZone: React.FC<{
  status: string;
  tasks: Task[];
  issues: Issue[];
  bgClass: string;
  style?: React.CSSProperties;
}> = ({ status, tasks, issues, bgClass, style }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['task', 'issue'],
    drop: () => ({ name: status }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className={bgClass} style={style}>
      {tasks.length + issues.length} items
    </div>
  );
};
