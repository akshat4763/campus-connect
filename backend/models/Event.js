const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    category: { type: String, default: 'Other' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    maxSeats: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Event', eventSchema);
