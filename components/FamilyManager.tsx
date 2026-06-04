import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bell, Check, Home, Plus, Shield, UserPlus, X } from 'lucide-react';

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
    <div className="motion-enter rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Home size={20} />
          </div>
          <div>
            <h3 className="font-bold text-stone-900">家庭管理</h3>
            <p className="text-xs text-stone-500 mt-0.5">家庭成员、邀请和权限</p>
          </div>
        </div>
        {family && <span className="text-xs text-stone-400">ID: {family.id.slice(0, 8)}</span>}
      </div>

      {msg && (
        <div className="motion-enter mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </div>
      )}

      {notifications.length > 0 && (
        <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-900">
            <Bell size={16} /> 消息通知
          </h4>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-stone-700">{n.fromUsername} 邀请你加入家庭</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(n.id, true)}
                    className="motion-press inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <Check size={14} /> 接受
                  </button>
                  <button
                    onClick={() => handleRespond(n.id, false)}
                    className="motion-press inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    <X size={14} /> 拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {family ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-bold text-emerald-900">{family.name}</h4>
            <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-500">
              {family.members.length} 位成员
            </span>
          </div>

          <div className="rounded-2xl border border-stone-100 overflow-hidden">
            {family.members.map((m: any) => (
              <div key={m.userId} className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-800">
                    {m.userId === user.id ? '我' : m.userId.slice(0, 8)}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                    <Shield size={11} /> {m.role === 'admin' ? '管理员' : '成员'}
                  </span>
                </div>

                {user.role === 'admin' && m.userId !== user.id && (
                  <select
                    value={m.role}
                    onChange={(e) => handleSetRole(m.userId, e.target.value)}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="member">成员</option>
                    <option value="admin">管理员</option>
                  </select>
                )}
              </div>
            ))}
          </div>

          {user.role === 'admin' && (
            <div className="mt-5 border-t border-stone-100 pt-5">
              <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-800">
                <UserPlus size={16} /> 邀请新成员
              </h5>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="输入用户名"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                <button
                  onClick={handleInvite}
                  disabled={loading || !inviteUsername}
                  className="motion-press rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  邀请
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
          <p className="mb-4 text-sm text-stone-600">你还没有加入任何家庭。</p>
          <h4 className="mb-3 text-sm font-bold text-stone-800">创建新家庭</h4>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="家庭名称，如：快乐一家人"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
            <button
              onClick={handleCreateFamily}
              disabled={loading || !familyName}
              className="motion-press inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              <Plus size={15} /> 创建
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManager;
