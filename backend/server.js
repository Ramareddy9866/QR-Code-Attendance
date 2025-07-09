const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const startSessionExpiryJob = require('./jobs/sessionExpiryJob');

dotenv.config();
connectDB();

const app = express();

const allowedOrigin = 'https://qr-code-attendance-bay.vercel.app';

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.options('*', cors({
  origin: allowedOrigin,
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/student', require('./routes/studentRoutes'));

startSessionExpiryJob();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
