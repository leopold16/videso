import type { RecordingState } from '../../../shared/types';

interface Props {
  state: RecordingState;
  onClick: () => void;
}

const LABELS: Record<RecordingState, string> = {
  idle: 'Start Recording',
  countdown: 'Starting...',
  recording: 'Stop Recording',
  converting: 'Converting...',
  done: 'Done!',
};

export default function RecordButton({ state, onClick }: Props) {
  const disabled = state === 'countdown' || state === 'converting' || state === 'done';

  return (
    <button
      className={`record-btn ${disabled ? 'disabled' : state}`}
      onClick={onClick}
      disabled={disabled}
    >
      {LABELS[state]}
    </button>
  );
}
