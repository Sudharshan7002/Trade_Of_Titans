import { apiClient } from './client';
import { GameStatus, FinalRanking, LiveRanking } from '../types/api';

export const gameApi = {
  getStatus: async (): Promise<GameStatus> => {
    const res = await apiClient.get<GameStatus>('/game/status');
    return res.data;
  },

  startGame: async (): Promise<GameStatus> => {
    const res = await apiClient.post<GameStatus>('/game/start');
    return res.data;
  },

  resetGame: async (): Promise<GameStatus> => {
    const res = await apiClient.post<GameStatus>('/game/reset');
    return res.data;
  },

  endGame: async (): Promise<{ message: string; winner: LiveRanking | null; rankings: FinalRanking[] }> => {
    const res = await apiClient.post<{ message: string; winner: LiveRanking | null; rankings: FinalRanking[] }>('/game/end');
    return res.data;
  },
};
