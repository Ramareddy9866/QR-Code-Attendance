const Session = require('../models/Session');

const checkSessionStatuses = async () => {
  try {
    const now = new Date();
    // set sessions to active if time is right
    await Session.updateMany(
      { date: { $lte: now }, expiresAt: { $gt: now }, status: { $in: ['upcoming', 'active', 'expired'] } },
      { $set: { status: 'active' } }
    );
    // set sessions to expired if time is over
    await Session.updateMany(
      { expiresAt: { $lte: now }, status: { $in: ['upcoming', 'active', 'expired'] } },
      { $set: { status: 'expired' } }
    );
  } catch (error) {}
};

const startSessionStatusJob = () => {
  setInterval(checkSessionStatuses, 60000);
  checkSessionStatuses();
};

module.exports = startSessionStatusJob;
