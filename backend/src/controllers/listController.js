import List from '../models/List.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ensureMember } from '../utils/permissions.js';

// @route POST /api/lists  { projectId, name }
export const createList = asyncHandler(async (req, res) => {
  const { projectId, name } = req.body;
  if (!name?.trim()) {
    res.status(400);
    throw new Error('List name is required');
  }
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  ensureMember(project, req.user._id, res);

  const count = await List.countDocuments({ project: projectId });
  const list = await List.create({ name: name.trim(), project: projectId, order: count });

  req.app.get('io').to(`project:${projectId}`).emit('list:created', list);
  res.status(201).json({ list });
});

// @route PATCH /api/lists/:id  { name?, order? }
export const updateList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }
  const project = await Project.findById(list.project);
  ensureMember(project, req.user._id, res);

  const { name, order } = req.body;
  if (name !== undefined) list.name = name.trim();
  if (order !== undefined) list.order = order;
  await list.save();

  req.app.get('io').to(`project:${list.project}`).emit('list:updated', list);
  res.json({ list });
});

// @route POST /api/lists/reorder  { projectId, orderedIds }
export const reorderLists = asyncHandler(async (req, res) => {
  const { projectId, orderedIds } = req.body;
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  ensureMember(project, req.user._id, res);
  await Promise.all(orderedIds.map((id, index) => List.findByIdAndUpdate(id, { order: index })));
  req.app.get('io').to(`project:${projectId}`).emit('list:reordered', { orderedIds });
  res.json({ success: true });
});

// @route DELETE /api/lists/:id
export const deleteList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }
  const project = await Project.findById(list.project);
  ensureMember(project, req.user._id, res);

  const tasks = await Task.find({ list: list._id }, '_id');
  await Comment.deleteMany({ task: { $in: tasks.map((t) => t._id) } });
  await Task.deleteMany({ list: list._id });
  await list.deleteOne();
  req.app.get('io').to(`project:${list.project}`).emit('list:deleted', { id: list._id });
  res.json({ message: 'List deleted' });
});
