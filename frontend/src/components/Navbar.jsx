import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-paper-line bg-paper/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-5">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500">
            <LayoutGrid size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg tracking-tight text-ink">Lanes</span>
        </Link>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <div className="relative" ref={ref}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="ml-1 flex items-center gap-2 rounded-md p-1 pr-2 transition hover:bg-paper-card"
            >
              <Avatar user={user} size="sm" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-40 mt-2 w-48 rounded-card border border-paper-line bg-paper-card py-1 shadow-lift">
                <div className="border-b border-paper-line px-3 py-2">
                  <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
                  <p className="truncate text-xs text-ink-soft">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-paper hover:text-crimson"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
