import { apiClient } from './client';
import { Round, Trade, TradingCenterDashboardData, DirectTradeCreate } from '../types/api';

export const tradingCenterApi = {
  getActiveRound: async (): Promise<Round | { detail: string }> => {
    const res = await apiClient.get<Round | { detail: string }>('/trading-center/round');
    return res.data;
  },

  getAllTrades: async (): Promise<Trade[]> => {
    const res = await apiClient.get<Trade[]>('/trading-center/trades');
    return res.data;
  },

  getDashboard: async (): Promise<TradingCenterDashboardData> => {
    const res = await apiClient.get<TradingCenterDashboardData>('/trading-center/dashboard');
    return res.data;
  },

  confirmTrade: async (tradeId: number): Promise<{ message: string; trade_id: number; status: string }> => {
    const res = await apiClient.post<{ message: string; trade_id: number; status: string }>(
      `/trade-confirmation/${tradeId}`
    );
    return res.data;
  },

  executeDirectTrade: async (data: DirectTradeCreate): Promise<{ message: string; trade_id: number; status: string }> => {
    const res = await apiClient.post<{ message: string; trade_id: number; status: string }>(
      '/trading-center/execute-trade',
      data
    );
    return res.data;
  },
};

