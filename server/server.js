require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for Auth / OTP endpoints to prevent abuse
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { success: false, error: 'Too many OTP requests from this IP. Please try again after 15 minutes.' }
});

app.use('/api/auth/send-otp', otpLimiter);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'FarmhouseHub Full-Stack API Engine',
    timestamp: new Date().toISOString()
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 FarmhouseHub API Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

module.exports = app;
