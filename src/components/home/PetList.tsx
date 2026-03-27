import { View, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { colors } from "@/lib/colors";
import { PetListCard } from "./PetListCard";
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
      renderItem={({ item }) => <PetListCard report={item} />}
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
