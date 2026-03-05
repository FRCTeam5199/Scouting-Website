import { useState, useEffect, useRef } from "react";

export default function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [centiseconds, setCentiseconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      // Clear any existing interval to prevent doubles in StrictMode
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCentiseconds((prev) => {
          if (prev + 1 >= 100) {
            setSeconds((s) => s + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => {
    setSeconds(0);
    setCentiseconds(0);
    setIsRunning(false);
  };

  // Format seconds to MM:SS.CS (centiseconds)
  const formatTime = (secs, cs) => {
    const mins = Math.floor(secs / 60);
    const secsRemainder = secs % 60;
    const csRemainder = cs || 0;
    return `${mins.toString().padStart(2, "0")}:${secsRemainder
      .toString()
      .padStart(2, "0")}.${csRemainder.toString().padStart(2, "0")}`;
  };

  return {
    seconds,
    centiseconds,
    isRunning,
    toggle,
    reset,
    formatTime: () => formatTime(seconds, centiseconds),
  };
}
