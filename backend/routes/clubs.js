const router = require('express').Router();
const Club = require('../models/Club');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { protect, authorize, asyncHandler } = require('../middleware/auth');

router.get('/', asyncHandler(async (req, res) => {
  res.json({ clubs: await Club.find().sort({ name: 1 }) });
}));

router.post('/', protect, authorize('superAdmin'), asyncHandler(async (req, res) => {
  const { name, description, logo } = req.body;
  if (!name) return res.status(400).json({ message: 'Club name is required' });
  const club = await Club.create({ name, description, logo, createdBy: req.user._id });
  res.status(201).json({ club });
}));

router.put('/:id', protect, authorize('superAdmin'), asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  ['name', 'description', 'logo'].forEach((f) => req.body[f] !== undefined && (club[f] = req.body[f]));
  await club.save();
  res.json({ club });
}));

router.delete('/:id', protect, authorize('superAdmin'), asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  const events = await Event.find({ club: club._id }).select('_id');
  await Registration.deleteMany({ event: { $in: events.map((e) => e._id) } });
  await Event.deleteMany({ club: club._id });
  await User.updateMany({ club: club._id }, { role: 'student', club: null });
  await club.deleteOne();
  res.json({ message: 'Club deleted' });
}));

module.exports = router;
