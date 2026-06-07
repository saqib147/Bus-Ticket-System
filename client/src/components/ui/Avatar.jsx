import { cn } from '@/utils/cn';

export function Avatar({ className, src, alt, fallback, ...props }) {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted',
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-medium text-primary">
          {fallback}
        </span>
      )}
    </div>
  );
}
