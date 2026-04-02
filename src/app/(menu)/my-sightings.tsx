import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eye } from "lucide-react-native";

import { colors } from "@/lib/colors";
import { useMySightings } from "@/hooks/useMySightings";
import { NavHeader } from "@/components/ui/NavHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { SightingCard } from "@/components/menu/SightingCard";

export default function MySightingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    items,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useMySightings();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Meus Avistamentos" className="px-6" />
      </View>

      {/* Loading */}
      {isLoading && (
        <View className="gap-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={88} borderRadius={16} />
          ))}
        </View>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-center font-montserrat text-sm text-text-secondary">
            Erro ao carregar seus avistamentos
          </Text>
        </View>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <View className="flex-1 items-center justify-center gap-4 px-12">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-background">
            <Eye size={32} color={colors.border} />
          </View>
          <Text className="text-center font-montserrat-medium text-sm text-text-secondary">
            Nenhum avistamento
          </Text>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <SightingCard
              sighting={item}
              onPress={() =>
                router.push({
                  pathname: "/(sightings)/[id]" as never,
                  params: { id: String(item.id) },
                })
              }
            />
          )}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            paddingBottom: 16 + insets.bottom,
          }}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
