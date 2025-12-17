import React, { useState } from 'react';
import { analyzeHealthProfile } from '../services/qwenService';
import { UserProfile } from '../types';
import { Activity, Moon, Utensils, Droplet, Thermometer, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  onProfileUpdate: (profile: UserProfile) => void;
}

const HealthProfile: React.FC<Props> = ({ onProfileUpdate }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '男',
    symptoms: [] as string[],
    otherSymptom: ''
  });
  const [result, setResult] = useState<any>(null);

  const commonSymptoms = [
    '失眠多梦', '手脚冰凉', '容易疲劳', '口干舌燥', 
    '食欲不振', '大便溏稀', '容易上火', '腰膝酸软'
  ];

  const toggleSymptom = (sym: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(sym) 
        ? prev.symptoms.filter(s => s !== sym)
        : [...prev.symptoms, sym]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const profile = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      symptoms: formData.otherSymptom ? [...formData.symptoms, formData.otherSymptom] : formData.symptoms
    };
    
    try {
      const analysis = await analyzeHealthProfile(profile);
      setResult(analysis);
      onProfileUpdate({ ...profile, constitution: analysis.constitution, dietPlan: analysis.diet, schedulePlan: analysis.schedule });
    } catch (e) {
      alert("分析失败，请重试");
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  if (step === 1) {
    return (
      <div className="p-6 max-w-2xl mx-auto pb-24">
        <h2 className="text-2xl font-bold text-emerald-900 mb-6 font-serif">中医体质辨识</h2>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h3 className="text-lg font-semibold mb-4 text-emerald-800 flex items-center gap-2">
              <UserIcon /> 基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-600 mb-1">姓名</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">年龄</label>
                <input 
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-stone-600 mb-2">性别</label>
              <div className="flex gap-4">
                {['男', '女'].map(g => (
                  <button
                    key={g}
                    onClick={() => setFormData({...formData, gender: g})}
                    className={`px-6 py-2 rounded-lg border ${
                      formData.gender === g 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-stone-600 border-stone-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h3 className="text-lg font-semibold mb-4 text-emerald-800 flex items-center gap-2">
              <Activity size={20} /> 近期症状 (可多选)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commonSymptoms.map(sym => (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    formData.symptoms.includes(sym)
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-medium'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-emerald-300'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
            <input 
              placeholder="其他不适症状..."
              value={formData.otherSymptom}
              onChange={e => setFormData({...formData, otherSymptom: e.target.value})}
              className="mt-4 w-full p-2 border border-stone-300 rounded-lg text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.age}
            className="w-full py-4 bg-emerald-800 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-900 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" /> 正在大模型推演中...</> : '生成健康画像'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-900 font-serif">您的健康画像</h2>
        <button onClick={() => setStep(1)} className="text-emerald-600 underline text-sm">重新测评</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={120} />
          </div>
          <h3 className="text-emerald-200 text-sm uppercase tracking-wider mb-2">核心体质</h3>
          <div className="text-4xl font-bold mb-4 font-serif">{result?.constitution || '平和质'}</div>
          <p className="text-emerald-100 opacity-90 text-sm leading-relaxed mb-6">
            {result?.analysis}
          </p>
          <div className="flex gap-2 text-xs">
            <span className="bg-white/20 px-2 py-1 rounded">肝气郁结</span>
            <span className="bg-white/20 px-2 py-1 rounded">湿热</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex gap-4">
            <div className="bg-amber-100 p-3 rounded-full h-fit text-amber-700">
              <Utensils size={24} />
            </div>
            <div>
              <h4 className="font-bold text-stone-800 mb-1">个性化食疗</h4>
              <p className="text-stone-600 text-sm leading-relaxed">{result?.diet}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex gap-4">
            <div className="bg-indigo-100 p-3 rounded-full h-fit text-indigo-700">
              <Moon size={24} />
            </div>
            <div>
              <h4 className="font-bold text-stone-800 mb-1">作息调养</h4>
              <p className="text-stone-600 text-sm leading-relaxed">{result?.schedule}</p>
            </div>
          </div>

           <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex gap-4">
            <div className="bg-rose-100 p-3 rounded-full h-fit text-rose-700">
              <Thermometer size={24} />
            </div>
            <div>
              <h4 className="font-bold text-stone-800 mb-1">忌口建议</h4>
              <p className="text-stone-600 text-sm leading-relaxed">避免食用辛辣刺激、生冷寒凉之物。少食海鲜发物。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default HealthProfile;