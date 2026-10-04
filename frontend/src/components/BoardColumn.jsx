import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';

export default function BoardColumn({ list, tasks, onOpenTask, onAddTask, onRenameList, onDeleteList }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);

  const submitAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setAdding(false);
      return;
    }
    onAddTask(list._id, title.trim());
    setTitle('');
  };

  const submitRename = () => {
    setEditingName(false);
    if (nameDraft.trim() && nameDraft.trim() !== list.name) onRenameList(list._id, nameDraft.trim());
    else setNameDraft(list.name);
  };

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <div className="mb-2.5 flex items-center justify-between px-1">
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            className="w-full rounded border border-brand-300 bg-paper-card px-1.5 py-0.5 text-[13px] font-semibold text-ink"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-ink-soft"
          >
            {list.name}
            <span className="rounded-full bg-paper-line px-1.5 py-0.5 text-[11px] font-medium normal-case text-ink-soft">
              {tasks.length}
            </span>
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded p-1 text-ink-soft/70 transition hover:bg-paper-card hover:text-ink"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-paper-line bg-paper-card py-1 shadow-lift">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteList(list._id);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-ink-soft hover:bg-paper hover:text-crimson"
              >
                <Trash2 size={13} />
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[8px] flex-1 overflow-y-auto rounded-card px-0.5 pb-1 scrollbar-thin transition-colors ${
              snapshot.isDraggingOver ? 'bg-brand-50/60' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} onOpen={onOpenTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {adding ? (
        <form onSubmit={submitAdd} className="mt-1 px-0.5">
          <textarea
            autoFocus
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitAdd(e);
              }
              if (e.key === 'Escape') setAdding(false);
            }}
            onBlur={() => !title.trim() && setAdding(false)}
            placeholder="Task title…"
            className="w-full resize-none rounded-card border border-brand-300 bg-paper-card p-2.5 text-[13.5px] text-ink placeholder:text-ink-soft/60"
          />
          <div className="mt-1.5 flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
            >
              Add task
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-2 py-1.5 text-xs text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-1 flex items-center gap-1.5 rounded-card px-2.5 py-2 text-[13px] text-ink-soft transition hover:bg-paper-card hover:text-ink"
        >
          <Plus size={14} />
          Add task
        </button>
      )}
    </div>
  );
}
