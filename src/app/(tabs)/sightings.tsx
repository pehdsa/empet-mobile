import { useState, useCallback, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Linking } from "react-native";
import MapView, { type Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/lib/colors";
import { DEFAULT_LOCATION } from "@/constants/defaults";

import { useLocation } from "@/hooks/useLocation";
import { usePetSightingsMap, usePetSightingsList } from "@/hooks/usePetSightings";
import { useSightingsFeedStore } from "@/stores/sightings-feed.store";
import { FilterButton } from "@/components/map/FilterButton";
import { SightingButton } from "@/components/map/SightingButton";
import { SightingsFilterModal } from "@/components/sightings/SightingsFilterModal";
import { SightingMarker } from "@/components/sightings/SightingMarker";
import { SightingPreviewCard } from "@/components/sightings/SightingPreviewCard";
import { MapEmptyState } from "@/components/map/MapEmptyState";
import { ViewToggle } from "@/components/home/ViewToggle";
import { SightingList } from "@/components/sightings/SightingList";
import { LocationPermissionModal } from "@/components/home/LocationPermissionModal";
import type { PetSighting } from "@/types/pet-sighting";

/** latitudeDelta → km (1° ≈ 111 km), clamp 1-100 */
function regionToRadiusKm(region: Region): number {
  const km = (region.latitudeDelta / 2) * 111;
  return Math.min(100, Math.max(1, Math.round(km)));
}

export default function Sightings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location, permissionStatus } = useLocation();
  const { viewMode, setViewMode, species, size } = useSightingsFeedStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<PetSighting | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [locationModalDismissed, setLocationModalDismissed] = useState(false);

  const [mapRegion, setMapRegion] = useState<Region>({
    ...DEFAULT_LOCATION,
    ...(location
      ? { latitude: location.latitude, longitude: location.longitude }
      : {}),
  });

  // --- Map query ---
  const mapFilters = {
    latitude: mapRegion.latitude,
    longitude: mapRegion.longitude,
    radius_km: regionToRadiusKm(mapRegion),
    species,
    size,
  };

  const mapQuery = usePetSightingsMap(mapFilters);

  // --- List query ---
  const listFilters = {
    latitude: location?.latitude ?? DEFAULT_LOCATION.latitude,
    longitude: location?.longitude ?? DEFAULT_LOCATION.longitude,
    species,
    size,
  };

  const listQuery = usePetSightingsList(listFilters);

  const hasActiveFilters = species !== undefined || size !== undefined;


  // Atualizar regiao quando localizacao chegar
  const hasSetInitial = useRef(false);
  if (location && !hasSetInitial.current) {
    hasSetInitial.current = true;
    setMapRegion((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }

  // Limpar selectedSighting ao trocar viewMode
  const handleViewModeToggle = useCallback(
    (mode: "map" | "list") => {
      setSelectedSighting(null);
      setViewMode(mode);
    },
    [setViewMode],
  );

  const handleRegionChange = useCallback((region: Region) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setMapRegion(region);
    }, 500);
  }, []);

  const handleMarkerPress = useCallback((sighting: PetSighting) => {
    setSelectedSighting(sighting);
  }, []);

  // Limpar selecao quando sighting selecionado sai dos resultados do mapa
  if (
    viewMode === "map" &&
    selectedSighting &&
    mapQuery.data &&
    !mapQuery.data.some((s) => s.id === selectedSighting.id)
  ) {
    setSelectedSighting(null);
  }

  // Modal de permissao: uma vez por sessao quando denied
  const showLocationModal =
    permissionStatus === "denied" && !locationModalDismissed;

  const handleAllowLocation = () => {
    setLocationModalDismissed(true);
    Linking.openSettings();
  };

  const toolbarTop = insets.top + 8;

  return (
    <View className="flex-1 bg-background">
      {/* === MAPA === */}
      {viewMode === "map" && (
        <>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={mapRegion}
            onRegionChangeComplete={handleRegionChange}
            showsUserLocation
            showsMyLocationButton={false}
            showsTraffic={false}
            showsBuildings={false}
            showsIndoors={false}
            showsPointsOfInterests={false}
            showsCompass={false}
            showsScale={false}
          >
            {mapQuery.data?.map((sighting, index) => (
              <SightingMarker
                key={sighting.id}
                sighting={sighting}
                selected={selectedSighting?.id === sighting.id}
                onPress={() => handleMarkerPress(sighting)}
                delay={index * 60}
              />
            ))}
          </MapView>

          {/* Loading */}
          {mapQuery.isLoading && (
            <View
              className="absolute left-0 right-0 items-center"
              style={{ top: toolbarTop + 52 }}
            >
              <View className="rounded-full bg-surface p-2 shadow-sm">
                <ActivityIndicator color={colors.primary} />
              </View>
            </View>
          )}

          {/* Bottom area */}
          <View
            className="absolute bottom-4 left-0 right-0 gap-3"
            pointerEvents="box-none"
          >
            {!mapQuery.isLoading &&
              !mapQuery.isError &&
              mapQuery.data &&
              mapQuery.data.length === 0 && (
                <MapEmptyState
                  onAction={() => setFilterModalVisible(true)}
                />
              )}

            {mapQuery.isError && !mapQuery.isLoading && (
              <MapEmptyState
                onAction={() => setFilterModalVisible(true)}
              />
            )}

            {selectedSighting && (
              <SightingPreviewCard
                sighting={selectedSighting}
                onPress={() =>
                  router.push({
                    pathname: "/(sightings)/[id]",
                    params: { id: String(selectedSighting.id) },
                  })
                }
              />
            )}
          </View>
        </>
      )}

      {/* === LISTA === */}
      {viewMode === "list" && (
        <SightingList
          items={listQuery.items}
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          isFetchingNextPage={listQuery.isFetchingNextPage}
          hasNextPage={listQuery.hasNextPage}
          onFetchNextPage={() => listQuery.fetchNextPage()}
          onRefresh={() => listQuery.refetch()}
          isRefreshing={listQuery.isRefetching && !listQuery.isFetchingNextPage}
          onOpenFilters={() => setFilterModalVisible(true)}
          onItemPress={(sighting) =>
            router.push({
              pathname: "/(sightings)/[id]",
              params: { id: String(sighting.id) },
            })
          }
          contentTopInset={toolbarTop + 52}
        />
      )}

      {/* Toolbar fixo no topo */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
        style={{ top: toolbarTop }}
        pointerEvents="box-none"
      >
        <ViewToggle mode={viewMode} onToggle={handleViewModeToggle} />
        <View className="flex-row items-center gap-2" pointerEvents="box-none">
          <FilterButton
            onPress={() => setFilterModalVisible(true)}
            hasActiveFilters={hasActiveFilters}
          />
          <SightingButton
            onPress={() => router.push("/(sightings)/new" as never)}
          />
        </View>
      </View>

      {/* Filter Modal */}
      <SightingsFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />

      {/* Location Permission Modal */}
      <LocationPermissionModal
        visible={showLocationModal}
        onClose={() => setLocationModalDismissed(true)}
        onAllow={handleAllowLocation}
      />
    </View>
  );
}
