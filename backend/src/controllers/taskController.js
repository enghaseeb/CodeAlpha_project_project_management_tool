import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ensureMember } from '../utils/permissions.js';

const TASK_POPULATE = [
  { path: 'assignees', select: 'name email avatarColor' },
  { path: 'createdBy', select: 'name email avatarColor' },
];

async function notifyAssignees({ io, userIds, excludeUserId, message, task }) {
  for (const userId of userIds) {
    if (userId.toString() === excludeUserId.toString()) continue;
    const notif = await Notification.create({
      recipient: userId,
      type: 'task_assigned',
      message,
      project: task.project,
      task: task._id,
      actor: excludeUserId,
    });
    io.to(`user:${userId}`).emit('notification:new', notif);
  }
}

// @route POST /api/tasks
export const createTask = asyncHandler(async (req, res) => {
  const { projectId, listId, title, description, priority, dueDate, assignees, labels } = req.body;
  if (!title?.trim() || !listId || !projectId) {
    res.status(400);
    throw new Error('Project, list and title are required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  ensureMember(project, req.user._id, res);

  const count = await Task.countDocuments({ list: listId });
  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    labels: labels || [],
    assignees: assignees || [],
    project: projectId,
    list: listId,
    order: count,
    createdBy: req.user._id,
  });

  const populated = await task.populate(TASK_POPULATE);
  const io = req.app.get('io');
  io.to(`project:${projectId}`).emit('task:created', populated);

  if (assignees?.length) {
    await notifyAssignees({
      io,
      userIds: assignees,
      excludeUserId: req.user._id,
      message: `${req.user.name} assigned you to "${task.title}"`,
      task,
    });
  }

  res.status(201).json({ task: populated });
});

// @route GET /api/tasks/:id
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(TASK_POPULATE);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json({ task });
});

// @route PATCH /api/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  const project = await Project.findById(task.project);
  ensureMember(project, req.user._id, res);

  const prevAssignees = task.assignees.map((a) => a.toString());
  const editable = ['title', 'description', 'priority', 'dueDate', 'labels', 'assignees'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });
  await task.save();

  const populated = await task.populate(TASK_POPULATE);
  const io = req.app.get('io');
  io.to(`project:${task.project}`).emit('task:updated', populated);

  if (req.body.assignees) {
    const newlyAssigned = req.body.assignees.filter((id) => !prevAssignees.includes(id.toString()));
    if (newlyAssigned.length) {
      await notifyAssignees({
        io,
        userIds: newlyAssigned,
        excludeUserId: req.user._id,
        message: `${req.user.name} assigned you to "${task.title}"`,
        task,
      });
    }
  }

  res.json({ task: populated });
});

// @route POST /api/tasks/:id/move  { listId, order }
// Dedicated endpoint for drag-and-drop: moves a task to a list/position and
// re-indexes both the source and destination lists so ordering stays clean.
export const moveTask = asyncHandler(async (req, res) => {
  const { listId, order } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const project = await Project.findById(task.project);
  ensureMember(project, req.user._id, res);

  const sourceListId = task.list.toString();
  task.list = listId;
  await task.save();

  const destTasks = await Task.find({ list: listId, _id: { $ne: task._id } }).sort('order');
  destTasks.splice(Math.max(0, Math.min(order, destTasks.length)), 0, task);
  await Promise.all(destTasks.map((t, i) => Task.findByIdAndUpdate(t._id, { order: i })));

  if (sourceListId !== listId) {
    const sourceTasks = await Task.find({ list: sourceListId }).sort('order');
    await Promise.all(sourceTasks.map((t, i) => Task.findByIdAndUpdate(t._id, { order: i })));
  }

  req.app
    .get('io')
    .to(`project:${task.project}`)
    .emit('task:moved', { taskId: task._id, listId, order, sourceListId });
  res.json({ success: true });
});

// @route DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  const project = await Project.findById(task.project);
  ensureMember(project, req.user._id, res);

  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();
  req.app
    .get('io')
    .to(`project:${task.project}`)
    .emit('task:deleted', { id: task._id, listId: task.list });
  res.json({ message: 'Task deleted' });
});
