# 🗄️ Database Schema Guide (For Backend Implementation)

## Overview
This guide shows how to structure your database when upgrading from LocalStorage to a real database.

---

## Database: PostgreSQL Example

### Table 1: time_slots
Stores all available time slots and their configurations.

```sql
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  time VARCHAR(100) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data:
INSERT INTO time_slots (time, capacity, enabled) VALUES
('09:00 AM - 11:00 AM', 3, true),
('11:00 AM - 01:00 PM', 3, true),
('01:00 PM - 03:00 PM', 3, true),
('03:00 PM - 05:00 PM', 3, true),
('05:00 PM - 07:00 PM', 3, true);
```

---

### Table 2: bookings
Stores all customer bookings.

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  slot_id INT NOT NULL REFERENCES time_slots(id),
  slot_time VARCHAR(100) NOT NULL,
  service VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  submission_method VARCHAR(50) DEFAULT 'email', -- email, whatsapp, sms
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, date, slot_id) -- Prevent double booking
);

CREATE INDEX idx_booking_date ON bookings(date);
CREATE INDEX idx_booking_email ON bookings(email);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_date_slot ON bookings(date, slot_id);
```

---

### Table 3: admins (Optional - For Multiple Admin Users)
Stores admin user accounts with secure passwords.

```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Use bcrypt!
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Table 4: booking_history (Optional - For Audit Trail)
Keeps track of all changes to bookings.

```sql
CREATE TABLE booking_history (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id),
  action VARCHAR(50), -- created, updated, cancelled
  changed_by VARCHAR(255),
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Database: MongoDB Example

### Collections Structure

```javascript
// Collection: time_slots
db.time_slots.insertMany([
  {
    _id: ObjectId(),
    time: "09:00 AM - 11:00 AM",
    capacity: 3,
    enabled: true,
    createdAt: ISODate(),
    updatedAt: ISODate()
  }
]);

// Collection: bookings
db.bookings.insertMany([
  {
    _id: ObjectId(),
    name: "John Doe",
    email: "john@example.com",
    date: ISODate("2025-12-25"),
    slotId: ObjectId(),
    slotTime: "09:00 AM - 11:00 AM",
    service: "Window Tinting",
    message: "Special request...",
    status: "pending",
    submissionMethod: "email",
    createdAt: ISODate(),
    updatedAt: ISODate()
  }
]);

// Create unique index to prevent double booking
db.bookings.createIndex({ email: 1, date: 1, slotId: 1 }, { unique: true });

// Collection: admins (optional)
db.admins.insertMany([
  {
    _id: ObjectId(),
    username: "admin",
    email: "admin@eksam.com",
    passwordHash: "bcrypt_hash_here",
    role: "super_admin",
    lastLogin: ISODate(),
    createdAt: ISODate(),
    updatedAt: ISODate()
  }
]);
```

---

## API Endpoints (Node.js/Express Example)

### Booking Endpoints

```javascript
// GET all available slots for a specific date
GET /api/slots/:date
Response: { slots: [...], status: "full"|"available" }

// POST create new booking
POST /api/bookings
Body: { name, email, date, slotId, service, message }
Response: { success, booking, message }

// GET all bookings by email (customer view)
GET /api/bookings/:email
Response: { bookings: [...] }

// GET all bookings (admin only)
GET /api/admin/bookings
Response: { bookings: [...] }

// GET bookings by date (admin)
GET /api/admin/bookings?date=2025-12-25
Response: { bookings: [...] }

// DELETE/CANCEL booking (admin)
DELETE /api/admin/bookings/:id
Response: { success, message }
```

### Slot Management Endpoints

```javascript
// GET all slots
GET /api/admin/slots
Response: { slots: [...] }

// POST create new slot
POST /api/admin/slots
Body: { time, capacity }
Response: { success, slot }

// PUT update slot
PUT /api/admin/slots/:id
Body: { capacity, enabled }
Response: { success, slot }

// DELETE slot
DELETE /api/admin/slots/:id
Response: { success, message }
```

### Admin Endpoints

```javascript
// POST login
POST /api/admin/login
Body: { username, password }
Response: { token, user }

// GET current admin
GET /api/admin/me
Headers: { Authorization: "Bearer token" }
Response: { user: {...} }

// POST logout
POST /api/admin/logout
Response: { success }
```

---

## Sample Backend Implementation (Node.js/Express)

```javascript
// server.js
const express = require('express');
const app = express();
app.use(express.json());

// Middleware
const { verifyAdmin } = require('./middleware/auth');

// ============ BOOKING ROUTES ============

// Get slots for a date
app.get('/api/slots/:date', async (req, res) => {
  const { date } = req.params;
  
  // Get time slots
  const slots = await db.query('SELECT * FROM time_slots WHERE enabled = true');
  
  // Count bookings per slot
  for (let slot of slots) {
    const count = await db.query(
      'SELECT COUNT(*) FROM bookings WHERE date = $1 AND slot_id = $2 AND status != $3',
      [date, slot.id, 'cancelled']
    );
    slot.booked = count[0].count;
    slot.isFull = slot.booked >= slot.capacity;
  }
  
  res.json({ slots });
});

// Create booking
app.post('/api/bookings', async (req, res) => {
  const { name, email, date, slotId, service, message } = req.body;
  
  try {
    // Check for double booking
    const existing = await db.query(
      'SELECT * FROM bookings WHERE email = $1 AND date = $2 AND slot_id = $3 AND status != $4',
      [email, date, slotId, 'cancelled']
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'You already have a booking for this slot!' 
      });
    }
    
    // Check if slot is full
    const count = await db.query(
      'SELECT COUNT(*) FROM bookings WHERE date = $1 AND slot_id = $2 AND status != $3',
      [date, slotId, 'cancelled']
    );
    
    const slot = await db.query('SELECT * FROM time_slots WHERE id = $1', [slotId]);
    
    if (count[0].count >= slot[0].capacity) {
      return res.status(409).json({ 
        success: false, 
        message: 'This slot is now full. Please select another time.' 
      });
    }
    
    // Create booking
    const booking = await db.query(
      'INSERT INTO bookings (name, email, date, slot_id, slot_time, service, message) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, email, date, slotId, slot[0].time, service, message]
    );
    
    // Send confirmation email
    await sendEmail(email, 'Booking Confirmation', `Your booking for ${date} at ${slot[0].time} has been confirmed!`);
    
    res.json({ 
      success: true, 
      booking: booking[0],
      message: 'Booking created successfully!' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ADMIN ROUTES ============

// Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  const admin = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
  
  if (!admin.length) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  const validPassword = await bcrypt.compare(password, admin[0].password_hash);
  
  if (!validPassword) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: admin[0].id }, 'SECRET_KEY', { expiresIn: '24h' });
  
  res.json({ success: true, token, user: admin[0] });
});

// Get all bookings (admin only)
app.get('/api/admin/bookings', verifyAdmin, async (req, res) => {
  const { date } = req.query;
  
  let query = 'SELECT * FROM bookings WHERE status != $1 ORDER BY date DESC';
  let params = ['cancelled'];
  
  if (date) {
    query = 'SELECT * FROM bookings WHERE date = $1 AND status != $2 ORDER BY date DESC';
    params = [date, 'cancelled'];
  }
  
  const bookings = await db.query(query, params);
  res.json({ bookings });
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Security Best Practices

### Password Hashing
```javascript
const bcrypt = require('bcrypt');

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const valid = await bcrypt.compare(password, hashedPassword);
```

### JWT Tokens
```javascript
const jwt = require('jsonwebtoken');

// Create token
const token = jwt.sign({ userId, role }, 'SECRET_KEY', { expiresIn: '24h' });

// Verify token
const decoded = jwt.verify(token, 'SECRET_KEY');
```

### CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Migration from LocalStorage to Database

```javascript
// Step 1: Export LocalStorage data
const localSlots = JSON.parse(localStorage.getItem('bookingSlots'));
const localBookings = JSON.parse(localStorage.getItem('bookings'));

// Step 2: Send to server
fetch('/api/admin/migrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slots: localSlots, bookings: localBookings })
});

// Step 3: Update frontend to use API instead of localStorage
// Replace: bookingSystem.getSlots()
// With:    fetch('/api/slots/' + date).then(r => r.json())
```

---

## Database Choice Recommendation

| Database | Best For | Difficulty |
|----------|----------|-----------|
| **PostgreSQL** | Reliability, Production | Medium |
| **MongoDB** | Flexibility, Scaling | Medium |
| **Firebase** | Quick Setup, Hosting | Easy |
| **MySQL** | Shared Hosting | Easy |

**For this project:** PostgreSQL is recommended for stability and ACID compliance.

---

## Version Control

Once you have a database:
1. Never commit `.env` files with credentials
2. Use environment variables for DB connection
3. Keep API keys separate from code
4. Use `.gitignore` for sensitive files

```bash
# .gitignore
.env
node_modules/
.DS_Store
*.log
```

---

This schema is ready to implement when you're ready to upgrade to a production system!
