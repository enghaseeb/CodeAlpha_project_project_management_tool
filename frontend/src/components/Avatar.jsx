const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const SIZES = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export default function Avatar({ user, size = 'sm', ring = false }) {
  if (!user) return null;
  return (
    <div
      title={user.name}
      className={`${SIZES[size]} ${ring ? 'ring-2 ring-paper-card' : ''} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: user.avatarColor || '#0D7A6E' }}
    >
      {initials(user.name)}
    </div>
  );
}

export function AvatarStack({ users = [], max = 4, size = 'sm' }) {
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u) => (
        <Avatar key={u._id || u.id} user={u} size={size} ring />
      ))}
      {overflow > 0 && (
        <div
          className={`${SIZES[size]} flex items-center justify-center rounded-full bg-ink-soft font-semibold text-white ring-2 ring-paper-card`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
