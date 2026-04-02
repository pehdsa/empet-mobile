import { useInfiniteQuery } from "@tanstack/react-query";
import { petReportsApi } from "@/services/api/pet-reports";
import { queryKeys } from "@/constants/query-keys";

/** Lista paginada de reports LOST do usuário (infinite scroll) */
export function useMyLostPets() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.myLostReports.list(),
    queryFn: ({ pageParam }) => petReportsApi.listMyLostReports(pageParam),
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
