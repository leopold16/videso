import type { AppSettings } from '../../../shared/types';

interface Props {
  settings: AppSettings;
  onUpdate: () => void;
}

export default function SettingsView({ settings, onUpdate }: Props) {
  async function handlePickPath() {
    const newPath = await window.videso.pickSavePath!();
    if (newPath) onUpdate();
  }

  return (
    <div className="settings">
      <div className="setting-row">
        <label>Save location</label>
        <div className="value" onClick={handlePickPath}>
          <span>{settings.savePath}</span>
          <span>Change</span>
        </div>
      </div>

      <div className="setting-row">
        <label>Shortcut</label>
        <div className="shortcut-badge">
          <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>2</kbd>
        </div>
      </div>

      <div className="version">Videso v1.0.0</div>
    </div>
  );
}
