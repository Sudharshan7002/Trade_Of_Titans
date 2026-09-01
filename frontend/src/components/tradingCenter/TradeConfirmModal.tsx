import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { tradingCenterApi } from '../../api/tradingCenter';
import { Trade } from '../../types/api';
import { 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Package, 
  Building2, 
  AlertTriangle 
} from 'lucide-react';

interface TradeConfirmModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  isExecutable: boolean;
}

export const TradeConfirmModal: React.FC<TradeConfirmModalProps> = ({
  trade,
  isOpen,
  onClose,
  onConfirmed,
  isExecutable,
}) => {
  const { getCountryName, getResourceName } = useGameState();
  const { success, error: toastError } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!trade) return null;

  const importerName = trade.import_country_name || getCountryName(trade.import_country_id);
  const exporterName = trade.export_country_name || getCountryName(trade.export_country_id);
  const resourceName = trade.resource_name || getResourceName(trade.resource_id);
  const paymentResourceName = trade.payment_resource_name || getResourceName(trade.payment_resource_id || undefined);
  const totalMoney = Number(trade.price) * trade.quantity;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const res = await tradingCenterApi.confirmTrade(trade.id);
      success('Trade Executed Successfully', `Trade #${res.trade_id} settled and registered.`);
      onConfirmed();
      onClose();
    } catch (err: any) {
      toastError('Execution Failed', err.message || 'Could not confirm trade.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Authorize Trade Execution #${trade.id}`}
      subtitle="Trading Center Protocol Verification & Settlement"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Country Transfer Flow Card */}
        <div className="p-4 rounded-2xl bg-titan-950/80 border border-white/10 flex items-center justify-between gap-3">
          {/* Exporter */}
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Source (Exporter)
            </span>
            <div className="font-display font-bold text-base text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{exporterName}</span>
            </div>
          </div>

          <div className="p-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Importer */}
          <div className="flex-1 text-center sm:text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Destination (Importer)
            </span>
            <div className="font-display font-bold text-base text-cyan-400 flex items-center gap-1.5 justify-center sm:justify-end mt-0.5">
              <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{importerName}</span>
            </div>
          </div>
        </div>

        {/* Cargo Details */}
        <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Commodity Transfer
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">{resourceName}</span>
            </div>
            <span className="font-mono font-bold text-cyan-300 text-base">
              {trade.quantity} units
            </span>
          </div>

          {/* Settlement Details */}
          <div className="pt-3 border-t border-white/5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Settlement Consideration
            </div>
            {trade.trade_type === 'money' ? (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-amber-300">
                  <DollarSign className="w-4 h-4" />
                  <span>Cash Payment (${Number(trade.price).toFixed(2)}/unit)</span>
                </div>
                <span className="font-mono font-black text-amber-300 text-lg">
                  ${totalMoney.toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-purple-300">
                  <Package className="w-4 h-4" />
                  <span>Barter Payment ({paymentResourceName})</span>
                </div>
                <span className="font-mono font-black text-purple-300 text-lg">
                  {trade.payment_quantity} units
                </span>
              </div>
            )}
          </div>
        </div>

        {!isExecutable && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Trade execution is disabled because the active round or game is currently inactive.
            </span>
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
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming || !isExecutable}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-titan-950 font-black text-sm tracking-wide shadow-glow-emerald transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? (
              <div className="w-4 h-4 border-2 border-titan-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-titan-950" />
            )}
            <span>CONFIRM & EXECUTE TRADE</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
