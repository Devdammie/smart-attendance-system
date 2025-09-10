import mongoose from 'mongoose';

const lecturerSchema = new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true},
    role:{type: String, default: 'lecturer'},
    passport: {
        type: String, // file path or URL
        default: ''
    }
})

const lecturerModel = mongoose.models.lecturer || mongoose.model('lecturer', lecturerSchema);
export default lecturerModel;