import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, registerUser } from '../api/auth';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { user, token } = await loginUser({ email, password });
        set({ user, token, isAuthenticated: true });
        connectSocket(token);
        return user;
      },

      register: async (name, email, password) => {
        const { user, token } = await registerUser({ name, email, password });
        set({ user, token, isAuthenticated: true });
        connectSocket(token);
        return user;
      },

      hydrateSocket: () => {
        const { token } = get();
        if (token) connectSocket(token);
      },

      logout: () => {
        disconnectSocket();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'pmt-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
