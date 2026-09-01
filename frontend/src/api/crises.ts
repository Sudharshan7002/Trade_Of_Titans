import { apiClient } from './client';
import { Crisis, CrisisCreateRequest } from '../types/api';

export const crisesApi = {
  getCrises: async (): Promise<Crisis[]> => {
    const res = await apiClient.get<Crisis[]>('/crises/');
    return res.data;
  },

  getRoundCrises: async (roundId: number): Promise<Crisis[]> => {
    const res = await apiClient.get<Crisis[]>(`/crises/round/${roundId}`);
    return res.data;
  },

  createCrisis: async (data: CrisisCreateRequest): Promise<Crisis> => {
    const res = await apiClient.post<Crisis>('/crises/', data);
    return res.data;
  },
};
