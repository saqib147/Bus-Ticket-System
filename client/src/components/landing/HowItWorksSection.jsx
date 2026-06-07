import { motion } from 'framer-motion';
import { Search, Armchair, CreditCard, Ticket } from 'lucide-react';

const steps = [
  { icon: Search, title: 'Search', description: 'Enter your route and travel date to find available buses.' },
  { icon: Armchair, title: 'Select Seats', description: 'Pick your preferred seats from the live seat map.' },
  { icon: CreditCard, title: 'Pay Securely', description: 'Complete payment via Stripe checkout.' },
  { icon: Ticket, title: 'Get E-Ticket', description: 'Receive your QR-coded e-ticket instantly via email.' },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-4 text-muted-foreground">Book your bus ticket in four simple steps</p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-primary/20 md:block" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <step.icon className="h-7 w-7" />
              </div>
              <span className="mt-2 text-xs font-semibold text-primary">Step {i + 1}</span>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
