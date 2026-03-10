interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function WebcamToggle({ enabled, onToggle }: Props) {
  return (
    <div className="webcam-toggle">
      <label>Webcam overlay</label>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="toggle-track" />
        <span className="toggle-thumb" />
      </label>
    </div>
  );
}
