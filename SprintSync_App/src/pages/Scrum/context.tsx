import React, { createContext, useContext, useState } from 'react';
import { Task } from '../../types/api';

interface ScrumContextType {
  setIsAddTaskDialogOpen: (open: boolean) => void;
  setIsAddIssueDialogOpen: (open: boolean) => void;
  setNewTask: React.Dispatch<React.SetStateAction<Partial<Task>>>;
}

const ScrumContext = createContext<ScrumContextType | undefined>(undefined);

export const ScrumProvider: React.FC<{ children: React.ReactNode; value: ScrumContextType }> = ({ children, value }) => {
  return (
    <ScrumContext.Provider value={value}>
      {children}
    </ScrumContext.Provider>
  );
};

export const useScrum = () => {
  const context = useContext(ScrumContext);
  if (context === undefined) {
    throw new Error('useScrum must be used within a ScrumProvider');
  }
  return context;
};
