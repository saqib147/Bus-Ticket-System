import { motion } from 'framer-motion';
import { Users, Bus, MapPin, Star } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Happy Passengers', value: '50K+' },
  { icon: Bus, label: 'Buses Available', value: '200+' },
  { icon: MapPin, label: 'Routes Covered', value: '150+' },
  { icon: Star, label: 'Average Rating', value: '4.8' },
];

export default function StatsRow() {
  return (
    <section className="border-y bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
