const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch {
    throw new Error('Failed to generate QR Code');
  }
};

module.exports = generateQRCode;
