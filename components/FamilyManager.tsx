import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

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
    <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px', marginTop: '1rem' }}>
      <h3>家庭管理</h3>
      {msg && <div style={{ marginBottom: '1rem', color: '#4CAF50' }}>{msg}</div>}

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', background: 'white' }}>
          <h4>🔔 消息通知</h4>
          {notifications.map(n => (
            <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span>{n.fromUsername} 邀请你加入家庭</span>
              <div>
                <button onClick={() => handleRespond(n.id, true)} style={{ marginRight: '0.5rem', background: '#4CAF50', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>接受</button>
                <button onClick={() => handleRespond(n.id, false)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>拒绝</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Family Section */}
      {family ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>🏠 {family.name}</h4>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>ID: {family.id.slice(0, 8)}</span>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <h5>成员列表:</h5>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {family.members.map((m: any) => (
                <li key={m.userId} style={{ padding: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {m.userId === user.id ? '我' : m.userId.slice(0, 8)} 
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                      {m.role === 'admin' ? '管理员' : '成员'}
                    </span>
                  </span>
                  
                  {/* Only Admin can change roles, but not for themselves */}
                  {user.role === 'admin' && m.userId !== user.id && (
                    <select 
                      value={m.role} 
                      onChange={(e) => handleSetRole(m.userId, e.target.value)}
                      style={{ marginLeft: '1rem', padding: '2px' }}
                    >
                      <option value="member">成员</option>
                      <option value="admin">管理员</option>
                    </select>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {user.role === 'admin' && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
              <h5>邀请新成员</h5>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="输入用户名" 
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button 
                  onClick={handleInvite} 
                  disabled={loading || !inviteUsername}
                  style={{ background: '#2196F3', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}
                >
                  邀请
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>你还没有加入任何家庭。</p>
          <div style={{ marginTop: '1rem' }}>
            <h4>创建新家庭</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="家庭名称 (如: 快乐一家人)" 
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button 
                onClick={handleCreateFamily} 
                disabled={loading || !familyName}
                style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManager;
