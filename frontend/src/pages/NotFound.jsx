import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
      <p className="font-display text-5xl text-ink">404</p>
      <p className="text-sm text-ink-soft">That page doesn't exist.</p>
      <Link to="/dashboard" className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700">
        Back to your projects
      </Link>
    </div>
  );
}
