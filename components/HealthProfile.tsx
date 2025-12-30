import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogOut, Users, UserCog, ChevronRight } from 'lucide-react';
import FamilyManager from './FamilyManager';
import ProfileManager from './ProfileManager';

interface Props {
  onProfileUpdate: (profile: UserProfile) => void;
  token: string;
  user: any;
  onLogout: () => void;
}

const HealthProfile: React.FC<Props> = ({ onProfileUpdate, token, user, onLogout }) => {
  const [showFamily, setShowFamily] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);

  if (showProfiles) {
    return (
      <div className="h-full w-full animate-in slide-in-from-right duration-300 ease-out bg-white z-20 absolute inset-0">
        <ProfileManager token={token} onBack={() => setShowProfiles(false)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#f7f5f0] animate-in fade-in zoom-in-[0.99] duration-300">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-24">
        {/* Header with User Controls */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 font-serif">个人中心</h2>
            <p className="text-sm text-stone-600">欢迎, {user.username}</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
          >
            <LogOut size={16} /> 退出
          </button>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* My Health Profiles Card */}
          <button
            onClick={() => setShowProfiles(true)}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCog size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-stone-800 group-hover:text-emerald-800 transition-colors">我的健康档案</h3>
                <p className="text-sm text-stone-500">管理个人及家人的中医健康信息</p>
              </div>
            </div>
            <div className="bg-stone-50 p-2 rounded-full text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <ChevronRight size={20} />
            </div>
          </button>

          {/* Family Management Toggle */}
          <button
            onClick={() => setShowFamily(!showFamily)}
            className={`w-full bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between hover:shadow-md transition-shadow group ${showFamily ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Users size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-stone-800 group-hover:text-indigo-800 transition-colors">家庭组管理</h3>
                <p className="text-sm text-stone-500">邀请家人加入，共享健康数据</p>
              </div>
            </div>
            <div className={`bg-stone-50 p-2 rounded-full text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors ${showFamily ? 'rotate-90' : ''}`}>
              <ChevronRight size={20} />
            </div>
          </button>
        </div>

        {/* Family Manager Section */}
        {showFamily && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <FamilyManager token={token} user={user} onUpdate={() => {}} />
          </div>
        )}
        
        {/* Placeholder for future features */}
        <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-stone-200 text-center text-stone-400">
          <p className="text-sm">更多健康服务敬请期待...</p>
        </div>
      </div>
    </div>
  );
};

export default HealthProfile;
