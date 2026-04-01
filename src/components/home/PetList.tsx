import { View, Text, FlatList, ActivityIndicator, RefreshControl, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/lib/colors";
import { speciesLabel, sizeLabel } from "@/constants/enums";
import { formatDistance } from "@/utils/format-distance";
import { PetGridCard } from "@/components/shared/PetGridCard";
import { MapEmptyState } from "@/components/map/MapEmptyState";
import type { PetReport } from "@/types/pet-report";

interface PetListProps {
  items: PetReport[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenFilters: () => void;
  contentTopInset: number;
}

function getDaysAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Perdido hoje";
  if (days === 1) return "Perdido há 1 dia";
  return `Perdido há ${days} dias`;
}

function buildLocationText(report: PetReport): string | null {
  if (report.distanceMeters != null) {
    return `${formatDistance(report.distanceMeters)}${report.addressHint ? ` - ${report.addressHint}` : ""}`;
  }
  return report.addressHint ?? null;
}

export function PetList({
  items,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
  onRefresh,
  isRefreshing,
  onOpenFilters,
  contentTopInset,
}: PetListProps) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const PADDING = 16 * 2; // paddingHorizontal
  const GAP = 12;
  const cardWidth = (screenWidth - PADDING - GAP) / 2;

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      onFetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <MapEmptyState onAction={onOpenFilters} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      renderItem={({ item }) => (
        <PetGridCard
          width={cardWidth}
          photoUrl={item.pet.photos?.[0]?.url}
          species={item.pet.species}
          title={item.pet.name}
          subtitle={`${speciesLabel[item.pet.species]} · ${sizeLabel[item.pet.size]}${item.pet.primaryColor ? ` · ${item.pet.primaryColor}` : ""}`}
          locationText={buildLocationText(item)}
          timeText={getDaysAgo(item.lostAt)}
          onPress={() =>
            router.push({
              pathname: "/(reports)/[id]",
              params: { id: String(item.id) },
            })
          }
        />
      )}
      ListHeaderComponent={
        <Text className="font-montserrat-bold text-lg text-text-primary">
          Pets perdidos
        </Text>
      }
      contentContainerStyle={{
        paddingTop: contentTopInset,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
      }}
      contentContainerClassName={items.length === 0 ? "flex-1" : undefined}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          progressViewOffset={contentTopInset}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="items-center py-4">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center">
          <MapEmptyState onAction={onOpenFilters} />
        </View>
      }
    />
  );
}
