import { systemPreferences } from 'electron';

export function checkScreenRecordingPermission(): boolean {
  return systemPreferences.getMediaAccessStatus('screen') === 'granted';
}

export function checkCameraPermission(): boolean {
  return systemPreferences.getMediaAccessStatus('camera') === 'granted';
}

export async function requestCameraPermission(): Promise<boolean> {
  return systemPreferences.askForMediaAccess('camera');
}

export function checkPermissions(): { screen: boolean; camera: boolean } {
  return {
    screen: checkScreenRecordingPermission(),
    camera: checkCameraPermission(),
  };
}
