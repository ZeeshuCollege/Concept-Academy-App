import { Capacitor, registerPlugin } from '@capacitor/core';

// Native Android Plugin Bridge for runtime permissions (POST_NOTIFICATIONS, CAMERA, RECORD_AUDIO)
const NativeAppPermissions = registerPlugin('AppPermissions');

const PERMISSION_STORAGE_KEY = 'concept_academy_permissions_prompted_v1';
const LEGACY_PERMISSION_STORAGE_KEY = 'aspire_permissions_prompted_v1';

export const isFirstLaunch = () => {
  try {
    return !localStorage.getItem(PERMISSION_STORAGE_KEY) && !localStorage.getItem(LEGACY_PERMISSION_STORAGE_KEY);
  } catch (e) {
    return false;
  }
};

export const markPermissionsCompleted = () => {
  try {
    localStorage.setItem(PERMISSION_STORAGE_KEY, 'true');
    localStorage.setItem(LEGACY_PERMISSION_STORAGE_KEY, 'true');
  } catch (e) {}
};

/**
 * Check current permissions status without prompting
 */
export const checkCurrentPermissions = async () => {
  const result = {
    notifications: 'prompt',
    camera: 'prompt',
    microphone: 'prompt',
    isNative: Capacitor.isNativePlatform()
  };

  // Check Notifications
  try {
    if (Capacitor.isNativePlatform()) {
      const notifRes = await NativeAppPermissions.checkNotificationPermission();
      result.notifications = notifRes?.status || (notifRes?.granted ? 'granted' : 'prompt');
    } else if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        result.notifications = 'granted';
      } else if (Notification.permission === 'denied') {
        result.notifications = 'denied';
      } else {
        result.notifications = 'prompt';
      }
    }
  } catch (e) {
    console.warn('Could not check notification permissions:', e);
  }

  // Check Camera & Mic via navigator.permissions if supported
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const camStatus = await navigator.permissions.query({ name: 'camera' });
      result.camera = camStatus.state; // 'granted', 'denied', 'prompt'
    } catch (e) {}

    try {
      const micStatus = await navigator.permissions.query({ name: 'microphone' });
      result.microphone = micStatus.state; // 'granted', 'denied', 'prompt'
    } catch (e) {}
  }

  return result;
};

/**
 * Request Notification Permission
 * Uses native Android POST_NOTIFICATIONS dialog on Capacitor, or standard Web Notification on browser
 */
export const requestNotificationPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await NativeAppPermissions.requestNotificationPermission();
      return !!res?.granted;
    } else if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  } catch (e) {
    console.warn('Notification permission request error:', e);
  }
  return false;
};

/**
 * Request Camera Permission
 * Triggers native Android CAMERA dialog on Capacitor, or WebRTC getUserMedia on browser
 */
export const requestCameraPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await NativeAppPermissions.requestCameraPermission();
      return !!res?.granted;
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      return true;
    }
  } catch (e) {
    console.warn('Camera permission request error:', e);
  }
  return false;
};

/**
 * Request Microphone Permission
 * Triggers native Android RECORD_AUDIO dialog on Capacitor, or WebRTC getUserMedia on browser
 */
export const requestMicrophonePermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await NativeAppPermissions.requestMicrophonePermission();
      return !!res?.granted;
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      return true;
    }
  } catch (e) {
    console.warn('Microphone permission request error:', e);
  }
  return false;
};

/**
 * Sequentially requests all necessary permissions
 */
export const requestAllPermissions = async (onStepProgress) => {
  const status = {
    notifications: false,
    camera: false,
    microphone: false
  };

  // 1. Notification (prompts user with native Android 13+ dialog)
  if (onStepProgress) onStepProgress('notifications', 'requesting');
  status.notifications = await requestNotificationPermission();
  if (onStepProgress) onStepProgress('notifications', status.notifications ? 'granted' : 'denied');

  // Short pause so user can absorb the transition between native OS dialogs
  await new Promise(r => setTimeout(r, 450));

  // 2. Camera (prompts user with native Android dialog)
  if (onStepProgress) onStepProgress('camera', 'requesting');
  status.camera = await requestCameraPermission();
  if (onStepProgress) onStepProgress('camera', status.camera ? 'granted' : 'denied');

  await new Promise(r => setTimeout(r, 450));

  // 3. Microphone (prompts user with native Android dialog)
  if (onStepProgress) onStepProgress('microphone', 'requesting');
  status.microphone = await requestMicrophonePermission();
  if (onStepProgress) onStepProgress('microphone', status.microphone ? 'granted' : 'denied');

  markPermissionsCompleted();
  return status;
};
