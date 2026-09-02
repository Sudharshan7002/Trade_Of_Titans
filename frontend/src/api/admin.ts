import { apiClient } from './client';
import { AdminDashboardData } from '../types/api';

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardData> => {
    const res = await apiClient.get<AdminDashboardData>('/admin-dashboard/');
    return res.data;
  },

  createObjective: async (countryId: number, resourceId: number, requiredQuantity: number) => {
    const res = await apiClient.post(
      `/objectives/?country_id=${countryId}&resource_id=${resourceId}&required_quantity=${requiredQuantity}`
    );
    return res.data;
  },

  getAllObjectives: async () => {
    const res = await apiClient.get('/objectives/');
    return res.data;
  },

  resetTournament: async () => {
    const res = await apiClient.post('/admin-dashboard/reset-tournament');
    return res.data;
  },
};
