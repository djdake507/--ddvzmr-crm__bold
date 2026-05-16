import { create } from 'zustand';
import axios from 'axios';

interface AuthState {
  userId: string | null;
  tenantId: string | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (tenantId: string, email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: localStorage.getItem('userId') || null,
  tenantId: localStorage.getItem('tenantId') || null,
  role: localStorage.getItem('role') || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { userId, role, tenantId, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('userId', userId);
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('role', role);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        userId,
        tenantId,
        role,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  },

  register: async (tenantId: string, email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        tenantId,
        email,
        password,
        firstName,
        lastName,
      });

      const { userId, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('userId', userId);
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        userId,
        tenantId,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('role');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      userId: null,
      tenantId: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },
}));
