import express from 'express';
import {
  registerStudent,
  loginStudent,
  logoutStudent,
  uploadPassport,
  generateStudentQRCode,
  downloadStudentQRCode
} from '../controllers/studentControllers.js';
import upload from '../middleware/multer.js';
import { isStudent } from '../middleware/studentAuth.js';
import { ensureSelf } from '../middleware/ensureSelf.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/logout', isStudent, logoutStudent);


// Passport upload route
router.post(
  '/upload-passport/:studentId',
  isStudent,
  ensureSelf,
  upload.single('passport'),
  uploadPassport
);

router.post(
  '/generate-qr/:studentId',
  isStudent,
  ensureSelf,
  generateStudentQRCode
);

router.get(
  '/download-qr/:studentId',
  isStudent,
  ensureSelf,
  downloadStudentQRCode
);

export default router;