import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const slideVariants = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={() => onOpenChange?.(false)}
          />
          <motion.div
            {...slideVariants[side]}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg',
              side === 'right' && 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
              side === 'left' && 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r'
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SheetHeader({ className, children, onClose, ...props }) {
  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      <div>{children}</div>
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function SheetTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function SheetContent({ className, ...props }) {
  return <div className={cn('flex-1 overflow-auto', className)} {...props} />;
}
