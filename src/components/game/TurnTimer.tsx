import React, { useEffect, useState } from 'react';

interface Props {
  startTime: number;
  duration?: number; // Seconds
  isActive: boolean;
}

export const TurnTimer: React.FC<Props> = ({ startTime, duration = 15, isActive }) => {
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    if (!isActive) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      const percentage = (remaining / duration) * 100;
      
      setProgress(percentage);

      if (percentage <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isActive, duration]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  // Color logic
  let color = '#22c55e'; // Green
  if (progress < 50) color = '#eab308'; // Yellow
  if (progress < 20) color = '#ef4444'; // Red

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        {/* Background Ring */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="4"
        />
        {/* Progress Ring */}
        {isActive && (
            <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-100 ease-linear"
            />
        )}
      </svg>
    </div>
  );
};
