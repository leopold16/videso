import type { DesktopSource, AppSettings, RecorderStatus } from '../shared/types';

export {};

declare global {
  interface Window {
    videso: {
      // Panel (main-preload)
      getSources?: () => Promise<DesktopSource[]>;
      getSettings?: () => Promise<AppSettings>;
      setSetting?: (key: string, value: any) => Promise<void>;
      pickSavePath?: () => Promise<string | null>;
      selectSource?: (sourceId: string) => Promise<void>;
      startRecording?: () => Promise<void>;
      stopRecording?: () => Promise<void>;
      toggleRecording?: () => Promise<void>;
      sendRecordingData?: (buffer: ArrayBuffer) => void;
      checkPermissions?: () => Promise<{ screen: boolean; camera: boolean }>;
      requestPermission?: () => Promise<boolean>;
      onBeginCapture?: (cb: (sourceId: string) => void) => () => void;
      onStopCapture?: (cb: () => void) => () => void;
      // Overlay (overlay-preload)
      onStartCountdown?: (cb: () => void) => () => void;
      countdownDone?: () => void;
      // Shared
      onRecorderStatus?: (cb: (status: RecorderStatus) => void) => () => void;
    };
  }
}
