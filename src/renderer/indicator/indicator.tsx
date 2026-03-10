import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './indicator.css';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function Indicator() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const unsub = window.videso.onRecorderStatus!((status) => {
      if (status.elapsed !== undefined) {
        setElapsed(status.elapsed);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="indicator-pill">
      <div className="pulse-dot" />
      <span className="timer">{formatTime(elapsed)}</span>
      <button className="stop-btn" onClick={() => window.videso.stopRecording!()}>
        Stop
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Indicator />);
