const Subject = require('../models/Subject');
const Session = require('../models/Session');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const generateQRCode = require('../utils/generateQRCode');
const crypto = require('crypto');

exports.createSubject = async (req, res) => {
  try {
    const { name, courseCode } = req.body;

    if (!name || !courseCode) {
      return res.status(400).json({ msg: 'Both name and course code are required' });
    }

    const existingSubject = await Subject.findOne({ courseCode });
    if (existingSubject) {
      return res.status(400).json({ msg: 'Course code already exists' });
    }

    const subject = await Subject.create({
      name,
      courseCode,
      admin: req.user._id
    });

    res.json(subject);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSubjects = async (req, res) => {
  const subjects = await Subject.find({ admin: req.user._id });
  res.json(subjects);
};

exports.generateSessionQR = async (req, res) => {
  try {
    const { subjectId, date, expiresAt, lat, lng } = req.body;
    const start = new Date(date);
    const end = new Date(expiresAt);

    // check if session time overlaps
    const overlap = await Session.findOne({
      admin: req.user._id,
      status: { $ne: 'invalidated' },
      date: { $lt: end },
      expiresAt: { $gt: start }
});

    if (overlap) {
      return res.status(400).json({ msg: 'Cannot create session: time interval overlaps with another session.' });
    }

    const encryptedId = crypto.randomBytes(16).toString('hex');
    // set session status
    let status = 'upcoming';
    const now = new Date();
    if (start <= now && end > now) {
      status = 'active';
    }
    const session = await Session.create({
      subject: subjectId,
      admin: req.user._id,
      date: start,
      expiresAt: end,
      classroomLocation: { lat, lng },
      encryptedId,
      status
    });

    const qrCode = await generateQRCode(encryptedId);

    res.json({ qrCode, sessionId: session._id });
  } catch {
    res.status(500).json({ msg: 'Failed to generate session' });
  }
};

exports.invalidateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    if (session.status !== 'active' && session.status !== 'upcoming') {
      return res.status(400).json({ msg: 'Only active or upcoming sessions can be invalidated.' });
    }
    session.status = 'invalidated';
    await session.save();
    res.json({ msg: 'Session invalidated successfully' });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.viewAttendanceBySubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    // get sessions for this subject
    const sessions = await Session.find({
      subject: subjectId,
      admin: req.user._id,
      status: { $in: ['active', 'expired'] }
    }).sort({ date: -1 });
    const sessionIds = sessions.map(s => s._id);
    const totalClasses = sessions.length;
    const enrollments = await Enrollment.find({ subject: subjectId })
      .populate('student', 'name email rollNumber');
    const Attendance = require('../models/Attendance');
    const attendanceRecords = await Attendance.find({ session: { $in: sessionIds } })
      .populate('student', 'name email rollNumber')
      .populate({
        path: 'session',
        select: 'date expiresAt status'
      });
    const studentStats = enrollments.map(enrollment => {
      const studentAttendance = attendanceRecords.filter(
        record => record.student._id.toString() === enrollment.student._id.toString()
      );
      return {
        student: {
          id: enrollment.student._id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          rollNumber: enrollment.student.rollNumber
        },
        totalClasses,
        attendedClasses: studentAttendance.length,
        attendancePercentage: totalClasses > 0
          ? Math.round((studentAttendance.length / totalClasses) * 100)
          : 0,
        attendanceRecords: studentAttendance.map(record => ({
          date: record.session.date,
          scannedAt: record.scannedAt,
          sessionStatus: record.session.status
        }))
      };
    });
    const sessionDetails = sessions.map(session => ({
      id: session._id,
      date: session.date,
      expiresAt: session.expiresAt,
      status: session.status,
      totalAttendance: attendanceRecords.filter(record =>
        record.session._id.toString() === session._id.toString()
      ).length
    }));
    res.json({
      subjectId,
      totalClasses,
      studentStats,
      sessionDetails
    });
  } catch {
    res.status(500).json({ msg: 'Failed to fetch attendance records' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({ _id: subjectId, admin: req.user._id });
    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(subjectId);

    res.json({ msg: 'Subject deleted successfully' });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    // get only active or upcoming sessions
    const sessions = await Session.find({ admin: req.user._id, status: { $in: ['active', 'upcoming'] } })
      .populate('subject', 'name')
      .sort({ date: -1 });
    res.json(sessions);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const { students, subjectIds } = req.body;
    if (!Array.isArray(students) || students.length === 0 || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ msg: 'Please provide students and at least one subject' });
    }
    // get all subjects
    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    // prepare result
    const subjectResults = {};
    for (const subject of subjects) {
      subjectResults[subject._id] = {
        subject: { _id: subject._id, name: subject.name, courseCode: subject.courseCode },
        enrolled: [],
        alreadyEnrolled: []
      };
    }
    for (const studentInfo of students) {
      const rollNumber = typeof studentInfo === 'string' ? studentInfo : studentInfo.rollNumber;
      const name = typeof studentInfo === 'object' ? studentInfo.name : undefined;
      const student = await User.findOne({ rollNumber, role: 'student' });
      if (!student) continue;
      if (name && student.name.toLowerCase() !== name.toLowerCase()) continue;
      // find enrollments for this student
      const existingEnrollments = await Enrollment.find({
        student: student._id,
        subject: { $in: subjectIds }
      });
      const existingSubjectIds = existingEnrollments.map(e => e.subject.toString());
      for (const subjectId of subjectIds) {
        const subject = subjects.find(s => s._id.toString() === subjectId.toString());
        if (!subject) continue;
        const studentData = { name: student.name, email: student.email, rollNumber: student.rollNumber };
        if (existingSubjectIds.includes(subjectId.toString())) {
          subjectResults[subjectId].alreadyEnrolled.push(studentData);
        } else {
          await Enrollment.create({ student: student._id, subject: subjectId });
          subjectResults[subjectId].enrolled.push(studentData);
        }
      }
    }
    // convert to array
    const results = Object.values(subjectResults);
    res.status(201).json({ results });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to enroll students', error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, 'name email rollNumber');
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch students' });
  }
};
