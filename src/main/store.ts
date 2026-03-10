import Store from 'electron-store';
import { app } from 'electron';
import path from 'path';
import type { AppSettings, Resolution } from '../shared/types';

const defaults: AppSettings = {
  savePath: path.join(app.getPath('videos'), 'Videso'),
  resolution: '1080p' as Resolution,
  webcamEnabled: false,
};

const store = new (Store as any)({ defaults }) as any;

export function getSettings(): AppSettings {
  return {
    savePath: store.get('savePath') as string,
    resolution: store.get('resolution') as Resolution,
    webcamEnabled: store.get('webcamEnabled') as boolean,
    webcamDeviceId: store.get('webcamDeviceId') as string | undefined,
  };
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  store.set(key, value);
}

export { store };
