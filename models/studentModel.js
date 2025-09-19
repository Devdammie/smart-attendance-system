import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    firstName:{type: String, required: true},
    lastName:{type: String, required: true},
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true},
    matricNumber:{type: String || Number , required: true, unique: true},
    department:{type: String, required: true},
    departmentOption:{type: String},
    part:{type: Number, required: true},
    role:{type: String, default: 'student'},
    passport: {
      type: String, // store file path or URL
      default: ''
    },
    qrCode: {
      type: String,
      default: ''
    },
     faceDescriptor: {
      type: [Number],
      required: false,
      default: []
    },
   // verifyotp:{type: Number, default: ''},
   // verufyotpExpireAt:{type: Number, default: ''},
    //isAccountVerified:{type: Boolean, default: false},
  //  resetotp:{type: Number, default: ''},
   // resetotpExpireAt:{type: Number, default: 0}
    
}, {timestamps: true})

const studentModel = mongoose.models.student || mongoose.model('student', studentSchema);
export default studentModel;