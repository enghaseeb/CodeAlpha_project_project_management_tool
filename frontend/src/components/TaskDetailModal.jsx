import { useEffect, useRef, useState } from 'react';
import { Trash2, Calendar, Tag, X, Send } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Modal, { ModalHeader } from './Modal';
import Avatar from './Avatar';
import { getComments, addComment as addCommentApi } from '../api/comments';
import { useAuthStore } from '../store/authStore';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function useAutoResize(value) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);
  return ref;
}

export default function TaskDetailModal({ task, project, open, onClose, onUpdate, onDelete }) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labelDraft, setLabelDraft] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const descRef = useAutoResize(description);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task?._id]);

  useEffect(() => {
    if (!task || !open) return;
    setLoadingComments(true);
    getComments(task._id)
      .then(setComments)
      .finally(() => setLoadingComments(false));
  }, [task?._id, open]);

  if (!task) return null;

  const members = project?.members.map((m) => m.user) || [];
  const isAssigned = (id) => task.assignees.some((a) => a._id === id);

  const toggleAssignee = (memberId) => {
    const next = isAssigned(memberId)
      ? task.assignees.filter((a) => a._id !== memberId).map((a) => a._id)
      : [...task.assignees.map((a) => a._id), memberId];
    onUpdate(task._id, { assignees: next });
  };

  const addLabel = (e) => {
    e.preventDefault();
    if (!labelDraft.trim()) return;
    onUpdate(task._id, { labels: [...task.labels, labelDraft.trim()] });
    setLabelDraft('');
  };

  const removeLabel = (label) => {
    onUpdate(task._id, { labels: task.labels.filter((l) => l !== label) });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText('');
    const comment = await addCommentApi(task._id, text);
    setComments((c) => [...c, comment]);
  };

  return (
    <Modal open={open} onClose={onClose} width="max-w-3xl">
      <ModalHeader title="Task" onClose={onClose} />
      <div className="grid max-h-[75vh] grid-cols-1 gap-0 overflow-y-auto scrollbar-thin sm:grid-cols-[1fr_240px]">
        {/* Main column */}
        <div className="border-paper-line px-5 py-5 sm:border-r">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== task.title && onUpdate(task._id, { title: title.trim() })}
            rows={1}
            className="w-full resize-none overflow-hidden border-none bg-transparent font-display text-xl leading-snug text-ink outline-none"
          />

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">Description</p>
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => onUpdate(task._id, { description })}
              placeholder="Add more detail…"
              rows={2}
              className="w-full resize-none rounded-md border border-paper-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400"
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
              Comments {comments.length > 0 && `(${comments.length})`}
            </p>
            <div className="space-y-3">
              {loadingComments && <p className="text-sm text-ink-soft">Loading…</p>}
              {comments.map((c) => (
                <div key={c._id} className="flex gap-2.5">
                  <Avatar user={c.author} size="sm" />
                  <div className="flex-1 rounded-card bg-paper px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-ink">{c.author.name}</span>
                      <span className="text-[11px] text-ink-soft">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} className="mt-3 flex items-start gap-2.5">
              <Avatar user={user} size="sm" />
              <div className="flex flex-1 items-center gap-2 rounded-card border border-paper-line bg-paper px-3 py-1.5 focus-within:border-brand-400">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 bg-transparent py-1 text-sm text-ink outline-none placeholder:text-ink-soft/60"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="text-brand-600 disabled:text-ink-soft/40"
                  aria-label="Send comment"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 px-5 py-5">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">Assignees</p>
            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => (
                <button
                  key={m._id}
                  onClick={() => toggleAssignee(m._id)}
                  title={m.name}
                  className={`rounded-full transition ${
                    isAssigned(m._id) ? 'ring-2 ring-brand-400' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Avatar user={m} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">Priority</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdate(task._id, { priority: p })}
                  className={`rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition ${
                    task.priority === p
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-paper-line text-ink-soft hover:border-brand-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
              <Calendar size={12} /> Due date
            </p>
            <input
              type="date"
              value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
              onChange={(e) => onUpdate(task._id, { dueDate: e.target.value || null })}
              className="w-full rounded-md border border-paper-line bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-brand-400"
            />
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
              <Tag size={12} /> Labels
            </p>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {task.labels.map((l) => (
                <span
                  key={l}
                  className="flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700"
                >
                  {l}
                  <button onClick={() => removeLabel(l)} aria-label={`Remove ${l}`}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={addLabel}>
              <input
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                placeholder="Add a label…"
                className="w-full rounded-md border border-paper-line bg-paper px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-soft/60 focus:border-brand-400"
              />
            </form>
          </div>

          <div className="border-t border-paper-line pt-4">
            <p className="mb-2 text-[11px] text-ink-soft">
              Created by {task.createdBy?.name} · {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </p>
            <button
              onClick={() => onDelete(task._id)}
              className="flex items-center gap-1.5 text-xs font-medium text-ink-soft transition hover:text-crimson"
            >
              <Trash2 size={13} />
              Delete task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
