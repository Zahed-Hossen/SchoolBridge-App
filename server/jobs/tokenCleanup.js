import cron from 'node-cron';
import Invitation from '../models/Invitation.js';

// Daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    const result = await Invitation.deleteMany({
      expiresAt: { $lt: new Date() },
      isUsed: false,
    });
    console.log(
      `🧹 Cleaned up ${result.deletedCount} expired invitation tokens`,
    );
  } catch (err) {
    console.error('❌ Token cleanup job failed:', err);
  }
});
