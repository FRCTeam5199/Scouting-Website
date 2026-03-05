import { useState, useEffect, useRef } from "react";


export default function useTimer(initialSeconds = 0) {
  const [time, setTime] = useState(initialSeconds * 100);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 10);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isRunning]); // ← DO NOT REMOVE BRACKETS

  const toggle = () => setIsRunning((prev) => !prev);

  const reset = () => {
    setTime(0);
    setIsRunning(false);
  };

  const seconds = Math.floor(time / 100);
  const centiseconds = time % 100;

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secsRemainder = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secsRemainder
      .toString()
      .padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    seconds,
    centiseconds,
    isRunning,
    toggle,
    reset,
    formatTime,
  };
}