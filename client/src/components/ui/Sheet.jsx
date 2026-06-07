import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export function Sheet({ open, onOpenChange, children, side = 'right' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const sideClasses = {
    right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l animate-slide-up',
    left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r animate-slide-up',
    bottom: 'inset-x-0 bottom-0 border-t animate-slide-up',
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      <div className={cn('fixed z-50 bg-background p-6 shadow-lg', sideClasses[side])}>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, onClose, title, description, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-2', className)} {...props}>
      <div className="flex items-center justify-between">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function SheetContent({ className, ...props }) {
  return <div className={cn('mt-6', className)} {...props} />;
}
