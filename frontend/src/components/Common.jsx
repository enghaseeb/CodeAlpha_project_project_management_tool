import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function LoadingSpinner({ size = 20 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-paper-line border-t-brand-500"
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-paper-line px-6 py-14 text-center">
      {Icon && <Icon size={28} className="text-ink-soft/60" strokeWidth={1.5} />}
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
