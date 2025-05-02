import { useState, useEffect } from 'react';

const CountdownTimer = ({ className = "" }) => {
  // The end date
  const endDate = new Date("2025-05-31T23:59:59").getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate - now;
      
      if (distance < 0) {
        // Past the end date
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        // Calculate time units
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    
    // Clean up the timer
    return () => clearInterval(timer);
  }, [endDate]);
  
  // Add leading zero to single digit numbers
  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  return (
    <div className={`mt-6 mb-2 ${className}`}>
      <div className="flex space-x-4">
        <div className="bg-[#FADEBD] text-[#212529] rounded-lg w-20 h-20 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">
            {formatNumber(timeLeft.days)}
          </div>
          <span className="text-xs font-bold">Days</span>
        </div>
        <div className="bg-[#FADEBD] text-[#212529] rounded-lg w-20 h-20 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">
            {formatNumber(timeLeft.hours)}
          </div>
          <span className="text-xs font-bold">Hours</span>
        </div>
        <div className="bg-[#FADEBD] text-[#212529] rounded-lg w-20 h-20 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">
            {formatNumber(timeLeft.minutes)}
          </div>
          <span className="text-xs font-bold">Minutes</span>
        </div>
        <div className="bg-[#FADEBD] text-[#212529] rounded-lg w-20 h-20 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">
            {formatNumber(timeLeft.seconds)}
          </div>
          <span className="text-xs font-bold">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;