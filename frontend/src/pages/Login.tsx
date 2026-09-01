import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Globe, Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toastError('Credentials Required', 'Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(username, password);
      success('Authentication Authorized', `Welcome, ${username}. Access level: ${response.role}.`);

      // Role-based redirect
      if (response.role === 'admin') {
        navigate('/admin');
      } else if (response.role === 'trading_center') {
        navigate('/trading-center');
      } else if (response.role === 'ranking') {
        navigate('/rankings');
      } else {
        navigate('/country');
      }
    } catch (err: any) {
      toastError('Authentication Failed', err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F6F8FB] dark:bg-titan-950 transition-colors duration-200 relative">
      {/* Top Corner Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-titan-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-titan-800 transition-all shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md mx-auto transition-colors">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight uppercase">
              Trade of Titans
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1 tracking-tight">
              Strategic Trading Summit Console
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 shadow-soft-card space-y-6 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Delegate Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. usa, admin)"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-sky-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-sky-400/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-sky-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-sky-400/20 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>Sign In</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
          Authorized delegations & summit officials only
        </p>
      </div>
    </div>
  );
};
