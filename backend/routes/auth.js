const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, asyncHandler } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const clean = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, club: u.club, avatar: u.avatar });

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password, role: 'student' }); // role is never taken from the client
  res.status(201).json({ token: sign(user._id), user: clean(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('club', 'name logo');
  if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(user._id), user: clean(user) });
}));

router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('club', 'name logo');
  res.json({ user: clean(user) });
}));

router.put('/me', protect, asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  if (name) req.user.name = name;
  if (avatar !== undefined) req.user.avatar = avatar;
  await req.user.save();
  const user = await User.findById(req.user._id).populate('club', 'name logo');
  res.json({ user: clean(user) });
}));

module.exports = router;
