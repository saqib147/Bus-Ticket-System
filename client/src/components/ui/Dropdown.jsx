import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export function Dropdown({ trigger, children, align = 'start', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover bg-background p-1 shadow-md animate-fade-in',
            align === 'end' ? 'right-0' : 'left-0'
          )}
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, onClick, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownTrigger({ children, className, ...props }) {
  return (
    <Button variant="outline" className={cn('gap-2', className)} {...props}>
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </Button>
  );
}
