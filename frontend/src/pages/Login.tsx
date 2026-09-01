import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Globe, Lock, User, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-titan-950">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-titan-900 border border-yellow-500/40 mx-auto">
            <Globe className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider uppercase">
              Trade of Titans
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1 tracking-tight">
              Trade administration console
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Delegate Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full glass-input text-white rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input text-white rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-titan-950 font-black text-sm uppercase tracking-wider shadow-glow-gold transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-titan-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-titan-950" />
              )}
              <span>Sign in</span>
            </button>
          </form>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 font-mono">
          Authorized users only
        </p>
      </div>
    </div>
  );
};
