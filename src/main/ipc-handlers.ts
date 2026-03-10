import { ipcMain, desktopCapturer, dialog, BrowserWindow } from 'electron';
import { IPC } from '../shared/channels';
import { getSettings, setSetting } from './store';
import { recorder } from './recorder';
import { checkPermissions, requestCameraPermission } from './permissions';
import type { DesktopSource } from '../shared/types';

export function registerIpcHandlers() {
  ipcMain.handle(IPC.GET_SOURCES, async (): Promise<DesktopSource[]> => {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 },
    });

    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnailDataUrl: s.thumbnail.toDataURL(),
      displayId: s.display_id,
    }));
  });

  ipcMain.handle(IPC.GET_SETTINGS, () => {
    return getSettings();
  });

  ipcMain.handle(IPC.SET_SETTING, (_event, key: string, value: any) => {
    setSetting(key as any, value);
  });

  ipcMain.handle(IPC.PICK_SAVE_PATH, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Choose save location',
    });
    if (!result.canceled && result.filePaths[0]) {
      setSetting('savePath', result.filePaths[0]);
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle(IPC.SELECT_SOURCE, (_event, sourceId: string) => {
    recorder.selectSource(sourceId);
  });

  ipcMain.handle(IPC.START_RECORDING, () => {
    recorder.start();
  });

  ipcMain.handle(IPC.STOP_RECORDING, () => {
    recorder.stop();
  });

  ipcMain.handle(IPC.TOGGLE_RECORDING, () => {
    recorder.toggle();
  });

  ipcMain.on(IPC.RECORDING_DATA, (_event, buffer: Buffer) => {
    recorder.handleRecordingData(buffer);
  });

  ipcMain.on(IPC.COUNTDOWN_DONE, () => {
    recorder.onCountdownDone();
  });

  ipcMain.handle(IPC.CHECK_PERMISSIONS, () => {
    return checkPermissions();
  });

  ipcMain.handle(IPC.REQUEST_PERMISSION, async () => {
    return requestCameraPermission();
  });
}
