const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Middleware
const authMiddleware = require('./middleware/authMiddleware');

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'API running', status: 'success' });
});

// Auth Routes (public)
app.use('/api/auth', authRoutes);

// Resume Routes (protected)
app.use('/api/resume', authMiddleware, resumeRoutes);

// AI Routes (protected)
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
});