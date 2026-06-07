import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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

export default function FleetStatusTable({ buses, isLoading }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Fleet Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(buses || []).map((bus) => (
                <TableRow key={bus._id}>
                  <TableCell className="font-medium">{bus.busNumber}</TableCell>
                  <TableCell>{bus.name}</TableCell>
                  <TableCell>{bus.type}</TableCell>
                  <TableCell>{bus.totalSeats}</TableCell>
                  <TableCell>
                    {bus.rating?.toFixed(1) || '0.0'} ({bus.totalReviews || 0})
                  </TableCell>
                  <TableCell>
                    <Badge variant={bus.isActive ? 'success' : 'destructive'}>
                      {bus.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!buses || buses.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No buses in fleet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
