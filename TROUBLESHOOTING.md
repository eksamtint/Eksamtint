# 🔧 Troubleshooting Guide - EKSAM TINT Booking System

## Quick Troubleshooting (30 seconds)

**Problem:** Bookings not saving
1. Press F12, check Console tab
2. Look for red error messages
3. If you see errors, scroll down to see details

**Problem:** Slots not showing as full
1. Refresh the page
2. Check you have 3 bookings for the slot
3. Open DevTools > Application > LocalStorage > bookings
4. Count bookings for your slot

**Problem:** Admin can't login
1. Password is case-sensitive: `admin123`
2. Try deleting and retyping password carefully
3. Check browser isn't auto-filling wrong password

---

## Detailed Troubleshooting

### SECTION 1: Booking Form Issues

#### Issue 1.1: Form Won't Submit
**Symptoms:** Click "Submit Now" but nothing happens

**Causes & Solutions:**
1. ❌ Missing form fields
   - Make sure ALL fields are filled:
   - [ ] Name
   - [ ] Email
   - [ ] Date
   - [ ] Service
   - [ ] Time slot selected
   - **Solution:** Fill all required fields (marked with *)

2. ❌ No time slot selected
   - Check if time slot is highlighted
   - **Solution:** 
     1. Select a date first
     2. Click on a time slot button
     3. Slot should get red border

3. ❌ Browser JavaScript disabled
   - **Solution:**
     1. Check: Settings > Privacy > JavaScript is enabled
     2. Reload the page
     3. Try again

4. ❌ Browser cache issue
   - **Solution:**
     1. Press Ctrl+Shift+Delete
     2. Select "All time"
     3. Check "Cookies and other site data"
     4. Click "Clear data"
     5. Refresh booking.html

**How to Debug:**
1. Open DevTools (F12)
2. Go to Console tab
3. Try submitting form
4. Look for red error messages
5. Screenshot and research the error

---

#### Issue 1.2: Slots Not Showing
**Symptoms:** Click on date but time slots don't appear

**Causes & Solutions:**
1. ❌ Date not selected
   - **Solution:** Click date input field, pick a date

2. ❌ JavaScript not loaded
   - **Solution:**
     1. Check F12 > Console for errors
     2. Look for "booking-api.js" load error
     3. Make sure booking-api.js file exists

3. ❌ Disabled slots only
   - **Solution:**
     1. In admin: Enable some slots
     2. Go back to booking page
     3. Refresh and try again

4. ❌ Container not rendered
   - **Solution:**
     1. F12 > Elements tab
     2. Find `<div id="timeSlotsContainer">`
     3. Should have multiple `<button>` children
     4. If empty, JavaScript isn't running

**How to Debug:**
1. Right-click on page > Inspect
2. Find `<div id="timeSlotsContainer">`
3. It should have buttons inside
4. If empty, check F12 > Console for errors

---

#### Issue 1.3: All Slots Show as Full
**Symptoms:** All time slots show "❌ SLOT FULL"

**Causes & Solutions:**
1. ❌ All slots have zero capacity
   - **Solution:**
     1. Go to admin.html
     2. Login and go to "Manage Slots"
     3. Click "Edit" on a slot
     4. Set capacity to 3 or higher
     5. Check booking.html again

2. ❌ Too many bookings for the slots
   - **Solution:**
     1. Go to admin.html
     2. View bookings for that date
     3. Cancel some bookings to free up space
     4. Go back to booking.html

3. ❌ Data corruption
   - **Solution:**
     1. F12 > Application > LocalStorage
     2. Clear both `bookingSlots` and `bookings`
     3. Refresh page (default slots reload)

---

#### Issue 1.4: Email Not Received
**Symptoms:** Booking submitted but no confirmation email

**Causes & Solutions:**
1. ⏱️ Email takes time
   - **Solution:** Wait 1-2 minutes, check again

2. ❌ Email in spam/promotions
   - **Solution:** 
     1. Check Spam folder
     2. Check Promotions tab (Gmail)
     3. Add sender to contacts

3. ❌ Wrong email address entered
   - **Solution:**
     1. Check what email you typed
     2. If typo, create another booking with correct email
     3. Prevent typos: Copy-paste your actual email

4. ❌ Web3Forms key is wrong
   - **Solution:**
     1. Go to booking.html (right-click > View Source)
     2. Find access_key on line ~296
     3. Compare with your Web3Forms account key
     4. If wrong, update it: https://web3forms.com/

5. ❌ Web3Forms account not active
   - **Solution:**
     1. Log into https://web3forms.com/
     2. Check account is verified
     3. Check account isn't disabled
     4. Generate new access key if needed

**How to Debug:**
1. F12 > Network tab
2. Create booking
3. Look for request to "web3forms.com"
4. Click it and check Response
5. Should see `"success": true`
6. If error, check error message

---

### SECTION 2: Admin Dashboard Issues

#### Issue 2.1: Admin Login Not Working
**Symptoms:** Enter password but can't login

**Causes & Solutions:**
1. ❌ Wrong password
   - **Solution:** Password is `admin123` (all lowercase, case-sensitive)
   - Check your keyboard doesn't have Caps Lock on

2. ❌ Browser cache
   - **Solution:**
     1. Clear cache (Ctrl+Shift+Delete)
     2. Reload admin.html
     3. Try again

3. ❌ LocalStorage corrupted
   - **Solution:**
     1. F12 > Application > LocalStorage
     2. Delete `adminLoggedIn` entry
     3. Refresh admin.html
     4. Try logging in again

4. ❌ JavaScript disabled
   - **Solution:**
     1. Enable JavaScript in browser settings
     2. Reload page

**Password Hint:** If you forgot the password, edit admin.html line 131:
```javascript
const ADMIN_PASSWORD = "admin123"; // ← Change this
```

---

#### Issue 2.2: No Slots Showing in Admin
**Symptoms:** "Manage Slots" tab shows empty list

**Causes & Solutions:**
1. ❌ All slots disabled
   - **Solution:**
     1. Create a new slot
     2. Click "Enable" on disabled slots
     3. Refresh page

2. ❌ Data not loaded
   - **Solution:**
     1. F12 > Console, type: `console.log(bookingSystem.getAllSlots())`
     2. Press Enter
     3. Should show slot array
     4. If not, data is corrupted

3. ❌ LocalStorage empty
   - **Solution:**
     1. F12 > Application > LocalStorage
     2. Look for `bookingSlots` entry
     3. If missing, refresh page to create defaults
     4. Check if data is there now

---

#### Issue 2.3: Can't Create New Slot
**Symptoms:** Click "Add Slot" but nothing happens

**Causes & Solutions:**
1. ❌ Fields not filled
   - **Solution:**
     1. Make sure you enter both Time AND Capacity
     2. Capacity must be a number ≥ 1
     3. Try again

2. ❌ Invalid time format
   - **Solution:**
     1. Use time picker (not type manually)
     2. Format should be: HH:MM (24-hour)
     3. Example: 09:00 for 9 AM, 14:00 for 2 PM

3. ❌ Invalid capacity
   - **Solution:**
     1. Capacity must be a whole number
     2. Must be ≥ 1
     3. Example: 3, 5, 10 (not 3.5 or 0)

4. ❌ Duplicate slot
   - **Solution:**
     1. Check if slot already exists with same time
     2. Edit existing slot instead of creating new
     3. Try different time

**How to Debug:**
1. F12 > Console
2. Click "Add Slot"
3. Check for error messages
4. Screenshot errors if any

---

#### Issue 2.4: Bookings Table Empty
**Symptoms:** No bookings show in "View Bookings" tab

**Causes & Solutions:**
1. ❌ No bookings created yet
   - **Solution:** Create a booking in booking.html first

2. ❌ All bookings cancelled
   - **Solution:**
     1. Check cancelled bookings exist
     2. Create new bookings
     3. Verify they appear

3. ❌ Date filter hiding results
   - **Solution:**
     1. Click "Show All" button
     2. All bookings should appear
     3. Then try specific date filter

4. ❌ Data not syncing
   - **Solution:**
     1. Refresh admin.html
     2. Log out and log back in
     3. Check F12 > Console for errors

**How to Debug:**
1. F12 > Console, type: `console.log(bookingSystem.getBookings())`
2. Press Enter
3. Should show array of bookings
4. If empty, no bookings exist yet

---

#### Issue 2.5: Date Filter Not Working
**Symptoms:** Filter by date returns wrong results

**Causes & Solutions:**
1. ❌ No date selected
   - **Solution:** Click date picker, select a date before filtering

2. ❌ Date format mismatch
   - **Solution:**
     1. Browser date picker should handle format
     2. Make sure you select valid date
     3. Try picking from dropdown calendar

3. ❌ Bookings are on different dates
   - **Solution:**
     1. Click "Show All" first
     2. Note actual booking dates
     3. Filter by those dates
     4. Verify they appear

4. ❌ Time zone issue (unlikely)
   - **Solution:**
     1. Check booking date matches filter date
     2. Clear cache and try again

---

### SECTION 3: Booking Capacity Issues

#### Issue 3.1: Slot Not Showing as Full
**Symptoms:** Have 3 bookings but slot shows available

**Causes & Solutions:**
1. ❌ Bookings are cancelled
   - **Solution:**
     1. Check booking status in admin
     2. Cancelled bookings don't count toward capacity
     3. Only "pending" or "confirmed" count

2. ❌ Wrong slot
   - **Solution:**
     1. Verify bookings are for the SAME slot
     2. Different slots don't affect each other
     3. Check slot ID in localStorage

3. ❌ Capacity is higher than 3
   - **Solution:**
     1. Go to admin
     2. Check actual slot capacity
     3. Edit if set to more than 3
     4. Adjust bookings accordingly

4. ❌ Data not refreshed
   - **Solution:**
     1. Refresh booking.html (F5)
     2. Re-select date
     3. Check slot status again

**Debug Steps:**
1. F12 > Application > LocalStorage > bookings
2. Find bookings for your slot/date
3. Count non-cancelled entries
4. Compare to slot capacity
5. F12 > Console:
   ```javascript
   bookingSystem.getSlotStatus(1, "2025-12-25")
   // Replace 1 with slot ID, date with actual date
   ```

---

#### Issue 3.2: Can Book When Slot Full
**Symptoms:** Slot shows FULL but can still book

**Causes & Solutions:**
1. ❌ Multiple browsers/tabs
   - **Solution:**
     1. Close all other tabs
     2. Clear cache
     3. Reopen booking.html
     4. Try again

2. ❌ Data not synced
   - **Solution:**
     1. Refresh page (F5)
     2. Re-select date to reload slots
     3. Try booking now

3. ❌ Booking rejected after submit
   - **Solution:**
     1. This is correct behavior!
     2. System checks again on submit
     3. Error message should appear
     4. Try different slot

4. ❌ Button not properly disabled
   - **Solution:**
     1. Refresh page
     2. Check button is gray
     3. Check button doesn't respond to click
     4. F12 > Elements to inspect button class

---

### SECTION 4: Data & Storage Issues

#### Issue 4.1: Data Lost After Refresh
**Symptoms:** Close browser and bookings disappear

**Causes & Solutions:**
1. ⚠️ Expected behavior for LocalStorage
   - When user clears cache/cookies, data is deleted
   - This is why database upgrade is needed

2. ❌ LocalStorage disabled
   - **Solution:**
     1. Browser Settings > Privacy
     2. Make sure cookies/storage is enabled
     3. Check site isn't blocked from storing data
     4. Try different browser

3. ⚠️ Incognito/Private mode
   - **Solution:**
     1. Data is cleared when incognito window closes
     2. Use normal browsing mode for production testing

4. 🔜 Need database
   - **Solution:**
     1. Current system is development only
     2. For production, implement real database
     3. See DATABASE_SCHEMA.md for guidance

**How to Preserve Data:**
1. Don't clear browser cache
2. Don't use incognito mode
3. Use same browser/device
4. Upgrade to database (production)

---

#### Issue 4.2: LocalStorage Data Looks Wrong
**Symptoms:** Data in F12 > LocalStorage doesn't match bookings

**Causes & Solutions:**
1. ❌ Data not saving
   - **Solution:**
     1. F12 > Console, check for errors
     2. Try creating fresh booking
     3. Immediately check LocalStorage

2. ❌ Old data showing
   - **Solution:**
     1. Close and reopen F12
     2. Refresh page
     3. Check localStorage again
     4. May take few seconds to update

3. ❌ Data corruption
   - **Solution:**
     1. F12 > Application > LocalStorage
     2. Carefully delete corrupted entry
     3. Refresh page (defaults will reload)
     4. Start fresh

4. ❌ Multiple browser profiles
   - **Solution:**
     1. Each browser profile has separate localStorage
     2. Bookings made in Profile A won't show in Profile B
     3. Use same profile consistently

**Inspect LocalStorage:**
1. F12 > Application tab
2. Click "LocalStorage" in left sidebar
3. Click your domain
4. Should see 3 entries:
   - `bookingSlots`
   - `bookings`
   - `adminLoggedIn` (if logged in)
5. Values should be valid JSON arrays

---

### SECTION 5: Performance Issues

#### Issue 5.1: Page Loads Slowly
**Symptoms:** Takes more than 5 seconds to load page

**Causes & Solutions:**
1. ❌ Large number of bookings
   - **Solution:**
     1. Cancel old bookings to reduce data size
     2. In production, archive old bookings
     3. Database will handle large data better

2. ❌ Network slow
   - **Solution:**
     1. Check internet connection
     2. Try loading page again
     3. Check for pending requests (F12 > Network)

3. ❌ Browser cache issues
   - **Solution:**
     1. Clear cache and reload
     2. Try different browser
     3. Disable extensions and retry

4. ⚠️ Too many extended notifications
   - **Solution:**
     1. Disable any extra JavaScript
     2. Remove unnecessary plugins
     3. Use faster browser

---

#### Issue 5.2: Buttons Not Responding
**Symptoms:** Click button but nothing happens

**Causes & Solutions:**
1. ❌ JavaScript not loaded
   - **Solution:**
     1. F12 > Console tab
     2. Type: `typeof bookingSystem`
     3. Should return: "object"
     4. If "undefined", JS didn't load

2. ❌ Button is disabled
   - **Solution:**
     1. Check button color and opacity
     2. Gray/faded = disabled
     3. Try different button/slot

3. ❌ Event listener not attached
   - **Solution:**
     1. F12 > Elements
     2. Click button, check for event listeners
     3. Right-click > Inspect
     4. Look for "Event Listeners" panel

4. ❌ Form validation failing silently
   - **Solution:**
     1. Open F12 > Console
     2. Watch for alert messages
     3. Fill all form fields and try again

---

### SECTION 6: Browser-Specific Issues

#### Chrome Issues
```
Problem: Bookings not saving
Solution: 
1. Clear chrome://cache
2. Go to chrome://settings/content/siteData
3. Delete data for your domain
4. Reload page

Problem: Email not sending
Solution:
1. Check chrome://extensions
2. Disable any email-blocking extensions
3. Try incognito mode (F12 to check if works)
4. If works in incognito, extension is culprit
```

#### Firefox Issues
```
Problem: Time slots not displaying
Solution:
1. Open about:preferences
2. Go to Privacy & Security
3. Make sure "Accept cookies" is enabled
4. Reload booking.html

Problem: Admin won't log in
Solution:
1. about:preferences > Privacy
2. Clear "Cookies and Site Data"
3. Try login again
```

#### Safari Issues
```
Problem: LocalStorage not working
Solution:
1. Safari > Preferences > Privacy
2. Make sure "Block all cookies" is UNCHECKED
3. Reload page
4. Try booking again

Problem: Admin page blank
Solution:
1. Develop > Empty Caches
2. Hold Shift and reload page
3. Try accessing admin again
```

#### Edge Issues
```
Problem: Slots not showing
Solution:
1. edge://settings/content/cookies
2. Allow cookies for your site
3. Reload booking.html

Problem: Form not submitting
Solution:
1. Check edge://extensions
2. Disable privacy extensions
3. Try again
```

---

### SECTION 7: Mobile-Specific Issues

#### Issue 7.1: Form Fields Too Small
**Symptoms:** Can't tap input fields on mobile

**Causes & Solutions:**
1. ❌ Zoom is wrong
   - **Solution:** Pinch to zoom out, or zoom in to see larger
   
2. ❌ Responsive design issue
   - **Solution:**
     1. Try landscape orientation
     2. Try fullscreen mode
     3. Use browser zoom (Ctrl++ or Cmd++)

3. ❌ Mobile-specific CSS
   - **Solution:** Edit CSS to increase padding/font-size for mobile

---

#### Issue 7.2: Time Picker Doesn't Work
**Symptoms:** Date input not opening on mobile

**Causes & Solutions:**
1. ⚠️ Browser doesn't support HTML5 date input
   - **Solution:**
     1. Use browser that supports it (Chrome, Firefox, Safari)
     2. Or type date manually in format: YYYY-MM-DD

2. ❌ Mobile keyboard interfering
   - **Solution:**
     1. Click input field once
     2. Use date picker that appears
     3. Don't try typing manually

---

### SECTION 8: Email Service Issues

#### Issue 8.1: All Emails Going to Spam
**Symptoms:** Emails received but all in spam folder

**Causes & Solutions:**
1. ❌ Web3Forms reputation
   - **Solution:**
     1. Mark emails as "Not Spam" to train filter
     2. Add sender to contacts
     3. Use real backend email service in production

2. ❌ Email content triggers spam filter
   - **Solution:**
     1. Edit booking.html email template
     2. Remove suspicious words
     3. Add proper headers

3. ❌ Domain reputation
   - **Solution:**
     1. In production, use your own domain email
     2. Set up SPF/DKIM records
     3. Use professional email service

---

#### Issue 8.2: Emails Sent But Not Received
**Symptoms:** System says sent but user doesn't get email

**Causes & Solutions:**
1. ⏱️ Delays up to 2 minutes
   - **Solution:** Wait longer before complaining

2. ❌ Wrong email address
   - **Solution:**
     1. Check what was typed in form
     2. Ask user to confirm their email
     3. User created booking with typo

3. ❌ Email blocked by ISP
   - **Solution:**
     1. User should check email settings
     2. Check spam/junk folders
     3. Whitelist sender email

4. ❌ Web3Forms down
   - **Solution:**
     1. Check https://web3forms.com/ status
     2. Wait for service to recover
     3. Try again later

---

## Still Having Issues?

### Debug Checklist
- [ ] Checked browser console (F12) for errors
- [ ] Checked F12 > Application > LocalStorage for data
- [ ] Tried clearing cache (Ctrl+Shift+Delete)
- [ ] Tried different browser
- [ ] Tried refreshing page (Ctrl+F5)
- [ ] Checked internet connection
- [ ] Verified all form fields filled
- [ ] Read relevant section above

### Where to Look for Clues
1. **Browser Console (F12)** - Red error messages
2. **LocalStorage (F12 > Application)** - Check data is there
3. **Network Tab (F12)** - Check requests succeeded
4. **Elements Tab (F12)** - Inspect buttons/form elements

### Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| Cannot read property 'addEventListener' | Element not found | Check HTML has required IDs |
| JSON parse error | Data corrupted | Clear localStorage, refresh |
| CORS error | API blocked | Use HTTPS in production |
| Uncaught ReferenceError: bookingSystem | JS not loaded | Check booking-api.js exists |

---

This guide covers 95% of common issues. If your problem isn't here, check the browser console for specific error messages!
