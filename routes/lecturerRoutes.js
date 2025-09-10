import express from 'express'
const router = express.Router();
import { registerLecturer, lecturerLogin, createCourse } from '../controllers/lecturerControllers.js';
import { isLecturer } from '../middleware/lecturerAuth.js';
import upload from '../middleware/multer.js';
import { uploadLecturerPassport } from '../controllers/lecturerControllers.js';

//const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', registerLecturer);
router.post('/login', lecturerLogin);
//router.get('/profile', authenticateToken, getLecturerProfile);    
router.post('/courses', isLecturer, createCourse);
router.post('/upload-passport/:lecturerId', upload.single('passport'), uploadLecturerPassport);


export default router