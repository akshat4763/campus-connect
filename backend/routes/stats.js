const router = require('express').Router();
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, authorize, asyncHandler } = require('../middleware/auth');

router.get('/admin', protect, authorize('superAdmin'), asyncHandler(async (req, res) => {
  const [users, clubs, events, registrations, attended] = await Promise.all([
    User.countDocuments(), Club.countDocuments(), Event.countDocuments(), Registration.countDocuments(), Registration.countDocuments({ attended: true }),
  ]);
  const recentEvents = await Event.find().populate('club', 'name').sort({ createdAt: -1 }).limit(5);
  res.json({ users, clubs, events, registrations, attended, recentEvents });
}));

router.get('/club', protect, authorize('clubAdmin'), asyncHandler(async (req, res) => {
  if (!req.user.club) return res.json({ events: 0, upcoming: 0, registrations: 0, attended: 0 });
  const events = await Event.find({ club: req.user.club }).select('_id date');
  const ids = events.map((e) => e._id);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [registrations, attended] = await Promise.all([
    Registration.countDocuments({ event: { $in: ids } }), Registration.countDocuments({ event: { $in: ids }, attended: true }),
  ]);
  res.json({ events: events.length, upcoming: events.filter((e) => e.date >= today).length, registrations, attended });
}));

module.exports = router;
