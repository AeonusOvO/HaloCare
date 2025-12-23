import React from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { useDiagnosis, TaskStep } from '../contexts/DiagnosisContext';
import { AppView } from '../types';

interface Props {
  onChangeView: (view: AppView) => void;
}

const FloatingCapsule: React.FC<Props> = ({ onChangeView }) => {
  const { activeTask, minimized, setMinimized } = useDiagnosis();

  if (!activeTask || !minimized) return null;

  // Determine step text
  let stepText = "初始化...";
  if (activeTask.status === 'processing') {
    switch (activeTask.step) {
        case 'init': stepText = "数据上传中..."; break;
        case 'analysis': stepText = "AI 正在分析..."; break;
        case 'report': stepText = "生成报告中..."; break;
    }
  } else if (activeTask.status === 'completed') {
    stepText = "辩证完成，点击查看";
  } else if (activeTask.status === 'failed') {
    stepText = "辩证失败，点击重试";
  }

  const handleClick = () => {
    // Navigate to Diagnosis view and un-minimize
    onChangeView(AppView.AI_DIAGNOSIS);
    setMinimized(false);
  };

  return (
    <button 
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-full py-2 px-4 shadow-xl flex items-center gap-3 animate-fade-in hover:bg-stone-800 transition-colors"
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/30">
            {activeTask.status === 'processing' ? (
                <Loader2 size={16} className="text-emerald-400 animate-spin" />
            ) : activeTask.status === 'completed' ? (
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            ) : (
                <Activity size={16} className="text-red-400" />
            )}
        </div>
        {activeTask.status === 'processing' && (
             <svg className="absolute top-0 left-0 w-8 h-8 -rotate-90 pointer-events-none">
                <circle
                    cx="16" cy="16" r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-stone-700"
                />
                <circle
                    cx="16" cy="16" r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="94.2"
                    strokeDashoffset={94.2 - (94.2 * activeTask.progress) / 100}
                    className="text-emerald-500 transition-all duration-500 ease-out"
                />
            </svg>
        )}
      </div>
      
      <div className="text-left">
        <p className="text-xs font-bold text-stone-200">{stepText}</p>
        {activeTask.status === 'processing' && (
            <p className="text-[10px] text-stone-500">进度 {activeTask.progress}%</p>
        )}
      </div>
    </button>
  );
};

export default FloatingCapsule;
