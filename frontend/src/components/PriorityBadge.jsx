const STYLES = {
  low: { label: 'Low', text: 'text-ink-soft', dot: 'bg-slate-400' },
  medium: { label: 'Medium', text: 'text-amber', dot: 'bg-amber' },
  high: { label: 'High', text: 'text-coral', dot: 'bg-coral' },
  urgent: { label: 'Urgent', text: 'text-crimson', dot: 'bg-crimson' },
};

export const PRIORITY_BAR = {
  low: '#94A3B8',
  medium: '#B45309',
  high: '#C2410C',
  urgent: '#B91C1C',
};

export default function PriorityBadge({ priority = 'medium' }) {
  const s = STYLES[priority] || STYLES.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
