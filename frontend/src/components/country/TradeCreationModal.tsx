import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { tradesApi } from '../../api/trades';
import { TradeType, TradeCreateRequest } from '../../types/api';
import { 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  Package, 
  AlertCircle
} from 'lucide-react';

interface TradeCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  myCountryId: number;
  activeRoundId: number;
  hasUsedImport: boolean;
  hasUsedExport: boolean;
  inventory: Array<{ resource_id: number; quantity: number }>;
  initialDirection?: 'import' | 'export';
  initialResourceId?: number;
  onTradeCreated: () => void;
}

export const TradeCreationModal: React.FC<TradeCreationModalProps> = ({
  isOpen,
  onClose,
  myCountryId,
  activeRoundId,
  hasUsedImport,
  hasUsedExport,
  inventory,
  initialDirection = 'import',
  initialResourceId,
  onTradeCreated,
}) => {
  const { countries, resources, getResourceName, getResourceBaseValue, getCountryName } = useGameState();
  const { success, error: toastError } = useToast();

  const [direction, setDirection] = useState<'import' | 'export'>(initialDirection);
  const [partnerCountryId, setPartnerCountryId] = useState<number | ''>('');
  const [resourceId, setResourceId] = useState<number | ''>(initialResourceId || '');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [tradeType, setTradeType] = useState<TradeType>('money');
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>('');
  const [paymentResourceId, setPaymentResourceId] = useState<number | ''>('');
  const [paymentQuantity, setPaymentQuantity] = useState<number | ''>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultDir = initialDirection === 'export' && !hasUsedExport ? 'export' : !hasUsedImport ? 'import' : 'export';
      setDirection(defaultDir);
      if (initialResourceId) {
        setResourceId(initialResourceId);
        const baseVal = getResourceBaseValue(initialResourceId);
        setPricePerUnit(baseVal || 10);
      }
    }
  }, [isOpen, initialDirection, initialResourceId, hasUsedImport, hasUsedExport]);

  // When resource changes, suggest default price if empty
  const handleResourceChange = (resId: number) => {
    setResourceId(resId);
    if (pricePerUnit === '' || pricePerUnit === 0) {
      const baseVal = getResourceBaseValue(resId);
      setPricePerUnit(baseVal || 10);
    }
  };

  const otherCountries = countries.filter((c) => c.id !== myCountryId);

  // Inventory lookup for country's owned resources
  const myInventoryMap = React.useMemo(() => {
    const map: Record<number, number> = {};
    inventory.forEach((i) => {
      map[i.resource_id] = i.quantity;
    });
    return map;
  }, [inventory]);

  // Determine slot validity
  const isSlotBlocked = direction === 'import' ? hasUsedImport : hasUsedExport;

  // Selected resource owned quantity (relevant if exporting)
  const myStockForSelectedResource = resourceId ? (myInventoryMap[resourceId] || 0) : 0;
  const myStockForPaymentResource = paymentResourceId ? (myInventoryMap[paymentResourceId] || 0) : 0;

  const totalMoneyValue = Number(quantity || 0) * Number(pricePerUnit || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSlotBlocked) {
      toastError(
        `Slot Quota Exceeded`,
        `Your country has already used its ${direction} slot for this round.`
      );
      return;
    }

    if (!partnerCountryId) {
      toastError('Partner Country Required', 'Please select a sovereign partner country.');
      return;
    }

    if (!resourceId) {
      toastError('Resource Required', 'Please select the primary resource to trade.');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toastError('Invalid Quantity', 'Quantity must be greater than zero.');
      return;
    }

    if (direction === 'export' && Number(quantity) > myStockForSelectedResource) {
      toastError(
        'Insufficient Inventory',
        `You only have ${myStockForSelectedResource} units available to export.`
      );
      return;
    }

    if (tradeType === 'money' && (pricePerUnit === '' || Number(pricePerUnit) < 0)) {
      toastError('Invalid Price', 'Price per unit must be a non-negative number.');
      return;
    }

    if (tradeType === 'resource') {
      if (!paymentResourceId) {
        toastError('Payment Resource Required', 'Please select the payment barter resource.');
        return;
      }
      if (paymentResourceId === resourceId) {
        toastError('Invalid Barter', 'Payment resource must be different from traded resource.');
        return;
      }
      if (!paymentQuantity || Number(paymentQuantity) <= 0) {
        toastError('Invalid Payment Quantity', 'Payment quantity must be greater than zero.');
        return;
      }
      if (direction === 'import' && Number(paymentQuantity) > myStockForPaymentResource) {
        toastError(
          'Insufficient Payment Inventory',
          `You only have ${myStockForPaymentResource} units of payment resource available.`
        );
        return;
      }
    }

    const payload: TradeCreateRequest = {
      round_id: activeRoundId,
      import_country_id: direction === 'import' ? myCountryId : Number(partnerCountryId),
      export_country_id: direction === 'export' ? myCountryId : Number(partnerCountryId),
      resource_id: Number(resourceId),
      quantity: Number(quantity),
      price: tradeType === 'money' ? Number(pricePerUnit) : 0,
      trade_type: tradeType,
      payment_resource_id: tradeType === 'resource' ? Number(paymentResourceId) : null,
      payment_quantity: tradeType === 'resource' ? Number(paymentQuantity) : null,
    };

    setIsSubmitting(true);
    try {
      const created = await tradesApi.createTrade(payload);
      success('Trade Proposal Dispatched', `Trade #${created.id} submitted for Trading Center verification.`);
      onTradeCreated();
      onClose();
    } catch (err: any) {
      toastError('Failed to Submit Trade', err.message || 'An error occurred while creating trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Draft Strategic Trade Order"
      subtitle={`Round #${activeRoundId} International Marketplace Protocol`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Trade Direction Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Trade Vector
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('import')}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-bold transition-all ${
                direction === 'import'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-glow-cyan/20'
                  : 'bg-titan-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>I Want to IMPORT</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection('export')}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-bold transition-all ${
                direction === 'export'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-glow-emerald/20'
                  : 'bg-titan-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>I Want to EXPORT</span>
            </button>
          </div>

          {isSlotBlocked && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Attention: You have already utilized your 1 {direction} quota for Round #{activeRoundId}.
              </span>
            </div>
          )}
        </div>

        {/* Partner Country Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {direction === 'import' ? 'Source / Exporter Sovereign State' : 'Destination / Importer Sovereign State'}
          </label>
          <select
            value={partnerCountryId}
            onChange={(e) => setPartnerCountryId(e.target.value ? Number(e.target.value) : '')}
            className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm"
            required
          >
            <option value="" disabled className="bg-titan-900 text-slate-500">
              -- Select Partner Sovereign State --
            </option>
            {otherCountries.map((c) => (
              <option key={c.id} value={c.id} className="bg-titan-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Selection & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Resource
            </label>
            <select
              value={resourceId}
              onChange={(e) => handleResourceChange(Number(e.target.value))}
              className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm"
              required
            >
              <option value="" disabled className="bg-titan-900 text-slate-500">
                -- Select Resource --
              </option>
              {resources.map((r) => {
                const stock = myInventoryMap[r.id] || 0;
                return (
                  <option key={r.id} value={r.id} className="bg-titan-900 text-white">
                    {r.name} (Base: ${r.base_value}) {direction === 'export' ? `[Stock: ${stock}]` : ''}
                  </option>
                );
              })}
            </select>
            {direction === 'export' && resourceId !== '' && (
              <p className="text-[11px] text-slate-400 mt-1">
                Your Available Stock:{' '}
                <span className="font-bold text-cyan-300">{myStockForSelectedResource} units</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Transfer Quantity
            </label>
            <input
              type="number"
              min="1"
              max={direction === 'export' ? myStockForSelectedResource : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Math.max(1, parseInt(e.target.value)) : '')}
              placeholder="e.g. 10"
              className="w-full glass-input text-white rounded-xl px-4 py-2.5 text-sm font-mono"
              required
            />
          </div>
        </div>

        {/* Settlement Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Settlement Mechanism
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTradeType('money')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                tradeType === 'money'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-glow-gold/10'
                  : 'bg-titan-950/60 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Fiat Currency (Money)</span>
            </button>
            <button
              type="button"
              onClick={() => setTradeType('resource')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                tradeType === 'resource'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-glow-violet/10'
                  : 'bg-titan-950/60 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Resource Barter</span>
            </button>
          </div>
        </div>

        {/* Dynamic Settlement Fields */}
        {tradeType === 'money' ? (
          <div className="p-4 rounded-xl bg-titan-950/60 border border-white/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Unit Price ($ per unit)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full glass-input text-white rounded-xl pl-8 pr-4 py-2 text-sm font-mono"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-1">Estimated Total Settle Value</div>
                <div className="font-display font-black text-xl text-amber-300 font-mono">
                  ${totalMoneyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              {direction === 'import'
                ? `You will pay $${totalMoneyValue.toFixed(2)} to ${
                    partnerCountryId ? getCountryName(Number(partnerCountryId)) : 'the exporter'
                  }.`
                : `You will receive $${totalMoneyValue.toFixed(2)} from ${
                    partnerCountryId ? getCountryName(Number(partnerCountryId)) : 'the importer'
                  }.`}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-titan-950/60 border border-white/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Payment Barter Resource
                </label>
                <select
                  value={paymentResourceId}
                  onChange={(e) => setPaymentResourceId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full glass-input text-white rounded-xl px-4 py-2 text-sm"
                  required
                >
                  <option value="" disabled className="bg-titan-900 text-slate-500">
                    -- Select Payment Resource --
                  </option>
                  {resources
                    .filter((r) => r.id !== resourceId)
                    .map((r) => (
                      <option key={r.id} value={r.id} className="bg-titan-900 text-white">
                        {r.name} {direction === 'import' ? `[Your Stock: ${myInventoryMap[r.id] || 0}]` : ''}
                      </option>
                    ))}
                </select>
                {direction === 'import' && paymentResourceId !== '' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your Payment Stock:{' '}
                    <span className="font-bold text-cyan-300">{myStockForPaymentResource} units</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Payment Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={direction === 'import' ? myStockForPaymentResource : undefined}
                  value={paymentQuantity}
                  onChange={(e) => setPaymentQuantity(e.target.value ? Math.max(1, parseInt(e.target.value)) : '')}
                  className="w-full glass-input text-white rounded-xl px-4 py-2 text-sm font-mono"
                  placeholder="e.g. 5"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Barter exchange: {quantity || 0} units of{' '}
              <span className="text-white font-semibold">{getResourceName(Number(resourceId))}</span> for{' '}
              {paymentQuantity || 0} units of{' '}
              <span className="text-white font-semibold">
                {getResourceName(Number(paymentResourceId))}
              </span>
              .
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isSlotBlocked}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-titan-950 font-black text-sm tracking-wide shadow-glow-cyan transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-titan-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowLeftRight className="w-4 h-4 text-titan-950" />
            )}
            <span>Transmit Order to Trading Center</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
