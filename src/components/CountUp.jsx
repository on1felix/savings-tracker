import { useState, useEffect, useRef } from 'react';

export default function CountUp({ end, duration = 2, suffix = '', prefix = '', className = '', decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  const prevEnd = useRef(end);

  useEffect(() => {
    if (prevEnd.current !== end) {
      started.current = false;
      prevEnd.current = end;
    }
  }, [end]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startValue = count;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = (now - startTime) / (duration * 1000);
            if (elapsed >= 1) {
              setCount(end);
              return;
            }
            const eased = 1 - Math.pow(1 - elapsed, 3);
            const currentValue = startValue + (end - startValue) * eased;
            setCount(currentValue);
            requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, count]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
