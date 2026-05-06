import React from 'react';
import { useDrag } from 'react-dnd';
import { Task } from '../../../types/api';
import { useScrum } from '../context';

export const DraggableTask: React.FC<{ task: Task; index: number; story?: any }> = ({ task, index, story }) => {
  const { setIsAddTaskDialogOpen } = useScrum();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id, type: 'task' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag as unknown as React.Ref<HTMLDivElement>}>
      {task.title}
    </div>
  );
};
