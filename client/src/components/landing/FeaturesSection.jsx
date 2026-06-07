import { motion } from 'framer-motion';
import { Shield, Clock, CreditCard, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const features = [
  {
    icon: Clock,
    title: 'Real-Time Availability',
    description: 'Live seat maps with instant locking so you never lose your selected seats.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Stripe-powered checkout with encrypted transactions and instant confirmation.',
  },
  {
    icon: Shield,
    title: 'Verified Operators',
    description: 'All bus operators are verified and rated by real passengers.',
  },
  {
    icon: Smartphone,
    title: 'Mobile E-Tickets',
    description: 'Download PDF tickets with QR codes — no printing required.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Why Choose BusGo?</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need for a smooth bus booking experience
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
