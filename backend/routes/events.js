const router = require('express').Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, authorize, asyncHandler } = require('../middleware/auth');

const FIELDS = ['title', 'description', 'image', 'date', 'time', 'venue', 'category', 'maxSeats'];
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public list with search + filters: ?q=&club=&category=&date=YYYY-MM-DD&upcoming=true
router.get('/', asyncHandler(async (req, res) => {
  const { q, club, category, date, upcoming } = req.query;
  const filter = {};
  if (q) filter.$or = [{ title: new RegExp(esc(q), 'i') }, { venue: new RegExp(esc(q), 'i') }];
  if (club) filter.club = club;
  if (category) filter.category = category;
  if (date) {
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  } else if (upcoming === 'true') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filter.date = { $gte: today };
  }
  const events = await Event.find(filter).populate('club', 'name logo').sort({ date: 1 });
  res.json({ events });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('club', 'name logo description');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ event });
}));

router.post('/', protect, authorize('clubAdmin', 'superAdmin'), asyncHandler(async (req, res) => {
  const data = {};
  FIELDS.forEach((f) => req.body[f] !== undefined && (data[f] = req.body[f]));
  data.club = req.user.role === 'clubAdmin' ? req.user.club : req.body.club;
  if (!data.club) return res.status(400).json({ message: req.user.role === 'clubAdmin' ? 'You are not assigned to a club yet' : 'Club is required' });
  data.createdBy = req.user._id;
  const event = await Event.create(data);
  res.status(201).json({ event });
}));

const loadOwned = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404).json({ message: 'Event not found' }); return null; }
  if (req.user.role === 'clubAdmin' && String(event.club) !== String(req.user.club)) {
    res.status(403).json({ message: 'This event belongs to another club' }); return null;
  }
  return event;
};

router.put('/:id', protect, authorize('clubAdmin', 'superAdmin'), asyncHandler(async (req, res) => {
  const event = await loadOwned(req, res);
  if (!event) return;
  FIELDS.forEach((f) => req.body[f] !== undefined && (event[f] = req.body[f]));
  if (req.user.role === 'superAdmin' && req.body.club) event.club = req.body.club;
  if (event.maxSeats < event.registeredCount) return res.status(400).json({ message: `Seats cannot be below current registrations (${event.registeredCount})` });
  await event.save();
  res.json({ event });
}));

router.delete('/:id', protect, authorize('clubAdmin', 'superAdmin'), asyncHandler(async (req, res) => {
  const event = await loadOwned(req, res);
  if (!event) return;
  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();
  res.json({ message: 'Event deleted' });
}));

module.exports = router;
