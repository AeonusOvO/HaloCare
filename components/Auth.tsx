import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Lock, Mail, ArrowRight, Loader2, Sparkles, ShieldCheck, HeartPulse, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (token: string, user: any) => void;
}

const DISCLAIMER = '本系统仅用于健康管理和科研演示，不作为临床诊断依据。';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isLogin) {
        const loginPromise = api.login(username, password);
        const [{ token, user }] = await Promise.all([loginPromise, minLoadTime]);
        onLogin(token, user);
      } else {
        const registerPromise = api.register(username, password, email);
        const [{ token, user }] = await Promise.all([registerPromise, minLoadTime]);
        onLogin(token, user);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.error) {
          setError(err.error);
      } else if (err.message && err.message.includes('Failed to fetch')) {
          setError('无法连接服务器，请确认后端服务已启动');
      } else {
          setError('认证失败：' + (err.message || '未知错误'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setError('');
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <div className={`motion-scale-in relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-emerald-100/80 bg-white shadow-2xl transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <aside className="hidden md:flex min-h-[620px] flex-col justify-between bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-10 text-white relative overflow-hidden">
            <HeartPulse className="motion-breathe absolute -right-8 bottom-8 text-white" size={220} />
            <div className="relative z-10">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 text-emerald-100 shadow-lg ring-1 ring-white/15">
                <Sparkles size={28} />
              </div>
              <h1 className="mt-8 text-4xl font-serif font-bold tracking-wider">云脉珍心</h1>
              <p className="mt-3 max-w-sm text-sm leading-7 text-emerald-100">
                面向四诊健康管理、冠心病初筛演示与家庭健康画像的中医智能原型。
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              {['四诊合参健康分析', '脉诊设备演示连接', '名医云会诊与养生方案'].map((item, index) => (
                <div key={item} className="motion-enter flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3" style={{ animationDelay: `${index * 50}ms` }}>
                  <ShieldCheck size={18} className="text-emerald-200" />
                  <span className="text-sm text-emerald-50">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <main className="p-6 md:p-10">
            <div className="mb-8 md:hidden text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900 text-emerald-50 shadow-lg">
                <Sparkles size={28} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-emerald-950 tracking-wider">云脉珍心</h1>
              <p className="mt-2 text-xs tracking-[0.18em] text-emerald-700">四诊健康管理原型</p>
            </div>

            <div className="mb-6 flex rounded-2xl bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`motion-press flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`motion-press flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${!isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                注册
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-800 mb-1">
                {isLogin ? '欢迎回来' : '创建账号'}
              </h2>
              <p className="text-stone-500 text-sm">
                {isLogin ? '请登录您的账号以继续' : '开启您的中医健康管理旅程'}
              </p>
            </div>

            {error && (
              <div className="motion-enter mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 outline-none transition-all duration-300 placeholder:text-stone-400 text-stone-700"
                    placeholder="用户名"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 outline-none transition-all duration-300 placeholder:text-stone-400 text-stone-700"
                    placeholder="密码"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="motion-press absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-emerald-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${!isLogin ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="relative group pt-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-colors">
                        <Mail size={20} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 outline-none transition-all duration-300 placeholder:text-stone-400 text-stone-700"
                        placeholder="电子邮箱"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="motion-press w-full bg-emerald-900 text-white py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-emerald-800 transition-all duration-300 flex items-center justify-center gap-2 group mt-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{isLogin ? '正在登录...' : '正在创建...'}</span>
                  </>
                ) : (
                  <>
                    {isLogin ? '登录' : '注册'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-stone-500 text-sm">
                {isLogin ? '还没有账号？' : '已有账号？'}
                <button
                  onClick={toggleMode}
                  className="motion-press ml-2 text-emerald-700 font-bold hover:text-emerald-900 hover:underline underline-offset-4 transition-colors focus:outline-none"
                >
                  {isLogin ? '立即注册' : '直接登录'}
                </button>
              </p>
            </div>

            <p className="mt-8 rounded-2xl bg-stone-50 px-4 py-3 text-center text-xs leading-5 text-stone-500">
              {DISCLAIMER}
            </p>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Auth;
