import { BrowserWindow, Notification } from 'electron';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { convertWebmToMp4 } from './ffmpeg';
import { getSettings } from './store';
import { IPC } from '../shared/channels';
import type { RecordingState, RecorderStatus } from '../shared/types';

class Recorder {
  private _state: RecordingState = 'idle';
  private _startTime: number = 0;
  private _timerInterval: NodeJS.Timeout | null = null;
  private _panelWindow: BrowserWindow | null = null;
  private _indicatorWindow: BrowserWindow | null = null;
  private _countdownWindow: BrowserWindow | null = null;
  private _selectedSourceId: string | null = null;
  private _onStateChange?: (status: RecorderStatus) => void;

  get state(): RecordingState {
    return this._state;
  }

  setWindows(panel: BrowserWindow | null, indicator: BrowserWindow | null, countdown: BrowserWindow | null) {
    this._panelWindow = panel;
    this._indicatorWindow = indicator;
    this._countdownWindow = countdown;
  }

  onStateChange(cb: (status: RecorderStatus) => void) {
    this._onStateChange = cb;
  }

  selectSource(sourceId: string) {
    this._selectedSourceId = sourceId;
  }

  private broadcast(status: RecorderStatus) {
    this._state = status.state;
    this._onStateChange?.(status);
    for (const win of [this._panelWindow, this._indicatorWindow]) {
      if (win && !win.isDestroyed()) {
        win.webContents.send(IPC.RECORDER_STATUS, status);
      }
    }
  }

  async toggle() {
    if (this._state === 'idle') {
      await this.start();
    } else if (this._state === 'recording') {
      this.stop();
    }
  }

  async start() {
    if (this._state !== 'idle') return;

    // Show countdown
    this.broadcast({ state: 'countdown' });

    if (this._countdownWindow && !this._countdownWindow.isDestroyed()) {
      this._countdownWindow.show();
      this._countdownWindow.webContents.send('start-countdown');
    }

    // Hide panel
    if (this._panelWindow && !this._panelWindow.isDestroyed()) {
      this._panelWindow.hide();
    }
  }

  onCountdownDone() {
    // Hide countdown
    if (this._countdownWindow && !this._countdownWindow.isDestroyed()) {
      this._countdownWindow.hide();
    }

    // Start recording
    this._startTime = Date.now();
    this.broadcast({ state: 'recording', elapsed: 0 });

    // Show indicator
    if (this._indicatorWindow && !this._indicatorWindow.isDestroyed()) {
      this._indicatorWindow.show();
    }

    // Tell panel renderer to begin capture
    if (this._panelWindow && !this._panelWindow.isDestroyed()) {
      this._panelWindow.webContents.send(IPC.BEGIN_CAPTURE, this._selectedSourceId);
    }

    // Start elapsed timer
    this._timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this._startTime) / 1000);
      if (this._indicatorWindow && !this._indicatorWindow.isDestroyed()) {
        this._indicatorWindow.webContents.send(IPC.RECORDER_STATUS, {
          state: 'recording',
          elapsed,
        });
      }
    }, 1000);
  }

  stop() {
    if (this._state !== 'recording') return;

    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }

    // Hide indicator
    if (this._indicatorWindow && !this._indicatorWindow.isDestroyed()) {
      this._indicatorWindow.hide();
    }

    // Tell renderer to stop capture and send data
    if (this._panelWindow && !this._panelWindow.isDestroyed()) {
      this._panelWindow.webContents.send(IPC.STOP_CAPTURE);
    }

    this.broadcast({ state: 'converting' });
  }

  async handleRecordingData(buffer: Buffer) {
    const tempDir = path.join(app.getPath('temp'), 'videso');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(tempDir, `recording-${Date.now()}.webm`);
    fs.writeFileSync(tempPath, buffer);

    const settings = getSettings();

    try {
      const outputPath = await convertWebmToMp4(tempPath, settings.savePath, (percent) => {
        this.broadcast({ state: 'converting', progress: percent });
      });

      this.broadcast({ state: 'done', outputPath });

      new Notification({
        title: 'Recording Saved',
        body: `Saved to ${path.basename(outputPath)}`,
      }).show();

      // Reset to idle after a moment
      setTimeout(() => {
        this.broadcast({ state: 'idle' });
      }, 2000);
    } catch (err: any) {
      this.broadcast({ state: 'idle', error: err.message });
    }
  }
}

export const recorder = new Recorder();
