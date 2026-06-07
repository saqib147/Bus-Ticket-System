import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Check, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useGetPendingOperatorsQuery,
  useGetUsersQuery,
  useApproveOperatorMutation,
  useRejectOperatorMutation,
} from '@/store/api/adminApi';

export default function OperatorManagementPage() {
  const { data: pendingData, isLoading: pendingLoading } = useGetPendingOperatorsQuery();
  const { data: operatorsData, isLoading: operatorsLoading } = useGetUsersQuery({ role: 'operator' });
  const [approveOperator, { isLoading: approving }] = useApproveOperatorMutation();
  const [rejectOperator, { isLoading: rejecting }] = useRejectOperatorMutation();

  const pending = pendingData?.data?.operators || [];
  const allOperators = operatorsData?.data?.users || [];

  const handleApprove = async (id) => {
    try {
      await approveOperator(id).unwrap();
      toast.success('Operator approved successfully');
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

  const statusVariant = {
    pending: 'warning',
    approved: 'success',
    rejected: 'destructive',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
          <Badge variant="warning">{pending.length}</Badge>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending operator applications</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((op) => (
                  <TableRow key={op._id}>
                    <TableCell className="font-medium">{op.name}</TableCell>
                    <TableCell>{op.email}</TableCell>
                    <TableCell>{op.phone || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(op.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={approving || rejecting}
                          onClick={() => handleApprove(op._id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={approving || rejecting}
                          onClick={() => handleReject(op._id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Operators</CardTitle>
        </CardHeader>
        <CardContent>
          {operatorsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOperators.map((op) => (
                  <TableRow key={op._id}>
                    <TableCell className="font-medium">{op.name}</TableCell>
                    <TableCell>{op.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[op.operatorStatus] || 'outline'}>
                        {op.operatorStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={op.isActive ? 'success' : 'destructive'}>
                        {op.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(op.createdAt), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
                {allOperators.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No operators found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
