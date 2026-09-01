import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Globe, LogOut, LayoutDashboard, Trophy } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const countryDisplayName = user?.countryId ? `Country #${user.countryId}` : null;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const workspace = role === 'admin'
    ? { to: '/admin', label: 'Administration' }
    : role === 'trading_center'
      ? { to: '/trading-center', label: 'Trading desk' }
      : role === 'ranking'
        ? { to: '/rankings', label: 'Global Rankings' }
        : { to: '/country', label: 'My country' };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-titan-950">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 border border-amber-300">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black tracking-wider text-base sm:text-lg text-white uppercase">
                Trade of Titans
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-mono tracking-tight">
              Trading administration
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 rounded-lg bg-titan-900 p-1">
          <NavLink to={workspace.to} className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold transition-colors ${isActive ? 'bg-amber-500 text-titan-950' : 'text-slate-300 hover:text-white'}`}>
            <LayoutDashboard className="h-3.5 w-3.5" /> {workspace.label}
          </NavLink>
        </nav>

        {/* Account actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                {countryDisplayName ? (
                  <span className="text-amber-300 font-semibold">{countryDisplayName}</span>
                ) : (
                  <span>{user?.username}</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {role ? <StatusBadge status={role} size="sm" showIcon={false} /> : null}
              </div>
            </div>
            
            <div className="sm:hidden">
              {role ? <StatusBadge status={role} size="sm" showIcon={false} /> : null}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all text-xs font-semibold gap-1.5"
            title="Sign out of console"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
