import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import CountUp from './CountUp';

export default function KpiCard({ title, value, icon: Icon, prefix, suffix, description, color = 'text-primary' }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className={cn('h-4 w-4', color)} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <CountUp end={value} prefix={prefix} suffix={suffix} />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
