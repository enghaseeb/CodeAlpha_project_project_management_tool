import Project from '../models/Project.js';
import List from '../models/List.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ensureMember, ensureAdmin } from '../utils/permissions.js';

const MEMBER_FIELDS = 'members.user';

// @route POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  if (!name?.trim()) {
    res.status(400);
    throw new Error('Project name is required');
  }

  const project = await Project.create({
    name: name.trim(),
    description: description?.trim() || '',
    color: color || '#0D7A6E',
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  const defaultLists = ['To Do', 'In Progress', 'Done'];
  await List.insertMany(defaultLists.map((n, i) => ({ name: n, project: project._id, order: i })));

  const populated = await Project.findById(project._id).populate(
    'members.user',
    'name email avatarColor'
  );
  res.status(201).json({ project: populated });
});

// @route GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ [MEMBER_FIELDS]: req.user._id })
    .populate('members.user', 'name email avatarColor')
    .sort('-createdAt');

  const projectIds = projects.map((p) => p._id);
  const taskCounts = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: '$project', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(taskCounts.map((c) => [c._id.toString(), c.count]));

  res.json({
    projects: projects.map((p) => ({ ...p.toObject(), taskCount: countMap[p._id.toString()] || 0 })),
  });
});

// @route GET /api/projects/:id  (full board: project + lists + tasks)
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    'members.user',
    'name email avatarColor'
  );
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  ensureMember(project, req.user._id, res);

  const [lists, tasks] = await Promise.all([
    List.find({ project: project._id }).sort('order'),
    Task.find({ project: project._id })
      .populate('assignees', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .sort('order'),
  ]);

  res.json({ project, lists, tasks });
});

// @route PATCH /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  ensureAdmin(project, req.user._id, res);

  const { name, description, color } = req.body;
  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description.trim();
  if (color !== undefined) project.color = color;
  await project.save();

  const populated = await Project.findById(project._id).populate(
    'members.user',
    'name email avatarColor'
  );

  req.app.get('io').to(`project:${project._id}`).emit('project:updated', populated);
  res.json({ project: populated });
});

// @route DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the project owner can delete this project');
  }

  const tasks = await Task.find({ project: project._id }, '_id');
  await Comment.deleteMany({ task: { $in: tasks.map((t) => t._id) } });
  await Task.deleteMany({ project: project._id });
  await List.deleteMany({ project: project._id });
  await project.deleteOne();

  req.app.get('io').to(`project:${project._id}`).emit('project:deleted', { id: project._id });
  res.json({ message: 'Project deleted' });
});

// @route POST /api/projects/:id/members  { email }
export const addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  ensureAdmin(project, req.user._id, res);

  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase().trim() });
  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }
  if (project.members.some((m) => m.user.toString() === user._id.toString())) {
    res.status(400);
    throw new Error('That person is already on this project');
  }

  project.members.push({ user: user._id, role: 'member' });
  await project.save();

  const io = req.app.get('io');
  const notification = await Notification.create({
    recipient: user._id,
    type: 'project_invite',
    message: `${req.user.name} added you to "${project.name}"`,
    project: project._id,
    actor: req.user._id,
  });
  io.to(`user:${user._id}`).emit('notification:new', notification);

  const populated = await Project.findById(project._id).populate(
    'members.user',
    'name email avatarColor'
  );
  io.to(`project:${project._id}`).emit('project:updated', populated);
  res.json({ project: populated });
});

// @route DELETE /api/projects/:id/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  ensureAdmin(project, req.user._id, res);

  if (project.owner.toString() === req.params.userId) {
    res.status(400);
    throw new Error('The project owner cannot be removed');
  }

  project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
  await project.save();

  const populated = await Project.findById(project._id).populate(
    'members.user',
    'name email avatarColor'
  );
  req.app.get('io').to(`project:${project._id}`).emit('project:updated', populated);
  res.json({ project: populated });
});
