export type DevicePlatform = "IOS" | "ANDROID";

export interface Device {
  id: number;
  deviceToken: string;
  platform: DevicePlatform;
  deviceName: string;
  createdAt: string;
}
