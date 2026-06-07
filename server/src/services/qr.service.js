import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateQRCodeData = (bookingId, passengerId) => {
  const token = crypto.randomBytes(16).toString('hex');
  return `BUSGO:${bookingId}:${passengerId}:${token}`;
};

export const generateQRCodeImage = async (data) => {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
    color: { dark: '#1e293b', light: '#ffffff' },
  });
};
