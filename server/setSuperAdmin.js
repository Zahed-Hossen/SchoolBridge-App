import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL = 'mdzahedsiddique@gmail.com';

async function setSuperAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    let user = await User.findOne({ email: EMAIL });
    if (!user) {
        user = new User({
        email: EMAIL,
        password: 'Ananas@Guava#38',
        fullName: 'Super Admin',
        role: 'SuperAdmin',
        verified: false,
        isActive: true,
      });
      await user.save();
      console.log('SuperAdmin user created:', user.email);
    } else {
      const res = await User.updateOne(
        { email: EMAIL },
        { $set: { role: 'SuperAdmin', verified: true, isActive: true } },
      );
      console.log('User updated:', res);
    }
  } catch (err) {
    console.error('Error updating/creating user:', err);
  } finally {
    await mongoose.disconnect();
  }
}

setSuperAdmin();
