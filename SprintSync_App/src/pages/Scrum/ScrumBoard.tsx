import React from 'react';
import { useScrum } from './context';
import { TaskDropZone } from './components/TaskDropZone';
import { Task, Issue } from '../../types/api';

export const ScrumBoard: React.FC = () => {
  const scrumContext = useScrum();

  return (
    <div>
      <TaskDropZone 
        status="todo" 
        tasks={[]} 
        issues={[]} 
        bgClass="bg-gray-100" 
      />
    </div>
  );
};

export default ScrumBoard;
