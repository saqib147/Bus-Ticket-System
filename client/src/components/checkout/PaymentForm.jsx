import { CreditCard, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PaymentForm({ onPay, isLoading, disabled }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment
        </CardTitle>
        <CardDescription>
          You will be redirected to Stripe&apos;s secure checkout to complete your payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Secure Payment via Stripe</p>
              <p className="text-xs text-muted-foreground">
                Your card details are never stored on our servers
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={onPay}
          disabled={disabled || isLoading}
        >
          <CreditCard className="h-4 w-4" />
          {isLoading ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
        </Button>
      </CardFooter>
    </Card>
  );
}
