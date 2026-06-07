import { cn } from '@/utils/cn';

export function Slider({ value = [0, 100], onValueChange, min = 0, max = 100, step = 1, className }) {
  const [minVal, maxVal] = value;

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), maxVal - step);
    onValueChange?.([newMin, maxVal]);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), minVal + step);
    onValueChange?.([minVal, newMax]);
  };

  return (
    <div className={cn('relative w-full pt-6', className)}>
      <div className="relative h-2 w-full rounded-full bg-secondary">
        <div
          className="absolute h-2 rounded-full bg-primary"
          style={{
            left: `${((minVal - min) / (max - min)) * 100}%`,
            right: `${100 - ((maxVal - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="pointer-events-none absolute top-6 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="pointer-events-none absolute top-6 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background"
      />
    </div>
  );
}
