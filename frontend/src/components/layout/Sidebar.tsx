import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  ArrowLeftRight, 
  Trophy, 
  Building2 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        {
          to: '/admin',
          label: 'Tournament Admin',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          to: '/trading-center',
          label: 'Trading Floor',
          icon: <ArrowLeftRight className="w-4 h-4" />,
        },
        {
          to: '/rankings',
          label: 'Leaderboard',
          icon: <Trophy className="w-4 h-4" />,
        },
      ];
    }
    if (role === 'trading_center') {
      return [
        {
          to: '/trading-center',
          label: 'Trading Floor',
          icon: <ArrowLeftRight className="w-4 h-4" />,
        },
        {
          to: '/rankings',
          label: 'Leaderboard',
          icon: <Trophy className="w-4 h-4" />,
        },
      ];
    }
    if (role === 'ranking') {
      return [
        {
          to: '/rankings',
          label: 'Leaderboard',
          icon: <Trophy className="w-4 h-4" />,
        },
      ];
    }
    // country role
    return [
      {
        to: '/country',
        label: 'Country Operations',
        icon: <Building2 className="w-4 h-4" />,
      },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-full md:w-56 shrink-0 md:min-h-[calc(100vh-4rem)] border-b md:border-b-0 md:border-r border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#080808] p-4 transition-colors">
      <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 subtle-scrollbar">
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
