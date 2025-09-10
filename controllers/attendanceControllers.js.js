import attendanceModel from '../models/attendanceModel.js';
import studentModel from '../models/studentModel.js';
import courseModel from '../models/courseModel.js';
import attendanceSessionModel from '../models/attendanceSessionModel.js';

export const startAttendanceSession = async (req, res) => {
    const { courseId } = req.body;
    const lecturerId = req.user.id; // assuming authentication middleware

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