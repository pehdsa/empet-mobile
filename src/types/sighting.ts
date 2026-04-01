export interface ReportSighting {
  id: number;
  reportId: number;
  location: { latitude: number; longitude: number };
  addressHint: string | null;
  description: string | null;
  sightedAt: string;
  sharePhone: boolean;
  contactPhone: string | null;
  isActive: boolean;
  user: { id: number; name: string };
}
