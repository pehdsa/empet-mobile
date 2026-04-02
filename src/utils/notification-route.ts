import type { NotificationType, NotificationData } from "@/types/notification";

export function getNotificationRoute(
  type: NotificationType,
  data: NotificationData,
): { pathname: string; params: Record<string, string> } | null {
  switch (type) {
    case "pet_lost_nearby":
    case "pet_report_sighting_reported":
      if (!data.report_id) return null;
      return {
        pathname: "/(reports)/[id]",
        params: { id: String(data.report_id) },
      };
    case "matches_found":
      if (!data.report_id) return null;
      return {
        pathname: "/(matches)/matches/[reportId]",
        params: { reportId: String(data.report_id) },
      };
    case "pet_sighting_claimed":
      if (!data.sighting_id) return null;
      return {
        pathname: "/(sightings)/[id]",
        params: { id: String(data.sighting_id) },
      };
    default:
      return null;
  }
}
