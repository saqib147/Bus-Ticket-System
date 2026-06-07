import { formatCurrency } from '@/utils/currency';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const popularRoutes = [
  { from: 'Lahore', to: 'Karachi', price: 4500, duration: '12h 00m' },
  { from: 'Lahore', to: 'Islamabad', price: 1800, duration: '5h 00m' },
  { from: 'Karachi', to: 'Lahore', price: 4800, duration: '12h 00m' },
  { from: 'Islamabad', to: 'Peshawar', price: 1200, duration: '3h 00m' },
  { from: 'Multan', to: 'Karachi', price: 3200, duration: '8h 30m' },
  { from: 'Faisalabad', to: 'Islamabad', price: 1500, duration: '4h 30m' },
];

export default function PopularRoutes() {
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Popular Routes</h2>
            <p className="mt-2 text-muted-foreground">Trending destinations this week</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularRoutes.map((route, i) => (
            <motion.div
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${tomorrow}`}
              >
                <Card className="group transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{route.from}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{route.to}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{route.duration}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">From {formatCurrency(route.price)}</Badge>
                      <ArrowRight className="ml-auto mt-2 h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
