import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @route GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('actor', 'name avatarColor')
    .sort('-createdAt')
    .limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  res.json({ notifications, unreadCount });
});

// @route PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true });
  res.json({ success: true });
});

// @route PATCH /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});
