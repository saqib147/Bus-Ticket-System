import nodemailer from 'nodemailer';
import { formatCurrency } from '../utils/currency.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  console.log(`Email skipped (SMTP sending disabled): ${subject} -> ${to}`);
  return;
};

export const sendWelcomeEmail = async (user, verificationUrl) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to BusGo - Verify Your Email',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#2563eb">Welcome to BusGo, ${user.name}!</h1>
        <p>Thank you for registering. Please verify your email address to get started.</p>
        <a href="${verificationUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Verify Email</a>
        <p style="color:#64748b;font-size:14px">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = async (user, booking, pdfBuffer) => {
  await sendEmail({
    to: user.email,
    subject: `Booking Confirmed - ${booking._id}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#16a34a">Booking Confirmed!</h1>
        <p>Hi ${user.name}, your bus ticket has been confirmed.</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Seats:</strong> ${booking.seats.join(', ')}</p>
        <p><strong>Amount:</strong> ${formatCurrency(booking.totalAmount)}</p>
        <p>Your e-ticket is attached as a PDF.</p>
      </div>
    `,
    attachments: pdfBuffer
      ? [{ filename: `ticket-${booking._id}.pdf`, content: pdfBuffer }]
      : [],
  });
};

export const sendCancellationEmail = async (user, booking, refundAmount) => {
  await sendEmail({
    to: user.email,
    subject: `Booking Cancelled - ${booking._id}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#dc2626">Booking Cancelled</h1>
        <p>Hi ${user.name}, your booking ${booking._id} has been cancelled.</p>
        <p><strong>Refund Amount:</strong> ${formatCurrency(refundAmount)}</p>
        <p>The refund will be processed within 5-7 business days.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  await sendEmail({
    to: user.email,
    subject: 'BusGo - Password Reset Request',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#2563eb">Password Reset</h1>
        <p>Hi ${user.name}, click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Reset Password</a>
      </div>
    `,
  });
};

export const sendOperatorApprovalEmail = async (user, approved) => {
  await sendEmail({
    to: user.email,
    subject: approved ? 'BusGo - Operator Account Approved' : 'BusGo - Operator Account Rejected',
    html: approved
      ? `<div style="font-family:Inter,sans-serif"><h1 style="color:#16a34a">Congratulations!</h1><p>Hi ${user.name}, your operator account has been approved. You can now log in to the admin panel.</p></div>`
      : `<div style="font-family:Inter,sans-serif"><h1 style="color:#dc2626">Application Rejected</h1><p>Hi ${user.name}, unfortunately your operator application was not approved at this time.</p></div>`,
  });
};

export default sendEmail;
