import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { marketplaceService } from '../services/marketplace';
import { marketplaceKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';

export const useMarketplaceData = (filters?: any) => {
  const { user, profile } = useAuthStore();

  const browseQuery = useInfiniteQuery({
    queryKey: marketplaceKeys.listingsWithFilters(filters),
    queryFn: ({ pageParam = 0 }) =>
      marketplaceService.getListings({ ...filters, offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const myListingsQuery = useQuery({
    queryKey: marketplaceKeys.myListings(),
    queryFn: () => marketplaceService.getMyListings(),
    enabled: !!user && profile?.user_status === 'verified',
    staleTime: 2 * 60 * 1000,
  });

  const useListing = (listingId: string) => {
    return useQuery({
      queryKey: marketplaceKeys.detail(listingId),
      queryFn: () => marketplaceService.getListingById(listingId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useReviews = (listingId: string) => {
    return useQuery({
      queryKey: marketplaceKeys.reviews(listingId),
      queryFn: () => marketplaceService.getReviews(listingId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    browseQuery,
    myListings: myListingsQuery.data ?? [],
    isLoadingMyListings: myListingsQuery.isLoading,
    refetchMyListings: myListingsQuery.refetch,
    useListing,
    useReviews,
  };
};
