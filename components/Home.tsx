import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { Activity, Calendar, Stethoscope, PlayCircle, Music, Users, ScanFace, ChevronRight } from 'lucide-react';

interface Props {
  userProfile: UserProfile | null;
  onChangeView: (view: AppView) => void;
}

const Home: React.FC<Props> = ({ userProfile, onChangeView }) => {
  const [isFamilyMode, setIsFamilyMode] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto pb-24 h-full">
      <header className="flex justify-between items-center mb-6 mt-2">
        <div>
           <h1 className="text-2xl font-serif font-bold text-emerald-900">
             {userProfile ? `早安，${userProfile.name}` : '早安，请完善信息'}
           </h1>
           <p className="text-stone-500 text-sm mt-1">
             {isFamilyMode ? '正在管理：父母的健康账户' : '您的专属中医健康管家'}
           </p>
        </div>
        <button 
           onClick={() => setIsFamilyMode(!isFamilyMode)}
           className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isFamilyMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-stone-100 text-stone-500 border-stone-200'}`}
        >
           {isFamilyMode ? '切换至个人' : '切换至家庭'}
        </button>
      </header>

      {/* Hero Section: Smart Constitution Identification */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
           <ScanFace size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
             <span className="bg-emerald-500/30 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">AI Core</span>
          </div>
          <h2 className="text-xl font-bold mb-2">智能体质辨识</h2>
          <p className="text-emerald-100 text-sm mb-6 max-w-[80%]">
             通过望闻问切AI多模态分析，生成您的专属健康画像，获取精准调理方案。
          </p>
          <div className="flex gap-3">
             <button 
               onClick={() => onChangeView(AppView.AI_DIAGNOSIS)}
               className="bg-white text-emerald-900 px-5 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-emerald-50 transition-colors"
             >
               开始辨证
             </button>
             {userProfile?.constitution && (
                <button 
                  onClick={() => onChangeView(AppView.PROFILE)} // In a real app, this might go to a detailed report view
                  className="bg-emerald-700/50 text-white border border-emerald-500/50 px-5 py-2 rounded-full font-bold text-sm hover:bg-emerald-700 transition-colors"
                >
                  查看画像
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Personalized Regimen */}
      <div className="space-y-4">
         <h3 className="font-bold text-stone-800 flex items-center gap-2">
           <Activity size={18} className="text-emerald-600"/> 个性化养生方案
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diet */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
               <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Calendar size={18}/></div>
                  <span className="font-bold text-stone-700">时令食疗</span>
               </div>
               <p className="text-xs text-stone-500 mb-2">今日大寒，宜温补</p>
               <ul className="text-sm text-stone-600 space-y-1 list-disc pl-4">
                  <li>推荐：羊肉萝卜汤</li>
                  <li>禁忌：生冷瓜果</li>
               </ul>
            </div>

            {/* Schedule & Exercise */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
               <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><PlayCircle size={18}/></div>
                  <span className="font-bold text-stone-700">起居运动</span>
               </div>
               <div className="flex items-center justify-between bg-stone-50 p-2 rounded-lg mb-2">
                  <span className="text-sm text-stone-600">八段锦跟练</span>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">15min</span>
               </div>
               <p className="text-xs text-stone-500">建议：23:00前入睡</p>
            </div>

            {/* Emotion */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
               <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Music size={18}/></div>
                  <span className="font-bold text-stone-700">情志调摄</span>
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-emerald-600">
                     <PlayCircle size={14}/> <span>五音疗愈·角调</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-emerald-600">
                     <PlayCircle size={14}/> <span>正念冥想引导</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Multi-Doctor Consultation */}
      <div className="bg-gradient-to-r from-stone-100 to-white p-5 rounded-2xl border border-stone-200">
         <div className="flex justify-between items-start mb-4">
            <div>
               <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-1">
                 <Stethoscope size={18} className="text-emerald-600"/> 多医师云会诊
               </h3>
               <p className="text-xs text-stone-500">三甲名医同步在线，智能比对诊断结果</p>
            </div>
            <Users className="text-stone-300" size={40} />
         </div>
         
         <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3].map(i => (
               <div key={i} className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-white shadow-sm overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=doc${i}`} alt="doc" />
                  </div>
                  <span className="text-[10px] mt-1 text-stone-500">专家{i}</span>
               </div>
            ))}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-400">
               +
            </div>
         </div>

         <button 
           onClick={() => onChangeView(AppView.CONSULTATION)}
           className="mt-4 w-full py-3 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl shadow-sm hover:bg-stone-50 hover:border-emerald-300 hover:text-emerald-700 transition-all flex items-center justify-center gap-2"
         >
           发起会诊 <ChevronRight size={16}/>
         </button>
      </div>

    </div>
  );
};

export default Home;
