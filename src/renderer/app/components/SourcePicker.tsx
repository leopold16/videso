import type { DesktopSource } from '../../../shared/types';

interface Props {
  sources: DesktopSource[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

export default function SourcePicker({ sources, selectedId, onSelect, onRefresh }: Props) {
  return (
    <div>
      <div className="source-header">
        <span>Source</span>
        <button className="refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
      </div>
      <div className="source-grid">
        {sources.map((source) => (
          <div
            key={source.id}
            className={`source-card ${source.id === selectedId ? 'selected' : ''}`}
            onClick={() => onSelect(source.id)}
          >
            <img src={source.thumbnailDataUrl} alt={source.name} />
            <div className="source-name">{source.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
