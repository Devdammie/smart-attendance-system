import express from 'express';
import rateLimit from 'express-rate-limit';
import { validateEnrollment, markAttendance, closeAttendanceSession, viewAttendanceHistory, downloadAttendanceHistory } from '../controllers/attendanceControllers.js';
import { isLecturer } from '../middleware/lecturerAuth.js';

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});

// Apply to all attendance routes
router.use(limiter);

router.post('/validate-enrollment', isLecturer, validateEnrollment);
router.post('/mark', isLecturer, markAttendance);
router.post('/close-session', isLecturer, closeAttendanceSession);

// View attendance history (JSON)
router.get('/history/:courseId', isLecturer, viewAttendanceHistory);

// Download attendance history (CSV)
router.get('/history/:courseId/download', isLecturer, downloadAttendanceHistory);

// Example for course ownership
const course = await courseModel.findOne({ _id: courseId, lecturer: req.user.id });
if (!course) {
  return res.status(404).json({ message: 'Course not found or not assigned to you' });
}

// Example for session ownership
const session = await attendanceSessionModel.findOne({ _id: sessionId, lecturer: req.user.id });
if (!session) {
  return res.status(404).json({ message: 'Session not found or not assigned to you' });
}

export default router;