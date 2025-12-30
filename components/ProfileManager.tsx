import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Calendar, Activity, ChevronLeft, Plus, Trash2, Edit2, FileText, Check } from 'lucide-react';

interface ProfileManagerProps {
  token: string;
  onBack: () => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ token, onBack }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    relation: '本人',
    gender: '男',
    birthDate: '',
    height: '',
    weight: '',
    occupation: '',
    tcmInfo: {
      chiefComplaint: '',
      coldHotPreference: '',
      sweatCondition: '',
      appetite: '',
      sleepCondition: '',
      stoolUrine: '',
      emotionalStatus: '',
    },
    linkedDiagnosisIds: [] as string[]
  });

  useEffect(() => {
    loadProfiles();
    loadDiagnosisHistory();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await api.getProfiles(token);
      setProfiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDiagnosisHistory = async () => {
    try {
      const data = await api.getDiagnosisHistory(token);
      setDiagnosisHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = () => {
    setCurrentProfile(null);
    setFormData({
      name: '',
      relation: '本人',
      gender: '男',
      birthDate: '',
      height: '',
      weight: '',
      occupation: '',
      tcmInfo: {
        chiefComplaint: '',
        coldHotPreference: '',
        sweatCondition: '',
        appetite: '',
        sleepCondition: '',
        stoolUrine: '',
        emotionalStatus: '',
      },
      linkedDiagnosisIds: []
    });
    setIsEditing(true);
  };

  const handleEdit = (profile: any) => {
    setCurrentProfile(profile);
    setFormData({
      name: profile.name || '',
      relation: profile.relation || '本人',
      gender: profile.basicInfo?.gender || '男',
      birthDate: profile.basicInfo?.birthDate || '',
      height: profile.basicInfo?.height || '',
      weight: profile.basicInfo?.weight || '',
      occupation: profile.basicInfo?.occupation || '',
      tcmInfo: {
        chiefComplaint: profile.tcmInfo?.chiefComplaint || '',
        coldHotPreference: profile.tcmInfo?.coldHotPreference || '',
        sweatCondition: profile.tcmInfo?.sweatCondition || '',
        appetite: profile.tcmInfo?.appetite || '',
        sleepCondition: profile.tcmInfo?.sleepCondition || '',
        stoolUrine: profile.tcmInfo?.stoolUrine || '',
        emotionalStatus: profile.tcmInfo?.emotionalStatus || '',
      },
      linkedDiagnosisIds: profile.linkedDiagnosisIds || []
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个档案吗？')) return;
    try {
      await api.deleteProfile(token, id);
      loadProfiles();
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      relation: formData.relation,
      basicInfo: {
        gender: formData.gender,
        birthDate: formData.birthDate,
        height: Number(formData.height),
        weight: Number(formData.weight),
        occupation: formData.occupation
      },
      tcmInfo: formData.tcmInfo,
      linkedDiagnosisIds: formData.linkedDiagnosisIds
    };

    try {
      if (currentProfile) {
        await api.updateProfile(token, currentProfile.id, payload);
      } else {
        await api.createProfile(token, payload);
      }
      setIsEditing(false);
      loadProfiles();
    } catch (err) {
      alert('保存失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDiagnosis = (id: string) => {
    setFormData(prev => ({
      ...prev,
      linkedDiagnosisIds: prev.linkedDiagnosisIds.includes(id)
        ? prev.linkedDiagnosisIds.filter(d => d !== id)
        : [...prev.linkedDiagnosisIds, id]
    }));
  };

  if (isEditing) {
    return (
      <div className="bg-white min-h-screen rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col h-full absolute inset-0 z-20">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-stone-100 p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsEditing(false)} 
            className="p-2 hover:bg-stone-100 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={24} className="text-stone-600" />
          </button>
          <h2 className="text-lg font-bold text-stone-800">{currentProfile ? '编辑档案' : '新建健康档案'}</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
          <form onSubmit={handleSubmit} className="p-6 space-y-8 max-w-3xl mx-auto">
            {/* Basic Info */}
          <section>
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold text-lg mb-4">
              <User size={20} /> 基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-500 mb-1">姓名</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">关系</label>
                <select 
                  value={formData.relation}
                  onChange={e => setFormData({...formData, relation: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {['本人', '父亲', '母亲', '配偶', '子女', '其他'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">性别</label>
                <div className="flex gap-4">
                  {['男', '女'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 py-2 rounded-xl border transition-all ${
                        formData.gender === g 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">出生日期</label>
                <input 
                  type="date"
                  value={formData.birthDate}
                  onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-stone-500 mb-1">身高 (cm)</label>
                  <input 
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({...formData, height: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-500 mb-1">体重 (kg)</label>
                  <input 
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">职业</label>
                <input 
                  value={formData.occupation}
                  onChange={e => setFormData({...formData, occupation: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </section>

          {/* TCM Info */}
          <section>
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold text-lg mb-4">
              <Activity size={20} /> 中医问诊信息 (十问)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone-500 mb-1">主诉 (最主要的不舒服)</label>
                <textarea 
                  rows={2}
                  value={formData.tcmInfo.chiefComplaint}
                  onChange={e => setFormData({
                    ...formData, 
                    tcmInfo: { ...formData.tcmInfo, chiefComplaint: e.target.value }
                  })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  placeholder="例如：最近经常头晕，睡眠不好..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'coldHotPreference', label: '寒热喜恶', placeholder: '怕冷/怕热/手脚冰凉...' },
                  { key: 'sweatCondition', label: '出汗情况', placeholder: '自汗/盗汗/无汗...' },
                  { key: 'appetite', label: '饮食胃口', placeholder: '食欲差/腹胀/喜热饮...' },
                  { key: 'sleepCondition', label: '睡眠状况', placeholder: '失眠/多梦/易醒...' },
                  { key: 'stoolUrine', label: '二便情况', placeholder: '便秘/溏稀/尿黄...' },
                  { key: 'emotionalStatus', label: '情志状态', placeholder: '焦虑/急躁/抑郁...' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm text-stone-500 mb-1">{field.label}</label>
                    <input 
                      value={(formData.tcmInfo as any)[field.key]}
                      onChange={e => setFormData({
                        ...formData, 
                        tcmInfo: { ...formData.tcmInfo, [field.key]: e.target.value }
                      })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* History Selection */}
          <section>
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold text-lg mb-4">
              <FileText size={20} /> 关联历史诊断 (AI 记录)
            </h3>
            {diagnosisHistory.length === 0 ? (
              <p className="text-stone-400 text-sm">暂无历史诊断记录</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2">
                {diagnosisHistory.map(record => (
                  <div 
                    key={record.id}
                    onClick={() => toggleDiagnosis(record.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      formData.linkedDiagnosisIds.includes(record.id)
                        ? 'bg-emerald-50 border-emerald-500'
                        : 'bg-white border-stone-200 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-stone-800">{new Date(record.date).toLocaleDateString()}</div>
                      <div className="text-xs text-stone-500 truncate w-64">{record.diagnosis}</div>
                    </div>
                    {formData.linkedDiagnosisIds.includes(record.id) && (
                      <Check size={20} className="text-emerald-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-emerald-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存档案'}
          </button>
        </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-[#f7f5f0] z-10 p-4 flex items-center gap-4">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-black/5 rounded-full transition-all active:scale-90"
        >
          <ChevronLeft size={24} className="text-stone-600" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-emerald-900">健康档案管理</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Create New Card */}
          <button 
            onClick={handleCreate}
            className="min-h-[160px] flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 mb-3 transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-stone-500 font-medium group-hover:text-emerald-700">新建档案</span>
          </button>

          {/* Profile Cards */}
          {profiles.map(profile => (
            <div key={profile.id} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-all relative group hover:-translate-y-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-stone-800">{profile.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium">
                      {profile.relation}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 space-x-2">
                    <span>{profile.basicInfo?.gender}</span>
                    <span>|</span>
                    <span>{profile.basicInfo?.birthDate ? `${new Date().getFullYear() - new Date(profile.basicInfo.birthDate).getFullYear()}岁` : '未知年龄'}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(profile)} className="p-2 bg-stone-50 text-stone-600 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(profile.id)} className="p-2 bg-stone-50 text-stone-600 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-start gap-2 text-sm text-stone-600">
                  <Activity size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                  <p className="line-clamp-2">{profile.tcmInfo?.chiefComplaint || '暂无主诉记录'}</p>
                </div>
                {profile.linkedDiagnosisIds?.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                    <FileText size={14} />
                    <span>关联了 {profile.linkedDiagnosisIds.length} 条历史诊断</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
