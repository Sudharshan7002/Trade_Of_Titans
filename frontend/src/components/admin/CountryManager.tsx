import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { referenceApi } from '../../api/reference';
import { Building2, Plus, UserPlus } from 'lucide-react';
import { Country } from '../../types/api';

interface CountryManagerProps {
  countries: Country[];
  onCountryUpdated: () => void;
}

export const CountryManager: React.FC<CountryManagerProps> = ({
  countries,
  onCountryUpdated,
}) => {
  const { refreshGameState, refreshReferenceData } = useGameState();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [money, setMoney] = useState<number>(10000);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      toastError('Missing Details', 'Please fill in all country registration fields.');
      return;
    }

    setIsCreating(true);
    try {
      await referenceApi.createCountry({
        name,
        username,
        password,
        money: Number(money),
      });
      success('Sovereign State Registered', `${name} has been enrolled into the global network.`);
      setName('');
      setUsername('');
      setPassword('');
      await Promise.all([refreshGameState(), refreshReferenceData()]);
      onCountryUpdated();
    } catch (err: any) {
      toastError('Country Registration Failed', err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 shadow-soft-card space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
            Geopolitical Roster
          </span>
          <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white mt-0.5">
            Sovereign States & Treasuries
          </h3>
        </div>
      </div>

      {/* Register New Country Form */}
      <form
        onSubmit={handleCreateCountry}
        className="p-5 rounded-2xl bg-slate-50 dark:bg-titan-950/60 border border-slate-200/80 dark:border-white/5 space-y-4 shadow-sm"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          <span>Register New Sovereign State</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">State Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. United Kingdom"
              className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-sky-400"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. uk_delegate"
              className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-sky-400"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Access Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-sky-400"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Initial Treasury ($)</label>
            <input
              type="number"
              value={money}
              onChange={(e) => setMoney(parseFloat(e.target.value))}
              placeholder="10000"
              className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-slate-900 dark:focus:border-sky-400"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2.5 border-t border-slate-200/80 dark:border-white/5">
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isCreating ? (
              <div className="w-3 h-3 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Enroll State</span>
          </button>
        </div>
      </form>

      {/* Countries Table */}
      <div className="overflow-x-auto subtle-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-3">State ID</th>
              <th className="py-2.5 px-3">Country Name</th>
              <th className="py-2.5 px-3">Login Username</th>
              <th className="py-2.5 px-3 text-right">Treasury Reserves</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {countries.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-slate-500 dark:text-slate-400">#{c.id}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Building2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span>{c.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{c.username}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  ${Number(c.money).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
