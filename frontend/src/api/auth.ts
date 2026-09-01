import { apiClient } from './client';
import { LoginRequest, LoginResponse, UserCreateRequest, UserResponse } from '../types/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  createUser: async (data: UserCreateRequest): Promise<UserResponse> => {
    const res = await apiClient.post<UserResponse>('/users/', data);
    return res.data;
  },
};
