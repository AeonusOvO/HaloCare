import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';

// In-memory task store (can be upgraded to Redis or DB later)
// Structure: { [taskId]: { id, userId, status, step, progress, result, error, createdAt, inputData } }
const tasks = new Map();

// Map userId to active taskId to prevent multiple concurrent tasks
const userActiveTasks = new Map();

export const taskManager = {
  // Start a new diagnosis task
  startTask: (userId, inputData) => {
    // Check if user already has an active task
    if (userActiveTasks.has(userId)) {
      const existingTaskId = userActiveTasks.get(userId);
      const existingTask = tasks.get(existingTaskId);
      
      // If task is still running, return it
      if (existingTask && ['pending', 'processing'].includes(existingTask.status)) {
        return existingTask;
      }
    }

    const taskId = uuidv4();
    const task = {
      id: taskId,
      userId,
      status: 'pending', // pending, processing, completed, failed
      step: 'init', // init, analysis, report
      progress: 0,
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      inputData // Store input data to process asynchronously
    };

    tasks.set(taskId, task);
    userActiveTasks.set(userId, taskId);
    
    // Trigger async processing immediately
    // We don't await this because we want to return the taskId to the client immediately
    processDiagnosisTask(taskId);

    return task;
  },

  // Get task status
  getTask: (taskId) => {
    return tasks.get(taskId);
  },

  // Get active task for user
  getUserActiveTask: (userId) => {
    if (!userActiveTasks.has(userId)) return null;
    const taskId = userActiveTasks.get(userId);
    return tasks.get(taskId);
  },

  // Update task progress
  updateTask: (taskId, updates) => {
    const task = tasks.get(taskId);
    if (!task) return;
    
    Object.assign(task, updates);
    tasks.set(taskId, task);
  },

  // Complete task
  completeTask: async (taskId, result) => {
    const task = tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.progress = 100;
    task.result = result;
    task.completedAt = new Date().toISOString();
    
    // Save to database
    try {
        await db.addDiagnosis(task.userId, result);
    } catch (e) {
        console.error(`[Task] Failed to save result to DB for task ${taskId}:`, e);
        task.error = "Saved to memory but failed to persist to disk";
    }

    // Cleanup active map so user can start new tasks later
    // We keep the task in `tasks` map for a while so user can query the result
    userActiveTasks.delete(task.userId);
  },

  // Fail task
  failTask: (taskId, error) => {
    const task = tasks.get(taskId);
    if (!task) return;

    task.status = 'failed';
    task.error = error;
    userActiveTasks.delete(task.userId);
  }
};

// Mock function to simulate AI processing (Replace with real Qwen calls later)
// In a real scenario, this would import the service logic or call the AI API directly
async function processDiagnosisTask(taskId) {
    const task = tasks.get(taskId);
    if (!task) return;

    try {
        task.status = 'processing';
        
        // --- Step 1: Initial Analysis ---
        taskManager.updateTask(taskId, { step: 'analysis', progress: 10 });
        console.log(`[Task ${taskId}] Started analysis...`);
        
        // Simulate delay (or real API call)
        // Here we would call the actual Qwen API using task.inputData
        // For now, we assume the client logic is moved here.
        // BUT: The current architecture has client-side orchestration.
        // To move this to backend, we need to move callQwen logic to backend completely.
        
        // WAIT! The user wants "even if frontend closes, backend continues".
        // This implies the entire Qwen logic chain (Omni -> Max) must run on the server.
        // Currently, frontend calls /api/chat/completions directly.
        
        // We need to implement the orchestration logic here.
        
        // Mocking the flow for now to establish the architecture:
        await new Promise(r => setTimeout(r, 2000)); 
        taskManager.updateTask(taskId, { step: 'analysis', progress: 30 });
        
        await new Promise(r => setTimeout(r, 2000));
        taskManager.updateTask(taskId, { step: 'analysis', progress: 60 });
        
        // --- Step 2: Generating Report ---
        taskManager.updateTask(taskId, { step: 'report', progress: 80 });
        await new Promise(r => setTimeout(r, 2000));
        
        // --- Step 3: Complete ---
        const mockResult = {
            id: uuidv4(),
            date: new Date().toISOString(),
            diagnosis: "AI 诊断结果示例",
            fullReport: {
                content: "这是后台异步生成的诊断报告...",
                reasoning: "基于后台任务队列..."
            },
            images: task.inputData.images // Persist images from input
        };
        
        await taskManager.completeTask(taskId, mockResult);
        console.log(`[Task ${taskId}] Completed successfully.`);

    } catch (e) {
        console.error(`[Task ${taskId}] Failed:`, e);
        taskManager.failTask(taskId, e.message);
    }
}
