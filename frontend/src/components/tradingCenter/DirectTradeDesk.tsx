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

import { CountryIntel, RoundSpotlight } from '../../types/api';

interface DirectTradeDeskProps {
  activeRoundId: number | undefined;
  isExecutable: boolean;
  countriesIntel?: Record<number, CountryIntel>;
  spotlight?: RoundSpotlight | null;
  onTradeExecuted: () => void;
}

export const DirectTradeDesk: React.FC<DirectTradeDeskProps> = ({
  activeRoundId,
  isExecutable,
  countriesIntel,
  spotlight,
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
  const [overrideLimits, setOverrideLimits] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalMoney = quantity * (unitPrice || 0);

  const getExporterEligibility = (cId: number) => {
    const c = countries.find((item) => item.id === cId);
    if (!c) return { canExport: true, isBlackMarket: false, label: '' };
    const intel = countriesIntel?.[cId];
    const isBlackMarket = intel?.trade_eligibility?.is_black_market || c.name === 'Standby Alpha';
    const canExport = isBlackMarket || (intel?.trade_eligibility ? intel.trade_eligibility.can_export : true);
    return {
      canExport,
      isBlackMarket,
      label: isBlackMarket
        ? `${c.name} ★ (Black Market - Unlimited)`
        : canExport
        ? `${c.name} (🟢 Ready - $${Number(c.money).toLocaleString()})`
        : `${c.name} (✓ Export Used - $${Number(c.money).toLocaleString()})`,
    };
  };

  const getImporterEligibility = (cId: number) => {
    const c = countries.find((item) => item.id === cId);
    if (!c) return { canImport: true, isBlackMarket: false, label: '' };
    const intel = countriesIntel?.[cId];
    const isBlackMarket = intel?.trade_eligibility?.is_black_market || c.name === 'Standby Alpha';
    const canImport = isBlackMarket || (intel?.trade_eligibility ? intel.trade_eligibility.can_import : true);
    return {
      canImport,
      isBlackMarket,
      label: isBlackMarket
        ? `${c.name} ★ (Black Market - Unlimited)`
        : canImport
        ? `${c.name} (🟢 Ready - $${Number(c.money).toLocaleString()})`
        : `${c.name} (✓ Import Used - $${Number(c.money).toLocaleString()})`,
    };
  };

  const selectedExporterInfo = exportCountryId ? getExporterEligibility(Number(exportCountryId)) : null;
  const selectedImporterInfo = importCountryId ? getImporterEligibility(Number(importCountryId)) : null;
  const hasLimitConflict = Boolean(
    (selectedExporterInfo && !selectedExporterInfo.canExport) ||
    (selectedImporterInfo && !selectedImporterInfo.canImport)
  );

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

    if (hasLimitConflict && !overrideLimits) {
      toastError(
        'Round Trade Limit Reached',
        'One of the selected countries has already used its quota for this round. Enable Referee Override if authorized.'
      );
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
        override_limits: overrideLimits,
      };

      const res = await tradingCenterApi.executeDirectTrade(payload);
      success(
        'Trade Executed & Settled',
        `Trade #${res.trade_id} between ${getCountryName(Number(exportCountryId))} and ${getCountryName(Number(importCountryId))} is complete.`
      );

      // Reset quantities and override
      setQuantity(1);
      setPaymentQuantity(1);
      setOverrideLimits(false);
      onTradeExecuted();
    } catch (err: any) {
      toastError('Trade Execution Notice', err.message || 'Transaction could not be completed.');
      onTradeExecuted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
            // Direct Settlement Desk
          </span>
          <h2 className="font-display font-black text-2xl text-black dark:text-white mt-0.5">
            Conduct Bilateral <span className="text-[#FF5533] dark:text-[#CCFF00]">Trade</span>
          </h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-1">
          <button
            type="button"
            onClick={() => setTradeType('money')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all ${
              tradeType === 'money'
                ? 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cash / Fiat</span>
          </button>

          <button
            type="button"
            onClick={() => setTradeType('resource')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all ${
              tradeType === 'resource'
                ? 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Barter Swap</span>
          </button>
        </div>
      </div>

      {/* Sovereign Spotlight Desk Alert */}
      {spotlight && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-amber-400 text-black shadow-sm">
              ⭐ Spotlight Active
            </span>
            <span className="font-display font-bold text-black dark:text-white">
              {spotlight.country_name}: <span className="text-amber-700 dark:text-amber-300">{spotlight.title}</span>
            </span>
          </div>
          <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
            Perk: <strong className="text-black dark:text-white">{spotlight.perk}</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Exporter (Country 1) */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-mono font-bold tracking-wider text-black dark:text-[#CCFF00] uppercase">
                // 01 Exporter (Seller)
              </label>
              {countries.some((c) => c.name === 'Standby Alpha') && (
                <button
                  type="button"
                  onClick={() => {
                    const alpha = countries.find((c) => c.name === 'Standby Alpha');
                    if (alpha) setExportCountryId(alpha.id);
                  }}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#FF5533]/15 hover:bg-[#FF5533]/25 text-[#FF5533] border border-[#FF5533]/30 transition-all flex items-center gap-1"
                  title="Quick-select Standby Alpha as Black Market supplier"
                >
                  <span>★ Black Market</span>
                </button>
              )}
            </div>
            <select
              value={exportCountryId}
              onChange={(e) => setExportCountryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-semibold focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
              required
            >
              <option value="" className="bg-white dark:bg-[#0A0A0A]">Select Exporter Country...</option>
              {countries.map((c) => {
                const el = getExporterEligibility(c.id);
                return (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={c.id === importCountryId}
                    className="bg-white dark:bg-[#0A0A0A]"
                  >
                    {el.label}
                  </option>
                );
              })}
            </select>
            {exportCountryId && countriesIntel?.[Number(exportCountryId)] && (
              <div className="pt-2 border-t border-neutral-200/60 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                  Available Stockpiles (Click to Select):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {countriesIntel[Number(exportCountryId)].stockpiles.length === 0 ? (
                    <span className="text-[11px] text-neutral-500 font-mono italic">No remaining stockpiles</span>
                  ) : (
                    countriesIntel[Number(exportCountryId)].stockpiles.map((st) => (
                      <button
                        key={st.resource_id}
                        type="button"
                        onClick={() => {
                          setResourceId(st.resource_id);
                          setQuantity(Math.min(st.quantity, 1000));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                          resourceId === st.resource_id
                            ? 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black border-[#CCFF00] shadow-sm'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                        }`}
                        title="Click to auto-populate resource"
                      >
                        {getResourceName(st.resource_id)}: <span className="font-bold">{st.quantity.toLocaleString()}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Importer (Country 2) */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 space-y-3">
            <label className="block text-xs font-mono font-bold tracking-wider text-[#FF5533] uppercase">
              // 02 Importer (Buyer)
            </label>
            <select
              value={importCountryId}
              onChange={(e) => setImportCountryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-semibold focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
              required
            >
              <option value="" className="bg-white dark:bg-[#0A0A0A]">Select Importer Country...</option>
              {countries.map((c) => {
                const el = getImporterEligibility(c.id);
                return (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={c.id === exportCountryId}
                    className="bg-white dark:bg-[#0A0A0A]"
                  >
                    {el.label}
                  </option>
                );
              })}
            </select>

            {importCountryId && countriesIntel?.[Number(importCountryId)] && (
              <div className="pt-2 border-t border-neutral-200/60 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                  Target Quotas Needed:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {countriesIntel[Number(importCountryId)].objectives.map((obj) => {
                    const remaining = Math.max(0, obj.required_quantity - obj.imported_quantity);
                    const isFulfilled = remaining === 0;
                    return (
                      <span
                        key={obj.resource_id}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-semibold border ${
                          isFulfilled
                            ? 'bg-[#CCFF00]/20 border-[#CCFF00]/40 text-black dark:text-[#CCFF00]'
                            : 'bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-white/10 text-neutral-800 dark:text-neutral-200'
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

        {/* Turn Limit Warning & Referee Override Banner */}
        {hasLimitConflict && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap text-xs text-amber-700 dark:text-amber-400 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
              <div>
                <strong className="font-bold uppercase tracking-wider">Round Quota Alert: </strong>
                {selectedExporterInfo && !selectedExporterInfo.canExport && (
                  <span>
                    <strong>{getCountryName(Number(exportCountryId))}</strong> has already exported this round.
                  </span>
                )}
                {selectedImporterInfo && !selectedImporterInfo.canImport && (
                  <span className="ml-1">
                    <strong>{getCountryName(Number(importCountryId))}</strong> has already imported this round.
                  </span>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 font-display font-bold cursor-pointer text-amber-800 dark:text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/40 hover:bg-amber-500/30 transition-all">
              <input
                type="checkbox"
                checked={overrideLimits}
                onChange={(e) => setOverrideLimits(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>Referee Override (Permit Deal)</span>
            </label>
          </div>
        )}

        {/* Commodity & Terms Row */}
        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 space-y-4">
          <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
            // Transaction Terms
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Primary Commodity */}
            <div>
              <label className="block text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1.5">
                Resource Transferred
              </label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
                required
              >
                <option value="" className="bg-white dark:bg-[#0A0A0A]">Choose Resource...</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id} className="bg-white dark:bg-[#0A0A0A]">
                    {r.name} (Base: ${r.base_value})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1.5">
                Quantity Units
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
                required
              />
            </div>

            {/* Money Mode: Price per unit */}
            {tradeType === 'money' ? (
              <div>
                <label className="block text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1.5">
                  Price per Unit ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
                  required
                />
              </div>
            ) : (
              /* Barter Mode: Payment Resource */
              <div>
                <label className="block text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1.5">
                  Barter Payment Resource
                </label>
                <select
                  value={paymentResourceId}
                  onChange={(e) => setPaymentResourceId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
                  required
                >
                  <option value="" className="bg-white dark:bg-[#0A0A0A]">Choose Payment Good...</option>
                  {resources
                    .filter((r) => r.id !== resourceId)
                    .map((r) => (
                      <option key={r.id} value={r.id} className="bg-white dark:bg-[#0A0A0A]">
                        {r.name} (Base: ${r.base_value})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Barter Mode Extra: Payment Quantity */}
          {tradeType === 'resource' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-neutral-200/60 dark:border-white/5">
              <div>
                <label className="block text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1.5">
                  Barter Payment Units (from Importer)
                </label>
                <input
                  type="number"
                  min="1"
                  value={paymentQuantity}
                  onChange={(e) => setPaymentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
                  required
                />
              </div>
            </div>
          )}

          {/* Summary Banner */}
          {exportCountryId && importCountryId && resourceId && (
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-4 flex-wrap text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-black dark:text-white">{getCountryName(Number(exportCountryId))}</span>
                <ArrowRight className="w-4 h-4 text-[#FF5533] dark:text-[#CCFF00]" />
                <span className="font-display font-bold text-black dark:text-white">{getCountryName(Number(importCountryId))}</span>
              </div>

              <div className="font-mono text-neutral-800 dark:text-neutral-200">
                {tradeType === 'money' ? (
                  <span>
                    Sending <strong className="text-black dark:text-white">{quantity.toLocaleString()}x {getResourceName(Number(resourceId))}</strong> for{' '}
                    <strong className="text-black dark:text-[#CCFF00]">${totalMoney.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>
                ) : (
                  <span>
                    Swapping <strong className="text-black dark:text-white">{quantity.toLocaleString()}x {getResourceName(Number(resourceId))}</strong> for{' '}
                    <strong className="text-black dark:text-[#FF5533]">{paymentQuantity.toLocaleString()}x {getResourceName(Number(paymentResourceId) || 0)}</strong>
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
            disabled={isSubmitting || !isExecutable || (hasLimitConflict && !overrideLimits)}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-display font-extrabold text-sm uppercase tracking-wider shadow-glow-lime transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-black" />
            )}
            <span>
              {hasLimitConflict && !overrideLimits
                ? 'Quota Limit Reached (Enable Override)'
                : 'Execute Trade Immediately'}
            </span>
          </button>
        </div>

        {!isExecutable && (
          <div className="p-3.5 rounded-2xl bg-[#FF5533]/15 border border-[#FF5533]/40 flex items-center gap-2 text-xs text-[#FF5533]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Direct trading requires both an active tournament session and an active trading round.
            </span>
          </div>
        )}
      </form>
    </div>
  );
};
