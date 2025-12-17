// Booking API - Backend Logic
// This can be replaced with a real backend (Node.js/Express, Python/Flask, etc.)

class BookingSystem {
  constructor() {
    this.slots = this.loadSlots();
    this.bookings = this.loadBookings();
  }

  loadSlots() {
    const defaultSlots = [
      { id: 1, time: "09:00 AM - 11:00 AM", capacity: 3, enabled: true },
      { id: 2, time: "11:00 AM - 01:00 PM", capacity: 3, enabled: true },
      { id: 3, time: "01:00 PM - 03:00 PM", capacity: 3, enabled: true },
      { id: 4, time: "03:00 PM - 05:00 PM", capacity: 3, enabled: true },
      { id: 5, time: "05:00 PM - 07:00 PM", capacity: 3, enabled: true }
    ];

    const stored = localStorage.getItem('bookingSlots');
    return stored ? JSON.parse(stored) : defaultSlots;
  }

  loadBookings() {
    const stored = localStorage.getItem('bookings');
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map(b => ({
        phoneVerified: typeof b.phoneVerified === 'boolean' ? b.phoneVerified : false,
        notes: b.notes || '',
        source: b.source || b.submissionMethod || 'web',
        priority: typeof b.priority === 'number' ? b.priority : 0,
        ...b,
        status: b.status === 'pending' ? 'waiting' : (b.status || 'waiting')
      }));
    } catch (e) {
      console.error('Failed to parse bookings from storage:', e);
      return [];
    }
  }

  saveSlots() {
    localStorage.setItem('bookingSlots', JSON.stringify(this.slots));
  }

  saveBookings() {
    localStorage.setItem('bookings', JSON.stringify(this.bookings));
  }

  // Check if slot is full (only count confirmed bookings)
  isSlotFull(slotId, date) {
    const key = `${date}-${slotId}`;
    const count = this.bookings.filter(b => 
      b.slotKey === key && 
      (b.status === 'confirmed' || b.status === 'accepted')
    ).length;
    const slot = this.slots.find(s => s.id === slotId);
    return slot && count >= slot.capacity;
  }

  // Get slot status (only count confirmed/accepted bookings)
  getSlotStatus(slotId, date) {
    const key = `${date}-${slotId}`;
    const confirmedCount = this.bookings.filter(b => 
      b.slotKey === key && 
      (b.status === 'confirmed' || b.status === 'accepted')
    ).length;
    const pendingCount = this.bookings.filter(b =>
      b.slotKey === key &&
      b.status === 'waiting'
    ).length;
    const slot = this.slots.find(s => s.id === slotId);
    if (!slot || !slot.enabled) return { status: 'disabled', booked: 0, capacity: 0, pending: 0 };
    return {
      status: confirmedCount >= slot.capacity ? 'full' : 'available',
      booked: confirmedCount,
      pending: pendingCount,
      capacity: slot.capacity
    };
  }

  // Check for double booking
  checkDoubleBooking(email, date, slotId) {
    return this.bookings.some(b => 
      b.email === email && 
      b.date === date && 
      b.slotId === slotId && 
      b.status !== 'cancelled'
    );
  }

  // Create booking
  createBooking(data) {
    // Prevent double booking
    if (this.checkDoubleBooking(data.email, data.date, data.slotId)) {
      return { success: false, message: 'You already have a booking for this slot!' };
    }

    // Check if slot is full
    if (this.isSlotFull(data.slotId, data.date)) {
      return { success: false, message: 'This slot is now full. Please select another time.' };
    }

    const booking = {
      id: Date.now(),
      ...data,
      phoneVerified: typeof data.phoneVerified === 'boolean' ? data.phoneVerified : false,
      notes: data.notes || '',
      source: data.source || data.submissionMethod || 'web',
      priority: typeof data.priority === 'number' ? data.priority : 0,
      slotKey: `${data.date}-${data.slotId}`,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      submissionMethod: data.submissionMethod || 'email'
    };

    this.bookings.push(booking);
    this.saveBookings();
    return { success: true, message: 'Booking created successfully!', booking };
  }

  // Get all bookings
  getBookings() {
    return this.bookings;
  }

  // Get bookings by date
  getBookingsByDate(date) {
    return this.bookings.filter(b => b.date === date && b.status !== 'cancelled');
  }

  // Cancel booking
  cancelBooking(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'cancelled';
      this.saveBookings();
      return true;
    }
    return false;
  }

  // Admin: Update slot
  updateSlot(slotId, updates) {
    const slot = this.slots.find(s => s.id === slotId);
    if (slot) {
      Object.assign(slot, updates);
      this.saveSlots();
      return true;
    }
    return false;
  }

  // Admin: Get all slots
  getAllSlots() {
    return this.slots;
  }

  // QUEUE MANAGEMENT METHODS ========================================

  // Get bookings by status
  getBookingsByStatus(status) {
    return this.bookings.filter(b => b.status === status).sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  // Get all pending bookings (queue)
  getPendingQueue() {
    return this.getBookingsByStatus('waiting');
  }

  // Accept booking (move to confirmed)
  acceptBooking(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    
    // Check if slot still has capacity
    if (this.isSlotFull(booking.slotId, booking.date)) {
      return { success: false, message: 'Slot is now full. Cannot accept this booking.' };
    }

    booking.status = 'confirmed';
    booking.acceptedAt = new Date().toISOString();
    this.saveBookings();
    return { success: true, message: 'Booking confirmed!', booking };
  }

  // Reject booking
  rejectBooking(bookingId, rejectionReason = '') {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    
    booking.status = 'rejected';
    booking.rejectionReason = rejectionReason;
    booking.rejectedAt = new Date().toISOString();
    this.saveBookings();
    return { success: true, message: 'Booking rejected!', booking };
  }

  // Get bookings for admin queue view
  getQueueStats() {
    return {
      pending: this.getPendingQueue().length,
      confirmed: this.getBookingsByStatus('confirmed').length,
      rejected: this.getBookingsByStatus('rejected').length,
      total: this.bookings.filter(b => b.status !== 'cancelled').length
    };
  }

  // Get booking details by ID
  getBookingById(bookingId) {
    return this.bookings.find(b => b.id === bookingId);
  }

  // Check waitlist (pending bookings that couldn't be accepted)
  getWaitlist() {
    return this.bookings.filter(b => b.status === 'waiting').map(b => ({
      ...b,
      queuePosition: this.getPendingQueue().indexOf(b) + 1
    }));
  }

  // Get slot availability for a date (considering pending + confirmed)
  getDetailedSlotStatus(slotId, date) {
    const key = `${date}-${slotId}`;
    const confirmed = this.bookings.filter(b => 
      b.slotKey === key && b.status === 'confirmed'
    ).length;
    const accepted = this.bookings.filter(b =>
      b.slotKey === key && b.status === 'accepted'
    ).length;
    const pending = this.bookings.filter(b =>
      b.slotKey === key && b.status === 'waiting'
    ).length;
    const rejected = this.bookings.filter(b =>
      b.slotKey === key && b.status === 'rejected'
    ).length;
    
    const slot = this.slots.find(s => s.id === slotId);
    const capacity = slot ? slot.capacity : 0;
    const locked = confirmed + accepted;
    const available = capacity - locked;

    return {
      slotId,
      date,
      capacity,
      confirmed,
      accepted,
      pending,
      rejected,
      locked,
      available,
      canAccept: available > 0,
      isFull: locked >= capacity
    };
  }
}

// Initialize system
const bookingSystem = new BookingSystem();
