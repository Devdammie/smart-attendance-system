import express from 'express';
import { validateEnrollment, markAttendance, closeAttendanceSession } from '../controllers/attendanceControllers.js';
import { isLecturer } from '../middleware/lecturerAuth.js';

const router = express.Router();

router.post('/validate-enrollment', isLecturer, validateEnrollment);
router.post('/mark', isLecturer, markAttendance);
router.post('/close-session', isLecturer, closeAttendanceSession);

export default router;