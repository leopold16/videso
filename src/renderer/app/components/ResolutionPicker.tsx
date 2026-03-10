import type { Resolution } from '../../../shared/types';

const OPTIONS: { value: Resolution; label: string }[] = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
  { value: '4k', label: '4K' },
  { value: 'native', label: 'Native' },
];

interface Props {
  value: Resolution;
  onChange: (r: Resolution) => void;
}

export default function ResolutionPicker({ value, onChange }: Props) {
  return (
    <div className="resolution-picker">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? 'active' : ''}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
