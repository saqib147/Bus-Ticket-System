import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

export default function CountUp({ end, duration = 1500, prefix = '', suffix = '', className }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number(end) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }

    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formatted = typeof end === 'number' && end % 1 !== 0
    ? count.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : count.toLocaleString();

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
