const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.use(auth, role('admin'));

router.post('/subject', adminCtrl.createSubject);
router.get('/subjects', adminCtrl.getSubjects);
router.delete('/subject/:subjectId', adminCtrl.deleteSubject);
router.get('/subject/:subjectId/attendance', adminCtrl.viewAttendanceBySubject);

router.post('/session', adminCtrl.generateSessionQR);
router.put('/session/:sessionId/invalidate', adminCtrl.invalidateSession);
router.get('/sessions', adminCtrl.getSessions);

router.post('/enroll-student', adminCtrl.enrollStudent);

module.exports = router;
