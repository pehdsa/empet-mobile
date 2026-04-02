export interface NotificationSettings {
  id: number;
  notifyLostNearby: boolean;
  notifyMatches: boolean;
  notifySightings: boolean;
  nearbyRadiusKm: number;
  location: { latitude: number; longitude: number } | null;
  createdAt: string;
  updatedAt: string;
}
