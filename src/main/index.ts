import { app, BrowserWindow } from 'electron';
import { createTray, setTrayRecording } from './tray';
import { createPanelWindow, createCountdownWindow, createIndicatorWindow } from './windows';
import { registerShortcuts, unregisterShortcuts } from './shortcuts';
import { registerIpcHandlers } from './ipc-handlers';
import { recorder } from './recorder';
import type { RecorderStatus } from '../shared/types';

// Hide dock icon — menu bar app only
app.dock?.hide();

let panelWindow: BrowserWindow;
let countdownWindow: BrowserWindow;
let indicatorWindow: BrowserWindow;

app.whenReady().then(() => {
  panelWindow = createPanelWindow();
  countdownWindow = createCountdownWindow();
  indicatorWindow = createIndicatorWindow();

  recorder.setWindows(panelWindow, indicatorWindow, countdownWindow);
  recorder.onStateChange((status: RecorderStatus) => {
    setTrayRecording(status.state === 'recording');
  });

  createTray(panelWindow);
  registerIpcHandlers();
  registerShortcuts();

  // Hide panel when it loses focus
  panelWindow.on('blur', () => {
    if (recorder.state === 'idle') {
      panelWindow.hide();
    }
  });
});

app.on('will-quit', () => {
  unregisterShortcuts();
});

app.on('window-all-closed', () => {
  // Keep running as menu bar app
});
