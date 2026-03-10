import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './countdown.css';

function Countdown() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const unsub = window.videso.onStartCountdown!(() => {
      setCount(3);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      window.videso.countdownDone!();
      setCount(null);
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 800);
    return () => clearTimeout(timer);
  }, [count]);

  if (count === null || count === 0) return null;

  return (
    <div className="countdown-overlay">
      <div key={count} className="countdown-number">
        {count}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Countdown />);
