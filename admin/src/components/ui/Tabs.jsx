import { cn } from '@/utils/cn';

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={cn('w-full', className)} data-value={value} data-onchange={onValueChange}>
      {children}
    </div>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ value, activeValue, onClick, className, children, ...props }) {
  const isActive = value === activeValue;
  return (
    <button
      type="button"
      onClick={() => onClick?.(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive && 'bg-background text-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeValue, className, children, ...props }) {
  if (value !== activeValue) return null;
  return (
    <div className={cn('mt-4 ring-offset-background focus-visible:outline-none', className)} {...props}>
      {children}
    </div>
  );
}
