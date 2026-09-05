require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes.cjs');
const propertyRoutes = require('./routes/property.routes.cjs');
const bookingRoutes = require('./routes/booking.routes.cjs');
const adminRoutes = require('./routes/admin.routes.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many OTP requests from this IP. Please try again after 15 minutes.' }
});

app.use('/api/auth/send-otp', otpLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'FarmhouseHub Full-Stack API Engine',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 FarmhouseHub API Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

// Keep process active
setInterval(() => {}, 60000);

module.exports = app;