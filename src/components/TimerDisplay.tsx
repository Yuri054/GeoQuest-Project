import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  startTime: number;
  isRunning: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ startTime, isRunning }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    // Initial sync
    setSeconds(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1 text-slate-300 font-mono text-xs tabular-nums">
      <Clock className="w-3.5 h-3.5 text-slate-400" />
      <span>{formatted}</span>
    </div>
  );
};
