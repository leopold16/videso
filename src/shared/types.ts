export interface DesktopSource {
  id: string;
  name: string;
  thumbnailDataUrl: string;
  displayId: string;
}

export type Resolution = '720p' | '1080p' | '4k' | 'native';

export const RESOLUTION_MAP: Record<Resolution, { width: number; height: number } | null> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
  native: null,
};

export type RecordingState = 'idle' | 'countdown' | 'recording' | 'converting' | 'done';

export interface RecorderStatus {
  state: RecordingState;
  elapsed?: number;
  progress?: number;
  outputPath?: string;
  error?: string;
}

export interface AppSettings {
  savePath: string;
  resolution: Resolution;
  webcamEnabled: boolean;
  webcamDeviceId?: string;
}
