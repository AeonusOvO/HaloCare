import React, { useState } from 'react';
import { api } from '../services/api';
import { Activity, AlertCircle, ArrowRight, Eye, EyeOff, HeartPulse, Lock, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';

interface AuthProps {
  onLogin: (token: string, user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { token, user } = await api.login(username, password);
        onLogin(token, user);
      } else {
        const { token, user } = await api.register(username, password, email);
        onLogin(token, user);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.error) {
          setError(err.error);
      } else if (err.message && err.message.includes('Failed to fetch')) {
          setError('无法连接服务器，请稍后重试或联系管理员');
      } else {
          setError('Authentication failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),linear-gradient(135deg,#f7f5f0_0%,#eef4ef_52%,#dfece7_100%)] text-stone-800 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.04fr_0.96fr] gap-5 lg:gap-8 items-stretch">
        <section className="hidden lg:flex motion-enter min-h-[620px] rounded-[2rem] bg-emerald-950 text-white p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200" />
          <div className="absolute right-[-90px] bottom-[-80px] text-emerald-700/25 motion-breathe">
            <HeartPulse size={310} strokeWidth={1.2} />
          </div>
          <div className="relative z-10 flex flex-col justify-between w-full">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner">
                <Activity size={30} className="text-emerald-200" />
              </div>
              <h1 className="mt-8 text-5xl font-bold tracking-[0.08em] leading-tight">云脉珍心</h1>
              <p className="mt-5 text-lg leading-8 text-emerald-50/80 max-w-xl">
                以四诊合参为主线，面向冠心病初筛演示、体质辨识和家庭健康管理的智能原型。
              </p>
            </div>

            <div className="space-y-3 text-sm text-emerald-50/82">
              {[
                '望闻问切多模态辨识',
                '脉诊设备演示连接',
                '健康画像与调理建议',
              ].map((item, index) => (
                <div
                  key={item}
                  className={`motion-enter motion-enter-delay-${Math.min(index + 1, 3)} flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3`}
                >
                  <ShieldCheck size={18} className="text-emerald-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="motion-scale-in bg-white/95 backdrop-blur rounded-[1.75rem] border border-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] p-5 sm:p-8 md:p-10">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-emerald-50 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <HeartPulse size={25} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">云脉珍心</h2>
                <p className="text-xs text-stone-500 mt-1">健康管理与科研演示系统</p>
              </div>
            </div>
            <div className="hidden sm:flex rounded-full bg-stone-100 p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`motion-press px-4 py-2 rounded-full text-sm font-bold transition-colors ${isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`motion-press px-4 py-2 rounded-full text-sm font-bold transition-colors ${!isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                注册
              </button>
            </div>
          </div>

          <div className="mb-7">
            <h3 className="text-3xl font-bold text-stone-900 mb-2">{isLogin ? '欢迎回来' : '创建账号'}</h3>
            <p className="text-sm text-stone-500">
              {isLogin ? '进入您的四诊健康管理工作台。' : '用于保存健康画像、四诊记录和家庭管理信息。'}
            </p>
          </div>

          {error && (
            <div className="motion-enter mb-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">用户名</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full h-[52px] rounded-2xl border border-stone-200 bg-stone-50/80 pl-11 pr-4 py-3 text-stone-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full h-[52px] rounded-2xl border border-stone-200 bg-stone-50/80 pl-11 pr-12 py-3 text-stone-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="motion-press absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="motion-enter">
                <label className="block text-sm font-bold text-stone-700 mb-2">邮箱</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full h-[52px] rounded-2xl border border-stone-200 bg-stone-50/80 pl-11 pr-4 py-3 text-stone-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="motion-press w-full mt-2 h-[52px] rounded-2xl bg-emerald-900 text-white font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
              {loading ? '正在处理...' : (isLogin ? '进入工作台' : '完成注册')}
            </button>
          </form>

          <div className="sm:hidden mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1 border border-stone-200">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`motion-press rounded-xl py-2 text-sm font-bold ${isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500'}`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`motion-press rounded-xl py-2 text-sm font-bold ${!isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500'}`}
            >
              注册
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-stone-500">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="motion-press ml-2 font-bold text-emerald-700 hover:text-emerald-900"
            >
              {isLogin ? '创建账号' : '返回登录'}
            </button>
          </p>

          <p className="mt-7 border-t border-stone-100 pt-5 text-center text-xs leading-6 text-stone-400">
            本系统仅用于健康管理和科研演示，不作为临床诊断依据。
          </p>
        </section>
      </div>
    </div>
  );
};

export default Auth;
