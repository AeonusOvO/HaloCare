import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, BookOpen, ScanFace, Users, UserCircle } from 'lucide-react';

interface Props {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ currentView, onChangeView, children }) => {
  const navItems = [
    { id: AppView.HOME, label: '首页', icon: LayoutDashboard },
    { id: AppView.LEARNING, label: '学习', icon: BookOpen },
    { id: AppView.AI_DIAGNOSIS, label: 'AI辩证', icon: ScanFace, isCenter: true },
    { id: AppView.COMMUNITY, label: '社区', icon: Users },
    { id: AppView.PROFILE, label: '我的', icon: UserCircle },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f7f5f0] md:flex-row text-stone-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-emerald-900 text-emerald-50 shadow-2xl z-20">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold tracking-wider">盒家康</h1>
          <p className="text-emerald-400 text-xs tracking-widest mt-1">智慧中医 AI TCM</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-emerald-800 text-white shadow-lg' 
                  : 'hover:bg-emerald-800/50 text-emerald-200'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 text-xs text-emerald-500 text-center">
          Powered by Qwen-VL-Plus
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div key={currentView} className="flex-1 h-full w-full animate-in fade-in zoom-in-[0.99] duration-300 ease-out">
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
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-[#f7f5f0] transition-all transform active:scale-95 ${
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
              className={`flex flex-col items-center justify-center p-2 flex-1 rounded-lg transition-colors ${
                isActive ? 'text-emerald-700' : 'text-stone-400'
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