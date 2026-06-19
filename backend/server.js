const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

// Middleware
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});