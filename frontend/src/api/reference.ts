import { apiClient } from './client';
import { Country, CountryCreateRequest, Resource, ResourceCreateRequest, InventoryItem, ImportObjective } from '../types/api';

export const referenceApi = {
  getCountries: async (): Promise<Country[]> => {
    const res = await apiClient.get<Country[]>('/countries/');
    return res.data;
  },

  getCountry: async (id: number): Promise<Country> => {
    const res = await apiClient.get<Country>(`/countries/${id}`);
    return res.data;
  },

  createCountry: async (data: CountryCreateRequest): Promise<Country> => {
    const res = await apiClient.post<Country>('/countries/', data);
    return res.data;
  },

  getResources: async (): Promise<Resource[]> => {
    const res = await apiClient.get<Resource[]>('/resources/');
    return res.data;
  },

  getResource: async (id: number): Promise<Resource> => {
    const res = await apiClient.get<Resource>(`/resources/${id}`);
    return res.data;
  },

  createResource: async (data: ResourceCreateRequest): Promise<Resource> => {
    const res = await apiClient.post<Resource>('/resources/', data);
    return res.data;
  },

  getAllInventories: async (): Promise<InventoryItem[]> => {
    const res = await apiClient.get<InventoryItem[]>('/inventory/');
    return res.data;
  },

  getCountryInventory: async (countryId: number): Promise<InventoryItem[]> => {
    const res = await apiClient.get<InventoryItem[]>(`/inventory/country/${countryId}`);
    return res.data;
  },

  createInventory: async (countryId: number, resourceId: number, quantity: number): Promise<InventoryItem> => {
    const res = await apiClient.post<InventoryItem>('/inventory/', {
      country_id: countryId,
      resource_id: resourceId,
      quantity,
    });
    return res.data;
  },

  getAllImportObjectives: async (): Promise<ImportObjective[]> => {
    const res = await apiClient.get<ImportObjective[]>('/import-objectives/');
    return res.data;
  },

  getCountryImportObjectives: async (countryId: number): Promise<ImportObjective[]> => {
    const res = await apiClient.get<ImportObjective[]>(`/import-objectives/country/${countryId}`);
    return res.data;
  },
};
