# QR-Code-Attendance

QR-Code-Attendance is a full-stack web app for managing classroom attendance using QR codes. Admins can create sessions, generate QR codes, enroll students, and view attendance logs. Students scan QR codes to mark attendance. The platform features a modern, responsive Material-UI interface.

## Features
- User authentication (register, login, password reset)
- Admin dashboard for managing subjects, students, and sessions
- Generate and invalidate QR codes for attendance
- Enroll students in subjects
- Students scan QR codes to mark attendance
- View attendance history and logs
- Responsive, modern UI (Material-UI)
- Email notifications for password resets

## Project Structure
QR-Code-Attendance/
  ├── backend/      # Node.js/Express backend API
  └── frontend/     # React frontend (Create React App)

## Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)
- MongoDB (local or cloud, e.g., MongoDB Atlas)

## Setup Instructions

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd QR-Code-Attendance
```

### 2. Backend Setup
```sh
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the `backend/` directory with the following (example):
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
FRONTEND_URL=http://localhost:3000
```

#### Start the Backend Server
```sh
npm run dev
```
The backend will run on http://localhost:5000 by default.

### 3. Frontend Setup
```sh
cd ../frontend
npm install
```

#### Environment Variables
Create a `.env` file in the `frontend/` directory with the following (example):
```
REACT_APP_API_URL=http://localhost:5000
```

#### Start the Frontend
```sh
npm start
```
The frontend will run on http://localhost:3000 by default.

## Usage
- Register a new user or log in.
- Admin: Add subjects, enroll students, generate QR codes, view logs.
- Student: Scan QR codes to mark attendance, view attendance history.

## Tech Stack
- **Frontend:** React, Material-UI, React Router, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer, QRCode
- **Other:** Email notifications, cron jobs for session expiry




