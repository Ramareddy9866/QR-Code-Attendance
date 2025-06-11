const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: String,
  courseCode: { type: String, required: true, unique: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Subject', subjectSchema);
