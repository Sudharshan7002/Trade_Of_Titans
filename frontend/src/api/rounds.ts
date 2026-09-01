import { apiClient } from './client';
import { Round } from '../types/api';

export const roundsApi = {
  getRounds: async (): Promise<Round[]> => {
    const res = await apiClient.get<Round[]>('/rounds/');
    return res.data;
  },

  createRound: async (roundNumber: number): Promise<Round> => {
    const res = await apiClient.post<Round>(`/rounds/?round_number=${roundNumber}`);
    return res.data;
  },

  startRound: async (roundId: number): Promise<Round> => {
    const res = await apiClient.post<Round>(`/rounds/${roundId}/start`);
    return res.data;
  },

  endRound: async (roundId: number): Promise<Round> => {
    const res = await apiClient.post<Round>(`/rounds/${roundId}/end`);
    return res.data;
  },
};
