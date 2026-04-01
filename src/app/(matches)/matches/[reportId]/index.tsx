import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { useMatches, useConfirmMatch, useDismissMatch } from "@/hooks/useMatches";
import { usePetReportDetail } from "@/hooks/usePetReports";
import { useToastStore } from "@/stores/toast";
import { NavHeader } from "@/components/ui/NavHeader";
import { MatchCard } from "@/components/match/MatchCard";
import type { MatchStatus, PetMatch } from "@/types/match";
import { useState } from "react";
import { ConfirmMatchDialog } from "@/components/match/ConfirmMatchDialog";

function parseId(raw: string | string[] | undefined): number | null {
  if (!raw || Array.isArray(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

const TABS: { key: MatchStatus; label: string }[] = [
  { key: "PENDING", label: "Pendentes" },
  { key: "CONFIRMED", label: "Confirmados" },
  { key: "DISMISSED", label: "Descartados" },
];

export default function MatchesListScreen() {
  const { reportId: rawId } = useLocalSearchParams<{ reportId: string }>();
  const reportId = parseId(rawId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const [activeTab, setActiveTab] = useState<MatchStatus>("PENDING");
  const [confirmingMatch, setConfirmingMatch] = useState<PetMatch | null>(null);

  const reportQuery = usePetReportDetail(reportId);
  const report = reportQuery.data;

  // 3 queries paralelas — uma por status — para counts e dados
  const pendingQuery = useMatches(reportId, "PENDING");
  const confirmedQuery = useMatches(reportId, "CONFIRMED");
  const dismissedQuery = useMatches(reportId, "DISMISSED");

  const queryByTab: Record<MatchStatus, typeof pendingQuery> = {
    PENDING: pendingQuery,
    CONFIRMED: confirmedQuery,
    DISMISSED: dismissedQuery,
  };

  const countByTab: Record<MatchStatus, number> = {
    PENDING: pendingQuery.data?.length ?? 0,
    CONFIRMED: confirmedQuery.data?.length ?? 0,
    DISMISSED: dismissedQuery.data?.length ?? 0,
  };

  const activeQuery = queryByTab[activeTab];
  const items = activeQuery.data ?? [];

  const confirmMut = useConfirmMatch();
  const dismissMut = useDismissMatch();

  const handleConfirm = (match: PetMatch) => {
    setConfirmingMatch(match);
  };

  const handleConfirmConfirmed = () => {
    if (!confirmingMatch || !reportId || !report) return;
    confirmMut.mutate(
      { reportId, matchId: confirmingMatch.id },
      {
        onSuccess: () => {
          setConfirmingMatch(null);
          showToast("Pet reencontrado! 🎉");
          router.replace({
            pathname: "/(pets)/[id]",
            params: { id: String(report.pet.id) },
          });
        },
        onError: () => showToast("Erro ao confirmar match", "error"),
      },
    );
  };

  const handleDismiss = (match: PetMatch) => {
    if (!reportId) return;
    dismissMut.mutate(
      { reportId, matchId: match.id },
      {
        onError: () => showToast("Erro ao descartar match", "error"),
      },
    );
  };

  if (!reportId) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-montserrat text-text-secondary">Report inválido</Text>
      </View>
    );
  }

  const isLoading = reportQuery.isLoading || activeQuery.isLoading;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <NavHeader
        title={report ? `Matches para ${report.pet.name}` : "Matches"}
        className="px-6"
      />

      {/* Tabs */}
      <View className="flex-row gap-2 px-6 py-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = countByTab[tab.key];
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                isActive ? "bg-primary" : "border border-border bg-surface"
              }`}
            >
              <Text
                className={`font-montserrat${isActive ? "-semibold" : ""} text-[13px] ${
                  isActive ? "text-white" : "text-text-secondary"
                }`}
              >
                {tab.label}
              </Text>
              {count > 0 && isActive && (
                <View className="h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white/30 px-1">
                  <Text className="font-montserrat-semibold text-[11px] text-white">
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-montserrat text-sm text-text-tertiary">
            Nenhum match {activeTab === "PENDING" ? "pendente" : activeTab === "CONFIRMED" ? "confirmado" : "descartado"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) =>
            report ? (
              <MatchCard
                match={item}
                pet={report.pet}
                onConfirm={() => handleConfirm(item)}
                onDismiss={() => handleDismiss(item)}
                onPress={() =>
                  router.push({
                    pathname: "/(matches)/matches/[reportId]/[matchId]",
                    params: {
                      reportId: String(reportId),
                      matchId: String(item.id),
                    },
                  })
                }
              />
            ) : null
          }
        />
      )}

      {/* Confirm dialog */}
      <ConfirmMatchDialog
        visible={confirmingMatch !== null}
        onClose={() => setConfirmingMatch(null)}
        onConfirm={handleConfirmConfirmed}
        loading={confirmMut.isPending}
      />
    </View>
  );
}
