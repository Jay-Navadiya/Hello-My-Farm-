const db = require('../config/db.cjs');
const axios = require('axios');

async function sendWhatsAppBookingConfirmation(booking, user, property) {
  const recipientPhone = user.mobile || booking.customerPhone;
  if (!recipientPhone) {
    console.warn('[WhatsApp Service] Recipient phone missing for booking:', booking.id);
    return { success: false, error: 'Recipient phone missing' };
  }

  const messageText = `Your booking has been successfully confirmed.

Property: ${property ? property.title : booking.propertyName}
Booking ID: ${booking.id}
Check-in: ${booking.check_in_date || booking.date}
Slot: ${booking.slot_label || booking.slotLabel}
Guests: ${booking.guest_count || booking.guestCount}
Total Amount: ₹${Number(booking.total_amount || booking.totalAmount).toLocaleString('en-IN')}
Payment Status: Paid

Thank you for booking with us.`;

  const notificationId = `notif-${Date.now()}`;
  db.prepare(`
    INSERT INTO notifications (id, recipient_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
  `).run(notificationId, user.id || 'guest', 'Booking Confirmed WhatsApp', messageText, 'whatsapp');

  console.log(`[WhatsApp Service] Automated message queued for ${recipientPhone}:`);
  console.log(messageText);

  if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_API_TOKEN !== 'mock_whatsapp_cloud_api_token') {
    try {
      const cleanPhone = recipientPhone.replace(/\D/g, '');
      await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: messageText }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`[WhatsApp API] Message sent successfully to ${cleanPhone}`);
    } catch (err) {
      console.error('[WhatsApp API Error]', err.response?.data || err.message);
    }
  }

  return {
    success: true,
    messageText,
    recipientPhone,
    encodedWebLink: `https://wa.me/${recipientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(messageText)}`
  };
}

module.exports = {
  sendWhatsAppBookingConfirmation
};
