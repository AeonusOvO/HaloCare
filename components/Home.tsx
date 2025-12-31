import React, { useState, useEffect, useMemo } from 'react';
import { AppView, UserProfile } from '../types';
import { api } from '../services/api';
import { Activity, Calendar, Stethoscope, PlayCircle, Music, Users, ScanFace, ChevronRight, PhoneCall } from 'lucide-react';
import { recordImpression, recordClick, sortByPreference, CardId, setModelForUser } from '../utils/personalization';
import { getTodayFruitRecommendation } from '../utils/seasonal';

interface Props {
  userProfile: UserProfile | null;
  onChangeView: (view: AppView) => void;
  token: string;
  userId: string;
}

const Home: React.FC<Props> = ({ userProfile, onChangeView, token, userId }) => {
  const [isFamilyMode, setIsFamilyMode] = useState(false);
  const [hasFamily, setHasFamily] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [orderedCards, setOrderedCards] = useState<CardId[]>([
    'smart_dashboard',
    'seasonal_diet',
    'exercise_plan',
    'emotion_regulation',
    'quick_services',
  ]);
  const fruit = useMemo(() => getTodayFruitRecommendation(), []);
  const fruitUrl = useMemo(() => `/api/fruit-image?name=${encodeURIComponent(fruit.name)}`, [fruit.name]);

  useEffect(() => {
    checkFamilyStatus();
    updateGreeting();
    loadProfiles();
    (async () => {
      try {
        const cloud = await api.getHabitModel(token);
        setModelForUser(userId, cloud);
      } catch (_) {}
      setOrderedCards(sortByPreference(userId, orderedCards));
    })();
  }, []);

  const checkFamilyStatus = async () => {
    try {
      const family = await api.getMyFamily(token);
      setHasFamily(!!family);
    } catch (err) {
      console.error(err);
      setHasFamily(false);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早安');
    else if (hour < 18) setGreeting('午安');
    else setGreeting('晚安');
  };

  const loadProfiles = async () => {
    try {
      const data = await api.getProfiles(token);
      setProfiles(data);
      if (data.length > 0) {
        // Default to the most recently updated profile (sorted by backend)
        setActiveProfile(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSelect = (profile: any) => {
    setActiveProfile(profile);
    setShowProfileSelector(false);
  };

  useEffect(() => {
    orderedCards.forEach(async (id) => {
      recordImpression(userId, id);
      try { await api.recordHabitEvent(token, { cardId: id, type: 'impression' }); } catch (_) {}
    });
  }, [orderedCards, userId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto pb-24 h-full">
      <header className="flex justify-between items-center mb-6 mt-2 relative z-20">
        <div>
           <div 
             className="relative"
             onClick={() => profiles.length > 0 && setShowProfileSelector(!showProfileSelector)}
           >
             <h1 className="text-2xl font-serif font-bold text-emerald-900 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
               {greeting}，{activeProfile ? activeProfile.name : (userProfile?.name || userProfile?.username || '请完善信息')}
               {profiles.length > 0 && <ChevronRight size={20} className={`text-emerald-700 transition-transform ${showProfileSelector ? 'rotate-90' : ''}`} />}
             </h1>
             
             {/* Profile Selector Dropdown */}
             {showProfileSelector && (
               <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 p-2 animate-in fade-in slide-in-from-top-2 z-30">
                 <div className="text-xs text-stone-400 px-2 py-1 mb-1">切换健康档案</div>
                 {profiles.map(p => (
                   <button
                     key={p.id}
                     onClick={(e) => { e.stopPropagation(); handleProfileSelect(p); }}
                     className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${activeProfile?.id === p.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50 text-stone-700'}`}
                   >
                     <span>{p.name}</span>
                     <span className="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{p.relation}</span>
                   </button>
                 ))}
               </div>
             )}
           </div>
           
           <p className="text-stone-500 text-sm mt-1">
             {isFamilyMode ? '正在管理：家庭组健康账户' : '您的专属中医健康管家 v1.0.1'}
           </p>
        </div>
        
           {hasFamily && (
          <button 
             onClick={() => setIsFamilyMode(!isFamilyMode)}
             className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isFamilyMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-stone-100 text-stone-500 border-stone-200'}`}
          >
             {isFamilyMode ? '切换至个人' : '切换至家庭'}
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-4 bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
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
                onClick={async () => {
                  recordClick(userId, 'smart_dashboard');
                  try { await api.recordHabitEvent(token, { cardId: 'smart_dashboard', type: 'click' }); } catch (_) {}
                  onChangeView(AppView.AI_DIAGNOSIS);
                }}
                className="bg-white text-emerald-900 px-5 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-emerald-50 transition-colors"
              >
                开始辨证
              </button>
              {userProfile?.constitution && (
                <button
                  onClick={() => onChangeView(AppView.PROFILE)}
                  className="bg-emerald-700/50 text-white border border-emerald-500/50 px-5 py-2 rounded-full font-bold text-sm hover:bg-emerald-700 transition-colors"
                >
                  查看画像
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-stone-100 text-stone-600 rounded-lg"><Activity size={18} /></div>
              <span className="font-bold text-stone-700">智能健康看板</span>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">实时</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <div className="text-xs text-stone-500 mb-1">今日心率</div>
              <div className="text-lg font-bold text-stone-800">72</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <div className="text-xs text-stone-500 mb-1">睡眠</div>
              <div className="text-lg font-bold text-stone-800">7.5h</div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <div className="text-xs text-stone-500 mb-1">步数</div>
              <div className="text-lg font-bold text-stone-800">8.2k</div>
            </div>
          </div>
          <button
            onClick={() => recordClick(userId, 'smart_dashboard')}
            className="mt-auto w-full py-2 bg-stone-800 text-white rounded-xl text-sm hover:bg-stone-700 transition"
          >
            查看详细趋势
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-stone-800 flex items-center gap-2">
          <Activity size={18} className="text-emerald-600" /> 个性化养生方案
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="bg-white p-0 rounded-2xl border border-stone-200 shadow-sm overflow-hidden md:col-span-2"
            onClick={async () => {
              recordClick(userId, 'seasonal_diet');
              try { await api.recordHabitEvent(token, { cardId: 'seasonal_diet', type: 'click' }); } catch (_) {}
            }}
          >
            <div className="flex items-center gap-2 p-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Calendar size={18} /></div>
              <span className="font-bold text-stone-700">时令药膳推荐</span>
            </div>
            <div className="relative h-40 md:h-52">
              <img
                src={fruitUrl}
                alt={fruit.name}
                className="w-full h-full object-cover"
                style={{ filter: fruit.filter }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <div className="text-xs opacity-80">今日果蔬推荐</div>
                <div className="text-lg font-bold">{fruit.name}</div>
              </div>
            </div>
            <div className="p-4 text-sm text-stone-600">
              今日节气建议：顺应气候，宜清淡适中；如有体寒，可搭配温补食材。
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm"
            onClick={async () => {
              recordClick(userId, 'exercise_plan');
              try { await api.recordHabitEvent(token, { cardId: 'exercise_plan', type: 'click' }); } catch (_) {}
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><PlayCircle size={18} /></div>
              <span className="font-bold text-stone-700">个性化运动方案</span>
            </div>
            <div className="flex items-center justify-between bg-stone-50 p-2 rounded-lg mb-2">
              <span className="text-sm text-stone-600">八段锦·第3式</span>
              <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">12min</span>
            </div>
            <p className="text-xs text-stone-500">建议：饭后30min再运动；23:00前入睡。</p>
          </div>

          <div
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm md:col-span-1"
            onClick={async () => {
              recordClick(userId, 'emotion_regulation');
              try { await api.recordHabitEvent(token, { cardId: 'emotion_regulation', type: 'click' }); } catch (_) {}
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Music size={18} /></div>
              <span className="font-bold text-stone-700">情志调摄</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-emerald-600">
                <PlayCircle size={14} /> <span>五音疗愈·角调</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-emerald-600">
                <PlayCircle size={14} /> <span>正念冥想引导</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <div
        className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm"
        onClick={async () => {
          recordClick(userId, 'quick_services');
          try { await api.recordHabitEvent(token, { cardId: 'quick_services', type: 'click' }); } catch (_) {}
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onChangeView(AppView.AI_DIAGNOSIS); }}
            className="px-3 py-3 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 font-bold text-sm transition"
          >
            一键AI辨证
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onChangeView(AppView.COMMUNITY); }}
            className="px-3 py-3 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 font-bold text-sm transition"
          >
            在线问诊
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onChangeView(AppView.HEALTH_PROFILE); }}
            className="px-3 py-3 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 font-bold text-sm transition"
          >
            用药提醒设置
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); recordClick(userId, 'quick_services'); }}
            className="px-3 py-3 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <PhoneCall size={16} className="text-emerald-600" /> 紧急联系人
          </button>
        </div>
      </div>

    </div>
  );
};

export default Home;
