import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/channels';

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
