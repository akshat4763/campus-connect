const router = require('express').Router();
const crypto = require('crypto');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, authorize, asyncHandler } = require('../middleware/auth');

const makeTicketId = () => `EVT-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`.toUpperCase();

// Register for an event (students only)
router.post('/', protect, authorize('student'), asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const endOfEventDay = new Date(event.date);
  endOfEventDay.setHours(23, 59, 59, 999);
  if (endOfEventDay < new Date()) return res.status(400).json({ message: 'This event has already happened' });
  if (await Registration.findOne({ user: req.user._id, event: event._id })) return res.status(400).json({ message: 'You are already registered' });

  // Atomic seat check + increment (safe when two people grab the last seat)
  const updated = await Event.findOneAndUpdate(
    { _id: event._id, $expr: { $lt: ['$registeredCount', '$maxSeats'] } },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  if (!updated) return res.status(400).json({ message: 'Sorry, this event is full' });

  try {
    const registration = await Registration.create({ user: req.user._id, event: event._id, ticketId: makeTicketId() });
    res.status(201).json({ registration });
  } catch (e) {
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: -1 } });
    throw e;
  }
}));

router.get('/my', protect, asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id })
    .populate({ path: 'event', populate: { path: 'club', select: 'name' } })
    .sort({ createdAt: -1 });
  res.json({ registrations: registrations.filter((r) => r.event) });
}));

router.get('/event/:eventId', protect, authorize('clubAdmin', 'superAdmin'), asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId).populate('club', 'name');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role === 'clubAdmin' && String(event.club._id) !== String(req.user.club)) return res.status(403).json({ message: 'This event belongs to another club' });
  const registrations = await Registration.find({ event: event._id }).populate('user', 'name email').sort({ createdAt: 1 });
  res.json({ event, registrations });
}));

router.patch('/:id/attendance', protect, authorize('clubAdmin', 'superAdmin'), asyncHandler(async (req, res) => {
  const reg = await Registration.findById(req.params.id).populate('event', 'club');
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  if (req.user.role === 'clubAdmin' && String(reg.event.club) !== String(req.user.club)) return res.status(403).json({ message: 'This event belongs to another club' });
  reg.attended = typeof req.body.attended === 'boolean' ? req.body.attended : !reg.attended;
  await reg.save();
  res.json({ registration: { _id: reg._id, attended: reg.attended } });
}));

// Cancel own registration
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg || String(reg.user) !== String(req.user._id)) return res.status(404).json({ message: 'Registration not found' });
  await reg.deleteOne();
  await Event.findByIdAndUpdate(reg.event, { $inc: { registeredCount: -1 } });
  res.json({ message: 'Registration cancelled' });
}));

module.exports = router;
