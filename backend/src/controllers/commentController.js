import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @route GET /api/tasks/:taskId/comments
export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate('author', 'name email avatarColor')
    .sort('createdAt');
  res.json({ comments });
});

// @route POST /api/tasks/:taskId/comments  { text }
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const comment = await Comment.create({ task: task._id, author: req.user._id, text: text.trim() });
  task.commentCount += 1;
  await task.save();

  const populated = await comment.populate('author', 'name email avatarColor');
  const io = req.app.get('io');
  io.to(`project:${task.project}`).emit('comment:added', { taskId: task._id, comment: populated });

  const recipients = new Set([...task.assignees.map((a) => a.toString()), task.createdBy.toString()]);
  recipients.delete(req.user._id.toString());
  for (const userId of recipients) {
    const notif = await Notification.create({
      recipient: userId,
      type: 'comment_added',
      message: `${req.user.name} commented on "${task.title}"`,
      project: task.project,
      task: task._id,
      actor: req.user._id,
    });
    io.to(`user:${userId}`).emit('notification:new', notif);
  }

  res.status(201).json({ comment: populated });
});

// @route DELETE /api/tasks/comments/:id
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own comments');
  }

  const task = await Task.findById(comment.task);
  await comment.deleteOne();
  if (task) {
    task.commentCount = Math.max(0, task.commentCount - 1);
    await task.save();
  }

  if (task) {
    req.app
      .get('io')
      .to(`project:${task.project}`)
      .emit('comment:deleted', { id: comment._id, taskId: comment.task });
  }
  res.json({ message: 'Comment deleted' });
});
