import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

// Task status types
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type TaskStep = 'init' | 'analysis' | 'report';

export interface DiagnosisTask {
  id: string;
  userId: string;
  status: TaskStatus;
  step: TaskStep;
  progress: number;
  result: any | null;
  error: string | null;
  createdAt: string;
}

interface DiagnosisContextType {
  activeTask: DiagnosisTask | null;
  startDiagnosis: (inputData: any) => Promise<void>;
  minimized: boolean;
  setMinimized: (minimized: boolean) => void;
  clearTask: () => void; // Acknowledge completion/error and clear
}

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

export const DiagnosisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useState<DiagnosisTask | null>(null);
  const [minimized, setMinimized] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for active task on mount (resume capability)
  useEffect(() => {
    const checkActiveTask = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const task = await api.getActiveTask(token);
        if (task) {
          setActiveTask(task);
          // If task is running, start polling
          if (['pending', 'processing'].includes(task.status)) {
            startPolling(task.id);
            // If we are recovering a running task, and we are NOT in the diagnosis view (which we can't know here easily without router), 
            // we should default to minimized so the capsule shows up.
            // But since this context is global, we can rely on App.tsx to set minimized based on View.
            // However, initially, we should probably set minimized=true to be safe, 
            // and let the Diagnosis component unset it if it mounts.
            setMinimized(true); 
          } else if (task.status === 'completed' || task.status === 'failed') {
            // Task finished while user was away
            setMinimized(true); // Show as notification capsule
          }
        }
      } catch (e) {
        console.error("Failed to check active task", e);
      }
    };

    checkActiveTask();

    return () => stopPolling();
  }, []);

  const startPolling = (taskId: string) => {
    stopPolling(); // Ensure no duplicate pollers
    
    pollIntervalRef.current = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        stopPolling();
        return;
      }

      try {
        const task = await api.getTaskStatus(token, taskId);
        setActiveTask(task);

        if (task.status === 'completed' || task.status === 'failed') {
          stopPolling();
          // Task finished, keep it in state so UI can show result
        }
      } catch (e) {
        console.error("Polling error", e);
        // Don't stop polling on transient errors, but maybe backoff?
      }
    }, 2000); // Poll every 2 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startDiagnosis = async (inputData: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Not authenticated");

    try {
      const task = await api.startDiagnosisTask(token, inputData);
      setActiveTask(task);
      setMinimized(false); // Open full view initially (or let component decide)
      startPolling(task.id);
    } catch (e) {
      console.error("Failed to start diagnosis", e);
      throw e;
    }
  };

  const clearTask = () => {
    setActiveTask(null);
    setMinimized(false);
    stopPolling();
  };

  return (
    <DiagnosisContext.Provider value={{ activeTask, startDiagnosis, minimized, setMinimized, clearTask }}>
      {children}
    </DiagnosisContext.Provider>
  );
};

export const useDiagnosis = () => {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error('useDiagnosis must be used within a DiagnosisProvider');
  }
  return context;
};
