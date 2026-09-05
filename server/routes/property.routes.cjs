const express = require('express');
const router = express.Router();
const db = require('../config/db.cjs');
const { verifyToken, requireOwnerOrAdmin } = require('../middleware/auth.cjs');

function safeParseJson(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

// Helper to format property output
function formatProperty(p) {
  return {
    id: p.id,
    ownerId: p.owner_id,
    title: p.title,
    propertyType: p.property_type,
    description: p.description,
    address: p.address,
    cityId: p.city_id,
    areaName: p.area_name,
    mapCoordinates: { lat: p.lat || 21.1702, lng: p.lng || 72.8311 },
    price6h: p.price_6h,
    price12h: p.price_12h,
    price24h: p.price_24h,
    securityDeposit: p.security_deposit,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    sqft: p.sqft,
    maxStayGuests: p.max_stay_guests,
    maxDayGuests: p.max_day_guests,
    images: safeParseJson(p.images, ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80']),
    amenities: safeParseJson(p.amenities, [{ name: 'Private Swimming Pool', icon: 'Waves' }]),
    status: p.status, // 'pending', 'approved', 'rejected'
    rejectionReason: p.rejection_reason,
    rating: 4.90,
    reviewCount: 42,
    isTopRated: true,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
}

// 0. GET & POST Site Config (Global Real-time Theme & Banner Sync)
router.get('/site-config', (req, res) => {
  const row = db.prepare("SELECT value FROM site_config WHERE key = 'theme'").get();
  if (row && row.value) {
    try {
      return res.json({ success: true, theme: JSON.parse(row.value) });
    } catch (e) {}
  }
  return res.json({ success: true, theme: null });
});

router.post('/site-config', verifyToken, (req, res) => {
  const userEmail = (req.user.email || '').toLowerCase();
  const isAdmin = req.user.role === 'admin' || userEmail === 'gaurang.smv2501@gmail.com' || userEmail === 'admin@farmhousehub.in';
  if (!isAdmin) {
    return res.status(403).json({ success: false, error: 'Unauthorized: Admin role required' });
  }

  const { theme } = req.body;
  if (!theme) return res.status(400).json({ success: false, error: 'Theme payload required' });

  db.prepare(`
    INSERT INTO site_config (key, value) VALUES ('theme', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(JSON.stringify(theme));

  return res.json({ success: true, message: 'Global site theme synced live!', theme });
});

// 1. GET Public Approved Properties ONLY
router.get('/', (req, res) => {
  const { cityId, areaId, searchQuery, minGuests } = req.query;
  let sql = 'SELECT * FROM properties WHERE status = ?';
  const params = ['approved'];

  if (cityId) {
    sql += ' AND city_id = ?';
    params.push(cityId);
  }

  if (areaId && areaId !== 'all') {
    sql += ' AND area_name LIKE ?';
    params.push(`%${areaId}%`);
  }

  if (minGuests) {
    sql += ' AND (max_day_guests >= ? OR max_stay_guests >= ?)';
    params.push(Number(minGuests), Number(minGuests));
  }

  if (searchQuery) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR area_name LIKE ?)';
    const q = `%${searchQuery}%`;
    params.push(q, q, q);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  return res.json({ success: true, properties: rows.map(formatProperty) });
});

// 2. GET My Properties (User's own submissions)
router.get('/my-properties', verifyToken, (req, res) => {
  const rows = db.prepare('SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC').all(req.user.id);
  return res.json({ success: true, properties: rows.map(formatProperty) });
});

// 3. GET Single Property Details
router.get('/:id', (req, res) => {
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!prop) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }
  return res.json({ success: true, property: formatProperty(prop) });
});

// 3b. GET Booked Dates Range for Property
router.get('/:id/booked-dates', (req, res) => {
  const propertyId = req.params.id;
  const rows = db.prepare(`
    SELECT check_in_date, check_out_date, slot_type
    FROM bookings
    WHERE property_id = ?
      AND booking_status IN ('confirmed', 'payment_pending')
  `).all(propertyId);

  const bookedRanges = rows.map(r => ({
    checkInDate: r.check_in_date,
    checkOutDate: r.check_out_date || r.check_in_date,
    slotType: r.slot_type
  }));

  return res.json({ success: true, bookedRanges });
});

// 3c. GET Owner Bookings (Bookings ONLY for properties owned by logged-in user)
router.get('/owner-bookings/list', verifyToken, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, p.title as property_name, p.images as property_images, u.name as guest_name, u.mobile as guest_mobile, u.email as guest_email
    FROM bookings b
    JOIN properties p ON b.property_id = p.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE p.owner_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);

  const bookings = rows.map(b => ({
    id: b.id,
    propertyId: b.property_id,
    propertyName: b.property_name,
    guestName: b.guest_name || 'Guest User',
    guestMobile: b.guest_mobile || 'N/A',
    guestEmail: b.guest_email || 'N/A',
    checkInDate: b.check_in_date,
    checkOutDate: b.check_out_date || b.check_in_date,
    slotType: b.slot_type,
    slotLabel: b.slot_label,
    guestCount: b.guest_count,
    totalAmount: b.total_amount,
    bookingStatus: b.booking_status,
    paymentStatus: b.payment_status,
    createdAt: b.created_at
  }));

  return res.json({ success: true, bookings });
});

// 4. POST Submit New Property (User -> Status: Pending Approval)
router.post('/', verifyToken, (req, res) => {
  const {
    title, propertyType, description, address, cityId, areaName, lat, lng,
    price6h, price12h, price24h, securityDeposit, bedrooms, bathrooms, sqft,
    maxStayGuests, maxDayGuests, images, amenities
  } = req.body;

  if (!title || !cityId || !address) {
    return res.status(400).json({ success: false, error: 'Title, City, and Address are required' });
  }

  const newId = `fh-${Date.now()}`;
  const imagesJson = JSON.stringify(images || [
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
  ]);
  const amenitiesJson = JSON.stringify(amenities || [
    { name: 'Private Swimming Pool', icon: 'Waves' },
    { name: 'Full Central AC', icon: 'Wind' }
  ]);

  db.prepare(`
    INSERT INTO properties (
      id, owner_id, title, property_type, description, address, city_id, area_name,
      lat, lng, price_6h, price_12h, price_24h, security_deposit, bedrooms, bathrooms,
      sqft, max_stay_guests, max_day_guests, images, amenities, status
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, 'pending'
    )
  `).run(
    newId, req.user.id, title, propertyType || 'Villa', description || '', address, cityId, areaName || 'Central',
    lat || 21.1702, lng || 72.8311, price6h || 4000, price12h || 7000, price24h || 12000, securityDeposit || 2500,
    bedrooms || 3, bathrooms || 3, sqft || 15000, maxStayGuests || 12, maxDayGuests || 35,
    imagesJson, amenitiesJson
  );

  const createdProp = db.prepare('SELECT * FROM properties WHERE id = ?').get(newId);

  return res.json({
    success: true,
    message: 'Property submitted successfully! Status is currently Pending Approval.',
    property: formatProperty(createdProp)
  });
});

// 5. PUT Edit Own Property
router.put('/:id', verifyToken, requireOwnerOrAdmin, (req, res) => {
  const p = req.property;
  const {
    title, propertyType, description, address, cityId, areaName,
    price6h, price12h, price24h, securityDeposit, bedrooms, bathrooms,
    sqft, maxStayGuests, maxDayGuests, images, amenities
  } = req.body;

  const newStatus = (req.user.role !== 'admin' && p.status === 'approved') ? 'pending' : p.status;

  db.prepare(`
    UPDATE properties SET
      title = COALESCE(?, title),
      property_type = COALESCE(?, property_type),
      description = COALESCE(?, description),
      address = COALESCE(?, address),
      city_id = COALESCE(?, city_id),
      area_name = COALESCE(?, area_name),
      price_6h = COALESCE(?, price_6h),
      price_12h = COALESCE(?, price_12h),
      price_24h = COALESCE(?, price_24h),
      security_deposit = COALESCE(?, security_deposit),
      bedrooms = COALESCE(?, bedrooms),
      bathrooms = COALESCE(?, bathrooms),
      sqft = COALESCE(?, sqft),
      max_stay_guests = COALESCE(?, max_stay_guests),
      max_day_guests = COALESCE(?, max_day_guests),
      images = COALESCE(?, images),
      amenities = COALESCE(?, amenities),
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title, propertyType, description, address, cityId, areaName,
    price6h, price12h, price24h, securityDeposit, bedrooms, bathrooms,
    sqft, maxStayGuests, maxDayGuests,
    images ? JSON.stringify(images) : null,
    amenities ? JSON.stringify(amenities) : null,
    newStatus,
    p.id
  );

  const updatedProp = db.prepare('SELECT * FROM properties WHERE id = ?').get(p.id);

  return res.json({
    success: true,
    message: newStatus === 'pending' 
      ? 'Property updated successfully! Re-submitted for Admin approval review.' 
      : 'Property updated successfully!',
    property: formatProperty(updatedProp)
  });
});

// 6. DELETE Property
router.delete('/:id', verifyToken, requireOwnerOrAdmin, (req, res) => {
  db.prepare('DELETE FROM properties WHERE id = ?').run(req.property.id);
  return res.json({ success: true, message: 'Property deleted successfully' });
});

module.exports = router;
