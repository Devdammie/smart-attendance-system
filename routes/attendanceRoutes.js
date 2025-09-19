import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { startAttendanceSession, validateEnrollment, markAttendance, markAttendanceWithFace, closeAttendanceSession, viewAttendanceHistory, downloadAttendanceHistory } from '../controllers/attendanceControllers.js';
import { isLecturer } from '../middleware/lecturerAuth.js';

const router = express.Router();

// Multer setup for memory storage (to process with face-api.js)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});

// Apply to all attendance routes
router.use(limiter);

router.post('/start-session', isLecturer, startAttendanceSession);
router.post('/validate-enrollment', isLecturer, validateEnrollment);
router.post('/mark', isLecturer, markAttendance);

// New route for marking attendance with face verification
router.post('/mark-with-face', isLecturer, upload.single('verificationImage'), markAttendanceWithFace);

router.post('/close-session', isLecturer, closeAttendanceSession);

// View attendance history (JSON)
router.get('/history/:courseId', isLecturer, viewAttendanceHistory);
// Download attendance history (CSV)
router.get('/history/:courseId/download', isLecturer, downloadAttendanceHistory);

export default router;