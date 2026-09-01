import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { tradingCenterApi } from '../../api/tradingCenter';
import { 
  Building2, 
  ArrowRight, 
  DollarSign, 
  Package, 
  RefreshCw, 
  CheckCircle2, 
  Repeat,
  AlertCircle
} from 'lucide-react';

import { CountryIntel } from '../../types/api';

interface DirectTradeDeskProps {
  activeRoundId: number | undefined;
  isExecutable: boolean;
  countriesIntel?: Record<number, CountryIntel>;
  onTradeExecuted: () => void;
}

export const DirectTradeDesk: React.FC<DirectTradeDeskProps> = ({
  activeRoundId,
  isExecutable,
  countriesIntel,
  onTradeExecuted,
}) => {
  const { countries, resources, getCountryName, getResourceName } = useGameState();
  const { success, error: toastError } = useToast();

  const [exportCountryId, setExportCountryId] = useState<number | ''>('');
  const [importCountryId, setImportCountryId] = useState<number | ''>('');
  const [tradeType, setTradeType] = useState<'money' | 'resource'>('money');
  const [resourceId, setResourceId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(10);
  const [paymentResourceId, setPaymentResourceId] = useState<number | ''>('');
  const [paymentQuantity, setPaymentQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalMoney = quantity * (unitPrice || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeRoundId) {
      toastError('Execution Error', 'No active round is currently underway.');
      return;
    }

    if (!exportCountryId || !importCountryId) {
      toastError('Selection Required', 'Please select both the exporter and importer countries.');
      return;
    }

    if (exportCountryId === importCountryId) {
      toastError('Invalid Countries', 'Exporter and Importer cannot be the same sovereign state.');
      return;
    }

    if (!resourceId || quantity <= 0) {
      toastError('Resource Required', 'Please specify a valid resource and positive quantity.');
      return;
    }

    if (tradeType === 'money' && (unitPrice < 0 || isNaN(unitPrice))) {
      toastError('Invalid Price', 'Please enter a valid price amount.');
      return;
    }

    if (tradeType === 'resource') {
      if (!paymentResourceId || paymentQuantity <= 0) {
        toastError('Barter Error', 'Please choose the barter payment resource and quantity.');
        return;
      }
      if (paymentResourceId === resourceId) {
        toastError('Barter Error', 'Payment resource must be different from the exported resource.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        round_id: activeRoundId,
        export_country_id: Number(exportCountryId),
        import_country_id: Number(importCountryId),
        resource_id: Number(resourceId),
        quantity: Number(quantity),
        price: tradeType === 'money' ? Number(unitPrice) : 0,
        trade_type: tradeType,
        payment_resource_id: tradeType === 'resource' ? Number(paymentResourceId) : null,
        payment_quantity: tradeType === 'resource' ? Number(paymentQuantity) : null,
      };

      const res = await tradingCenterApi.executeDirectTrade(payload);
      success(
        'Trade Executed & Settled',
        `Trade #${res.trade_id} between ${getCountryName(Number(exportCountryId))} and ${getCountryName(Number(importCountryId))} is complete.`
      );

      // Reset quantities
      setQuantity(1);
      setPaymentQuantity(1);
      onTradeExecuted();
    } catch (err: any) {
      toastError('Trade Execution Rejected', err.message || 'Transaction could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            Direct Settlement Console
          </span>
          <h2 className="font-display font-black text-xl text-white mt-0.5">
            Conduct Bilateral Trade
          </h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-titan-900 border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setTradeType('money')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tradeType === 'money'
                ? 'bg-emerald-500 text-titan-950 shadow-glow-emerald/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Money Transaction</span>
          </button>

          <button
            type="button"
            onClick={() => setTradeType('resource')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tradeType === 'resource'
                ? 'bg-amber-500 text-titan-950 shadow-glow-gold/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Barter System</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Exporter (Country 1) */}
          <div className="p-4 rounded-xl bg-titan-950/60 border border-white/5 space-y-2">
            <label className="block text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Country 1 — Exporter (Seller)
            </label>
            <select
              value={exportCountryId}
              onChange={(e) => setExportCountryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-white font-semibold"
              required
            >
              <option value="" className="bg-titan-900">Select Exporter Country...</option>
              {countries.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  disabled={c.id === importCountryId}
                  className="bg-titan-900"
                >
                  {c.name} (Balance: ${Number(c.money).toLocaleString()})
                </option>
              ))}
            </select>
            {exportCountryId && countriesIntel?.[Number(exportCountryId)] && (
              <div className="pt-2 border-t border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  Available Stockpiles (Click to Select):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {countriesIntel[Number(exportCountryId)].stockpiles.length === 0 ? (
                    <span className="text-[11px] text-slate-500 font-mono italic">No remaining stockpiles</span>
                  ) : (
                    countriesIntel[Number(exportCountryId)].stockpiles.map((st) => (
                      <button
                        key={st.resource_id}
                        type="button"
                        onClick={() => {
                          setResourceId(st.resource_id);
                          setQuantity(Math.min(st.quantity, 1000));
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                          resourceId === st.resource_id
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-glow-emerald/20'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-emerald-500/40 hover:text-white'
                        }`}
                        title="Click to auto-populate resource"
                      >
                        {getResourceName(st.resource_id)}: <span className="font-bold text-white">{st.quantity.toLocaleString()}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Importer (Country 2) */}
          <div className="p-4 rounded-xl bg-titan-950/60 border border-white/5 space-y-2">
            <label className="block text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Country 2 — Importer (Buyer)
            </label>
            <select
              value={importCountryId}
              onChange={(e) => setImportCountryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-white font-semibold"
              required
            >
              <option value="" className="bg-titan-900">Select Importer Country...</option>
              {countries.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  disabled={c.id === exportCountryId}
                  className="bg-titan-900"
                >
                  {c.name} (Balance: ${Number(c.money).toLocaleString()})
                </option>
              ))}
            </select>

            {importCountryId && countriesIntel?.[Number(importCountryId)] && (
              <div className="pt-2 border-t border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  Target Quotas Needed:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {countriesIntel[Number(importCountryId)].objectives.map((obj) => {
                    const remaining = Math.max(0, obj.required_quantity - obj.imported_quantity);
                    const isFulfilled = remaining === 0;
                    return (
                      <span
                        key={obj.resource_id}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold border ${
                          isFulfilled
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/80'
                            : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        }`}
                      >
                        {getResourceName(obj.resource_id)}: {isFulfilled ? '✓ Fulfilled' : `Need ${remaining.toLocaleString()} u`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commodity & Terms Row */}
        <div className="p-4 rounded-xl bg-titan-950/40 border border-white/5 space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Transaction Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Primary Commodity */}
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                Resource Transferred
              </label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : '')}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                required
              >
                <option value="" className="bg-titan-900">Choose Resource...</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id} className="bg-titan-900">
                    {r.name} (Base: ${r.base_value})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                Quantity Units
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-mono"
                required
              />
            </div>

            {/* Money Mode: Price per unit */}
            {tradeType === 'money' ? (
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  Price per Unit ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
            ) : (
              /* Barter Mode: Payment Resource */
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  Barter Payment Resource
                </label>
                <select
                  value={paymentResourceId}
                  onChange={(e) => setPaymentResourceId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="" className="bg-titan-900">Choose Payment Good...</option>
                  {resources
                    .filter((r) => r.id !== resourceId)
                    .map((r) => (
                      <option key={r.id} value={r.id} className="bg-titan-900">
                        {r.name} (Base: ${r.base_value})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Barter Mode Extra: Payment Quantity */}
          {tradeType === 'resource' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  Barter Payment Units (from Importer)
                </label>
                <input
                  type="number"
                  min="1"
                  value={paymentQuantity}
                  onChange={(e) => setPaymentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>
          )}

          {/* Summary Banner */}
          {exportCountryId && importCountryId && resourceId && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{getCountryName(Number(exportCountryId))}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white">{getCountryName(Number(importCountryId))}</span>
              </div>

              <div className="font-mono text-cyan-300">
                {tradeType === 'money' ? (
                  <span>
                    Sending <strong className="text-white">{quantity}x {getResourceName(Number(resourceId))}</strong> for{' '}
                    <strong className="text-emerald-400">${totalMoney.toLocaleString()}</strong>
                  </span>
                ) : (
                  <span>
                    Swapping <strong className="text-white">{quantity}x {getResourceName(Number(resourceId))}</strong> for{' '}
                    <strong className="text-amber-400">{paymentQuantity}x {getResourceName(Number(paymentResourceId) || 0)}</strong>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Execution Action */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !isExecutable}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-titan-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-glow-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-titan-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-titan-950" />
            )}
            <span>Execute Trade Immediately</span>
          </button>
        </div>

        {!isExecutable && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Direct trading requires both an active tournament session and an active trading round.
            </span>
          </div>
        )}
      </form>
    </div>
  );
};
