import React, { useState, useEffect } from 'react';

const QuizCountdownTimer = ({ initialTime, isLocked }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isLocked || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLocked]);

  const percentage = (timeLeft / initialTime) * 100 || 0;
  
  // Color transitions based on remaining time
  let colorClass = 'text-green-600';
  let bgClass = 'bg-green-600';
  if (timeLeft <= 5) {
    colorClass = 'text-red-600';
    bgClass = 'bg-red-600';
  } else if (timeLeft <= 10) {
    colorClass = 'text-yellow-500';
    bgClass = 'bg-yellow-500';
  }

  if (isLocked) {
    colorClass = 'text-gray-400';
    bgClass = 'bg-gray-400';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Time Remaining</span>
        <span className={`text-3xl font-black font-mono ${colorClass}`}>
          00:{timeLeft.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgClass} transition-all duration-1000 ease-linear rounded-full`}
          style={{ width: `${isLocked ? 0 : percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizCountdownTimer;
