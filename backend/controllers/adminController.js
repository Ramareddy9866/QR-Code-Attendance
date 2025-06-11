const Subject = require('../models/Subject');
const Session = require('../models/Session');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const generateQRCode = require('../utils/generateQRCode');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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
    const encryptedId = crypto.randomBytes(16).toString('hex');

    const session = await Session.create({
      subject: subjectId,
      admin: req.user._id,
      date,
      expiresAt,
      classroomLocation: { lat, lng },
      encryptedId
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
    await Session.findByIdAndUpdate(sessionId, { isActive: false });
    res.json({ msg: 'Session invalidated' });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.viewAttendanceBySubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;

    const sessions = await Session.find({
      subject: subjectId,
      admin: req.user._id
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
        select: 'date expiresAt isActive'
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
          sessionStatus: record.session.isActive ? 'Active' : 'Expired'
        }))
      };
    });

    const sessionDetails = sessions.map(session => ({
      id: session._id,
      date: session.date,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
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
    const sessions = await Session.find({ admin: req.user._id })
      .populate('subject', 'name')
      .sort({ date: -1 });

    res.json(sessions);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const { name, rollNumber, subjectIds } = req.body;

    if (!name || !rollNumber || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ msg: 'Name, roll number, and at least one subject are required' });
    }

    const student = await User.findOne({ rollNumber, role: 'student' });
    if (!student) {
      return res.status(404).json({ msg: 'Student does not exist. Please register the student first.' });
    }

    if (student.name.toLowerCase() !== name.toLowerCase()) {
      return res.status(400).json({ msg: 'Student name does not match the registered name' });
    }

    const existingEnrollments = await Enrollment.find({
      student: student._id,
      subject: { $in: subjectIds }
    }).populate('subject', 'name courseCode');

    const existingSubjectIds = existingEnrollments.map(e => e.subject._id.toString());
    const newSubjectIds = subjectIds.filter(id => !existingSubjectIds.includes(id));

    if (newSubjectIds.length === 0) {
      return res.status(400).json({
        msg: 'Student already enrolled in all selected subjects',
        existingEnrollments: existingEnrollments.map(e => ({
          subjectName: e.subject.name,
          courseCode: e.subject.courseCode
        }))
      });
    }

    const enrollments = await Promise.all(
      newSubjectIds.map(subjectId =>
        Enrollment.create({
          student: student._id,
          subject: subjectId
        })
      )
    );

    let responseMsg = 'Student enrolled successfully';
    if (existingEnrollments.length > 0) {
      responseMsg = `Student enrolled in ${newSubjectIds.length} new subject(s). Already enrolled in ${existingEnrollments.length} subject(s).`;
    }

    res.status(201).json({
      msg: responseMsg,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber
      },
      newEnrollments: enrollments.length,
      existingEnrollments: existingEnrollments.map(e => ({
        subjectName: e.subject.name,
        courseCode: e.subject.courseCode
      }))
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Failed to enroll student',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('subject', 'name courseCode')
      .populate({
        path: 'subject',
        populate: {
          path: 'admin',
          select: 'name'
        }
      });

    res.json(enrollments);
  } catch {
    res.status(500).json({ msg: 'Failed to fetch enrollments' });
  }
};
