export type NotificationType = "pet_lost_nearby" | "matches_found" | "pet_sighting_reported";

export interface Notification {
  id: string;
  type: NotificationType;
  data: {
    title: string;
    body: string;
    report_id?: number;
    pet_name?: string;
  };
  readAt: string | null;
  createdAt: string;
}
