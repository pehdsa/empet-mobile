import { useState, useCallback, useRef, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Animated, Linking } from "react-native";
import MapView, { type Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/lib/colors";
import { DEFAULT_LOCATION } from "@/constants/defaults";

import { useLocation } from "@/hooks/useLocation";
import { useLostReportsMap, useLostReportsList } from "@/hooks/usePetReports";
import { useHomePetReportsStore } from "@/stores/home-pet-reports.store";
import { FilterButton } from "@/components/map/FilterButton";
import { SightingButton } from "@/components/map/SightingButton";
import { FilterModal } from "@/components/map/FilterModal";
import { PetMarker } from "@/components/map/PetMarker";
import { PetPreviewCard } from "@/components/map/PetPreviewCard";
import { MapEmptyState } from "@/components/map/MapEmptyState";
import { ViewToggle } from "@/components/home/ViewToggle";
import { PetList } from "@/components/home/PetList";
import { LocationPermissionModal } from "@/components/home/LocationPermissionModal";
import type { PetReport } from "@/types/pet-report";

/** latitudeDelta → km (1° ≈ 111 km), clamp 1-100 */
function regionToRadiusKm(region: Region): number {
  const km = (region.latitudeDelta / 2) * 111;
  return Math.min(100, Math.max(1, Math.round(km)));
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location, permissionStatus } = useLocation();
  const { viewMode, setViewMode, species, size } = useHomePetReportsStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedReport, setSelectedReport] = useState<PetReport | null>(null);
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

  const mapQuery = useLostReportsMap(mapFilters);

  // --- List query ---
  const listFilters = {
    latitude: location?.latitude ?? DEFAULT_LOCATION.latitude,
    longitude: location?.longitude ?? DEFAULT_LOCATION.longitude,
    species,
    size,
  };

  const listQuery = useLostReportsList(listFilters);

  const hasActiveFilters = species !== undefined || size !== undefined;

  // Animacao de opacidade dos marcadores
  const markersOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mapQuery.isPlaceholderData) {
      Animated.timing(markersOpacity, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(markersOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [mapQuery.isPlaceholderData, markersOpacity]);

  // Atualizar região quando localização chegar
  const hasSetInitial = useRef(false);
  if (location && !hasSetInitial.current) {
    hasSetInitial.current = true;
    setMapRegion((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }

  // Limpar selectedReport ao trocar viewMode
  const handleViewModeToggle = useCallback(
    (mode: "map" | "list") => {
      setSelectedReport(null);
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

  const handleMarkerPress = useCallback((report: PetReport) => {
    setSelectedReport(report);
  }, []);

  const handlePreviewPress = useCallback(() => {
    if (!selectedReport) return;
    router.push({
      pathname: "/pet-report/[id]",
      params: { id: String(selectedReport.id) },
    });
  }, [selectedReport, router]);

  // Limpar seleção quando report selecionado sai dos resultados do mapa
  if (
    viewMode === "map" &&
    selectedReport &&
    mapQuery.data &&
    !mapQuery.data.some((r) => r.id === selectedReport.id)
  ) {
    setSelectedReport(null);
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
            {mapQuery.data?.map((report) => (
              <PetMarker
                key={report.id}
                report={report}
                selected={selectedReport?.id === report.id}
                onPress={() => handleMarkerPress(report)}
                opacity={markersOpacity}
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

            {selectedReport && (
              <PetPreviewCard
                report={selectedReport}
                onPress={handlePreviewPress}
              />
            )}
          </View>
        </>
      )}

      {/* === LISTA === */}
      {viewMode === "list" && (
        <PetList
          items={listQuery.items}
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          isFetchingNextPage={listQuery.isFetchingNextPage}
          hasNextPage={listQuery.hasNextPage}
          onFetchNextPage={() => listQuery.fetchNextPage()}
          onRefresh={() => listQuery.refetch()}
          isRefreshing={listQuery.isRefetching && !listQuery.isFetchingNextPage}
          onOpenFilters={() => setFilterModalVisible(true)}
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
            onPress={() => router.push("/sighting/new" as never)}
          />
        </View>
      </View>

      {/* Filter Modal */}
      <FilterModal
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
