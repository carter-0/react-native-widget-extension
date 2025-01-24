import ReactNativeWidgetExtensionAppClip from "./ReactNativeWidgetExtensionAppClipModule";

export function areActivitiesEnabled(): boolean {
  return ReactNativeWidgetExtensionAppClip.areActivitiesEnabled();
}

export function startActivity(...args: any): void {
  return ReactNativeWidgetExtensionAppClip.startActivity(...args);
}

export function updateActivity(...args: any): void {
  return ReactNativeWidgetExtensionAppClip.updateActivity(...args);
}

export function endActivity(...args: any): void {
  return ReactNativeWidgetExtensionAppClip.endActivity(...args);
}
