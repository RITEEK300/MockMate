import { useEffect, useState } from 'react';

export function useInterviewTimer(durationSeconds: number, shouldRun: boolean) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!shouldRun || remaining <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [remaining, shouldRun]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return {
    remaining,
    label: `${minutes}:${seconds}`,
    progress: durationSeconds === 0 ? 0 : remaining / durationSeconds
  };
}
