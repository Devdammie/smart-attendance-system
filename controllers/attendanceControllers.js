import attendanceModel from '../models/attendanceModel.js';
import courseModel from '../models/courseModel.js';
import studentModel from '../models/studentModel.js';
import { Parser } from 'json2csv'; // For CSV export
import attendanceSessionModel from '../models/attendanceSessionModel.js';
import { isValidObjectId } from '../utils/validateObjectId.js';
import { faceapi, image } from '../utils/faceapi.js';

export const startAttendanceSession = async (req, res) => {
    const { courseId } = req.body;
    const lecturerId = req.user.id; // assuming authentication middleware

    if (!isValidObjectId(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        // Check if course exists and belongs to lecturer
        const course = await courseModel.findOne({ _id: courseId, lecturer: lecturerId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or not assigned to you' });
        }

        // Optionally, check if there's already an active session for this course
        const activeSession = await attendanceSessionModel.findOne({ course: courseId, isActive: true });
        if (activeSession) {
            return res.status(400).json({ message: 'An attendance session is already active for this course' });
        }

        // Create new session
        const session = new attendanceSessionModel({
            course: courseId,
            lecturer: lecturerId
        });
        await session.save();

        return res.status(201).json({ message: 'Attendance session started', session });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const validateEnrollment = async (req, res) => {
    const { studentId, courseId } = req.body;
    const lecturerId = req.user.id; // from authentication middleware

    if (!isValidObjectId(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        // Check if student exists
        const student = await studentModel.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if course exists and belongs to lecturer
        const course = await courseModel.findOne({ _id: courseId, lecturer: lecturerId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or not assigned to you' });
        }

        // Check if student is enrolled in the course
        if (!student.courses.includes(courseId)) {
            return res.status(403).json({ message: 'Student not enrolled in this course' });
        }

        // Enrollment is valid
        return res.status(200).json({ message: 'Student is enrolled in this course', student });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const markAttendance = async (req, res) => {
    const { studentId, courseId, sessionId } = req.body;
    const lecturerId = req.user.id; // from authentication middleware

    if (!isValidObjectId(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        // Validate student, course, and session
        const student = await studentModel.findById(studentId);
        const course = await courseModel.findOne({ _id: courseId, lecturer: lecturerId });
        const session = await attendanceSessionModel.findOne({ _id: sessionId, course: courseId, isActive: true });

        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (!course) return res.status(404).json({ message: 'Course not found or not assigned to you' });
        if (!session) return res.status(404).json({ message: 'Active session not found for this course' });

        // Prevent duplicate attendance
        const alreadyMarked = await attendanceModel.findOne({ student: studentId, course: courseId, session: sessionId });
        if (alreadyMarked) {
            return res.status(400).json({ message: 'Attendance already marked for this student in this session' });
        }

        // Mark attendance
        const attendance = new attendanceModel({
            student: studentId,
            course: courseId,
            session: sessionId,
            markedBy: lecturerId
        });
        await attendance.save();

        return res.status(201).json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const markAttendanceWithFace = async (req, res) => {
    const { studentId, courseId, sessionId } = req.body;
    const lecturerId = req.user.id; // from authentication middleware

    if (!req.file) {
        return res.status(400).json({ message: 'No verification image provided.' });
    }

    if (!isValidObjectId(courseId) || !isValidObjectId(sessionId) || !isValidObjectId(studentId)) {
        return res.status(400).json({ message: 'Invalid ID provided.' });
    }

    try {
        // 1. Validate student, course, and session
        const student = await studentModel.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (!student.faceDescriptor || student.faceDescriptor.length === 0) {
            return res.status(400).json({ message: 'Student has not registered a face for verification.' });
        }

        const course = await courseModel.findOne({ _id: courseId, lecturer: lecturerId });
        if (!course) return res.status(404).json({ message: 'Course not found or not assigned to you' });

        const session = await attendanceSessionModel.findOne({ _id: sessionId, course: courseId, isActive: true });
        if (!session) return res.status(404).json({ message: 'Active session not found for this course' });

        // 2. Prevent duplicate attendance
        const alreadyMarked = await attendanceModel.findOne({ student: studentId, session: sessionId });
        if (alreadyMarked) {
            return res.status(400).json({ message: 'Attendance already marked for this student in this session' });
        }

        // 3. Perform Face Verification
        const verificationImg = await image(req.file.buffer);
        const result = await faceapi.detectSingleFace(verificationImg).withFaceLandmarks().withFaceDescriptor();

        if (!result) {
            return res.status(400).json({ message: 'No face detected in the verification image.' });
        }

        const storedDescriptor = new Float32Array(student.faceDescriptor);
        const faceMatcher = new faceapi.FaceMatcher([storedDescriptor]);
        const bestMatch = faceMatcher.findBestMatch(result.descriptor);

        // A distance threshold of 0.6 is standard. Lower is more strict.
        if (bestMatch.label === 'unknown' || bestMatch.distance > 0.5) {
             return res.status(401).json({ message: `Face verification failed. Match distance: ${bestMatch.distance.toFixed(2)}` });
        }

        // 4. Mark attendance
        const attendance = new attendanceModel({
            student: studentId,
            course: courseId,
            session: sessionId,
            markedBy: lecturerId
        });
        await attendance.save();

        return res.status(201).json({ message: 'Attendance marked successfully via face verification.', attendance });
    } catch (error) {
        console.error('Error during facial attendance marking:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const closeAttendanceSession = async (req, res) => {
    const { sessionId } = req.body;
    const lecturerId = req.user.id; // from authentication middleware

    try {
        // Find session and ensure it belongs to the lecturer and is active
        const session = await attendanceSessionModel.findOne({
            _id: sessionId,
            lecturer: lecturerId,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({ message: 'Active session not found or not assigned to you' });
        }

        // Close session
        session.isActive = false;
        session.endedAt = new Date();
        await session.save();

        return res.status(200).json({ message: 'Attendance session closed', session });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// View attendance history for a course
export const viewAttendanceHistory = async (req, res) => {
    const { courseId } = req.params;
    const lecturerId = req.user.id; // from auth middleware

    if (!isValidObjectId(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        // Ensure course belongs to lecturer
        const course = await courseModel.findOne({ _id: courseId, lecturer: lecturerId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or not assigned to you' });
        }

        // Get attendance records for this course
        const attendanceRecords = await attendanceModel.find({ course: courseId })
            .populate('student', 'firstName lastName matricNumber email')
            .populate('session', 'startedAt endedAt')
            .sort({ timestamp: -1 });

        return res.status(200).json({ attendance: attendanceRecords });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Download attendance history as CSV
export const downloadAttendanceHistory = async (req, res) => {
    const { courseId } = req.params;
    const lecturerId = req.user.id;

    if (!isValidObjectId(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        // Ensure course belongs to lecturer
        const course = await courseModel.findOne({ _id: courseId, lecturer: lecturerId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or not assigned to you' });
        }

        // Get attendance records
        const attendanceRecords = await attendanceModel.find({ course: courseId })
            .populate('student', 'firstName lastName matricNumber email')
            .populate('session', 'startedAt endedAt')
            .sort({ timestamp: -1 });

        // Function to sanitize data for CSV export
        function sanitizeForCSV(value) {
            if (typeof value === 'string' && /^[=+\-@]/.test(value)) {
                return "'" + value;
            }
            return value;
        }

        // Prepare data for CSV
        const data = attendanceRecords.map(record => ({
            firstName: sanitizeForCSV(record.student.firstName),
            lastName: sanitizeForCSV(record.student.lastName),
            matricNumber: sanitizeForCSV(record.student.matricNumber),
            email: sanitizeForCSV(record.student.email),
            sessionStart: record.session?.startedAt,
            sessionEnd: record.session?.endedAt,
            markedBy: record.markedBy,
            timestamp: record.timestamp
        }));

        const json2csv = new Parser();
        const csv = json2csv.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment(`attendance_${course.code}.csv`);
        return res.send(csv);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};