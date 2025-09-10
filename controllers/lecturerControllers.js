import lecturerModel from '../models/lecturerModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AttendanceSessionModel from '../models/attendanceSessionModel.js';
// import cron from 'node-cron';
import attendanceModel from '../models/attendanceModel.js';
import studentModel from '../models/studentModel.js';
import courseModel from '../models/courseModel.js';
import dotenv from 'dotenv';
import { isValidObjectId } from '../utils/validateObjectId.js';
dotenv.config();

const jwt_secret = process.env.JWT_SECRET;
//
export const registerLecturer = async (req, res) => {

    const { firstName, lastName, email, password } = req.body;
    console.log(" data receive", firstName, lastName, email, password);

    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "All field required!"})
        }

		// Validate email address. this code checks whether the provided email 
		//address is in a valid format by matching it against a regex pattern. 
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(email)) {
		  return res.status(400).json({ error: "Invalid email address!" });
		}
          
        // Check if email already exist in the database
		const userExistAsStudent = await studentModel.findOne({ email });
		const lecturer = await lecturerModel.findOne({ email });

		if (userExistAsStudent) {
			return res.status(401).json({ error: 'User already exist as Student!' });
		}

		if (lecturer) {
			return res.status(401).json({ error: 'User already exist.' });
		}

		// Hash password using bcrypt
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(password, salt);

		const newlecturer = await lecturerModel.create({ 
												firstName, 
												lastName, 
												email, 
												password: hashedPassword, 
												role: "lecturer" 
											});

        if (!newlecturer) {
            return res.status(401).json({ error: "Error creating account!"})
        }

		console.log("account created");
        return res.status(201).json({ message: "Account created!"});

	} catch (error) {
		console.log('Sign up error', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}

};




// Login function
export const lecturerLogin = async (req, res) => {
	const { email, password } = req.body;

	console.log("login details", email, password);

	try {
		if (!email || !password) {
			return res.status(400).json({ error: 'Please fill all required field!' });
		}

		const lecturer = await lecturerModel.findOne({ email });

		if (!lecturer) {
			return res.status(404).json({ error: 'Account does not exist!' });
		}

		const isPasswordValid = bcrypt.compareSync(password, lecturer.password);

		if (!isPasswordValid) {
			return res.status(401).json({ error: 'Invalid password' });
		}


		if (lecturer.role !== "lecturer") {
			return res.status(403).json({ error: "This login is for lecturers only!"})
		}
		 	// Create a Token
		const payload = { id: lecturer._id.toString() };
		const token = jwt.sign(payload, jwt_secret, {
			expiresIn: '1d',
			algorithm: 'HS256',
		});

		if (!token) {
			return res.status(500).json({ message: 'Error creating token!' });
		}

		console.log("cookie token is", token)
		return res.status(200).json({ id: lecturer._id, token });	

	} catch (error) {
		console.error("error sign in lecturer", error);
		return res.status(500).json({ error: 'Internal Server Error!' });
	}

};

// Create Course Controller
export const createCourse = async (req, res) => {
    const { name, code, department, departmentOption, part } = req.body;
    const lecturerId = req.user.id; // assuming you have authentication middleware that sets req.user

    if (!name || !code || !department || !departmentOption || !part) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if course code already exists
        const existing = await courseModel.findOne({ code });
        if (existing) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        const course = new courseModel({
            name,
            code,
            department,
            departmentOption,
            part,
            lecturer: lecturerId
        });

        await course.save();
        return res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const uploadLecturerPassport = async (req, res) => {
    const { lecturerId } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const passportPath = req.file.path.replace(/\\/g, '/');
        const updatedLecturer = await lecturerModel.findByIdAndUpdate(
            lecturerId,
            { passport: passportPath },
            { new: true }
        );
        if (!updatedLecturer) {
            return res.status(404).json({ message: 'Lecturer not found' });
        }
        return res.status(200).json({ message: 'Passport uploaded', passport: passportPath, lecturer: updatedLecturer });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

