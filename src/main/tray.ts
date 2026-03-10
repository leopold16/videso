import { Tray, nativeImage, Menu, BrowserWindow } from 'electron';
import path from 'path';
import { positionPanelBelowTray } from './windows';

let tray: Tray | null = null;

export function createTray(panelWindow: BrowserWindow): Tray {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icons', 'trayTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Videso');

  tray.on('click', (_event, bounds) => {
    if (panelWindow.isVisible()) {
      panelWindow.hide();
    } else {
      positionPanelBelowTray(panelWindow, bounds);
      panelWindow.show();
    }
  });

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Videso', enabled: false },
      { type: 'separator' },
      { label: 'Quit', role: 'quit' },
    ]);
    tray?.popUpContextMenu(contextMenu);
  });

  return tray;
}

export function setTrayRecording(recording: boolean) {
  if (!tray) return;
  const iconName = recording ? 'trayRecordingTemplate.png' : 'trayTemplate.png';
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icons', iconName);
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);
  tray.setImage(icon);
}

export function getTray(): Tray | null {
  return tray;
}
