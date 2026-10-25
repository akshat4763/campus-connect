const router = require('express').Router();
const User = require('../models/User');
const { protect, authorize, asyncHandler } = require('../middleware/auth');

router.use(protect, authorize('superAdmin'));

router.get('/', asyncHandler(async (req, res) => {
  res.json({ users: await User.find().populate('club', 'name').sort({ createdAt: -1 }) });
}));

router.patch('/:id/role', asyncHandler(async (req, res) => {
  const { role, club } = req.body;
  if (!['student', 'clubAdmin', 'superAdmin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: "You can't change your own role" });
  if (role === 'clubAdmin' && !club) return res.status(400).json({ message: 'Pick a club for a club admin' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = role;
  user.club = role === 'clubAdmin' ? club : null;
  await user.save();
  res.json({ user: await User.findById(user._id).populate('club', 'name') });
}));

module.exports = router;
