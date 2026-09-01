import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  ArrowLeftRight, 
  ShieldCheck, 
  Trophy,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        {
          to: '/admin',
          label: 'Supreme Control',
          icon: <ShieldCheck className="w-4 h-4" />,
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
      ];
    }

    if (role === 'ranking') {
      return [
        {
          to: '/rankings',
          label: 'Global Standings',
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
    <aside className="w-full md:w-56 shrink-0 md:min-h-[calc(100vh-4rem)] border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-titan-950 p-4 transition-colors">
      <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 subtle-scrollbar">
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
