import React from 'react';
import { AppView } from '../types';
import { BookOpen, HeartPulse, LayoutDashboard, ScanFace, UserCircle, Users } from 'lucide-react';

interface Props {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ currentView, onChangeView, children }) => {
  const navItems = [
    { id: AppView.HOME, label: '首页', icon: LayoutDashboard },
    { id: AppView.LEARNING, label: '学习', icon: BookOpen },
    { id: AppView.AI_DIAGNOSIS, label: 'AI辨证', icon: ScanFace, isCenter: true },
    { id: AppView.COMMUNITY, label: '社区', icon: Users },
    { id: AppView.PROFILE, label: '我的', icon: UserCircle },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f7f5f0] md:flex-row text-stone-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-emerald-950 text-emerald-50 shadow-2xl z-20">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <HeartPulse size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-wider">云脉珍心</h1>
              <p className="text-emerald-300 text-xs tracking-widest mt-1">四诊健康管理</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`motion-press w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                currentView === item.id
                  ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-950/20 translate-x-1'
                  : 'hover:bg-emerald-900/70 text-emerald-200'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 text-xs text-emerald-300/80 leading-5">
          本系统仅用于健康管理和科研演示，不作为临床诊断依据。
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div key={currentView} className="flex-1 min-h-0 overflow-hidden motion-enter">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden bg-white border-t border-stone-200 flex justify-between items-end px-2 pb-safe pt-2 z-30 relative">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          
          if (item.isCenter) {
             return (
               <div key={item.id} className="relative -top-6 flex flex-col items-center justify-center">
                 <button
                    onClick={() => onChangeView(item.id)}
                    className={`motion-press w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-[#f7f5f0] transition-all transform active:scale-95 ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-emerald-200' 
                        : 'bg-emerald-800 text-emerald-100'
                    }`}
                 >
                    <item.icon size={32} />
                 </button>
                 <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}>
                   {item.label}
                 </span>
               </div>
             );
          }

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`motion-press flex flex-col items-center justify-center p-2 flex-1 rounded-xl transition-colors ${
                isActive ? 'text-emerald-700 bg-emerald-50' : 'text-stone-400'
              }`}
            >
              <item.icon size={24} className={isActive ? 'fill-current opacity-20' : ''} strokeWidth={isActive ? 2.5 : 2}/>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
