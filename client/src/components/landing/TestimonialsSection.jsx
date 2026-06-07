import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Frequent Traveler',
    text: 'BusGo made booking so easy! The real-time seat map is a game changer. I always know exactly which seat I am getting.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Business Commuter',
    text: 'Secure payments and instant e-tickets. I book my weekly commute in under 2 minutes. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Student',
    text: 'Great prices and the mobile ticket with QR code works perfectly. No more standing in line at the terminal.',
    rating: 4,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-primary/5 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">What Passengers Say</h2>
          <p className="mt-4 text-muted-foreground">Trusted by thousands of travelers</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar fallback={t.name.charAt(0)} />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
