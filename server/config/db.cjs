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
      auth_providers TEXT,
      role TEXT DEFAULT 'user',
      assigned_city_id TEXT,
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
      images TEXT,
      amenities TEXT,
      status TEXT DEFAULT 'pending',
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

    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    db.exec("ALTER TABLE bookings ADD COLUMN check_out_date TEXT;");
  } catch (e) {}

  try {
    db.exec("ALTER TABLE users ADD COLUMN assigned_city_id TEXT;");
  } catch (e) {}

  seedDefaultData();
}

function seedDefaultData() {
  const adminConfigs = [
    { email: 'gaurang.smv2501@gmail.com', pass: 'Gaurang#2501', name: 'Gaurang Patel' },
    { email: 'admin@farmhousehub.in', pass: 'Admin@1234', name: 'System Admin' }
  ];

  adminConfigs.forEach((cfg, idx) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(cfg.pass, salt);
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(cfg.email);

    if (!existing) {
      db.prepare(`
        INSERT OR IGNORE INTO users (id, name, mobile, email, password_hash, role, auth_providers)
        VALUES (?, ?, ?, ?, ?, 'admin', ?)
      `).run(
        `admin-user-0${idx + 1}`,
        cfg.name,
        `+91 99999 9999${idx}`,
        cfg.email,
        hash,
        JSON.stringify(['email', 'email_otp', 'google'])
      );
      console.log(`[DB Seed] Admin user created: ${cfg.email}`);
    } else {
      db.prepare("UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?").run(hash, existing.id);
      console.log(`[DB Seed] Updated admin role and password for: ${cfg.email}`);
    }
  });

  const propCount = db.prepare('SELECT count(*) as cnt FROM properties').get();
  if (propCount.cnt === 0) {
    const adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
    const adminId = adminUser ? adminUser.id : 'admin-user-01';

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
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
        ]),
        amenities: JSON.stringify(['Private Pool', 'Gazebo Lawn', 'Rain Dance', 'Jacuzzi', 'Cricket Turf', 'Sound System', 'Full Kitchen', 'Generator Backup']),
        status: 'approved'
      },
      {
        id: 'fh-102',
        title: 'Emerald Palms Private Estate',
        city_id: 'surat',
        area_name: 'New Dandi Road',
        price_6h: 5500,
        price_12h: 9000,
        price_24h: 15000,
        security_deposit: 3500,
        bedrooms: 5,
        bathrooms: 6,
        sqft: 22000,
        max_stay_guests: 20,
        max_day_guests: 60,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
        ]),
        amenities: JSON.stringify(['Infinity Pool', 'Party Hall', 'Lawn 100+ Capacity', 'Rain Dance', 'BBQ Grill', 'Caretaker 24x7']),
        status: 'approved'
      },
      {
        id: 'fh-103',
        title: 'Tapi Riverfront Luxury Oasis',
        city_id: 'surat',
        area_name: 'Kamrej & Tapi Basin',
        price_6h: 4000,
        price_12h: 6800,
        price_24h: 11000,
        security_deposit: 2500,
        bedrooms: 3,
        bathrooms: 4,
        sqft: 15000,
        max_stay_guests: 12,
        max_day_guests: 35,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ]),
        amenities: JSON.stringify(['River View Deck', 'Pool', 'Table Tennis', 'Carrom', 'Open Lawn', 'Caretaker']),
        status: 'approved'
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO properties (
        id, owner_id, title, city_id, area_name, price_6h, price_12h, price_24h,
        security_deposit, bedrooms, bathrooms, sqft, max_stay_guests, max_day_guests,
        images, amenities, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialProps.forEach(p => {
      insertStmt.run(
        p.id, adminId, p.title, p.city_id, p.area_name, p.price_6h, p.price_12h, p.price_24h,
        p.security_deposit, p.bedrooms, p.bathrooms, p.sqft, p.max_stay_guests, p.max_day_guests,
        p.images, p.amenities, p.status
      );
    });

    console.log('[DB Seed] Sample approved properties seeded successfully.');
  }
}

initDatabase();

module.exports = db;
