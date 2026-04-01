import { View, Text } from "react-native";
import { Calendar, MapPin } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { formatDate } from "@/utils/format-date";
import { relativeTime } from "@/utils/relative-time";
import { StaticMapPreview } from "@/components/shared/StaticMapPreview";
import type { PetReport } from "@/types/pet-report";

interface ReportInfoSectionProps {
  report: PetReport;
}

function getRelevantDate(report: PetReport): string {
  if (report.status === "FOUND" && report.foundAt) {
    return report.foundAt;
  }
  return report.lostAt;
}

export function ReportInfoSection({ report }: ReportInfoSectionProps) {
  const relevantDate = getRelevantDate(report);

  return (
    <View className="gap-3 bg-surface p-4">
      {/* Title */}
      <Text className="font-montserrat-bold text-base text-text-primary">
        Detalhes do report
      </Text>

      {/* Date */}
      <View className="flex-row items-center gap-2">
        <Calendar size={16} color={colors.textTertiary} />
        <View className="gap-0.5">
          <Text className="font-montserrat text-sm text-text-primary">
            {formatDate(relevantDate, "dd 'de' MMMM 'de' yyyy, HH:mm")}
          </Text>
          <Text className="font-montserrat text-[13px] text-text-tertiary">
            {relativeTime(relevantDate)}
          </Text>
        </View>
      </View>

      {/* Location */}
      {report.addressHint && (
        <View className="flex-row items-center gap-2">
          <MapPin size={16} color={colors.textTertiary} />
          <Text className="font-montserrat text-sm text-text-primary">
            {report.addressHint}
          </Text>
        </View>
      )}

      {/* Description */}
      {report.description && (
        <Text className="font-montserrat text-sm leading-5 text-text-secondary">
          {report.description}
        </Text>
      )}

      {/* Static map preview — não usa MKMapView para evitar corrupção
           dos gesture recognizers no iOS (RNGH #2688) */}
      <StaticMapPreview
        latitude={report.location.latitude}
        longitude={report.location.longitude}
        label={report.pet.name}
      />
    </View>
  );
}
