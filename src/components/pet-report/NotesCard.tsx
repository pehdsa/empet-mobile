import { View, Text } from "react-native";
import { Info } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface NotesCardProps {
  notes: string;
}

export function NotesCard({ notes }: NotesCardProps) {
  return (
    <View className="gap-3 bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <Info size={16} color={colors.secondary} />
        <Text className="font-montserrat-bold text-base text-text-primary">
          Observações do dono
        </Text>
      </View>
      <Text className="font-montserrat text-sm leading-5 text-text-secondary">
        {notes}
      </Text>
    </View>
  );
}
