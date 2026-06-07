import { Clock, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function OperatorPendingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle>Account Pending Approval</CardTitle>
          <CardDescription>
            Your operator registration is being reviewed by our admin team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            You can sign in, but fleet management features will unlock once an admin approves
            your account.
          </p>
          <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 p-3">
            <Mail className="h-4 w-4" />
            <span>You will receive an email once approved.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
