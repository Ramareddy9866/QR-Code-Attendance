const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  expiresAt: Date,
  classroomLocation: {
    lat: Number,
    lng: Number
  },
  isActive: { type: Boolean, default: true },
  encryptedId: String
});

sessionSchema.pre('save', async function(next) {
  try {
    const collection = this.constructor.collection;
    const indexes = await collection.indexes();
    const ttlIndex = indexes.find(index => index.expireAfterSeconds !== undefined);
    if (ttlIndex) await collection.dropIndex(ttlIndex.name);
    next();
  } catch (error) {
    next(error);
  }
});

sessionSchema.index({ subject: 1, date: -1 });
sessionSchema.index({ admin: 1, date: -1 });
sessionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Session', sessionSchema);
