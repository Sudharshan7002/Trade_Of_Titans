import { apiClient } from './client';
import { Trade, TradeCreateRequest } from '../types/api';

export const tradesApi = {
  createTrade: async (data: TradeCreateRequest): Promise<Trade> => {
    const res = await apiClient.post<Trade>('/trades/', data);
    return res.data;
  },

  getAllTrades: async (): Promise<Trade[]> => {
    const res = await apiClient.get<Trade[]>('/trades/');
    return res.data;
  },

  getRoundTrades: async (roundId: number): Promise<Trade[]> => {
    const res = await apiClient.get<Trade[]>(`/trades/round/${roundId}`);
    return res.data;
  },

  getCountryTrades: async (countryId: number): Promise<Trade[]> => {
    const res = await apiClient.get<Trade[]>(`/trades/country/${countryId}`);
    return res.data;
  },
};
