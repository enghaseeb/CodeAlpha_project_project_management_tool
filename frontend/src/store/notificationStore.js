import { create } from 'zustand';
import toast from 'react-hot-toast';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async () => {
    const { notifications, unreadCount } = await getNotifications();
    set({ notifications, unreadCount });
  },

  receive: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
    toast(notification.message, { icon: '🔔' });
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, get().notifications.find((n) => n._id === id && !n.read) ? state.unreadCount - 1 : state.unreadCount),
    }));
    await markAsRead(id);
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    await markAllAsRead();
  },
}));
