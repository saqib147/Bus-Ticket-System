import Stripe from 'stripe';

let stripeInstance = null;

export const getStripe = () => {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured in server/.env');
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
};

export default getStripe;
