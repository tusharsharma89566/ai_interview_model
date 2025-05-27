
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number; // in seconds
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  return (
    <div className="text-sm text-gray-300 bg-gray-600 px-2 py-1 rounded">
      Time: {formatTime(Math.max(0, timeLeft))}
    </div>
  );
};

export default TimerDisplay;
