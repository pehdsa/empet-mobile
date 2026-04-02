export type NotificationType =
  | "pet_lost_nearby"
  | "matches_found"
  | "pet_report_sighting_reported"
  | "pet_sighting_claimed";

/** Campos dentro de data vêm em snake_case (direto do toArray() do Laravel) */
export interface NotificationData {
  // pet_lost_nearby
  report_id?: number | null;
  pet_name?: string | null;
  pet_species?: string | null;
  address_hint?: string | null;
  distance_km?: number | null;
  // matches_found (+ report_id, pet_name)
  matches_count?: number | null;
  // pet_report_sighting_reported (+ report_id, pet_name, address_hint)
  sighting_id?: number | null;
  sighted_at?: string | null;
  // pet_sighting_claimed (+ sighting_id)
  sighting_title?: string | null;
  claimer_name?: string | null;
  claimer_phone?: string | null;
  claimer_phone_is_whatsapp?: boolean | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  data: NotificationData;
  readAt: string | null;
  createdAt: string;
}
