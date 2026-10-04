import { useState } from 'react';
import { X } from 'lucide-react';
import Modal, { ModalHeader } from './Modal';
import Avatar from './Avatar';

export default function InviteMemberModal({ open, onClose, project, onAdd, onRemove, currentUserId }) {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onAdd(email.trim());
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add that person');
    } finally {
      setSaving(false);
    }
  };

  const myRole = project?.members.find((m) => m.user._id === currentUserId)?.role;
  const canManage = myRole === 'owner' || myRole === 'admin';

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Project members" onClose={onClose} />
      <div className="px-5 py-5">
        {canManage && (
          <form onSubmit={submit} className="mb-4 flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@email.com"
              type="email"
              className="flex-1 rounded-md border border-paper-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-500 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        )}
        {error && <p className="mb-3 text-sm text-crimson">{error}</p>}

        <div className="space-y-1">
          {project?.members.map((m) => (
            <div key={m.user._id} className="flex items-center justify-between rounded-md px-1.5 py-2">
              <div className="flex items-center gap-2.5">
                <Avatar user={m.user} size="sm" />
                <div>
                  <p className="text-sm text-ink">{m.user.name}</p>
                  <p className="text-xs capitalize text-ink-soft">{m.role}</p>
                </div>
              </div>
              {canManage && m.role !== 'owner' && (
                <button
                  onClick={() => onRemove(m.user._id)}
                  className="rounded p-1 text-ink-soft transition hover:bg-paper hover:text-crimson"
                  aria-label={`Remove ${m.user.name}`}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
