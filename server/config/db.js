const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'farmhouse.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize Schemas
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      avatar_url TEXT,
      auth_providers TEXT, -- JSON array e.g. ["mobile", "google"]
      role TEXT DEFAULT 'user', -- 'user', 'owner', 'admin'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      property_type TEXT DEFAULT 'Villa',
      description TEXT,
      address TEXT,
      city_id TEXT NOT NULL,
      area_name TEXT NOT NULL,
      lat REAL,
      lng REAL,
      price_6h REAL DEFAULT 4000,
      price_12h REAL DEFAULT 7000,
      price_24h REAL DEFAULT 12000,
      security_deposit REAL DEFAULT 2500,
      bedrooms INTEGER DEFAULT 3,
      bathrooms INTEGER DEFAULT 3,
      sqft INTEGER DEFAULT 15000,
      max_stay_guests INTEGER DEFAULT 12,
      max_day_guests INTEGER DEFAULT 35,
      images TEXT, -- JSON array
      amenities TEXT, -- JSON array
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      slot_type TEXT NOT NULL,
      slot_label TEXT NOT NULL,
      guest_count INTEGER DEFAULT 1,
      rent_amount REAL NOT NULL,
      security_deposit REAL NOT NULL,
      total_amount REAL NOT NULL,
      booking_status TEXT DEFAULT 'confirmed',
      payment_status TEXT DEFAULT 'PAID',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (property_id) REFERENCES properties (id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      upi_transaction_id TEXT,
      payment_gateway TEXT DEFAULT 'Easebuzz UPI',
      dynamic_qr_url TEXT,
      status TEXT DEFAULT 'PAID',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    );

    CREATE TABLE IF NOT EXISTS otps (
      mobile TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  // Check if Admin exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@farmhousehub.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);

  let adminId = 'admin-user-01';
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);
    db.prepare(`
      INSERT INTO users (id, name, mobile, email, password_hash, role, auth_providers)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      'System Admin',
      '+91 99999 99999',
      adminEmail,
      hash,
      'admin',
      JSON.stringify(['email'])
    );
    console.log(`[DB Seed] Admin user created: ${adminEmail}`);
  } else {
    adminId = existingAdmin.id;
  }

  // Check if initial properties exist
  const propCount = db.prepare('SELECT count(*) as cnt FROM properties').get();
  if (propCount.cnt === 0) {
    const initialProps = [
      {
        id: 'fh-101',
        title: 'The Palm Royale Weekend Villa',
        city_id: 'surat',
        area_name: 'Dumas Road & Beach',
        price_6h: 4500,
        price_12h: 7500,
        price_24h: 12500,
        security_deposit: 3000,
        bedrooms: 4,
        bathrooms: 5,
        sqft: 18500,
        max_stay_guests: 16,
        max_day_guests: 45,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify([
          { name: 'Private Swimming Pool', icon: 'Waves' },
          { name: 'Rain Dance Arena', icon: 'CloudRain' },
          { name: 'Full Central AC', icon: 'Wind' }
        ]),
        description: 'Surat\'s most sought-after luxury getaway! Featuring a 4-bedroom air-conditioned villa, private infinity swimming pool with LED lighting, and sprawling green lawn.',
        status: 'approved'
      },
      {
        id: 'fh-105',
        title: 'Imperial Crown Party Resort & Farm',
        city_id: 'surat',
        area_name: 'New Dandi Road',
        price_6h: 6000,
        price_12h: 9800,
        price_24h: 15500,
        security_deposit: 4000,
        bedrooms: 5,
        bathrooms: 6,
        sqft: 25000,
        max_stay_guests: 22,
        max_day_guests: 75,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify([
          { name: 'Olympic-Style Swimming Pool', icon: 'Waves' },
          { name: 'Soundproof Party Lounge', icon: 'Speaker' }
        ]),
        description: 'Surat\'s ultra-premium mega farm. Crafted for grandiose celebrations and family reunions.',
        status: 'approved'
      },
      {
        id: 'fh-201',
        title: 'Serenade Luxury Infinity Villa',
        city_id: 'vadodara',
        area_name: 'Sevasi & Gotri Green Belt',
        price_6h: 5200,
        price_12h: 8500,
        price_24h: 13800,
        security_deposit: 3500,
        bedrooms: 4,
        bathrooms: 5,
        sqft: 22000,
        max_stay_guests: 16,
        max_day_guests: 50,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify([
          { name: 'Infinity Edge Swimming Pool', icon: 'Waves' },
          { name: 'Air Conditioned Suites', icon: 'Wind' }
        ]),
        description: 'Vadodara\'s top rated contemporary architectural villa with infinity pool and manicured lawns.',
        status: 'approved'
      }
    ];

    const insertPropStmt = db.prepare(`
      INSERT INTO properties (
        id, owner_id, title, city_id, area_name, price_6h, price_12h, price_24h,
        security_deposit, bedrooms, bathrooms, sqft, max_stay_guests, max_day_guests,
        images, amenities, description, status
      ) VALUES (
        @id, '${adminId}', @title, @city_id, @area_name, @price_6h, @price_12h, @price_24h,
        @security_deposit, @bedrooms, @bathrooms, @sqft, @max_stay_guests, @max_day_guests,
        @images, @amenities, @description, @status
      )
    `);

    for (const p of initialProps) {
      insertPropStmt.run(p);
    }
    console.log('[DB Seed] Initial properties seeded');
  }
}

initDatabase();

module.exports = db;
