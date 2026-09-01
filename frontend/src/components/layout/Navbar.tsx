import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGameState } from '../../context/GameStateContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../ui/StatusBadge';
import { RoundCountdownTimer } from '../ui/RoundCountdownTimer';
import { Globe, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { activeRound } = useGameState();
  const { theme, toggleTheme } = useTheme();
  const countryDisplayName = user?.countryId ? `Country #${user.countryId}` : null;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const workspace =
    role === 'admin'
      ? { to: '/admin', label: 'Administration' }
      : role === 'trading_center'
      ? { to: '/trading-center', label: 'Trading Desk' }
      : role === 'ranking'
      ? { to: '/rankings', label: 'Global Rankings' }
      : { to: '/country', label: 'My Country' };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="flex min-h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm transition-transform duration-200 hover:scale-105">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold tracking-tight text-base sm:text-lg text-slate-950 dark:text-white uppercase">
                Trade of Titans
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-tight leading-none mt-0.5">
              Strategic Trading Summit
            </p>
          </div>
        </div>

        {/* Global Live Round Countdown Timer */}
        <div className="flex items-center gap-3">
          <RoundCountdownTimer round={activeRound} compact={true} />
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100/80 dark:bg-titan-900/80 border border-slate-200/60 dark:border-white/5 p-1 transition-colors">
            <NavLink
              to={workspace.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> {workspace.label}
            </NavLink>
          </nav>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-titan-900 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-titan-850 transition-all shadow-soft-card"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Account Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80 dark:border-white/10">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {countryDisplayName || user?.username}
              </div>
              <div className="mt-0.5">
                {role ? <StatusBadge status={role} size="sm" showIcon={false} /> : null}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-titan-900 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all text-xs font-semibold gap-1.5 shadow-soft-card"
              title="Sign out of console"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
