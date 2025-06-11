const Session = require('../models/Session');

const checkExpiredSessions = async () => {
  try {
    const now = new Date();
    await Session.updateMany(
      { expiresAt: { $lt: now }, isActive: true },
      { $set: { isActive: false } }
    );
  } catch (error) {}
};

const startSessionExpiryJob = () => {
  setInterval(checkExpiredSessions, 60000);
  checkExpiredSessions();
};

module.exports = startSessionExpiryJob;
