// Run once: npm run seed   (WIPES the database, then adds demo data)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(0, 0, 0, 0); return d; };

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Club.deleteMany(), Event.deleteMany(), Registration.deleteMany()]);

  const admin = await User.create({ name: 'Super Admin', email: 'admin@college.edu', password: 'Admin@123', role: 'superAdmin' });
  const [coding, cultural, sports] = await Club.create([
    { name: 'Coding Club', description: 'Hackathons, workshops and competitive programming.', createdBy: admin._id },
    { name: 'Cultural Club', description: 'Music, dance, drama and fests.', createdBy: admin._id },
    { name: 'Sports Club', description: 'Tournaments and fitness events.', createdBy: admin._id },
  ]);
  const clubAdmin = await User.create({ name: 'Coding Club Admin', email: 'coding@college.edu', password: 'Club@123', role: 'clubAdmin', club: coding._id });
  await User.create({ name: 'Cultural Club Admin', email: 'cultural@college.edu', password: 'Club@123', role: 'clubAdmin', club: cultural._id });
  await User.create({ name: 'Demo Student', email: 'student@college.edu', password: 'Student@123', role: 'student' });

  const img = (s) => `https://picsum.photos/seed/${s}/800/450`;
  await Event.create([
    { title: 'HackSprint 2026', description: '24-hour hackathon. Build something useful with your team and pitch it to the judges. Food and swag included.', image: img('hack'), date: inDays(5), time: '09:00', venue: 'Main Auditorium', category: 'Technical', club: coding._id, maxSeats: 120, createdBy: clubAdmin._id },
    { title: 'React & shadcn/ui Workshop', description: 'Hands-on session building a modern UI with React, Tailwind and shadcn/ui. Bring your laptop.', image: img('react'), date: inDays(9), time: '14:00', venue: 'Lab 3', category: 'Workshop', club: coding._id, maxSeats: 60, createdBy: clubAdmin._id },
    { title: 'Open Mic Night', description: 'Poetry, stand-up, music — the stage is yours. Sign up and perform or just enjoy the show.', image: img('mic'), date: inDays(7), time: '18:00', venue: 'Open Air Theatre', category: 'Cultural', club: cultural._id, maxSeats: 200, createdBy: admin._id },
    { title: 'Inter-Department Cricket Cup', description: 'Knockout cricket tournament between departments. Teams of 11.', image: img('cricket'), date: inDays(12), time: '08:00', venue: 'College Ground', category: 'Sports', club: sports._id, maxSeats: 150, createdBy: admin._id },
    { title: 'Intro to Cloud & DevOps', description: 'A seminar on CI/CD, containers and deploying your first app to the cloud.', image: img('cloud'), date: inDays(15), time: '11:00', venue: 'Seminar Hall', category: 'Seminar', club: coding._id, maxSeats: 80, createdBy: clubAdmin._id },
    { title: 'Freshers Dance Fest', description: 'Solo and group dance competition with prizes for the top three.', image: img('dance'), date: inDays(20), time: '17:00', venue: 'Main Auditorium', category: 'Cultural', club: cultural._id, maxSeats: 100, createdBy: admin._id },
  ]);

  console.log('Seeded! Logins:\n  admin@college.edu / Admin@123 (superAdmin)\n  coding@college.edu / Club@123 (clubAdmin)\n  student@college.edu / Student@123 (student)');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
