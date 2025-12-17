import React from 'react';
import { AppView } from '../types';
import { Users, UserPlus, FileText, MessageSquare, Heart, Share2 } from 'lucide-react';

interface Props {
  onChangeView: (view: AppView) => void;
}

const Community: React.FC<Props> = ({ onChangeView }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto pb-24 h-full overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-emerald-900">中医社区</h1>
        <p className="text-stone-500 text-sm">分享养生心得，连接名医专家</p>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => onChangeView(AppView.PROFILE)}
          className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center gap-2 hover:bg-stone-50 transition-colors"
        >
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <FileText size={24} />
          </div>
          <span className="font-bold text-stone-700 text-sm">分享健康画像</span>
        </button>

        <button 
          onClick={() => onChangeView(AppView.CONSULTATION)}
          className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center gap-2 hover:bg-stone-50 transition-colors"
        >
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <Users size={24} />
          </div>
          <span className="font-bold text-stone-700 text-sm">发起多医会诊</span>
        </button>
      </div>

      {/* Featured Doctors for Long-term Care */}
      <div className="mb-8">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
           <UserPlus size={18} className="text-emerald-600"/> 签约家庭医生
        </h3>
        <div className="space-y-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
               <img 
                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=doc${i}`} 
                 alt="Doctor" 
                 className="w-16 h-16 rounded-full bg-stone-100"
               />
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                   <h4 className="font-bold text-stone-800">王医师 {i}</h4>
                   <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">主任医师</span>
                 </div>
                 <p className="text-xs text-stone-500 mt-1 line-clamp-1">擅长：脾胃调理、失眠、亚健康干预...</p>
                 <div className="flex gap-2 mt-2">
                    <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-700">
                      签约咨询
                    </button>
                    <button className="text-xs border border-stone-300 text-stone-600 px-3 py-1.5 rounded-full hover:bg-stone-50">
                      查看详情
                    </button>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* Feed Placeholder */}
      <div>
         <h3 className="font-bold text-stone-800 mb-4">精选动态</h3>
         <div className="space-y-4">
           {[1, 2].map(i => (
             <div key={i} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-8 h-8 rounded-full bg-stone-200"></div>
                   <span className="text-sm font-bold text-stone-700">养生达人{i}号</span>
                   <span className="text-xs text-stone-400 ml-auto">2小时前</span>
                </div>
                <p className="text-sm text-stone-600 mb-3 leading-relaxed">
                  最近坚持练习八段锦，感觉睡眠质量明显改善了！推荐大家也试试。配合App里的食疗方案，效果更佳。#中医养生 #八段锦
                </p>
                <div className="flex items-center gap-4 text-stone-400 text-xs">
                   <button className="flex items-center gap-1 hover:text-rose-500"><Heart size={14}/> 24</button>
                   <button className="flex items-center gap-1 hover:text-emerald-500"><MessageSquare size={14}/> 8</button>
                   <button className="flex items-center gap-1 hover:text-emerald-500"><Share2 size={14}/> 分享</button>
                </div>
             </div>
           ))}
         </div>
      </div>

    </div>
  );
};

export default Community;
