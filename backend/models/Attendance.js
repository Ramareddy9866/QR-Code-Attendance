const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  scannedAt: Date,
  scanLocation: {
    lat: Number,
    lng: Number
  }
});

attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
