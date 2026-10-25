// Creates backend/.env and frontend/.env with working local defaults (never overwrites existing files).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const write = (file, content) => {
  const p = path.join(__dirname, '..', file);
  if (fs.existsSync(p)) return console.log(`✔ ${file} already exists — left untouched`);
  fs.writeFileSync(p, content);
  console.log(`✔ created ${file}`);
};

write('backend/.env', `PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/event-system
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
CLIENT_URL=http://localhost:5173
# Optional — only needed for image upload (free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
`);
write('frontend/.env', `VITE_API_URL=http://localhost:5001/api\n`);

console.log('\nNext steps:\n  1. Make sure MongoDB is running\n  2. npm run seed   (demo data)\n  3. npm run dev    (opens http://localhost:5173)');
