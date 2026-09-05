const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'farmhouse_hub_jwt_super_secret_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, mobile, email, role, avatar_url FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token expired or invalid signature' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied: Admin privileges required' });
  }
  next();
}

function requireOwnerOrAdmin(req, res, next) {
  const propertyId = req.params.id || req.body.propertyId;
  if (!propertyId) {
    return res.status(400).json({ success: false, error: 'Property ID missing' });
  }

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
  if (!property) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }

  if (req.user.role !== 'admin' && property.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Permission denied: You can edit only your own property' });
  }

  req.property = property;
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireOwnerOrAdmin,
  JWT_SECRET
};
