import React, { useState } from 'react';
import { User as UserIcon, Lock, Database, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (u: string, p: string) => Promise<void>;
  onRegister: (u: string, p: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, loading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) onLogin(username, password);
    else onRegister(username, password);
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Cards (CSS Animation) */}
        <div className="absolute top-20 left-10 w-24 h-36 bg-red-500 rounded-lg -rotate-12 opacity-20 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-36 bg-yellow-500 rounded-lg rotate-12 opacity-20 animate-float-slower"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-2xl tracking-tighter">
            UNO
          </h1>
          <p className="text-slate-300 font-medium tracking-[0.2em] text-sm mt-2 uppercase opacity-80">
            Universal Online
          </p>
        </div>

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Server Status Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
             <span className="text-[10px] font-mono text-green-400/80 tracking-wider">SYSTEM ONLINE</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            {isLogin ? 'Welcome Back' : 'New Player'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Field */}
            <div className="relative group">
              <div className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedField === 'username' || username ? '-top-2.5 text-xs text-blue-400 bg-slate-900/80 px-2 rounded' : 'top-3.5 text-slate-400'}`}>
                <span className="flex items-center gap-2">
                  <UserIcon size={14} /> Username
                </span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all duration-300"
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedField === 'password' || password ? '-top-2.5 text-xs text-purple-400 bg-slate-900/80 px-2 rounded' : 'top-3.5 text-slate-400'}`}>
                <span className="flex items-center gap-2">
                  <Lock size={14} /> Password
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white outline-none focus:border-purple-500/50 focus:bg-slate-900/80 transition-all duration-300"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm text-center animate-in slide-in-from-top-2 fade-in duration-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg 
                transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center gap-2
                ${loading 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25'}
              `}
            >
              {loading ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  {isLogin ? 'Enter Game' : 'Create Account'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); }}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-300"
            >
              {isLogin ? "First time? Create an account" : "Already have an account? Log In"}
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-500 text-xs font-mono opacity-50">
          v2.0.0 • SECURE CONNECTION • LATENCY: 24ms
        </div>
      </div>
    </div>
  );
};
