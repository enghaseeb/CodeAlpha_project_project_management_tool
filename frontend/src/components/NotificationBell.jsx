import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleClick = (n) => {
    if (!n.read) markRead(n._id);
    setOpen(false);
    if (n.project) navigate(`/projects/${n.project}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-ink-soft transition hover:bg-paper hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-card border border-paper-line bg-paper-card shadow-lift">
          <div className="flex items-center justify-between border-b border-paper-line px-4 py-3">
            <p className="font-display text-base text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-soft">You're all caught up.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full flex-col gap-0.5 border-b border-paper-line px-4 py-3 text-left text-sm transition last:border-0 hover:bg-paper ${
                    !n.read ? 'bg-brand-50/60' : ''
                  }`}
                >
                  <span className="text-ink">{n.message}</span>
                  <span className="text-xs text-ink-soft">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
