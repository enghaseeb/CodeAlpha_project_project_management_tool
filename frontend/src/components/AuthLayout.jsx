import { LayoutGrid } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-10 lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500">
            <LayoutGrid size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg text-white">Lanes</span>
        </div>

        <div className="max-w-sm">
          <h1 className="font-display text-4xl leading-[1.15] text-white">
            Work, laid out in the open.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            Boards your team can see moving in real time — tasks, comments and
            updates land the moment they happen.
          </p>
        </div>

        <div className="flex gap-2.5">
          {['To Do', 'In Progress', 'Done'].map((label, i) => (
            <div key={label} className="w-24 rounded-md border border-white/10 bg-white/[0.04] p-2.5">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-white/40">{label}</p>
              {Array.from({ length: 3 - i }).map((_, j) => (
                <div key={j} className="mb-1.5 h-2.5 w-full rounded-sm bg-white/10 last:mb-0" />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
