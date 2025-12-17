import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import { callQwen } from '../services/qwenService';
import { Message } from '../types';

const AIButler: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好，我是您的专属AI健康管家“小康”。今天感觉身体有什么不适，或者想聊聊养生话题吗？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, reasoning]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setReasoning('');

    try {
      // Keep only last 6 messages for context to save tokens/complexity in this demo
      const context = messages.slice(-6);
      
      const systemMsg: Message = {
        role: 'system',
        content: `你是一个温柔、体贴、高度拟人化的中医AI健康管家“小康”。
        你的性格：如沐春风，富有同理心，像一位相识多年的老朋友。
        你的任务：通过日常对话了解用户健康状况，提供中医养生建议，并在适当时候提醒用户注意饮食作息。
        在此次对话中，请展示出你的“思考过程”，分析用户的潜在情绪和健康隐患。
        回复风格：口语化，温暖，避免生硬的医疗术语堆砌。`
      };

      let assistantMsgContent = '';
      
      // Use qwen-plus for text chat, it is faster and stable
      await callQwen([systemMsg, ...context, userMsg], 'qwen-plus', 0.8, (content, thought) => {
        assistantMsgContent = content;
        setReasoning(thought);
      });

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsgContent, reasoning_content: reasoning }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我刚才走神了（网络连接不稳定），请您再说一遍好吗？' }]);
    } finally {
      setLoading(false);
      setReasoning('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7]">
      <div className="p-4 bg-emerald-800 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">小康管家</h2>
            <p className="text-xs text-emerald-100">24小时时刻守护您的健康</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
            }`}>
              {msg.role === 'assistant' && msg.reasoning_content && (
                <div className="mb-2 text-xs text-stone-500 bg-stone-100 p-2 rounded border-l-2 border-emerald-500">
                  <p className="font-bold flex items-center gap-1"><Sparkles size={10} /> 思考过程:</p>
                  <p className="italic line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                    {msg.reasoning_content}
                  </p>
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed">
                {typeof msg.content === 'string' ? msg.content : 'Image sent'}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
             <div className="max-w-[85%] bg-white border border-stone-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                {reasoning && (
                  <div className="mb-2 text-xs text-stone-500 bg-stone-100 p-2 rounded border-l-2 border-emerald-500 animate-pulse">
                    <p className="font-bold flex items-center gap-1"><Sparkles size={10} /> 思考中...</p>
                    <p>{reasoning}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-stone-400">
                  <Loader2 className="animate-spin" size={16} />
                  <span>小康正在组织语言...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-stone-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="告诉小康您现在的感受..."
            className="flex-1 p-3 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="p-3 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIButler;