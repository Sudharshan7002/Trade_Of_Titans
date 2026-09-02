import { apiClient } from './client';
import { Country, CountryDashboardData, InventoryItem, ImportObjective, Trade } from '../types/api';

export const countryApi = {
  getMe: async (): Promise<Country> => {
    const res = await apiClient.get<Country>('/country/me');
    return res.data;
  },

  getInventory: async (): Promise<InventoryItem[]> => {
    const res = await apiClient.get<InventoryItem[]>('/country/inventory');
    return res.data;
  },

  getObjectives: async (): Promise<ImportObjective[]> => {
    const res = await apiClient.get<ImportObjective[]>('/country/objectives');
    return res.data;
  },

  getTrades: async (): Promise<Trade[]> => {
    const res = await apiClient.get<Trade[]>('/country/trades');
    return res.data;
  },

  getDashboard: async (): Promise<CountryDashboardData> => {
    const res = await apiClient.get<CountryDashboardData>('/country/dashboard');
    return res.data;
  },

  activateShield: async (): Promise<{ success: boolean; message: string; remaining_money: number }> => {
    const res = await apiClient.post('/country/covert-ops/shield');
    return res.data;
  },

  launchSabotage: async (target_country_id: number, resource_id: number): Promise<{ success: boolean; was_blocked: boolean; quantity_destroyed: number; message: string; remaining_money: number }> => {
    const res = await apiClient.post('/country/covert-ops/sabotage', {
      target_country_id,
      resource_id,
    });
    return res.data;
  },
};
