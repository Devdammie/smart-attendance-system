import jwt from 'jsonwebtoken'
import lecturerModel from '../models/lecturerModel.js'
//require("dotenv").config();
import "dotenv/config";


const jwt_secret = process.env.JWT_SECRET;

export const isLecturer = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log("No Authorization header found for lecturer.");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log('Token:', token);

    const decoded = jwt.verify(token, jwt_secret);

    if (!decoded) {
      console.log("Session token expired or invalid!");
      return res.status(401).json({ error: "Session token expired or invalid!" });
    }

    console.log('Decoded token:', decoded);
    const lecturerId = decoded.id; // Extract student ID from decoded token

    const user = await lecturerModel.findById(lecturerId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "lecturer") {
      return res.status(403).json({ error: "Access forbidden: Not a lecturer" });
    }

    // Store student ID on the request object for use in subsequent middleware or routes
    //req.lecturerId = lecturerId; 

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying lecturer token", error);
    return res.status(401).json({ error: "Session token expired or invalid!" });
  }
};
