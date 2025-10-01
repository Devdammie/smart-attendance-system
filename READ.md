# Smart Attendance System

A Node.js, Express, and MongoDB-based backend for a smart attendance system using QR codes, passport uploads, and role-based authentication for students and lecturers.

---

## Features

- **Student Registration & Login**
- **Lecturer Registration & Login**
- **JWT Authentication & Authorization**
- **Student Passport Upload (with Multer)**
- **Lecturer Passport Upload**
- **QR Code Generation for Students**
- **QR Code Download for Students**
- **Auto-assign Courses to Students by Department/Part**
- **Lecturer Course Creation**
- **Attendance Session Management (Start/Close)**
- **QR Code Scanning for Attendance**
- **Attendance Marking and History**
- **Attendance History Download (CSV)**
- **Security: Input validation, rate limiting, ownership checks**

---

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- Multer (file uploads)
- jsonwebtoken (JWT)
- bcryptjs (password hashing)
- qrcode (QR code generation)
- json2csv (CSV export)
- express-rate-limit (rate limiting)
- CORS, Helmet (security)

---

## Setup

1. **Clone the repository**
    ```sh
    git clone https://github.com/yourusername/smart_attendance_system.git
    cd smart_attendance_system
    ```

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Set up environment variables**

    Create a `.env` file in the root directory:
    ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```

4. **Run the server**
    ```sh
    npm start
    ```
    The server runs on `http://localhost:5000` by default.

---

## API Endpoints

### Student Endpoints

| Method | Endpoint                                      | Description                        |
|--------|-----------------------------------------------|------------------------------------|
| POST   | `/api/students/register`                      | Register a new student             |
| POST   | `/api/students/login`                         | Student login                      |
| POST   | `/api/students/logout`                        | Student logout (JWT required)      |
| POST   | `/api/students/upload-passport/:studentId`    | Upload student passport (JWT)      |
| POST   | `/api/students/generate-qr/:studentId`        | Generate QR code (JWT)             |
| GET    | `/api/students/download-qr/:studentId`        | Download QR code (JWT)             |

### Lecturer Endpoints

| Method | Endpoint                                      | Description                        |
|--------|-----------------------------------------------|------------------------------------|
| POST   | `/api/lecturers/register`                     | Register a new lecturer            |
| POST   | `/api/lecturers/login`                        | Lecturer login                     |
| POST   | `/api/lecturers/logout`                       | Lecturer logout (JWT required)     |
| POST   | `/api/lecturers/upload-passport/:lecturerId`  | Upload lecturer passport (JWT)     |
| POST   | `/api/lecturers/courses`                      | Create a course (JWT)              |

### Attendance Endpoints

| Method | Endpoint                                      | Description                        |
|--------|-----------------------------------------------|------------------------------------|
| POST   | `/api/attendance/start-session`               | Start attendance session (JWT)     |
| POST   | `/api/attendance/close-session`               | Close attendance session (JWT)     |
| POST   | `/api/attendance/validate-enrollment`         | Validate student enrollment (JWT)  |
| POST   | `/api/attendance/mark`                        | Mark attendance (JWT)              |
| GET    | `/api/attendance/history/:courseId`           | View attendance history (JWT)      |
| GET    | `/api/attendance/history/:courseId/download`  | Download attendance history (CSV)  |

---

## Usage Notes

- **All protected routes require a valid JWT token in the `Authorization` header:**  
  `Authorization: Bearer <token>`
- **File uploads** (passport): Use `multipart/form-data` with the key `passport`.
- **Only students can access their own resources** (passport, QR code).
- **Lecturers can only manage their own courses and sessions.**

---

## Security

- Input validation and ownership checks on all sensitive routes.
- Rate limiting on attendance endpoints.
- JWT-based authentication.
- File type and size restrictions on uploads.

---

## Deployment

- Works on Render, Heroku, or any Node.js hosting.
- Ensure all environment variables are set in your deployment dashboard.

---

## License

MIT

---

## Author

DevDammie 

