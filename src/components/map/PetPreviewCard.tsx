import { speciesLabel, sizeLabel } from "@/constants/enums";
import { PetListCard } from "@/components/shared/PetListCard";
import type { PetReport } from "@/types/pet-report";

interface PetPreviewCardProps {
  report: PetReport;
  onPress: () => void;
}

function getDaysAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Perdido hoje";
  if (days === 1) return "Perdido há 1 dia";
  return `Perdido há ${days} dias`;
}

export function PetPreviewCard({ report, onPress }: PetPreviewCardProps) {
  const { pet, addressHint, lostAt } = report;

  return (
    <PetListCard
      photoUrl={pet.photos?.[0]?.url}
      species={pet.species}
      title={pet.name}
      subtitle={`${speciesLabel[pet.species]} · ${sizeLabel[pet.size]}${pet.primaryColor ? ` · ${pet.primaryColor}` : ""}`}
      locationText={addressHint}
      timeText={getDaysAgo(lostAt)}
      onPress={onPress}
      className="mx-4"
    />
  );
}
