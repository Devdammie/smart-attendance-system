import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date }, // Optional: for closing attendance
    isActive: { type: Boolean, default: true }
});

const attendanceSessionModel = mongoose.model('AttendanceSession', attendanceSessionSchema);
export default attendanceSessionModel;