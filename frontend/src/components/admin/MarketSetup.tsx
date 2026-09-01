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
    event.preventDefault(); setLoading(true);
    try { await referenceApi.createResource({ name: resourceName, base_value: baseValue }); setResourceName(''); await Promise.all([refreshGameState(), refreshReferenceData()]); success('Resource added', 'The market catalogue has been updated.'); }
    catch (err: any) { error('Could not add resource', err.message); } finally { setLoading(false); }
  };
  const addInventory = async (event: React.FormEvent) => {
    event.preventDefault(); if (!countryId || !resourceId) return error('Choose country and resource', 'Both selections are required.'); setLoading(true);
    try { await referenceApi.createInventory(Number(countryId), Number(resourceId), quantity); success('Stockpile allocated', 'Initial inventory is ready for trading.'); }
    catch (err: any) { error('Could not allocate stockpile', err.message); } finally { setLoading(false); }
  };
  const addObjective = async () => {
    if (!countryId || !resourceId) return error('Choose country and resource', 'Both selections are required.'); setLoading(true);
    try { await adminApi.createObjective(Number(countryId), Number(resourceId), quantity); success('Objective assigned', 'The country import target is now tracked.'); }
    catch (err: any) { error('Could not assign objective', err.message); } finally { setLoading(false); }
  };
  const selects = <><select value={countryId} onChange={e => setCountryId(e.target.value ? Number(e.target.value) : '')} className="glass-input rounded-xl px-3 py-2 text-xs text-white" required><option value="" className="bg-titan-900">Country</option>{countries.map(c => <option className="bg-titan-900" key={c.id} value={c.id}>{c.name}</option>)}</select><select value={resourceId} onChange={e => setResourceId(e.target.value ? Number(e.target.value) : '')} className="glass-input rounded-xl px-3 py-2 text-xs text-white" required><option value="" className="bg-titan-900">Resource</option>{resources.map(r => <option className="bg-titan-900" key={r.id} value={r.id}>{r.name}</option>)}</select><input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="glass-input rounded-xl px-3 py-2 text-xs text-white" /></>;
  return <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4"><div><span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Market foundation</span><h3 className="font-display font-bold text-xl text-white mt-0.5">Resources, Stockpiles & Objectives</h3></div><form onSubmit={createResource} className="flex flex-wrap gap-2"><input value={resourceName} onChange={e => setResourceName(e.target.value)} placeholder="Resource name" required className="glass-input rounded-xl px-3 py-2 text-xs text-white"/><input type="number" min="0" step="0.01" value={baseValue} onChange={e => setBaseValue(Number(e.target.value))} className="glass-input rounded-xl px-3 py-2 text-xs text-white"/><button disabled={loading} className="px-3 py-2 rounded-xl bg-cyan-500 text-titan-950 text-xs font-black"><Plus className="w-3.5 h-3.5 inline"/> Add resource</button></form><form onSubmit={addInventory} className="flex flex-wrap gap-2">{selects}<button disabled={loading} className="px-3 py-2 rounded-xl bg-emerald-500 text-titan-950 text-xs font-black"><Boxes className="w-3.5 h-3.5 inline"/> Allocate stock</button><button type="button" disabled={loading} onClick={addObjective} className="px-3 py-2 rounded-xl bg-amber-400 text-titan-950 text-xs font-black">Assign import objective</button></form></div>;
};
