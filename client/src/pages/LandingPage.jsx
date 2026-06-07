import Hero from '@/components/landing/Hero';
import StatsRow from '@/components/landing/StatsRow';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PopularRoutes from '@/components/landing/PopularRoutes';
import TestimonialsSection from '@/components/landing/TestimonialsSection';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <StatsRow />
      <FeaturesSection />
      <HowItWorksSection />
      <PopularRoutes />
      <TestimonialsSection />
    </>
  );
}
