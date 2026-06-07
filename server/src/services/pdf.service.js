import PDFDocument from 'pdfkit';
import { formatCurrency } from '../utils/currency.js';

export const generateTicketPDF = (ticketData) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { passenger, booking, schedule, route, bus, qrCodeImage } = ticketData;

    doc.fontSize(22).fillColor('#2563eb').text('BusGo E-Ticket', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#64748b').text(`Booking ID: ${booking._id}`, { align: 'center' });
    doc.moveDown();

    doc.moveTo(40, doc.y).lineTo(380, doc.y).dash(5, { space: 3 }).stroke('#cbd5e1');
    doc.undash();
    doc.moveDown();

    doc.fontSize(12).fillColor('#0f172a');
    doc.text(`Passenger: ${passenger.name}`);
    doc.text(`Email: ${passenger.email}`);
    doc.text(`Phone: ${passenger.phone || 'N/A'}`);
    doc.moveDown();

    doc.text(`Route: ${route.source} → ${route.destination}`);
    doc.text(`Bus: ${bus.name} (${bus.busNumber})`);
    doc.text(`Type: ${bus.type}`);
    doc.text(`Date: ${new Date(schedule.date).toLocaleDateString()}`);
    doc.text(`Departure: ${schedule.departureTime} | Arrival: ${schedule.arrivalTime}`);
    doc.text(`Seats: ${booking.seats.join(', ')}`);
    doc.text(`Amount: ${formatCurrency(booking.totalAmount)}`);
    doc.moveDown();

    if (qrCodeImage) {
      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      doc.image(qrBuffer, { fit: [120, 120], align: 'center' });
    }

    doc.moveDown();
    doc.fontSize(10).fillColor('#16a34a').text('STATUS: CONFIRMED', { align: 'center' });
    doc.fontSize(8).fillColor('#94a3b8').text('Present this ticket at boarding.', { align: 'center' });

    doc.end();
  });
