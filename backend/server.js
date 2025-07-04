const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const startSessionExpiryJob = require('./jobs/sessionExpiryJob');

dotenv.config();
connectDB();

const app = express();
app.use(cors({
     origin: 'https://qr-code-attendance-bay.vercel.app',
     credentials: true
   }));
app.use(express.json());

app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/student', require('./routes/studentRoutes'));

startSessionExpiryJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
