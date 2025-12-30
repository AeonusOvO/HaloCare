import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Bell, UserPlus, Shield, User, Check, X, Loader2, Home } from 'lucide-react';

interface FamilyManagerProps {
  token: string;
  user: any;
  onUpdate: () => void;
}

const FamilyManager: React.FC<FamilyManagerProps> = ({ token, user, onUpdate }) => {
  const [family, setFamily] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [inviteUsername, setInviteUsername] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [fam, notifs] = await Promise.all([
        api.getMyFamily(token),
        api.getNotifications(token)
      ]);
      setFamily(fam);
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFamily = async () => {
    try {
      setLoading(true);
      await api.createFamily(token, familyName);
      setMsg('家庭创建成功');
      fetchData();
      onUpdate();
    } catch (err: any) {
      setMsg(err.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      setLoading(true);
      await api.inviteMember(token, inviteUsername);
      setMsg(`已发送邀请给 ${inviteUsername}`);
      setInviteUsername('');
    } catch (err: any) {
      setMsg(err.error || '邀请失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (notifId: string, accept: boolean) => {
    try {
      await api.respondToInvite(token, notifId, accept);
      setMsg(accept ? '已加入家庭' : '已拒绝邀请');
      fetchData();
      onUpdate();
    } catch (err: any) {
      setMsg(err.error || '操作失败');
    }
  };

  const handleSetRole = async (targetUserId: string, role: string) => {
    try {
      await api.setRole(token, targetUserId, role);
      setMsg('权限已更新');
      fetchData();
    } catch (err: any) {
      setMsg(err.error || '操作失败');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700">
          <Users size={24} />
        </div>
        <h3 className="text-xl font-bold text-stone-800">家庭管理</h3>
      </div>
      
      {msg && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check size={16} /> {msg}
        </div>
      )}

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="mb-8 bg-amber-50 border border-amber-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-3 text-sm">
            <Bell size={16} /> 消息通知
          </h4>
          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <div 
                key={n.id} 
                className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-amber-100 animate-in fade-in slide-in-from-left-4 duration-300 fill-mode-backwards"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <span className="text-sm text-stone-700 font-medium">
                  <span className="text-emerald-700 font-bold">{n.fromUsername}</span> 邀请你加入家庭
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRespond(n.id, true)} 
                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors active:scale-95"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => handleRespond(n.id, false)} 
                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors active:scale-95"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family Section */}
      {family ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div>
              <div className="text-xs text-stone-400 mb-1 uppercase tracking-wider">Current Family</div>
              <h4 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <Home size={18} /> {family.name}
              </h4>
            </div>
            <span className="text-xs font-mono bg-stone-200 text-stone-600 px-2 py-1 rounded-md">
              ID: {family.id.slice(0, 8)}
            </span>
          </div>
          
          <div>
            <h5 className="text-sm font-bold text-stone-500 mb-3 px-1">成员列表</h5>
            <div className="space-y-3">
              {family.members.map((m: any, idx: number) => (
                <div 
                  key={m.userId} 
                  className="flex justify-between items-center p-3 rounded-xl border border-stone-100 hover:border-emerald-200 hover:shadow-sm transition-all bg-white group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                      m.role === 'admin' ? 'bg-emerald-500' : 'bg-stone-400'
                    }`}>
                      {m.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                    </div>
                    <div>
                      <div className="font-bold text-stone-700 text-sm">
                        {m.userId === user.id ? '我' : `用户 ${m.userId.slice(0, 4)}`}
                      </div>
                      <div className="text-xs text-stone-400 flex items-center gap-1">
                        {m.role === 'admin' ? '管理员' : '成员'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Only Admin can change roles, but not for themselves */}
                  {user.role === 'admin' && m.userId !== user.id && (
                    <select 
                      value={m.role} 
                      onChange={(e) => handleSetRole(m.userId, e.target.value)}
                      className="text-xs p-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="member">成员</option>
                      <option value="admin">管理员</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="pt-6 border-t border-stone-100">
              <h5 className="text-sm font-bold text-stone-500 mb-3 px-1">邀请新成员</h5>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-colors">
                    <UserPlus size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="输入对方用户名" 
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 outline-none transition-all text-sm"
                  />
                </div>
                <button 
                  onClick={handleInvite} 
                  disabled={loading || !inviteUsername}
                  className="px-6 bg-emerald-900 text-white rounded-xl font-medium shadow-lg hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : '邀请'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
            <Home size={32} />
          </div>
          <p className="text-stone-500 mb-6 text-sm">你还没有加入任何家庭，创建一个来开始吧！</p>
          
          <div className="flex gap-2 max-w-xs mx-auto">
            <input 
              type="text" 
              placeholder="家庭名称 (如: 快乐一家人)" 
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all"
            />
            <button 
              onClick={handleCreateFamily} 
              disabled={loading || !familyName}
              className="px-4 bg-emerald-600 text-white rounded-xl font-medium shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
            >
              创建
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManager;
