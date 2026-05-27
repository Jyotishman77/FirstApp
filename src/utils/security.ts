import * as ScreenCapture from 'expo-screen-capture';

/**
 * Prevents screenshots and screen recording on the current window.
 * Highly recommended for sensitive, timed-access chat screens.
 */
export async function enableScreenshotBlocker(): Promise<void> {
  try {
    await ScreenCapture.preventScreenCaptureAsync();
  } catch (error) {
    console.warn('Failed to enable screen capture prevention:', error);
  }
}

/**
 * Re-allows screenshot and screen recording capture.
 */
export async function disableScreenshotBlocker(): Promise<void> {
  try {
    await ScreenCapture.allowScreenCaptureAsync();
  } catch (error) {
    console.warn('Failed to disable screen capture prevention:', error);
  }
}
