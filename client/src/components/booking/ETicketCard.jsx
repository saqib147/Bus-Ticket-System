import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, QrCode, MapPin, Clock, Bus } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ETicketCard({ ticket, booking, schedule, route, bus, onDownload }) {
  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <div className="bg-gradient-to-r from-primary to-blue-500 p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            <span className="font-bold">BusGo E-Ticket</span>
          </div>
          <Badge className="bg-white/20 text-white">Confirmed</Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg">
          {route?.source} → {route?.destination}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Booking ID</p>
            <p className="font-mono text-sm">{booking?._id?.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Travel Date</p>
            <p className="text-sm">
              {schedule?.date ? format(new Date(schedule.date), 'PPP') : '—'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm">{schedule?.departureTime} - {schedule?.arrivalTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm">{bus?.name}</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Seats</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {(booking?.seats || []).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>

        {ticket?.qrCodeImage && (
          <div className="flex flex-col items-center rounded-lg border bg-muted/30 p-4">
            <QrCode className="mb-2 h-5 w-5 text-muted-foreground" />
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={ticket.qrCodeImage}
              alt="Ticket QR Code"
              className="h-40 w-40"
            />
            <p className="mt-2 text-xs text-muted-foreground">Scan at boarding</p>
          </div>
        )}

        <Button variant="outline" className="w-full gap-2" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Download PDF Ticket
        </Button>
      </CardContent>
    </Card>
  );
}

export function ConfettiEffect() {
  useEffect(() => {
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#fbbf24', '#34d399'];
    const container = document.createElement('div');
    container.className = 'pointer-events-none fixed inset-0 z-50 overflow-hidden';
    document.body.appendChild(container);

    const particles = Array.from({ length: 50 }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'absolute h-2 w-2 rounded-sm';
      el.style.backgroundColor = colors[i % colors.length];
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = '-10px';
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.animation = `confetti-fall ${2 + Math.random() * 2}s linear forwards`;
      el.style.animationDelay = `${Math.random() * 0.5}s`;
      container.appendChild(el);
      return el;
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const timer = setTimeout(() => {
      container.remove();
      style.remove();
    }, 4000);

    return () => {
      clearTimeout(timer);
      container.remove();
      style.remove();
    };
  }, []);

  return null;
}
