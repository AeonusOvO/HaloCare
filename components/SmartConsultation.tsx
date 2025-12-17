import React, { useState } from 'react';
import { callQwen } from '../services/qwenService';
import { DoctorDiagnosis, Message } from '../types';
import { Stethoscope, UserCheck, GitCompare, MessageSquare, Loader2, Sparkles } from 'lucide-react';

const SmartConsultation: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnoses, setDiagnoses] = useState<DoctorDiagnosis[]>([]);
  const [consensus, setConsensus] = useState<string | null>(null);

  // Simulated doctors with different personalities/backgrounds
  const doctors = [
    { id: 'doc1', name: '张老中医', title: '国医大师', style: '温病学派，保守稳健，注重整体调理' },
    { id: 'doc2', name: '李博士', title: '中西医结合专家', style: '现代中医，注重数据指标与药理结合' },
    { id: 'doc3', name: '王教授', title: '学院派研究员', style: '经方派，用药精简，注重经典' },
  ];

  const startConsultation = async () => {
    if (!query) return;
    setLoading(true);
    setDiagnoses([]);
    setConsensus(null);

    try {
      // 1. Parallel requests for each doctor
      const promises = doctors.map(async (doc) => {
        const systemPrompt = `你扮演${doc.name}，头衔是${doc.title}。
        你的诊疗风格是：${doc.style}。
        请根据用户的描述，给出诊断、处方思路和建议。
        必须保持人物设定，语气符合身份。
        请输出JSON格式: { "diagnosis": "诊断结果", "prescription": "处方或调理建议", "thinking": "辨证思路" }`;

        const msgs: Message[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ];

        // Use qwen-plus for faster multi-doctor simulation
        const res = await callQwen(msgs, 'qwen-plus', 0.6);
        let parsed;
        try {
             const clean = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
             parsed = JSON.parse(clean);
        } catch {
             parsed = { diagnosis: "分析中", prescription: res.content, thinking: res.reasoning };
        }
        
        return {
          id: doc.id,
          name: doc.name,
          title: doc.title,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`,
          diagnosis: parsed.diagnosis,
          prescription: parsed.prescription,
          thinking: res.reasoning
        };
      });

      const results = await Promise.all(promises);
      setDiagnoses(results);

      // 2. Generate Consensus
      const consensusPrompt = `作为会诊主持人，请对比以下三位专家的意见，总结出异同点，并给出最终的综合建议。
      专家1 (${results[0].name}): ${results[0].diagnosis}, 建议: ${results[0].prescription}
      专家2 (${results[1].name}): ${results[1].diagnosis}, 建议: ${results[1].prescription}
      专家3 (${results[2].name}): ${results[2].diagnosis}, 建议: ${results[2].prescription}`;

      const consensusRes = await callQwen([{ role: 'user', content: consensusPrompt }], 'qwen-plus');
      setConsensus(consensusRes.content);

    } catch (e) {
      console.error(e);
      alert("会诊系统繁忙，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-24 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">名医云会诊</h2>
        <p className="text-stone-500">连接高校与三甲医院，多专家同步在线辨证</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 mb-8">
        <label className="block text-sm font-bold text-stone-700 mb-2">主诉/病情描述</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请详细描述您的症状，例如：最近总是失眠，舌苔发白，吃凉的东西胃疼..."
          className="w-full p-4 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={startConsultation}
            disabled={loading || !query}
            className="bg-emerald-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-900 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Stethoscope />}
            发起会诊
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
          <p className="text-stone-600 animate-pulse">正在同步连线三位专家进行辨证...</p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-stone-400">
            <span>连接北京...</span>
            <span>连接上海...</span>
            <span>连接广州...</span>
          </div>
        </div>
      )}

      {diagnoses.length > 0 && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-6">
            {diagnoses.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-stone-100 flex flex-col">
                <div className="bg-stone-50 p-4 border-b border-stone-100 flex items-center gap-3">
                  <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-full bg-white p-1 border" />
                  <div>
                    <h3 className="font-bold text-stone-800">{doc.name}</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{doc.title}</span>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">诊断结果</h4>
                    <p className="font-serif font-bold text-lg text-emerald-900">{doc.diagnosis}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">治疗建议</h4>
                    <p className="text-sm text-stone-600 leading-relaxed">{doc.prescription}</p>
                  </div>
                  {doc.thinking && (
                     <div className="bg-stone-50 p-3 rounded-lg text-xs text-stone-500 italic border border-stone-100">
                        <span className="flex items-center gap-1 font-bold not-italic mb-1"><Sparkles size={10}/> AI 思考回路:</span>
                        {doc.thinking.slice(0, 100)}...
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <GitCompare size={100} />
             </div>
             <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-3">
                <UserCheck /> 智能比对结论
             </h3>
             <div className="prose prose-invert prose-lg max-w-none">
               <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-sm md:text-base">
                 {consensus}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartConsultation;