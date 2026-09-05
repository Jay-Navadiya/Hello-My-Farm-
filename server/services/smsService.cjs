const db = require('../config/db.cjs');
const axios = require('axios');

const OTP_EXPIRY_MINUTES = 5;
const COOLDOWN_SECONDS = 60;

function sendMobileOTP(mobile) {
  const existingOtp = db.prepare('SELECT * FROM otps WHERE mobile = ?').get(mobile);
  
  if (existingOtp) {
    const lastCreated = new Date(existingOtp.created_at).getTime();
    const now = new Date().getTime();
    const elapsedSec = (now - lastCreated) / 1000;

    if (elapsedSec < COOLDOWN_SECONDS) {
      const waitRemaining = Math.ceil(COOLDOWN_SECONDS - elapsedSec);
      throw new Error(`Please wait ${waitRemaining} seconds before requesting a new OTP`);
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO otps (mobile, code, expires_at, attempts, created_at)
    VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
    ON CONFLICT(mobile) DO UPDATE SET
      code = excluded.code,
      expires_at = excluded.expires_at,
      attempts = 0,
      created_at = CURRENT_TIMESTAMP
  `).run(mobile, code, expiresAt);

  console.log(`[SMS Service] OTP for ${mobile}: ${code} (Expires in ${OTP_EXPIRY_MINUTES} mins)`);

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'mock_twilio_account_sid') {
    axios.post(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, 
      new URLSearchParams({
        To: mobile,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Your FarmhouseHub verification code is: ${code}. Valid for 5 minutes.`
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).catch(err => console.error('[SMS Service Error]', err.message));
  }

  return { success: true, message: `OTP sent successfully to ${mobile}`, expiresAt, debugOtp: code };
}

function verifyMobileOTP(mobile, inputCode) {
  const otpRecord = db.prepare('SELECT * FROM otps WHERE mobile = ?').get(mobile);

  if (!otpRecord) {
    return { valid: false, message: 'No OTP record found for this mobile number. Please request a new OTP.' };
  }

  const now = new Date();
  const expires = new Date(otpRecord.expires_at);
  if (now > expires) {
    db.prepare('DELETE FROM otps WHERE mobile = ?').run(mobile);
    return { valid: false, message: 'OTP has expired! Please request a new code.' };
  }

  if (otpRecord.attempts >= 5) {
    db.prepare('DELETE FROM otps WHERE mobile = ?').run(mobile);
    return { valid: false, message: 'Maximum failed attempts reached. Please request a fresh OTP.' };
  }

  if (otpRecord.code !== inputCode.trim()) {
    db.prepare('UPDATE otps SET attempts = attempts + 1 WHERE mobile = ?').run(mobile);
    return { valid: false, message: 'Incorrect OTP code! Please check the code sent to your mobile.' };
  }

  db.prepare('DELETE FROM otps WHERE mobile = ?').run(mobile);
  return { valid: true };
}

module.exports = {
  sendMobileOTP,
  verifyMobileOTP
};
