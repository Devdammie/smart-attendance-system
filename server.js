import express from 'express';
import mongoose from 'mongoose';
import "dotenv/config";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import studentRoutes from './routes/studentRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import path from 'path';
import { loadModels } from './utils/faceapi.js';
const app = express();



// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

app.get('/', (req, res)=>{
    res.send('Hello from the server');
})

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/lecturers', lecturerRoutes);
//app.use('')
 
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await loadModels();
    console.log(`Server running on port ${PORT}`);
  });
});