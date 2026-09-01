import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { tradingCenterApi } from '../../api/tradingCenter';
import { Modal } from '../ui/Modal';
import { Trade } from '../../types/api';
import { 
  Building2, 
  ArrowRight, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface TradeConfirmModalProps {
  trade: Trade;
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

  const exporterName = trade.export_country_name || getCountryName(trade.export_country_id);
  const importerName = trade.import_country_name || getCountryName(trade.import_country_id);
  const resourceName = trade.resource_name || getResourceName(trade.resource_id);
  const paymentResourceName =
    trade.payment_resource_name || getResourceName(trade.payment_resource_id || undefined);
  const totalMoney = Number(trade.price) * trade.quantity;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await tradingCenterApi.confirmTrade(trade.id);
      success(
        'Trade Executed & Settled',
        `Trade #${trade.id} has been formally confirmed and debited across treasuries and stockpiles.`
      );
      onConfirmed();
      onClose();
    } catch (err: any) {
      toastError('Trade Confirmation Failed', err.message);
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
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 flex items-center justify-between gap-3 shadow-sm">
          {/* Exporter */}
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Source (Exporter)
            </span>
            <div className="font-display font-bold text-base text-black dark:text-[#CCFF00] flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{exporterName}</span>
            </div>
          </div>

          <div className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
            <ArrowRight className="w-5 h-5 text-[#FF5533]" />
          </div>

          {/* Importer */}
          <div className="flex-1 text-center sm:text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Destination (Importer)
            </span>
            <div className="font-display font-bold text-base text-[#FF5533] flex items-center gap-1.5 justify-center sm:justify-end mt-0.5">
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{importerName}</span>
            </div>
          </div>
        </div>

        {/* Cargo Details */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 space-y-3 shadow-sm">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
            Commodity Transfer
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-500" />
              <span className="font-display font-bold text-black dark:text-white">{resourceName}</span>
            </div>
            <span className="font-mono font-bold text-black dark:text-[#CCFF00] text-base">
              {trade.quantity.toLocaleString()} units
            </span>
          </div>

          {/* Settlement Details */}
          <div className="pt-3 border-t border-neutral-200 dark:border-white/5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Settlement Consideration
            </div>
            {trade.trade_type === 'money' ? (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <DollarSign className="w-4 h-4" />
                  <span>Cash Payment (${Number(trade.price).toFixed(2)}/unit)</span>
                </div>
                <span className="font-mono font-black text-black dark:text-[#CCFF00] text-lg">
                  ${totalMoney.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[#FF5533]">
                  <Package className="w-4 h-4" />
                  <span>Barter Payment ({paymentResourceName})</span>
                </div>
                <span className="font-mono font-black text-[#FF5533] text-lg">
                  {trade.payment_quantity?.toLocaleString()} units
                </span>
              </div>
            )}
          </div>
        </div>

        {!isExecutable && (
          <div className="p-3.5 rounded-2xl bg-[#FF5533]/15 border border-[#FF5533]/40 flex items-center gap-3 text-xs text-[#FF5533]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Trade execution is disabled because the active round or game is currently inactive.
            </span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-display font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming || !isExecutable}
            className="px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-black" />
            )}
            <span>Confirm & Execute Trade</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
