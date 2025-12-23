import { Message } from '../types';
const BASE_URL = '/api/chat/completions';

export const callQwen = async (
  messages: Message[],
  model: string = 'qwen-vl-max', 
  temperature: number = 0.7,
  onStreamUpdate?: (content: string, reasoning: string) => void,
  onConnect?: () => void,
  extraBody?: any // Add extraBody support
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
      ...extraBody // Spread extraBody into the request body
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

// --- New AI Diagnosis Flow Helpers ---

export const analyzeImageWithQwenVL = async (faceImage: string, tongueImage: string) => {
  const content: any[] = [
    { type: 'text', text: '请作为中医专家，分析这张面部照片和舌象照片。请详细描述面色（如苍白、潮红、萎黄）、神态（如得神、少神）、舌质（颜色、胖瘦、齿痕）和舌苔（颜色、厚薄、润燥）。' }
  ];
  
  if (faceImage) content.push({ type: 'image_url', image_url: { url: faceImage } });
  if (tongueImage) content.push({ type: 'image_url', image_url: { url: tongueImage } });
  
  return callQwen(
    [{ role: 'user', content }],
    'qwen3-vl-plus',
    0.7,
    undefined,
    undefined,
    { enable_thinking: true, thinking_budget: 81920 }
  );
};

export const analyzeAudioWithQwenOmni = async (audioBase64: string, userDescription: string) => {
  const content: any[] = [
    { type: 'text', text: `请作为中医专家，分析这段音频。用户的主观描述是：“${userDescription}”。请结合音频内容，客观描述说话人的声音特征（如语调、语速、是否有气无力、嘶哑）、呼吸音（如急促、粗重）以及咳嗽声等听觉特征。重点补充用户描述中可能遗漏的听诊细节。` },
    { 
      type: 'input_audio', 
      input_audio: { 
        data: audioBase64, 
        format: 'webm' 
      } 
    }
  ];

  return callQwen(
    [{ role: 'user', content }],
    'qwen3-omni-30b-a3b-captioner',
    0.7
  );
};

export const generateFinalDiagnosis = async (
  wangResult: string,
  wenResult: string,
  wenUserDescription: string,
  inquiryData: any,
  qieData: string,
  onStreamUpdate?: (content: string, reasoning: string) => void,
  onConnect?: () => void
) => {
    const prompt = `
    我正在进行中医“望闻问切”综合诊断。请根据以下多模态分析结果进行最终辨证：
    
    1. 【望诊结果】(Qwen-VL 视觉分析):
    ${wangResult}
    
    2. 【闻诊结果】(Qwen-Omni 音频分析):
    ${wenResult}
    (用户自述: ${wenUserDescription})
    
    3. 【问诊数据】(十问歌):
    ${JSON.stringify(inquiryData, null, 2)}
    
    4. 【切诊数据】:
    ${qieData || '由于线上限制，无脉象数据。请基于望闻问三诊进行推断。'}
    
    请务必严格按照以下 JSON 格式输出诊断结果，不要包含任何 markdown 标记，直接返回纯 JSON 字符串。JSON 结构如下：
    {
      "diagnosis": "核心辨证结论",
      "pathology": "核心病机分析",
      "suggestions": {
        "diet": "饮食调理建议",
        "lifestyle": "作息与运动建议",
        "acupoints": "推荐穴位及按摩方法"
      }
    }
    `;
    
    return callQwen(
        [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        'qwen3-max',
        0.7,
        onStreamUpdate,
        onConnect
    );
};
