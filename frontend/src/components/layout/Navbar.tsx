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
    <header className="sticky top-4 z-40 w-full mb-6 transition-all duration-200">
      <div className="floating-header flex min-h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-black dark:bg-[#CCFF00] text-white dark:text-black shadow-sm transition-transform duration-200 hover:scale-105">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold tracking-tight text-base sm:text-lg text-black dark:text-white uppercase">
                Trade of <span className="text-[#FF5533] dark:text-[#CCFF00]">Titans</span>
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-neutral-500 dark:text-neutral-400 font-mono tracking-tight leading-none mt-0.5">
              // Geopolitical Summit
            </p>
          </div>
        </div>

        {/* Global Live Round Countdown Timer */}
        <div className="flex items-center gap-3">
          <RoundCountdownTimer round={activeRound} compact={true} />
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/10 p-1 transition-colors">
            <NavLink
              to={workspace.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-display font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> {workspace.label}
            </NavLink>
          </nav>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FFD000]" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-800" />
            )}
          </button>

          {/* Account Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200 dark:border-white/10">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-display font-bold text-black dark:text-white leading-tight">
                {countryDisplayName || user?.username}
              </div>
              <div className="mt-0.5">
                {role ? <StatusBadge status={role} size="sm" showIcon={false} /> : null}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-xs font-display font-bold gap-1.5 shadow-sm"
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
