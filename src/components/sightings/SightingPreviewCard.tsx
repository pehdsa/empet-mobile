import { speciesLabel, sizeLabel } from "@/constants/enums";
import { PetListCard } from "@/components/shared/PetListCard";
import type { PetSighting } from "@/types/pet-sighting";

interface SightingPreviewCardProps {
  sighting: PetSighting;
  onPress?: () => void;
}

function getDaysAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Avistado hoje";
  if (days === 1) return "Avistado há 1 dia";
  return `Avistado há ${days} dias`;
}

export function SightingPreviewCard({ sighting, onPress }: SightingPreviewCardProps) {
  return (
    <PetListCard
      photoUrl={sighting.photos[0]?.url}
      species={sighting.species}
      title={sighting.title}
      subtitle={`${speciesLabel[sighting.species]}${sighting.size ? ` · ${sizeLabel[sighting.size]}` : ""}${sighting.color ? ` · ${sighting.color}` : ""}`}
      locationText={sighting.addressHint}
      timeText={getDaysAgo(sighting.sightedAt)}
      onPress={onPress}
      className="mx-4"
    />
  );
}
