const express = require('express');
const router = express.Router();
const studentCtrl = require('../controllers/studentController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.use(auth, role('student'));

router.post('/mark-attendance', studentCtrl.markAttendance);
router.get('/attendance-history', studentCtrl.getAttendance);
router.get('/sessions', studentCtrl.getSessions);
router.get('/enrollments', studentCtrl.getStudentEnrollments);

module.exports = router;
