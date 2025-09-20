// models/Attendance.js
import mongoose from 'mongoose';


const attendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    timestamp: { type: Date, default: Date.now }
});

const attendanceModel = mongoose.model('Attendance', attendanceSchema);

export default attendanceModel