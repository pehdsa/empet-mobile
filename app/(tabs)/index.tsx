import { useState, useCallback, useRef, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Animated } from "react-native";
import MapView, { type Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/lib/colors";
import { DEFAULT_LOCATION } from "@/constants/defaults";

import { useLocation } from "@/hooks/useLocation";
import { useLostReports } from "@/hooks/usePetReports";
import { useMapFiltersStore } from "@/stores/map-filters.store";
import { useToastStore } from "@/stores/toast";
import { FilterButton } from "@/components/map/FilterButton";
import { SightingButton } from "@/components/map/SightingButton";
import { FilterModal } from "@/components/map/FilterModal";
import { PetMarker } from "@/components/map/PetMarker";
import { PetPreviewCard } from "@/components/map/PetPreviewCard";
import { MapEmptyState } from "@/components/map/MapEmptyState";
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
  const toast = useToastStore();
  const { species, size, resetFilters } = useMapFiltersStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedReport, setSelectedReport] = useState<PetReport | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [mapRegion, setMapRegion] = useState<Region>({
    ...DEFAULT_LOCATION,
    ...(location
      ? { latitude: location.latitude, longitude: location.longitude }
      : {}),
  });

  const filters = {
    latitude: mapRegion.latitude,
    longitude: mapRegion.longitude,
    radius_km: regionToRadiusKm(mapRegion),
    species,
    size,
  };

  const {
    data: reports,
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useLostReports(filters);

  const hasActiveFilters = species !== undefined || size !== undefined;

  // Animacao de opacidade dos marcadores
  const markersOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaceholderData) {
      // Dados antigos — reduzir opacidade
      Animated.timing(markersOpacity, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Dados novos — fade in
      Animated.timing(markersOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaceholderData, markersOpacity]);

  // Toast permissão negada (uma vez)
  const hasShownToast = useRef(false);
  if (permissionStatus === "denied" && !hasShownToast.current) {
    hasShownToast.current = true;
    toast.show("Ative a localizacao para melhor experiencia", "error");
  }

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

  // Limpar seleção quando report selecionado sai dos resultados
  if (
    selectedReport &&
    reports &&
    !reports.some((r) => r.id === selectedReport.id)
  ) {
    setSelectedReport(null);
  }

  return (
    <View className="flex-1">
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
        {reports?.map((report) => (
          <PetMarker
            key={report.id}
            report={report}
            selected={selectedReport?.id === report.id}
            onPress={() => handleMarkerPress(report)}
            opacity={markersOpacity}
          />
        ))}
      </MapView>

      {/* Top bar: Filtros + Avistei um pet */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
        style={{ top: insets.top + 8 }}
      >
        <FilterButton
          onPress={() => setFilterModalVisible(true)}
          hasActiveFilters={hasActiveFilters}
        />
        <SightingButton
          onPress={() => router.push("/sighting/new" as never)}
        />
      </View>

      {/* Loading */}
      {isLoading && (
        <View
          className="absolute left-0 right-0 items-center"
          style={{ top: insets.top + 60 }}
        >
          <View className="rounded-full bg-surface p-2 shadow-sm">
            <ActivityIndicator color={colors.primary} />
          </View>
        </View>
      )}

      {/* Bottom area: FAB + card/empty */}
      <View className="absolute bottom-4 left-0 right-0 gap-3" pointerEvents="box-none">
        {/* Empty state */}
        {!isLoading && !isError && reports && reports.length === 0 && (
          <MapEmptyState onAction={() => setFilterModalVisible(true)} />
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <MapEmptyState onAction={() => setFilterModalVisible(true)} />
        )}

        {/* Preview card */}
        {selectedReport && (
          <PetPreviewCard
            report={selectedReport}
            onPress={handlePreviewPress}
          />
        )}
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}
