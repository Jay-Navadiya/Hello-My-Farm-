const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMobileOTP, verifyMobileOTP } = require('../services/smsService');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Helper to sign JWT
function issueToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, mobile: user.mobile, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// 1. Mobile OTP Request Endpoint
router.post('/send-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number' });
  }

  try {
    const formattedMobile = mobile.startsWith('+') ? mobile : `+91 ${mobile.replace(/\D/g, '').slice(-10)}`;
    const result = sendMobileOTP(formattedMobile);
    return res.json({ success: true, message: result.message, expiresAt: result.expiresAt, debugOtp: result.debugOtp });
  } catch (err) {
    return res.status(429).json({ success: false, error: err.message });
  }
});

// 2. Mobile OTP Verification Endpoint
router.post('/verify-otp', (req, res) => {
  const { mobile, otp, name, email, dob } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
  }

  const formattedMobile = mobile.startsWith('+') ? mobile : `+91 ${mobile.replace(/\D/g, '').slice(-10)}`;
  const verification = verifyMobileOTP(formattedMobile, otp);

  if (!verification.valid) {
    return res.status(400).json({ success: false, error: verification.message });
  }

  // Check if user exists by mobile
  let user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(formattedMobile);

  if (!user) {
    // Check if account with same email exists (Account Linking)
    if (email) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }
  }

  if (user) {
    // Account exists -> update details & auth providers if needed
    const providers = JSON.parse(user.auth_providers || '[]');
    if (!providers.includes('mobile')) providers.push('mobile');

    db.prepare(`
      UPDATE users SET 
        mobile = COALESCE(mobile, ?),
        auth_providers = ?,
        name = COALESCE(NULLIF(name, ''), ?)
      WHERE id = ?
    `).run(formattedMobile, JSON.stringify(providers), name || 'Guest User', user.id);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  } else {
    // Create new account
    const newUserId = `usr-${Date.now()}`;
    const defaultName = name || `Guest ${formattedMobile.slice(-4)}`;
    const defaultEmail = email || `user_${Date.now()}@farmhousehub.in`;

    db.prepare(`
      INSERT INTO users (id, name, mobile, email, role, auth_providers)
      VALUES (?, ?, ?, ?, 'user', ?)
    `).run(newUserId, defaultName, formattedMobile, defaultEmail, JSON.stringify(['mobile']));

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId);
  }

  const token = issueToken(user);
  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      authProviders: JSON.parse(user.auth_providers || '[]')
    }
  });
});

// 3. Email Signup Endpoint
router.post('/email-signup', (req, res) => {
  const { name, email, password, mobile } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Email and password (min 6 chars) are required' });
  }

  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `usr-${Date.now()}`;

  db.prepare(`
    INSERT INTO users (id, name, email, mobile, password_hash, role, auth_providers)
    VALUES (?, ?, ?, ?, ?, 'user', ?)
  `).run(userId, name || 'User', email, mobile || null, passwordHash, JSON.stringify(['email']));

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const token = issueToken(user);

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      authProviders: ['email']
    }
  });
});

// 4. Email Login Endpoint
router.post('/email-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !user.password_hash) {
    return res.status(400).json({ success: false, error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(400).json({ success: false, error: 'Invalid email or password' });
  }

  const token = issueToken(user);
  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatarUrl: user.avatar_url,
      authProviders: JSON.parse(user.auth_providers || '[]')
    }
  });
});

// 5. Social OAuth Login Endpoint (Google & Facebook)
router.post('/social-login', (req, res) => {
  const { provider, socialId, name, email, avatarUrl, mobile } = req.body;
  if (!provider || (!email && !socialId)) {
    return res.status(400).json({ success: false, error: 'Provider and account credentials required' });
  }

  // Account Linking: Check if user exists by email or mobile
  let user = null;
  if (email) {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }
  if (!user && mobile) {
    user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
  }

  if (user) {
    const providers = JSON.parse(user.auth_providers || '[]');
    if (!providers.includes(provider)) providers.push(provider);

    db.prepare(`
      UPDATE users SET 
        auth_providers = ?,
        avatar_url = COALESCE(avatar_url, ?)
      WHERE id = ?
    `).run(JSON.stringify(providers), avatarUrl || null, user.id);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  } else {
    const userId = `usr-social-${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, name, email, mobile, avatar_url, role, auth_providers)
      VALUES (?, ?, ?, ?, ?, 'user', ?)
    `).run(
      userId,
      name || 'Social User',
      email || `${provider}_${socialId}@farmhousehub.in`,
      mobile || null,
      avatarUrl || null,
      JSON.stringify([provider])
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }

  const token = issueToken(user);
  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatarUrl: user.avatar_url,
      authProviders: JSON.parse(user.auth_providers || '[]')
    }
  });
});

// 6. Admin Portal Email & Password Login Endpoint
router.post('/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Admin Email and password are required' });
  }

  const admin = db.prepare('SELECT * FROM users WHERE email = ? AND role = "admin"').get(email);
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Credentials' });
  }

  const match = bcrypt.compareSync(password, admin.password_hash);
  if (!match) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Credentials' });
  }

  const token = issueToken(admin);
  return res.json({
    success: true,
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      avatarUrl: admin.avatar_url
    }
  });
});

// 7. Get Current Authenticated Profile
router.get('/me', verifyToken, (req, res) => {
  return res.json({ success: true, user: req.user });
});

// 8. Update User Profile
router.put('/profile', verifyToken, (req, res) => {
  const { name, email, mobile, avatarUrl } = req.body;
  try {
    db.prepare(`
      UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        mobile = COALESCE(?, mobile),
        avatar_url = COALESCE(?, avatar_url)
      WHERE id = ?
    `).run(name, email, mobile, avatarUrl, req.user.id);

    const updatedUser = db.prepare('SELECT id, name, mobile, email, role, avatar_url FROM users WHERE id = ?').get(req.user.id);
    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
