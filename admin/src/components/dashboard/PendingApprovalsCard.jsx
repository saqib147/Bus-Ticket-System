import { format } from 'date-fns';
import { Check, X, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useApproveOperatorMutation,
  useRejectOperatorMutation,
} from '@/store/api/adminApi';

export default function PendingApprovalsCard({ operators, isLoading }) {
  const [approveOperator, { isLoading: approving }] = useApproveOperatorMutation();
  const [rejectOperator, { isLoading: rejecting }] = useRejectOperatorMutation();

  const handleApprove = async (id) => {
    try {
      await approveOperator(id).unwrap();
      toast.success('Operator approved');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to approve operator');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectOperator(id).unwrap();
      toast.success('Operator rejected');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reject operator');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Pending Approvals
        </CardTitle>
        <Badge variant="warning">{operators?.length || 0}</Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !operators?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No pending operator approvals
          </p>
        ) : (
          <div className="space-y-3">
            {operators.slice(0, 5).map((op) => (
              <div
                key={op._id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium text-sm">{op.name}</p>
                  <p className="text-xs text-muted-foreground">{op.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Applied {format(new Date(op.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={approving || rejecting}
                    onClick={() => handleApprove(op._id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={approving || rejecting}
                    onClick={() => handleReject(op._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
