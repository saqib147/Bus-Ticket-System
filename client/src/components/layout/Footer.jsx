import { Link } from 'react-router-dom';
import { Bus, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-primary">
              <Bus className="h-6 w-6" />
              BusGo
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Book bus tickets online with real-time seat availability, secure payments, and instant e-tickets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/search" className="hover:text-primary">Search Buses</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary">My Dashboard</Link></li>
              <li><Link to="/dashboard/bookings" className="hover:text-primary">Booking History</Link></li>
              <li><Link to="/auth/register" className="hover:text-primary">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@busgo.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (800) 555-BUS</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Follow Us</h4>
            <div className="mt-4 flex gap-4 text-muted-foreground">
              <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary" /></a>
              <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary" /></a>
              <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary" /></a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BusGo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
