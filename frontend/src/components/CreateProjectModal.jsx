import { useState } from 'react';
import Modal, { ModalHeader } from './Modal';

const COLORS = ['#0D7A6E', '#B45309', '#C2410C', '#B91C1C', '#6D28D9', '#0369A1', '#15803D', '#A21CAF'];

export default function CreateProjectModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    setName('');
    setDescription('');
    setColor(COLORS[0]);
    setError('');
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onCreate({ name, description, color });
      close();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={close}>
      <ModalHeader title="New project" onClose={close} />
      <form onSubmit={submit} className="space-y-4 px-5 py-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website redesign"
            className="w-full rounded-md border border-paper-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is this project about?"
            className="w-full resize-none rounded-md border border-paper-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full transition"
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px #F6F7F5, 0 0 0 4px ${c}` : 'none' }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-crimson">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={close}
            className="rounded-md px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-paper"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-md bg-brand-500 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
