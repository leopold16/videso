import { contextBridge, ipcRenderer } from 'electron';

// Inline channel names — preload scripts run in a sandboxed context
// and cannot require() non-built-in modules.
const IPC = {
  GET_SOURCES: 'get-sources',
  GET_SETTINGS: 'get-settings',
  SET_SETTING: 'set-setting',
  PICK_SAVE_PATH: 'pick-save-path',
  SELECT_SOURCE: 'select-source',
  START_RECORDING: 'start-recording',
  STOP_RECORDING: 'stop-recording',
  TOGGLE_RECORDING: 'toggle-recording',
  RECORDING_DATA: 'recording-data',
  RECORDER_STATUS: 'recorder-status',
  CHECK_PERMISSIONS: 'check-permissions',
  REQUEST_PERMISSION: 'request-permission',
  BEGIN_CAPTURE: 'begin-capture',
  STOP_CAPTURE: 'stop-capture',
} as const;

contextBridge.exposeInMainWorld('videso', {
  getSources: () => ipcRenderer.invoke(IPC.GET_SOURCES),
  getSettings: () => ipcRenderer.invoke(IPC.GET_SETTINGS),
  setSetting: (key: string, value: any) => ipcRenderer.invoke(IPC.SET_SETTING, key, value),
  pickSavePath: () => ipcRenderer.invoke(IPC.PICK_SAVE_PATH),
  selectSource: (sourceId: string) => ipcRenderer.invoke(IPC.SELECT_SOURCE, sourceId),
  startRecording: () => ipcRenderer.invoke(IPC.START_RECORDING),
  stopRecording: () => ipcRenderer.invoke(IPC.STOP_RECORDING),
  toggleRecording: () => ipcRenderer.invoke(IPC.TOGGLE_RECORDING),
  sendRecordingData: (buffer: ArrayBuffer) => ipcRenderer.send(IPC.RECORDING_DATA, Buffer.from(buffer)),
  checkPermissions: () => ipcRenderer.invoke(IPC.CHECK_PERMISSIONS),
  requestPermission: () => ipcRenderer.invoke(IPC.REQUEST_PERMISSION),
  onRecorderStatus: (cb: (status: any) => void) => {
    const handler = (_event: any, status: any) => cb(status);
    ipcRenderer.on(IPC.RECORDER_STATUS, handler);
    return () => ipcRenderer.removeListener(IPC.RECORDER_STATUS, handler);
  },
  onBeginCapture: (cb: (sourceId: string) => void) => {
    const handler = (_event: any, sourceId: string) => cb(sourceId);
    ipcRenderer.on(IPC.BEGIN_CAPTURE, handler);
    return () => ipcRenderer.removeListener(IPC.BEGIN_CAPTURE, handler);
  },
  onStopCapture: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on(IPC.STOP_CAPTURE, handler);
    return () => ipcRenderer.removeListener(IPC.STOP_CAPTURE, handler);
  },
});
