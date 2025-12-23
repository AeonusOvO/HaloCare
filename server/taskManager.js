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

// Server-side Qwen orchestration
async function callQwenAPI(messages, model = 'qwen-plus', temperature = 0.7) {
    const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-eba2fce7c20c42af9acb2e2acfaa6760';
    const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            stream: false // Task queue doesn't support streaming response yet
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Qwen API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
        content: data.choices[0].message.content,
        reasoning: data.choices[0].message.reasoning_content || ''
    };
}

async function processDiagnosisTask(taskId) {
    const task = tasks.get(taskId);
    if (!task) return;

    try {
        task.status = 'processing';
        taskManager.updateTask(taskId, { step: 'analysis', progress: 10 });
        console.log(`[Task ${taskId}] Started analysis...`);

        const { wangResult, wenResult, wenAudioText, inquiryData, qieData, images } = task.inputData;

        // --- Step 2: Generating Report (Server Side Orchestration) ---
        // We reuse the prompt logic from frontend
        
        const prompt = `
    你是一位经验丰富的中医临床专家（Expert TCM Doctor）。现在需要根据“四诊合参”的信息，为患者进行完整的辨证论治。
    
    以下是四诊采集的详细数据：

    1. 【望诊信息】(由 Healon 视觉分析):
    ${wangResult}

    2. 【闻诊信息】(由 Healon 听觉分析):
    - 音频特征分析: ${wenResult}
    - 用户主观描述: ${wenAudioText || '无'}

    3. 【问诊信息】(十问歌):
    ${JSON.stringify(inquiryData, null, 2)}

    4. 【切诊信息】:
    ${qieData || '（线上问诊无脉象数据，请根据脉症从舍原则，侧重舌脉互参进行推断）'}

    ---
    **任务要求**：
    请综合分析以上信息，进行严谨的逻辑推演，生成一份专业的中医诊断报告。
    
    **注意**：
    1. **拒绝套话**：不要说“建议咨询医生”之类的废话，直接给出基于当前信息的专业判断。
    2. **辨证精准**：必须明确指出“证型”。
    3. **病机分析**：详细解释为什么是这个证型？结合具体的舌象、脉象（如有）、症状进行关联分析。
    4. **调理方案**：给出的建议必须针对该证型，不要给出通用的“多喝水、多运动”。

    请严格按照以下 JSON 格式输出，不要包含任何 markdown 标记，直接返回纯 JSON 字符串：
    {
      "diagnosis": "核心辨证结论",
      "pathology": "核心病机分析（300字左右，深度解析病因病机，关联四诊信息）",
      "suggestions": {
        "diet": "针对性的食疗建议（推荐具体食材和食谱，忌口什么）",
        "lifestyle": "针对性的起居调摄（如具体的运动方式、作息时间、情志调节）",
        "acupoints": "精准的穴位推荐（2-3个核心穴位，并说明按摩或艾灸方法）"
      }
    }
    `;

        taskManager.updateTask(taskId, { step: 'analysis', progress: 50 });
        
        // Call Qwen-Max for final reasoning
        const result = await callQwenAPI([{ role: 'user', content: prompt }], 'qwen-max');
        
        taskManager.updateTask(taskId, { step: 'report', progress: 90 });

        let parsedData;
        try {
            const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanJson);
        } catch (e) {
            console.warn("Failed to parse JSON response, falling back to raw text", e);
            // Fallback structure
            parsedData = {
                diagnosis: "诊断生成完成（解析格式可能有误）",
                pathology: result.content,
                suggestions: { diet: "", lifestyle: "", acupoints: "" }
            };
        }

        // --- Step 3: Complete ---
        const finalRecord = {
            id: uuidv4(),
            date: new Date().toISOString(),
            diagnosis: parsedData.diagnosis,
            fullReport: parsedData, // Store parsed structure
            rawContent: result.content, // Store raw text just in case
            images: images // Persist images from input
        };
        
        await taskManager.completeTask(taskId, finalRecord);
        console.log(`[Task ${taskId}] Completed successfully.`);

    } catch (e) {
        console.error(`[Task ${taskId}] Failed:`, e);
        taskManager.failTask(taskId, e.message);
    }
}
