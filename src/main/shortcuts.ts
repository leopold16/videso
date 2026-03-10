import { globalShortcut } from 'electron';
import { recorder } from './recorder';

export function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+2', () => {
    recorder.toggle();
  });
}

export function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}
