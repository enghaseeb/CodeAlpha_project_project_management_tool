import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error('Name, email and password are all required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name: name.trim(), email: email.trim(), password });

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password || ''))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// @route GET /api/auth/search?q=
// Used by the "add member" / "assign" pickers
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ users: [] });

  const regex = new RegExp(q.trim(), 'i');
  const users = await User.find({
    $and: [{ _id: { $ne: req.user._id } }, { $or: [{ name: regex }, { email: regex }] }],
  }).limit(10);

  res.json({ users: users.map((u) => u.toSafeObject()) });
});
