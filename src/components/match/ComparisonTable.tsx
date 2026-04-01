import { View, Text } from "react-native";
import { Check, Minus, X } from "lucide-react-native";
import { speciesLabel, sizeLabel, sexLabel } from "@/constants/enums";
import type { Pet, PetSpecies, PetSize, PetSex } from "@/types/pet";
import type { PetSighting } from "@/types/pet-sighting";

type RowStatus = "match" | "uncertain" | "divergent";

interface ComparisonRow {
  label: string;
  petValue: string | null;
  matchValue: string | null;
  status: RowStatus;
}

function compareValues(a: string | null, b: string | null): RowStatus {
  if (a == null || b == null) return "uncertain";
  return a.toLowerCase() === b.toLowerCase() ? "match" : "divergent";
}

function buildRows(pet: Pet, sighting: PetSighting): ComparisonRow[] {
  return [
    {
      label: "Espécie",
      petValue: speciesLabel[pet.species],
      matchValue: speciesLabel[sighting.species as PetSpecies],
      status: pet.species === sighting.species ? "match" : "divergent",
    },
    {
      label: "Porte",
      petValue: sizeLabel[pet.size],
      matchValue: sighting.size ? sizeLabel[sighting.size as PetSize] : null,
      status:
        sighting.size == null
          ? "uncertain"
          : pet.size === sighting.size
            ? "match"
            : "divergent",
    },
    {
      label: "Sexo",
      petValue: sexLabel[pet.sex],
      matchValue: sighting.sex ? sexLabel[sighting.sex as PetSex] : null,
      status:
        sighting.sex == null
          ? "uncertain"
          : pet.sex === sighting.sex
            ? "match"
            : "divergent",
    },
    {
      label: "Raça",
      petValue: pet.breed?.name ?? null,
      matchValue: sighting.breed?.name ?? null,
      status: compareValues(pet.breed?.name ?? null, sighting.breed?.name ?? null),
    },
    {
      label: "Cor",
      petValue: pet.primaryColor,
      matchValue: sighting.color,
      status: compareValues(pet.primaryColor, sighting.color),
    },
  ];
}

const STATUS_CONFIG: Record<
  RowStatus,
  { bg: string; circleBg: string; Icon: typeof Check; label: string }
> = {
  match: { bg: "#43A04708", circleBg: "#43A047", Icon: Check, label: "Match" },
  uncertain: { bg: "#F8F8F8", circleBg: "#9B9C9D", Icon: Minus, label: "Incerto" },
  divergent: { bg: "#E5393508", circleBg: "#E53935", Icon: X, label: "Divergente" },
};

interface ComparisonTableProps {
  pet: Pet;
  sighting: PetSighting;
}

export function ComparisonTable({ pet, sighting }: ComparisonTableProps) {
  const rows = buildRows(pet, sighting);

  return (
    <View>
      {/* Table */}
      <View className="overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <View className="flex-row bg-background px-4 py-2.5">
          <Text className="flex-1 font-montserrat-semibold text-xs text-text-tertiary">
            Atributo
          </Text>
          <Text className="flex-1 text-center font-montserrat-semibold text-xs text-text-tertiary">
            Seu pet
          </Text>
          <Text className="flex-1 text-center font-montserrat-semibold text-xs text-text-tertiary">
            Match
          </Text>
          <View className="w-7" />
        </View>

        {/* Rows */}
        {rows.map((row) => {
          const cfg = STATUS_CONFIG[row.status];
          return (
            <View
              key={row.label}
              className="flex-row items-center border-t border-border px-4 py-3"
              style={{ backgroundColor: cfg.bg }}
            >
              <Text
                className="flex-1 font-montserrat-medium text-[13px]"
                style={{ color: row.status === "divergent" ? "#E53935" : row.status === "uncertain" ? "#9B9C9D" : "#313233" }}
              >
                {row.label}
              </Text>
              <Text className="flex-1 text-center font-montserrat text-[13px] text-text-secondary">
                {row.petValue ?? "—"}
              </Text>
              <Text
                className="flex-1 text-center font-montserrat text-[13px]"
                style={{ color: row.status === "divergent" ? "#E53935" : "#6B6C6D" }}
              >
                {row.matchValue ?? "—"}
              </Text>
              <View
                className="h-[22px] w-[22px] items-center justify-center rounded-full"
                style={{ backgroundColor: cfg.circleBg }}
              >
                <cfg.Icon size={14} color="#FFFFFF" />
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="mt-3 flex-row items-center justify-center gap-4">
        {(["match", "uncertain", "divergent"] as RowStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <View key={s} className="flex-row items-center gap-1.5">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cfg.circleBg }}
              />
              <Text className="font-montserrat text-[11px] text-text-tertiary">
                {cfg.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
