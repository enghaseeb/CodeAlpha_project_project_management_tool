import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import BoardColumn from '../components/BoardColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { AvatarStack } from '../components/Avatar';
import { LoadingSpinner } from '../components/Common';
import { getProject, addMember as addMemberApi, removeMember as removeMemberApi } from '../api/projects';
import { createList as createListApi, updateList as updateListApi, deleteList as deleteListApi } from '../api/lists';
import {
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  moveTask as moveTaskApi,
  deleteTask as deleteTaskApi,
} from '../api/tasks';
import { getSocket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';

// Removes a task from wherever it is and reinserts it at (listId, order),
// re-indexing both the source and destination lanes. Used both for our own
// optimistic drag update and for incoming socket broadcasts, so it needs to
// behave sanely whether or not the task has already moved locally.
function applyMove(tasks, { taskId, listId, order }) {
  const task = tasks.find((t) => t._id === taskId);
  if (!task) return tasks;
  const sourceListId = task.list;
  const rest = tasks.filter((t) => t._id !== taskId);

  const destTasks = rest.filter((t) => t.list === listId).sort((a, b) => a.order - b.order);
  const clamped = Math.max(0, Math.min(order, destTasks.length));
  destTasks.splice(clamped, 0, { ...task, list: listId });
  const reindexedDest = destTasks.map((t, i) => ({ ...t, order: i }));

  let reindexedSource = [];
  if (sourceListId !== listId) {
    const sourceTasks = rest.filter((t) => t.list === sourceListId).sort((a, b) => a.order - b.order);
    reindexedSource = sourceTasks.map((t, i) => ({ ...t, order: i }));
  }

  const touched = new Set([...reindexedDest.map((t) => t._id), ...reindexedSource.map((t) => t._id)]);
  const untouched = rest.filter((t) => !touched.has(t._id));
  return [...untouched, ...reindexedDest, ...reindexedSource];
}

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [project, setProject] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [listName, setListName] = useState('');

  useEffect(() => {
    setLoading(true);
    getProject(id)
      .then((data) => {
        setProject(data.project);
        setLists(data.lists);
        setTasks(data.tasks);
      })
      .catch(() => toast.error('Could not load this project'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('project:join', id);

    const onTaskCreated = (task) => setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [...prev, task]));
    const onTaskUpdated = (task) => setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    const onTaskMoved = (payload) => setTasks((prev) => applyMove(prev, payload));
    const onTaskDeleted = ({ id: taskId }) => setTasks((prev) => prev.filter((t) => t._id !== taskId));

    const onListCreated = (list) => setLists((prev) => (prev.some((l) => l._id === list._id) ? prev : [...prev, list]));
    const onListUpdated = (list) => setLists((prev) => prev.map((l) => (l._id === list._id ? list : l)));
    const onListDeleted = ({ id: listId }) => {
      setLists((prev) => prev.filter((l) => l._id !== listId));
      setTasks((prev) => prev.filter((t) => t.list !== listId));
    };

    const onCommentAdded = ({ taskId }) =>
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, commentCount: t.commentCount + 1 } : t)));

    const onProjectUpdated = (p) => setProject(p);
    const onProjectDeleted = () => {
      toast('This project was deleted');
      navigate('/dashboard');
    };

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:moved', onTaskMoved);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('list:created', onListCreated);
    socket.on('list:updated', onListUpdated);
    socket.on('list:deleted', onListDeleted);
    socket.on('comment:added', onCommentAdded);
    socket.on('project:updated', onProjectUpdated);
    socket.on('project:deleted', onProjectDeleted);

    return () => {
      socket.emit('project:leave', id);
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:moved', onTaskMoved);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('list:created', onListCreated);
      socket.off('list:updated', onListUpdated);
      socket.off('list:deleted', onListDeleted);
      socket.off('comment:added', onCommentAdded);
      socket.off('project:updated', onProjectUpdated);
      socket.off('project:deleted', onProjectDeleted);
    };
  }, [id, navigate]);

  const tasksByList = useMemo(() => {
    const map = {};
    for (const list of lists) map[list._id] = [];
    for (const task of tasks) {
      if (!map[task.list]) map[task.list] = [];
      map[task.list].push(task);
    }
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.order - b.order));
    return map;
  }, [lists, tasks]);

  const selectedTask = tasks.find((t) => t._id === selectedTaskId) || null;

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setTasks((prev) => applyMove(prev, { taskId: draggableId, listId: destination.droppableId, order: destination.index }));
    moveTaskApi(draggableId, { listId: destination.droppableId, order: destination.index }).catch(() => {
      toast.error('Could not save that move — refresh to resync');
    });
  };

  const handleAddTask = (listId, title) =>
    createTaskApi({ projectId: id, listId, title }).catch(() => toast.error('Could not add task'));

  const handleUpdateTask = (taskId, data) =>
    updateTaskApi(taskId, data).catch(() => toast.error('Could not save changes'));

  const handleDeleteTask = (taskId) => {
    setSelectedTaskId(null);
    deleteTaskApi(taskId).catch(() => toast.error('Could not delete task'));
  };

  const handleAddList = (e) => {
    e.preventDefault();
    if (!listName.trim()) {
      setAddingList(false);
      return;
    }
    createListApi({ projectId: id, name: listName.trim() })
      .then(() => {
        setListName('');
        setAddingList(false);
      })
      .catch(() => toast.error('Could not add list'));
  };

  const handleRenameList = (listId, name) =>
    updateListApi(listId, { name }).catch(() => toast.error('Could not rename list'));

  const handleDeleteList = (listId) => {
    if (!window.confirm('Delete this list and all its tasks?')) return;
    deleteListApi(listId).catch(() => toast.error('Could not delete list'));
  };

  const handleAddMember = (email) => addMemberApi(id, email).then((p) => setProject(p));
  const handleRemoveMember = (userId) => removeMemberApi(id, userId).then((p) => setProject(p));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <LoadingSpinner size={24} />
      </div>
    );
  }
  if (!project) return null;

  return (
    <div className="flex h-screen flex-col bg-paper">
      <Navbar />

      <div className="flex items-center justify-between border-b border-paper-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="font-display text-xl text-ink">{project.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <AvatarStack users={project.members.map((m) => m.user)} size="sm" max={5} />
          <button
            onClick={() => setMembersOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-paper-line px-3 py-1.5 text-sm text-ink-soft transition hover:border-brand-300 hover:text-ink"
          >
            <Users size={14} />
            Invite
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-5 py-5 scrollbar-thin">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-5">
            {lists
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((list) => (
                <BoardColumn
                  key={list._id}
                  list={list}
                  tasks={tasksByList[list._id] || []}
                  onOpenTask={(task) => setSelectedTaskId(task._id)}
                  onAddTask={handleAddTask}
                  onRenameList={handleRenameList}
                  onDeleteList={handleDeleteList}
                />
              ))}

            <div className="w-64 shrink-0">
              {addingList ? (
                <form onSubmit={handleAddList}>
                  <input
                    autoFocus
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    onBlur={() => !listName.trim() && setAddingList(false)}
                    placeholder="List name…"
                    className="w-full rounded-card border border-brand-300 bg-paper-card px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60"
                  />
                </form>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  className="flex w-full items-center gap-1.5 rounded-card border border-dashed border-paper-line px-3 py-2.5 text-sm text-ink-soft transition hover:border-brand-300 hover:text-ink"
                >
                  <Plus size={15} />
                  Add list
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      <TaskDetailModal
        task={selectedTask}
        project={project}
        open={!!selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      <InviteMemberModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        project={project}
        onAdd={handleAddMember}
        onRemove={handleRemoveMember}
        currentUserId={user?.id}
      />
    </div>
  );
}
