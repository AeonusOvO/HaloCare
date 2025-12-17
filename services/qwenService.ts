import { Message } from '../types';
const BASE_URL = '/api/chat/completions';

export const callQwen = async (
  messages: Message[],
  model: string = 'qwen-vl-max', // Corrected from qwen3-vl-plus to stable qwen-vl-max
  temperature: number = 0.7,
  onStreamUpdate?: (content: string, reasoning: string) => void,
  onConnect?: () => void
): Promise<{ content: string; reasoning: string }> => {
  const controller = new AbortController();
  // Set a 60-second timeout to prevent indefinite hanging
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const body: any = {
      model: model,
      messages: messages,
      stream: !!onStreamUpdate,
      temperature: temperature,
      // Removed enable_thinking as it may cause issues with the standard VL endpoint
      // enable_thinking: true, 
      // thinking_budget: 10240 
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        // Extract specific DashScope/OpenAI error messages
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
        console.error("Qwen API Error Data:", errorData);
      } catch (e) {
        errorMessage = `HTTP Error ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    if (onConnect) onConnect();

    const contentType = response.headers.get('content-type') || '';
    const isEventStream = contentType.includes('text/event-stream');

    if (onStreamUpdate && response.body && isEventStream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalContent = '';
      let finalReasoning = '';
      let buffer = '';

      const processLine = (line: string) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return false;
        if (trimmedLine === 'data: [DONE]') return true;
        
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.substring(6);
            const json = JSON.parse(jsonStr);
            const delta = json.choices[0]?.delta;

            if (delta) {
              // Capture reasoning if the model supports it (some do natively)
              if (delta.reasoning_content) {
                finalReasoning += delta.reasoning_content;
              }
              if (delta.content) {
                finalContent += delta.content;
              }
              onStreamUpdate(finalContent, finalReasoning);
            }
          } catch (e) {
            console.warn("Error parsing stream chunk", e);
          }
        } else if (trimmedLine.startsWith('{') && trimmedLine.includes('"error"')) {
           try {
             const errJson = JSON.parse(trimmedLine);
             if (errJson.error) {
               throw new Error(errJson.error.message || "Stream Error");
             }
           } catch (e) {
             // ignore parse error here
           }
        }
        return false;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; 

        for (const line of lines) {
          if (processLine(line)) {
            return { content: finalContent, reasoning: finalReasoning };
          }
        }
      }

      if (buffer.trim()) {
        processLine(buffer);
      }

      return { content: finalContent, reasoning: finalReasoning };
    } else {
      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        reasoning: data.choices[0].message.reasoning_content || ''
      };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Qwen API Error:", error);
    if (error.name === 'AbortError') {
      throw new Error("请求超时，请检查网络或重试");
    }
    throw error;
  }
};

export const analyzeHealthProfile = async (profile: any) => {
  const prompt = `
    作为一位资深中医专家，请根据以下用户数据构建精准健康画像（体质辨识）：
    症状: ${profile.symptoms.join(', ')}
    年龄: ${profile.age}
    性别: ${profile.gender}
    
    请输出JSON格式:
    {
      "constitution": "体质名称 (如: 阴虚质)",
      "analysis": "详细体质分析...",
      "diet": "饮食建议...",
      "schedule": "作息建议..."
    }
    只返回JSON，不要markdown标记。
  `;
  
  // Use qwen-plus for pure text analysis as it's faster and cheaper, or qwen-vl-max
  const result = await callQwen([{ role: 'user', content: prompt }], 'qwen-plus');
  try {
    const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("JSON Parse Error", e);
    return {
      constitution: "分析中...",
      analysis: result.content,
      diet: "请参考通用养生建议",
      schedule: "建议规律作息"
    };
  }
};
