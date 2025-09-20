import jwt from "jsonwebtoken"
import studentModel from "../models/studentModel.js"
//require("dotenv").config();
import "dotenv/config";


const jwt_secret = process.env.JWT_SECRET;

export const isStudent = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log("No Authorization header found for Student.");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log('Token:', token);

    const decoded = jwt.verify(token, jwt_secret);

    if (!decoded) {
        return res.status(401).json({ error: "Session token expired or invalid!" });
    }

    console.log('decoded is', decoded)
    const student_id = decoded.id;; // Extract student ID from decoded token

    const user = await studentModel.findById(student_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "student") {
      return res.status(403).json({ error: "Access forbidden: Not a student" });
    }

    // Store user on the request object for use in subsequent middleware or routes
    req.user = user;

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token", error);
    return res.status(401).json({ error: "Session token expired or invalid!" });
  }
};
