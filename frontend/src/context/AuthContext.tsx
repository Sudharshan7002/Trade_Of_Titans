import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, LoginResponse } from '../types/api';
import { authApi } from '../api/auth';

export interface AuthUser {
  username: string;
  role: UserRole;
  countryId: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  countryId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('tot_token');
    localStorage.removeItem('tot_user');
    setToken(null);
    setUser(null);
  }, []);

  // Initialize auth state from localStorage on startup
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('tot_token');
      const storedUser = localStorage.getItem('tot_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      logout();
    } finally {
      setIsLoading(false);
    }

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('tot-auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('tot-auth-expired', handleAuthExpired);
    };
  }, [logout]);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password });
      
      const authUser: AuthUser = {
        username,
        role: response.role,
        countryId: response.country_id,
      };

      localStorage.setItem('tot_token', response.access_token);
      localStorage.setItem('tot_user', JSON.stringify(authUser));

      setToken(response.access_token);
      setUser(authUser);

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    role: user?.role ?? null,
    countryId: user?.countryId ?? null,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
