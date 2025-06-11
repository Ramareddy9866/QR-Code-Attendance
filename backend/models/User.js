const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'student'], required: true },
  rollNumber: { type: String, required: function() { return this.role === 'student'; } },
  activeSessionToken: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema);
