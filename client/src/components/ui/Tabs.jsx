import { useState } from 'react';
import { cn } from '@/utils/cn';

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = onValueChange ?? setInternal;

  return (
    <div className={className} data-active={active}>
      {typeof children === 'function' ? children({ active, setActive }) : children}
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

export function TabsTrigger({ value, active, setActive, className, children, ...props }) {
  const isActive = active === value;
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive && 'bg-background text-foreground shadow-sm',
        className
      )}
      onClick={() => setActive(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, active, className, children, ...props }) {
  if (active !== value) return null;
  return (
    <div className={cn('mt-2 ring-offset-background focus-visible:outline-none', className)} {...props}>
      {children}
    </div>
  );
}
