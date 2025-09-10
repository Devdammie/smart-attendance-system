import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    departmentOption: { type: String, required: true },
    part: { type: String, required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    createdAt: { type: Date, default: Date.now }
});

const courseModel = mongoose.model('Course', courseSchema);
export default courseModel;