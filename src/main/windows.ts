import { BrowserWindow, screen } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production' && !process.env.ELECTRON_IS_PACKAGED;

function resolvePreload(name: string): string {
  return path.join(__dirname, '..', 'preload', name);
}

function resolveRenderer(entry: string): string {
  if (isDev) {
    return `http://localhost:5173/${entry}/index.html`;
  }
  return `file://${path.join(__dirname, '..', 'renderer', entry, 'index.html')}`;
}

export function createPanelWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 360,
    height: 480,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    transparent: false,
    backgroundColor: '#1e1e1e',
    vibrancy: 'popover',
    visualEffectState: 'active',
    roundedCorners: true,
    webPreferences: {
      preload: resolvePreload('main-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadURL(resolveRenderer('app'));
  if (isDev) win.webContents.openDevTools({ mode: 'detach' });
  return win;
}

export function createCountdownWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: resolvePreload('overlay-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setIgnoreMouseEvents(true);
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadURL(resolveRenderer('countdown'));
  return win;
}

export function createIndicatorWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth } = display.workAreaSize;

  const win = new BrowserWindow({
    width: 180,
    height: 44,
    x: Math.round(screenWidth / 2 - 90),
    y: 8,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    webPreferences: {
      preload: resolvePreload('overlay-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setMovable(true);
  win.loadURL(resolveRenderer('indicator'));
  return win;
}

export function positionPanelBelowTray(panel: BrowserWindow, trayBounds: Electron.Rectangle) {
  const panelBounds = panel.getBounds();
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - panelBounds.width / 2);
  const y = trayBounds.y + trayBounds.height + 4;
  panel.setPosition(x, y, false);
}
