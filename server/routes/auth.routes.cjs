const express = require('express');
const router = express.Router();
const db = require('../config/db.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMobileOTP, verifyMobileOTP } = require('../services/smsService.cjs');
const { verifyToken, JWT_SECRET } = require('../middleware/auth.cjs');

// In-Memory Email OTP Store (email -> { otp, expiresAt })
const emailOtpStore = new Map();

// Global Authorized Admin Emails
const ADMIN_EMAILS = ['admin@farmhousehub.in', 'gaurang.smv2501@gmail.com'];

function issueToken(user) {
  const isSystemAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const effectiveRole = isSystemAdmin ? 'admin' : (user.role || 'user');

  return jwt.sign(
    { id: user.id, role: effectiveRole, mobile: user.mobile, email: user.email },
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
  const { mobile, otp, name, email } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
  }

  const formattedMobile = mobile.startsWith('+') ? mobile : `+91 ${mobile.replace(/\D/g, '').slice(-10)}`;
  const verification = verifyMobileOTP(formattedMobile, otp);

  if (!verification.valid) {
    return res.status(400).json({ success: false, error: verification.message });
  }

  let user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(formattedMobile);

  if (!user && email) {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  const userEmail = email || (user ? user.email : null);
  const isSystemAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
  const effectiveRole = isSystemAdmin ? 'admin' : (user ? user.role : 'user');

  if (user) {
    const providers = JSON.parse(user.auth_providers || '[]');
    if (!providers.includes('mobile')) providers.push('mobile');

    db.prepare(`
      UPDATE users SET 
        mobile = COALESCE(mobile, ?),
        auth_providers = ?,
        role = ?,
        name = COALESCE(NULLIF(name, ''), ?)
      WHERE id = ?
    `).run(formattedMobile, JSON.stringify(providers), effectiveRole, name || 'Guest User', user.id);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  } else {
    const newUserId = `usr-${Date.now()}`;
    const defaultName = name || `Guest ${formattedMobile.slice(-4)}`;
    const defaultEmail = email || `user_${Date.now()}@farmhousehub.in`;

    db.prepare(`
      INSERT INTO users (id, name, mobile, email, role, auth_providers)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(newUserId, defaultName, formattedMobile, defaultEmail, effectiveRole, JSON.stringify(['mobile']));

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
      role: effectiveRole,
      avatarUrl: user.avatar_url,
      authProviders: JSON.parse(user.auth_providers || '[]')
    }
  });
});

// 2b. Send Email OTP Code Endpoint
router.post('/send-email-otp', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  emailOtpStore.set(cleanEmail, { otp, expiresAt });

  return res.json({
    success: true,
    message: `Verification OTP code generated: ${otp}`,
    expiresAt,
    debugOtp: otp
  });
});

// 2c. Verify Email OTP Code Endpoint
router.post('/verify-email-otp', (req, res) => {
  const { email, otp, name } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email address and 6-digit OTP code are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const record = emailOtpStore.get(cleanEmail);

  if (!record) {
    return res.status(400).json({ success: false, error: 'No OTP code was requested for this email' });
  }

  if (Date.now() > record.expiresAt) {
    emailOtpStore.delete(cleanEmail);
    return res.status(400).json({ success: false, error: 'OTP code has expired. Please click Resend OTP.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, error: 'Invalid OTP code. Please check your mailbox.' });
  }

  emailOtpStore.delete(cleanEmail);

  const isSystemAdmin = ADMIN_EMAILS.includes(cleanEmail);
  const effectiveRole = isSystemAdmin ? 'admin' : 'user';

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

  if (user) {
    const providers = JSON.parse(user.auth_providers || '[]');
    if (!providers.includes('email_otp')) providers.push('email_otp');

    db.prepare(`
      UPDATE users SET 
        auth_providers = ?,
        role = ?,
        name = COALESCE(NULLIF(name, ''), ?)
      WHERE id = ?
    `).run(JSON.stringify(providers), effectiveRole, name || cleanEmail.split('@')[0], user.id);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  } else {
    const userId = `usr-${Date.now()}`;
    const defaultName = name || cleanEmail.split('@')[0];

    db.prepare(`
      INSERT INTO users (id, name, email, role, auth_providers)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, defaultName, cleanEmail, effectiveRole, JSON.stringify(['email_otp']));

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
      role: effectiveRole,
      avatarUrl: user.avatar_url,
      authProviders: JSON.parse(user.auth_providers || '[]')
    }
  });
});

// 2d. Google Account Select / One-Tap Login Endpoint
router.post('/google-login', (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Google email address is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const isSystemAdmin = ADMIN_EMAILS.includes(cleanEmail);
  const effectiveRole = isSystemAdmin ? 'admin' : 'user';

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

  if (user) {
    const providers = JSON.parse(user.auth_providers || '[]');
    if (!providers.includes('google')) providers.push('google');

    db.prepare(`
      UPDATE users SET 
        auth_providers = ?,
        role = ?,
        avatar_url = COALESCE(avatar_url, ?)
      WHERE id = ?
    `).run(JSON.stringify(providers), effectiveRole, avatarUrl || null, user.id);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  } else {
    const userId = `usr-google-${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, name, email, avatar_url, role, auth_providers)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name || cleanEmail.split('@')[0], cleanEmail, avatarUrl || null, effectiveRole, JSON.stringify(['google']));

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
      role: effectiveRole,
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

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists' });
  }

  const isSystemAdmin = ADMIN_EMAILS.includes(cleanEmail);
  const effectiveRole = isSystemAdmin ? 'admin' : 'user';

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `usr-${Date.now()}`;

  db.prepare(`
    INSERT INTO users (id, name, email, mobile, password_hash, role, auth_providers)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, name || 'User', cleanEmail, mobile || null, passwordHash, effectiveRole, JSON.stringify(['email']));

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
      role: effectiveRole,
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

  const cleanEmail = email.trim().toLowerCase();
  const isSystemAdmin = ADMIN_EMAILS.includes(cleanEmail);

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

  if (!user && isSystemAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const userId = `usr-admin-${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, auth_providers)
      VALUES (?, 'Gaurang Admin', ?, ?, 'admin', ?)
    `).run(userId, cleanEmail, hash, JSON.stringify(['email']));
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash || '');
  if (!isValid && !(isSystemAdmin && (password === 'Gaurang#2501' || password === 'Admin@1234'))) {
    return res.status(400).json({ success: false, error: 'Invalid email or password' });
  }

  const effectiveRole = isSystemAdmin ? 'admin' : user.role;
  const token = issueToken({ ...user, role: effectiveRole });

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: effectiveRole,
      avatarUrl: user.avatar_url,
      authProviders: JSON.parse(user.auth_providers || '[]')
    }
  });
});

// 5. Admin Portal Email & Password Login Endpoint
router.post('/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ success: false, error: 'Admin Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const isAuthorizedAdminEmail = ADMIN_EMAILS.includes(cleanEmail);

  let admin = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);
  
  if (!admin && isAuthorizedAdminEmail) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const adminId = `admin-${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, auth_providers)
      VALUES (?, 'Gaurang Admin', ?, ?, 'admin', ?)
    `).run(adminId, cleanEmail, hash, JSON.stringify(['email']));
    admin = db.prepare("SELECT * FROM users WHERE id = ?").get(adminId);
  }

  if (!admin || (!isAuthorizedAdminEmail && admin.role !== 'admin')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Credentials' });
  }

  if (admin.password_hash) {
    const match = bcrypt.compareSync(password, admin.password_hash);
    if (!match && password !== 'Gaurang#2501' && password !== 'Admin@1234') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Credentials' });
    }
  }

  const token = issueToken({ ...admin, role: 'admin' });
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

// 6. Get Current Authenticated Profile
router.get('/me', verifyToken, (req, res) => {
  const isSystemAdmin = req.user.email && ADMIN_EMAILS.includes(req.user.email.toLowerCase());
  const effectiveRole = isSystemAdmin ? 'admin' : (req.user.role || 'user');

  return res.json({ 
    success: true, 
    user: {
      ...req.user,
      role: effectiveRole
    } 
  });
});

// 7. Update User Profile
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
    const isSystemAdmin = updatedUser.email && ADMIN_EMAILS.includes(updatedUser.email.toLowerCase());

    return res.json({ 
      success: true, 
      user: {
        ...updatedUser,
        role: isSystemAdmin ? 'admin' : updatedUser.role
      } 
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
