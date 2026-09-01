import { apiClient } from './client';
import { LiveRanking, FinalRanking } from '../types/api';

export const rankingsApi = {
  getLiveRankings: async (): Promise<{ rankings: LiveRanking[] }> => {
    const res = await apiClient.get<{ rankings: LiveRanking[] }>('/rankings/');
    return res.data;
  },

  getFinalRankings: async (): Promise<FinalRanking[]> => {
    const res = await apiClient.get<FinalRanking[]>('/rankings/final');
    return res.data;
  },
};
