import React, { useState } from 'react';
import { Boxes, Plus } from 'lucide-react';
import { referenceApi } from '../../api/reference';
import { adminApi } from '../../api/admin';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';

export const MarketSetup: React.FC = () => {
  const { countries, resources, refreshGameState, refreshReferenceData } = useGameState();
  const { success, error } = useToast();
  const [resourceName, setResourceName] = useState('');
  const [baseValue, setBaseValue] = useState(10);
  const [countryId, setCountryId] = useState<number | ''>('');
  const [resourceId, setResourceId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const createResource = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await referenceApi.createResource({ name: resourceName, base_value: baseValue });
      setResourceName('');
      await Promise.all([refreshGameState(), refreshReferenceData()]);
      success('Resource added', 'The market catalogue has been updated.');
    } catch (err: any) {
      error('Could not add resource', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addInventory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!countryId || !resourceId) return error('Choose country and resource', 'Both selections are required.');
    setLoading(true);
    try {
      await referenceApi.createInventory(Number(countryId), Number(resourceId), quantity);
      success('Stockpile allocated', 'Initial inventory is ready for trading.');
    } catch (err: any) {
      error('Could not allocate stockpile', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addObjective = async () => {
    if (!countryId || !resourceId) return error('Choose country and resource', 'Both selections are required.');
    setLoading(true);
    try {
      await adminApi.createObjective(Number(countryId), Number(resourceId), quantity);
      success('Objective assigned', 'The country import target is now tracked.');
    } catch (err: any) {
      error('Could not assign objective', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 shadow-soft-card space-y-5">
      <div>
        <span className="text-xs font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
          Market Foundation
        </span>
        <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white mt-0.5">
          Resources, Stockpiles & Objectives
        </h3>
      </div>

      {/* Add Resource Form */}
      <form onSubmit={createResource} className="p-4 rounded-2xl bg-slate-50 dark:bg-titan-950/60 border border-slate-200/80 dark:border-white/5 flex flex-wrap gap-2.5 items-center shadow-sm">
        <input
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
          placeholder="Resource name (e.g. Lithium)"
          required
          className="rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-sky-400 flex-1 min-w-[160px]"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={baseValue}
          onChange={(e) => setBaseValue(Number(e.target.value))}
          placeholder="Base Value ($)"
          className="rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-slate-900 dark:focus:border-sky-400 w-28"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Resource</span>
        </button>
      </form>

      {/* Allocate Stock & Objectives Form */}
      <form onSubmit={addInventory} className="p-4 rounded-2xl bg-slate-50 dark:bg-titan-950/60 border border-slate-200/80 dark:border-white/5 flex flex-wrap gap-2.5 items-center shadow-sm">
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-sky-400 flex-1 min-w-[140px]"
          required
        >
          <option value="" className="bg-white dark:bg-titan-900 text-slate-400">Select Country...</option>
          {countries.map((c) => (
            <option className="bg-white dark:bg-titan-900 text-slate-900 dark:text-white" key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-sky-400 flex-1 min-w-[140px]"
          required
        >
          <option value="" className="bg-white dark:bg-titan-900 text-slate-400">Select Resource...</option>
          {resources.map((r) => (
            <option className="bg-white dark:bg-titan-900 text-slate-900 dark:text-white" key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Quantity"
          className="rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-slate-900 dark:focus:border-sky-400 w-24"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Allocate Stock</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={addObjective}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-titan-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-titan-700 text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-40"
        >
          Assign Import Objective
        </button>
      </form>
    </div>
  );
};
