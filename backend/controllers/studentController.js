const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');

const getDistance = (lat1, lon1, lat2, lon2) => {
  lat1 = Number(lat1);
  lon1 = Number(lon1);
  lat2 = Number(lat2);
  lon2 = Number(lon2);

  if (
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2) ||
    lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 ||
    lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180
  ) {
    throw new Error('Invalid coordinates');
  }

  const R = 6371e3; // earth radius in meters
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.markAttendance = async (req, res) => {
  try {
    const { encryptedId, lat, lng } = req.body;
    if (!encryptedId || !lat || !lng) {
      return res.status(400).json({ 
        msg: 'Missing required fields',
        details: 'QR code data and location are required'
      });
    }

    const session = await Session.findOne({ encryptedId }).populate('subject');
    if (!session || session.status !== 'active') {
      return res.status(400).json({ msg: 'Invalid or inactive session' });
    }

    // Ignore seconds/ms for all time checks
    const now = new Date();
    now.setSeconds(0, 0);
    const sessionStart = new Date(session.date);
    sessionStart.setSeconds(0, 0);
    const sessionEnd = new Date(session.expiresAt);
    sessionEnd.setSeconds(0, 0);

    if (now < sessionStart) {
      return res.status(400).json({ msg: 'Session has not started yet' });
    }
    if (now > sessionEnd) {
      return res.status(400).json({ msg: 'Session expired' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      subject: session.subject._id
    });

    if (!enrollment) {
      return res.status(403).json({ 
        msg: 'Not enrolled in subject',
        details: 'You are not enrolled in this subject. Please contact your administrator.'
      });
    }

    try {
      const studentLat = Number(lat);
      const studentLng = Number(lng);
      const classroomLat = Number(session.classroomLocation.lat);
      const classroomLng = Number(session.classroomLocation.lng);

      const distance = getDistance(studentLat, studentLng, classroomLat, classroomLng);
      if (distance > 50) {
        return res.status(400).json({ 
          msg: 'Out of location range',
          details: `You are ${distance.toFixed(2)} meters away from the classroom`
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        msg: 'Location error',
        details: error.message
      });
    }

    const alreadyMarked = await Attendance.findOne({ student: req.user._id, session: session._id });
    if (alreadyMarked) {
      return res.status(400).json({ msg: 'Attendance already marked' });
    }

    await Attendance.create({
      student: req.user._id,
      session: session._id,
      scannedAt: new Date(),
      scanLocation: { lat: Number(lat), lng: Number(lng) }
    });

    res.json({ msg: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAttendance = async (req, res) => {
  const attendance = await Attendance.find({ student: req.user._id })
    .populate('session', 'date')
    .populate({
      path: 'session',
      populate: { path: 'subject', select: 'name' }
    });

  res.json(attendance);
};

exports.getSessions = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('subject');
    const subjectIds = enrollments.map(enrollment => enrollment.subject._id);
    const sessions = await Session.find({ subject: { $in: subjectIds }, status: { $in: ['active', 'expired'] } })
      .populate('subject', 'name')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch sessions' });
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
