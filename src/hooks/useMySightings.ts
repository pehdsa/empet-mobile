import { useInfiniteQuery } from "@tanstack/react-query";
import { petSightingsApi } from "@/services/api/pet-sightings";
import { queryKeys } from "@/constants/query-keys";

/** Lista paginada de avistamentos do usuário (infinite scroll) */
export function useMySightings() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.mySightings.list(),
    queryFn: ({ pageParam }) => petSightingsApi.listMySightings(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data.meta;
      return meta.current_page < meta.last_page
        ? meta.current_page + 1
        : undefined;
    },
  });

  const items = query.data?.pages.flatMap((page) => page.data.data) ?? [];

  return { ...query, items };
}
