import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { referenceApi } from '../../api/reference';
import { adminApi } from '../../api/admin';
import { Plus, Boxes, Target } from 'lucide-react';

export const MarketSetup: React.FC = () => {
  const { countries, resources, refreshReferenceData, refreshGameState } = useGameState();
  const { success, error: toastError } = useToast();

  const [resourceName, setResourceName] = useState('');
  const [baseValue, setBaseValue] = useState<number>(10);

  const [countryId, setCountryId] = useState<number | ''>('');
  const [resourceId, setResourceId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(100);

  const [loading, setLoading] = useState(false);

  const createResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceName) return;
    setLoading(true);
    try {
      await referenceApi.createResource({ name: resourceName, base_value: Number(baseValue) });
      success('Commodity Registered', `${resourceName} catalog entry created.`);
      setResourceName('');
      await Promise.all([refreshGameState(), refreshReferenceData()]);
    } catch (err: any) {
      toastError('Failed to Create Resource', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryId || !resourceId || !quantity) return;
    setLoading(true);
    try {
      await referenceApi.createInventory(Number(countryId), Number(resourceId), Number(quantity));
      success('Stockpile Allocated', 'Sovereign inventory updated.');
      await refreshGameState();
    } catch (err: any) {
      toastError('Failed to Allocate Stockpile', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addObjective = async () => {
    if (!countryId || !resourceId || !quantity) {
      toastError('Missing Fields', 'Please select country, resource, and quota amount.');
      return;
    }
    setLoading(true);
    try {
      await adminApi.createObjective(Number(countryId), Number(resourceId), Number(quantity));
      success('Objective Assigned', 'Strategic import quota added.');
      await refreshGameState();
    } catch (err: any) {
      toastError('Failed to Assign Objective', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-sm space-y-6">
      <div className="border-b border-neutral-100 dark:border-white/10 pb-4">
        <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
          // Market Foundation
        </span>
        <h3 className="font-display font-black text-2xl text-black dark:text-white mt-0.5">
          Resources & <span className="text-[#FF5533] dark:text-[#CCFF00]">Stockpiles</span>
        </h3>
      </div>

      {/* Add Resource Form */}
      <form onSubmit={createResource} className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 flex flex-wrap gap-3 items-center shadow-sm">
        <input
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
          placeholder="Resource name (e.g. Lithium)"
          required
          className="rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-[#CCFF00] flex-1 min-w-[160px]"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={baseValue}
          onChange={(e) => setBaseValue(Number(e.target.value))}
          placeholder="Base Value ($)"
          className="rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-[#CCFF00] w-28"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-display font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Resource</span>
        </button>
      </form>

      {/* Allocate Stock & Objectives Form */}
      <form onSubmit={addInventory} className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 flex flex-wrap gap-3 items-center shadow-sm">
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#CCFF00] flex-1 min-w-[140px]"
          required
        >
          <option value="" className="bg-white dark:bg-[#0A0A0A] text-neutral-400">Select Country...</option>
          {countries.map((c) => (
            <option className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white" key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#CCFF00] flex-1 min-w-[140px]"
          required
        >
          <option value="" className="bg-white dark:bg-[#0A0A0A] text-neutral-400">Select Resource...</option>
          {resources.map((r) => (
            <option className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white" key={r.id} value={r.id}>
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
          className="rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-[#CCFF00] w-24"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-display font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Allocate Stock</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={addObjective}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-display font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          <Target className="w-3.5 h-3.5 text-[#FF5533]" />
          <span>Assign Quota</span>
        </button>
      </form>
    </div>
  );
};
