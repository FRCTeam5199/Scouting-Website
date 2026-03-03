import { useState, useEffect, useRef } from "react";

export default function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const secsRemainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${secsRemainder
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    seconds,
    isRunning,
    toggle,
    reset,
    formatTime: () => formatTime(seconds),
  };
}
