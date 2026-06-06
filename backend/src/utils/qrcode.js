const QRCode = require('qrcode');

/**
 * Generate a QR Code as a Data URL (base64 PNG)
 * @param {string} url - The URL to encode in the QR code
 * @returns {Promise<string>} - Base64 Data URL
 */
const generateQRCode = async (url) => {
  try {
    const qrDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
    return qrDataURL;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

/**
 * Generate a QR Code as a PNG Buffer
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
const generateQRCodeBuffer = async (url) => {
  try {
    const buffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
    return buffer;
  } catch (error) {
    throw new Error(`QR Code buffer generation failed: ${error.message}`);
  }
};

module.exports = { generateQRCode, generateQRCodeBuffer };
