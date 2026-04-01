import { View, FlatList, ActivityIndicator, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PawPrint } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { usePets } from "@/hooks/usePets";

import { EmptyState } from "@/components/ui/EmptyState";
import { PetCard } from "@/components/pet/PetCard";
import { FAB } from "@/components/map/FAB";
import type { Pet } from "@/types/pet";

export default function PetsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, isLoading, isError, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    usePets();

  const handleCreate = () => router.push("/(pets)/new");

  const handlePetPress = (pet: Pet) => {
    router.push({ pathname: "/(pets)/[id]", params: { id: String(pet.id) } });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="h-[52px] justify-center px-6">
        <Text className="font-montserrat-bold text-lg text-text-primary">
          Meus Pets
        </Text>
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="font-montserrat text-sm text-text-secondary">
            Erro ao carregar pets
          </Text>
          <Pressable onPress={() => refetch()} className="active:opacity-60">
            <Text className="font-montserrat-medium text-sm text-primary">
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            icon={PawPrint}
            title="Nenhum pet cadastrado"
            description="Cadastre seus pets para poder reportar caso eles se percam"
            actionLabel="Cadastrar Pet"
            onAction={handleCreate}
            actionVariant="button"
          />
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PetCard pet={item} onPress={() => handlePetPress(item)} />
            )}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshing={false}
            onRefresh={() => refetch()}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ paddingVertical: 16 }}
                />
              ) : null
            }
          />

          {/* FAB */}
          <View className="absolute bottom-6 right-6">
            <FAB onPress={handleCreate} />
          </View>
        </View>
      )}
    </View>
  );
}
