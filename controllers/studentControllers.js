import studentModel from '../models/studentModel.js';
import attendanceSessionModel from '../models/attendanceSessionModel.js';
import attendanceModel from '../models/attendanceModel.js';
import lecturerModel from '../models/lecturerModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { image, faceapi } from '../utils/faceapi.js';
import fs from 'fs';
import path from 'path';

const jwtSecret = process.env.JWT_SECRET;

// Student Registration
export const registerStudent = async (req, res) => {
    const { firstName, lastName, email, password, matricNumber, department, departmentOption, part } = req.body;
    console.log('Received registration data:', req.body);

    // Check for missing fields
    if (!firstName || !lastName || !email || !password || !matricNumber || !department || !departmentOption || !part) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check for existing student by email or matricNumber
        const existingStudent = await studentModel.findOne({ $or: [{ email }, { matricNumber }] });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this email or matric number already exists' });
        }
         // Validate email address. this code checks whether the provided email 
		//address is in a valid format by matching it against a regex pattern. 
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(email)) {
		  return res.status(400).json({ error: "Invalid email address!" });
		}

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const newStudent = new studentModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            matricNumber,
            department,
            departmentOption,
            part
        });

        await newStudent.save();
        console.log('Student registered:', newStudent);

        return res.status(201).json({ message: 'Student registered successfully', student: newStudent });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Student Login
export const loginStudent = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
       
        const student = await studentModel.findOne({ email }); // FIXED HERE
        if (!student) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // fixed typo: should be 1000 not 10000
        });
        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

// Student Logout
export const logoutStudent = (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none': 'strict',
        });
        return res.status(200).json({message: 'Logout successful'}); 
    }catch(error){
        return res.status(500).json({message: 'Server error'});
    }
}

// Upload Passport Controller
export const uploadPassport = async (req, res) => {
    const { studentId } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const passportPath = req.file.path.replace(/\\/g, '/'); // for Windows path compatibility
        const updatedStudent = await studentModel.findByIdAndUpdate(
            studentId,
            { passport: passportPath },
            { new: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.status(200).json({ message: 'Passport uploaded', passport: passportPath, student: updatedStudent });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Generate QR Code Controller
export const generateStudentQRCode = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await studentModel.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Data to encode in QR (customize as needed)
        const qrData = JSON.stringify({ studentId: student._id, matricNumber: student.matricNumber });

        // Ensure directory exists
        const qrDir = path.join(process.cwd(), 'uploads', 'qrcodes');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        // File path for QR image
        const qrFileName = `${student._id}_qrcode.png`;
        const qrFilePath = path.join(qrDir, qrFileName);

        // Generate and save QR code image
        await QRCode.toFile(qrFilePath, qrData);

        // Store relative path in DB for serving
        const relativePath = `uploads/qrcodes/${qrFileName}`;
        student.qrCode = relativePath;
        await student.save();

        return res.status(200).json({ message: 'QR code generated', qrCodePath: relativePath });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Download QR Code Controller
export const downloadStudentQRCode = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await studentModel.findById(studentId);
        if (!student || !student.qrCode) {
            return res.status(404).json({ message: 'QR code not found for this student' });
        }
        const qrPath = path.join(process.cwd(), student.qrCode);
        if (!fs.existsSync(qrPath)) {
            return res.status(404).json({ message: 'QR code image file not found' });
        }
        res.download(qrPath, `${student.matricNumber}_qrcode.png`);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const registerFace = async (req, res) => {
    const { studentId } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    try {
        const student = await studentModel.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Process the image from buffer
        const img = await image(req.file.buffer);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (!detections) {
            return res.status(400).json({ message: 'No face detected in the image. Please upload a clear picture of your face.' });
        }

        // Save the face descriptor to the student model
        student.faceDescriptor = Array.from(detections.descriptor);
        await student.save();

        return res.status(200).json({ message: 'Face registered successfully.' });
    } catch (error) {
        console.error('Face registration error:', error);
        return res.status(500).json({ message: 'Server error during face registration.' });
    }
};
