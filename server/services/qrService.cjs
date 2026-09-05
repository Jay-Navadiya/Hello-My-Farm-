const QRCode = require('qrcode');

async function generateDynamicUPIQR(amount, bookingId, merchantVpa = null, merchantName = null) {
  const vpa = merchantVpa || process.env.UPI_VPA || 'agency@easebuzz';
  const name = merchantName || process.env.UPI_MERCHANT_NAME || 'FarmhouseHub';

  const formattedAmount = Number(amount).toFixed(2);
  const upiString = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${formattedAmount}&tn=${encodeURIComponent(bookingId)}&cu=INR`;

  try {
    const qrDataUrl = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    return {
      upiString,
      qrDataUrl,
      amount: formattedAmount,
      vpa,
      merchantName: name,
      bookingId
    };
  } catch (err) {
    console.error('[QR Service Error]', err);
    throw new Error('Failed to generate dynamic UPI QR code');
  }
}

module.exports = {
  generateDynamicUPIQR
};
