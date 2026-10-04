import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { AvatarStack } from './Avatar';
import { PRIORITY_BAR } from './PriorityBadge';

export default function TaskCard({ task, index, onOpen }) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && isPast(due) && !isToday(due);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <button
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(task)}
          className={`mb-2 w-full rounded-card border border-paper-line bg-paper-card p-3 text-left transition ${
            snapshot.isDragging ? 'shadow-lift' : 'hover:border-brand-200'
          }`}
          style={{
            borderLeftWidth: '3px',
            borderLeftColor: PRIORITY_BAR[task.priority],
            ...provided.draggableProps.style,
          }}
        >
          <p className="text-[13.5px] leading-snug text-ink">{task.title}</p>

          {task.labels?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.labels.map((l) => (
                <span
                  key={l}
                  className="rounded bg-brand-50 px-1.5 py-0.5 text-[10.5px] font-medium text-brand-700"
                >
                  {l}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-ink-soft">
              {due && (
                <span
                  className={`flex items-center gap-1 text-[11px] ${overdue ? 'font-medium text-crimson' : ''}`}
                >
                  <Clock size={11} />
                  {format(due, 'MMM d')}
                </span>
              )}
              {task.commentCount > 0 && (
                <span className="flex items-center gap-1 text-[11px]">
                  <MessageSquare size={11} />
                  {task.commentCount}
                </span>
              )}
            </div>
            {task.assignees?.length > 0 && <AvatarStack users={task.assignees} size="xs" max={3} />}
          </div>
        </button>
      )}
    </Draggable>
  );
}
