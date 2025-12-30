import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: (token: string, user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate a minimum loading time for better UX
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
          setError('Authentication failed: ' + (err.message || 'Unknown error'));
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
    <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-900/5 -skew-y-3 transform origin-top-left z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-900/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>

      <div className={`relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Header Section */}
        <div className="bg-emerald-900 p-8 pt-12 pb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-800 text-emerald-100 mb-4 shadow-lg ring-4 ring-emerald-900/50">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white tracking-wider mb-2">
              盒家康
            </h1>
            <p className="text-emerald-200 text-xs tracking-[0.2em] uppercase">
              智慧中医 AI Traditional Medicine
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-stone-800 mb-1">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="text-stone-500 text-sm">
              {isLogin ? '请登录您的账号以继续' : '开启您的智慧中医健康之旅'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-pulse">
              <div className="mt-0.5">⚠️</div>
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 outline-none transition-all duration-300 placeholder:text-stone-400 text-stone-700"
                  placeholder="密码"
                  required
                />
              </div>

              <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${!isLogin ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="relative group pt-1"> {/* Added padding top to account for grid gap if needed, but grid handles layout */}
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
              className="w-full bg-emerald-900 text-white py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-emerald-800 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group mt-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
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
                className="ml-2 text-emerald-700 font-bold hover:text-emerald-900 hover:underline underline-offset-4 transition-colors focus:outline-none"
              >
                {isLogin ? '立即注册' : '直接登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="absolute bottom-6 text-stone-400 text-xs text-center w-full">
        &copy; {new Date().getFullYear()} 盒家康智慧中医系统. All rights reserved.
      </div>
    </div>
  );
};

export default Auth;
