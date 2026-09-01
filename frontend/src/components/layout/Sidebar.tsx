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
    <aside className="w-full md:w-56 shrink-0 md:min-h-[calc(100vh-4rem)] border-b md:border-b-0 md:border-r border-white/10 bg-titan-950 p-4">
      <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 subtle-scrollbar">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
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
