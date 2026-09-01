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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F0F2F5] dark:bg-[#000000] transition-colors duration-200 relative">
      {/* Top Corner Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-3 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111111] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#181818] transition-all shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#FFD000]" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-800" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-black dark:bg-[#CCFF00] text-white dark:text-black shadow-lg mx-auto transition-transform hover:scale-105">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight uppercase">
              Trade of <span className="text-[#FF5533] dark:text-[#CCFF00]">Titans</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-neutral-500 mt-1 tracking-tight">
              // Strategic Trading Summit Console
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-7 sm:p-9 rounded-[32px] bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-2xl space-y-6 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Delegate Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. usa, admin)"
                  className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm bg-neutral-50 dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-[#CCFF00] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm bg-neutral-50 dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-[#CCFF00] transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-lime w-full py-3.5 text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>Authenticate & Enter</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-neutral-500 font-mono">
          Authorized delegations & summit officials only
        </p>
      </div>
    </div>
  );
};
