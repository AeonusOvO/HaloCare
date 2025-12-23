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
    { type: 'text', text: `你是一位资深中医专家。请仔细观察提供的面部和舌象照片，进行专业的“望诊”分析。
    
请重点识别并详细描述以下内容（不要遗漏细节）：

1. **望面（面诊）**：
   - **面色**：识别主色（如青、赤、黄、白、黑）与客色，判断是否有光泽（得神/失神）。
   - **神态**：观察眼神是否明亮、精神状态（如疲惫、亢奋）。
   - **局部特征**：眼周（黑眼圈、浮肿）、口唇（颜色、干裂）、皮肤纹理。

2. **望舌（舌诊）**：
   - **舌神**：荣枯（有神/无神）。
   - **舌色**：淡白、淡红、红、绛、紫（是否有瘀斑/瘀点）。
   - **舌形**：老嫩、胖大（有无齿痕）、瘦薄、裂纹、芒刺。
   - **舌态**：强硬、震颤、歪斜。
   - **舌苔**：颜色（白、黄、灰黑）、质地（厚薄、润燥、腻腐、剥落）。
   - **舌下络脉**：是否有怒张或青紫。

请输出一份结构清晰、术语专业的望诊报告。` }
  ];
  
  if (faceImage) content.push({ type: 'image_url', image_url: { url: faceImage } });
  if (tongueImage) content.push({ type: 'image_url', image_url: { url: tongueImage } });
  
  return callQwen(
    [{ role: 'user', content }],
    'qwen-vl-max',
    0.7,
    undefined,
    undefined
  );
};

export const analyzeAudioWithQwenOmni = async (audioBase64: string, userDescription: string) => {
  const content: any[] = [
    { type: 'text', text: `你是一位资深中医专家。请通过听觉分析这段音频，进行专业的“闻诊”分析。
    
请结合用户的文字描述（重点关注气味和主观感受）和音频内容，生成一份闻诊报告。

1. **听声音（音频分析重点）**：
   - **语声**：语调高低（洪亮/低微）、语速快慢、是否有气无力（少气懒言）、是否有嘶哑或鼻音。
   - **呼吸**：呼吸声是否粗重、急促、或有哮鸣音。
   - **咳嗽/喷嚏/呕吐**：若有，描述声音特点（如咳声重浊、干咳无痰）。

2. **嗅气味与主观补充（参考用户描述）**：
   - 用户描述内容：【${userDescription}】
   - 请结合用户描述，分析是否有特殊的口气（如酸腐、腥臭）、体味或排泄物气味异常。

请输出结构清晰的闻诊分析，区分“听到的客观特征”和“用户主诉的特征”。` },
    { 
      type: 'input_audio', 
      input_audio: { 
        data: audioBase64, 
        format: 'wav' 
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
    你是一位经验丰富的中医临床专家（Expert TCM Doctor）。现在需要根据“四诊合参”的信息，为患者进行完整的辨证论治。
    
    以下是四诊采集的详细数据：

    1. 【望诊信息】(由 Healon 视觉分析):
    ${wangResult}

    2. 【闻诊信息】(由 Healon 听觉分析):
    ${wenResult}
    (用户补充的主观描述与气味: ${wenUserDescription})

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
    
    return callQwen(
        [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        'qwen3-max',
        0.7,
        onStreamUpdate,
        onConnect
    );
};
