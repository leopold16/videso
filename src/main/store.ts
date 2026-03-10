import { app } from 'electron';
import path from 'path';
import type { AppSettings, Resolution } from '../shared/types';

let store: any = null;

const defaults: AppSettings = {
  savePath: path.join(app.getPath('videos'), 'Videso'),
  resolution: '1080p' as Resolution,
  webcamEnabled: false,
};

// Use Function trick to preserve real ESM import() — TypeScript compiles
// `await import(...)` to require() in CommonJS mode, which breaks ESM-only packages.
const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;

export async function initStore(): Promise<void> {
  const { default: Store } = await dynamicImport('electron-store');
  store = new Store({ defaults });
}

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
