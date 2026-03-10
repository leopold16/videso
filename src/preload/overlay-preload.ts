import { contextBridge, ipcRenderer } from 'electron';

const IPC = {
  COUNTDOWN_DONE: 'countdown-done',
  STOP_RECORDING: 'stop-recording',
  RECORDER_STATUS: 'recorder-status',
} as const;

contextBridge.exposeInMainWorld('videso', {
  onStartCountdown: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on('start-countdown', handler);
    return () => ipcRenderer.removeListener('start-countdown', handler);
  },
  countdownDone: () => ipcRenderer.send(IPC.COUNTDOWN_DONE),
  stopRecording: () => ipcRenderer.invoke(IPC.STOP_RECORDING),
  onRecorderStatus: (cb: (status: any) => void) => {
    const handler = (_event: any, status: any) => cb(status);
    ipcRenderer.on(IPC.RECORDER_STATUS, handler);
    return () => ipcRenderer.removeListener(IPC.RECORDER_STATUS, handler);
  },
});
