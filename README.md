# BusGo - Bus Ticket Reservation System

BusGo is a full-stack MERN bus ticket reservation platform with a passenger-facing web app, an admin/operator panel, and a REST API with real-time seat locking.

## Project Structure

```
busgo/
├── client/          # Passenger-facing React app (port 5173)
├── admin/           # Admin + Operator React app (port 5174)
└── server/          # Node.js + Express API (port 5000)
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (test keys)
- Cloudinary account (optional, for image uploads)
- Gmail SMTP credentials (optional, for emails)

## Installation

```bash
# Install all dependencies
npm run install:all

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
cp admin/.env.example admin/.env
```

Edit `server/.env` with your MongoDB URI, JWT secrets, Stripe keys, and other credentials.

## Environment Variables

### Server (`server/.env`)
See `server/.env.example` for all required variables including `MONGO_URI`, JWT secrets, Stripe, Cloudinary, and email settings.

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Admin (`admin/.env`)
```
VITE_API_URL=http://localhost:5000/api/v1
```

## Seed Database

```bash
npm run seed
```

## Running in Development

```bash
npm run dev
```

This starts all three apps concurrently:
- **API**: http://localhost:5000
- **Client**: http://localhost:5173
- **Admin**: http://localhost:5174

## API Base URLs

| Service | URL |
|---------|-----|
| REST API | `http://localhost:5000/api/v1` |
| Health Check | `http://localhost:5000/health` |
| Socket.IO | `http://localhost:5000` |

## Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@busgo.com | Admin@123 |
| Operator | operator1@busgo.com | Op@123 |
| Passenger | user1@busgo.com | User@123 |

## Features

- JWT authentication with access + refresh tokens (httpOnly cookies)
- Real-time seat locking via Socket.IO (5-minute TTL)
- Stripe checkout sessions, webhooks, and refunds
- E-ticket generation (QR code + PDF)
- Email notifications (booking, cancellation, verification)
- Cloudinary image uploads for avatars and bus photos
- Admin dashboard with KPIs and reports
- Operator fleet, route, and schedule management

## Build for Production

```bash
npm run build
```

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, Stripe, Nodemailer, Cloudinary, PDFKit, QRCode

**Frontend:** React 18, Vite, Redux Toolkit, RTK Query, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
