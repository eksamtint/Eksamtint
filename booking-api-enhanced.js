// EKSAM TINT - Advanced Booking System Logic
// Handles Bookings, Slots, Services, Staff, and System Settings

class BookingSystem {
  constructor() {
    this.initStorage();
    this.slots = this.loadSlots();
    this.bookings = this.loadBookings();
    this.services = this.loadServices();
    this.settings = this.loadSettings();
    this.auditLogs = this.loadAuditLogs();
    this.waitlist = this.loadWaitlist();
    this.messageTemplates = this.loadMessageTemplates();
  }

  // ==================== INITIALIZATION & STORAGE ====================
  initStorage() {
    if (!localStorage.getItem('bookingSystemInitialized')) {
      console.log('Initializing Booking System Storage...');
      localStorage.setItem('bookingSystemInitialized', 'true');
    }
  }

  // Helper to safely parse JSON
  safeLoad(key, defaultValue) {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn(`Failed to parse ${key}, resetting to default.`, e);
      return defaultValue;
    }
  }

  loadSlots() {
    const defaultSlots = [
      { id: 1, time: "09:00 AM - 11:00 AM", capacity: 3, enabled: true },
      { id: 2, time: "11:00 AM - 01:00 PM", capacity: 3, enabled: true },
      { id: 3, time: "01:00 PM - 03:00 PM", capacity: 3, enabled: true },
      { id: 4, time: "03:00 PM - 05:00 PM", capacity: 3, enabled: true },
      { id: 5, time: "05:00 PM - 07:00 PM", capacity: 3, enabled: true }
    ];
    return this.safeLoad('bookingSlots', defaultSlots);
  }

  loadBookings() {
    return this.safeLoad('bookings', []);
  }

  loadServices() {
    const defaultServices = [
      { id: 1, name: "Window Tinting", duration: 120, price: 150 },
      { id: 2, name: "Stickers & Signage", duration: 60, price: 80 },
      { id: 3, name: "Headlight Tinting", duration: 45, price: 60 },
      { id: 4, name: "Chameleon Tint", duration: 120, price: 200 },
      { id: 5, name: "Dechrome", duration: 180, price: 250 }
    ];
    return this.safeLoad('services', defaultServices);
  }

  loadSettings() {
    const defaultSettings = {
      businessName: "EKSAM TINT",
      currency: "£",
      slotInterval: 30,
      adminPassword: "admin123"
    };
    return this.safeLoad('settings', defaultSettings);
  }

  loadAuditLogs() {
    return this.safeLoad('auditLogs', []);
  }

  loadWaitlist() {
    return this.safeLoad('waitlist', []);
  }

  loadMessageTemplates() {
    const defaultTemplates = {
      bookingReceived: "Hi {{name}}, EKSAM TINT here. We received your booking for {{service}} on {{date}} at {{time}}. It is currently PENDING approval. We will update you shortly.",
      bookingAccepted: "Hi {{name}}, Good news! Your booking with EKSAM TINT for {{date}} at {{time}} is CONFIRMED. See you then!",
      bookingRejected: "Hi {{name}}, unfortunately, we cannot fulfill your booking request for {{date}}. Reason: {{reason}}. Please contact us to reschedule.",
      bookingCancelled: "Hi {{name}}, your booking for {{date}} has been cancelled as requested."
    };
    return this.safeLoad('messageTemplates', defaultTemplates);
  }

  saveSlots() { localStorage.setItem('bookingSlots', JSON.stringify(this.slots)); }
  saveBookings() { localStorage.setItem('bookings', JSON.stringify(this.bookings)); }
  saveServices() { localStorage.setItem('services', JSON.stringify(this.services)); }
  saveSettings() { localStorage.setItem('settings', JSON.stringify(this.settings)); }
  saveAuditLogs() { localStorage.setItem('auditLogs', JSON.stringify(this.auditLogs)); }
  saveWaitlist() { localStorage.setItem('waitlist', JSON.stringify(this.waitlist)); }
  saveMessageTemplates() { localStorage.setItem('messageTemplates', JSON.stringify(this.messageTemplates)); }

  // ==================== AUDIT LOGGING ====================
  addAuditLog(action, details) {
    const log = {
      id: Date.now(),
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log); // Add to beginning
    if (this.auditLogs.length > 100) this.auditLogs.pop(); // Keep last 100
    this.saveAuditLogs();
  }

  getAuditLogs() { return this.auditLogs || []; }

  // ==================== SLOT LOGIC ====================
  getSlotStatus(slotId, date) {
    const key = `${date}-${slotId}`;
    
    // Count ONLY Confirmed and Accepted bookings towards capacity
    const relevantBookings = this.bookings.filter(b => 
      b.slotKey === key && 
      ['confirmed', 'accepted', 'pending'].includes(b.status)
    );

    const count = relevantBookings.length;
    const slot = this.slots.find(s => s.id === slotId);
    
    if (!slot) return { status: 'error' };

    return {
      slotId,
      time: slot.time,
      capacity: slot.capacity,
      booked: count,
      available: slot.capacity - count,
      status: !slot.enabled ? 'disabled' : (count >= slot.capacity ? 'full' : 'available')
    };
  }

  getAllSlots() { return this.slots || []; }

  updateSlot(slotId, updates) {
    const slot = this.slots.find(s => s.id === slotId);
    if (slot) {
      Object.assign(slot, updates);
      this.saveSlots();
      this.addAuditLog('SLOT_UPDATE', `Updated slot ${slot.time}: ${JSON.stringify(updates)}`);
      return { success: true };
    }
    return { success: false };
  }

  addSlot(time, capacity) {
    const newId = this.slots.length > 0 ? Math.max(...this.slots.map(s => s.id)) + 1 : 1;
    const newSlot = { id: newId, time, capacity: parseInt(capacity), enabled: true };
    this.slots.push(newSlot);
    this.saveSlots();
    this.addAuditLog('SLOT_ADD', `Added new slot: ${time}`);
    return { success: true, slot: newSlot };
  }

  // ==================== BOOKING LOGIC ====================
  createBooking(data) {
    // 1. Check Double Booking
    const isDouble = this.bookings.some(b => 
      b.email === data.email && 
      b.date === data.date && 
      b.slotId === data.slotId && 
      ['pending', 'confirmed', 'accepted'].includes(b.status)
    );

    if (isDouble) return { success: false, message: 'You already have a booking for this slot.' };

    // 2. Check Capacity
    const status = this.getSlotStatus(data.slotId, data.date);
    if (status.status === 'full' || status.status === 'disabled') {
      // Auto-Waitlist
      this.addToWaitlist(data);
      return { success: true, message: 'Slot full. Added to Waitlist.', isWaitlist: true };
    }

    // 3. Create Booking
    const newBooking = {
      id: Date.now(),
      ...data,
      slotKey: `${data.date}-${data.slotId}`,
      status: 'pending', // Default status for queue
      createdAt: new Date().toISOString(),
      history: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Booking created' }]
    };

    this.bookings.push(newBooking);
    this.saveBookings();
    this.addAuditLog('BOOKING_CREATE', `New booking: ${data.name} for ${data.date}`);
    return { success: true, booking: newBooking };
  }

  getBookings() { return this.bookings || []; }

  // Queue Management
  updateBookingStatus(bookingId, status, reason = '') {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    const oldStatus = booking.status;
    booking.status = status;
    booking.history.push({ 
      status: status, 
      timestamp: new Date().toISOString(), 
      note: reason || `Status changed to ${status}` 
    });

    if (status === 'rejected') booking.rejectionReason = reason;
    if (status === 'cancelled') booking.cancellationReason = reason;

    this.saveBookings();
    this.addAuditLog('BOOKING_UPDATE', `Booking ${bookingId} changed from ${oldStatus} to ${status}`);
    
    // Check waitlist promotion if a slot frees up
    if (['cancelled', 'rejected'].includes(status)) {
        this.checkWaitlistPromotion(booking.slotId, booking.date);
    }

    return { success: true, booking };
  }

  // ==================== SERVICE MANAGEMENT ====================
  getAllServices() { return this.services || []; }
  
  addService(name, duration, price) {
    const id = this.services.length > 0 ? Math.max(...this.services.map(s => s.id)) + 1 : 1;
    this.services.push({ id, name, duration, price });
    this.saveServices();
    this.addAuditLog('SERVICE_ADD', `Added service: ${name}`);
  }

  deleteService(id) {
    this.services = this.services.filter(s => s.id !== id);
    this.saveServices();
    this.addAuditLog('SERVICE_DELETE', `Deleted service ID: ${id}`);
  }

  // ==================== WAITLIST ====================
  addToWaitlist(data) {
    const entry = { id: Date.now(), ...data, addedAt: new Date().toISOString() };
    this.waitlist.push(entry);
    this.saveWaitlist();
    this.addAuditLog('WAITLIST_ADD', `Added ${data.name} to waitlist`);
  }

  checkWaitlistPromotion(slotId, date) {
    const candidates = this.waitlist.filter(w => w.slotId === slotId && w.date === date);
    if (candidates.length > 0) {
        console.log("Waitlist opportunity available for", candidates[0]);
    }
  }

  // ==================== MESSAGING ====================
  getTemplate(type, data) {
    let template = this.messageTemplates[type] || "";
    Object.keys(data).forEach(key => {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    });
    return template;
  }
  
  updateTemplate(type, text) {
      this.messageTemplates[type] = text;
      this.saveMessageTemplates();
  }

  // ==================== SETTINGS & AUTH ====================
  getSettings() { return this.settings; }

  checkPassword(input) {
      return input === this.settings.adminPassword;
  }
}

// Initialize Global System
const bookingSystem = new BookingSystem();