import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/Common';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { getSocket } from './lib/socket';

export default function App() {
  const { isAuthenticated, hydrateSocket } = useAuthStore();
  const receiveNotification = useNotificationStore((s) => s.receive);

  // Reconnect the socket on a fresh page load using the persisted token.
  useEffect(() => {
    if (isAuthenticated) hydrateSocket();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live-append notifications (assignments, comments, invites) as they arrive,
  // regardless of which page is currently open.
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    if (!socket) return;
    const onNotification = (n) => receiveNotification(n);
    socket.on('notification:new', onNotification);
    return () => socket.off('notification:new', onNotification);
  }, [isAuthenticated, receiveNotification]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13.5px',
            borderRadius: '10px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectBoard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
