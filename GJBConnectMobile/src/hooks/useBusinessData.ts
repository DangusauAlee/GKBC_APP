import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { businessService } from '../services/business';
import type { BusinessFilters } from '../types/business';
import { businessKeys } from './queryKeys';

export const useBusinessData = (filters: BusinessFilters = {}) => {
  const {
    business_type,
    category,
    location_axis,
    search,
    min_rating,
    limit = 20,
  } = filters;

  // Businesses list with infinite scroll
  const businessesInfinite = useInfiniteQuery({
    queryKey: businessKeys.list({ business_type, category, location_axis, search, min_rating }),
    queryFn: ({ pageParam = 0 }) =>
      businessService.getBusinesses({
        business_type,
        category,
        location_axis,
        search,
        min_rating,
        limit,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === limit ? allPages.length * limit : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  // Categories for filter dropdown
  const categoriesQuery = useQuery({
    queryKey: businessKeys.categories(),
    queryFn: () => businessService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  // Location counts (optional)
  const locationCountsQuery = useQuery({
    queryKey: businessKeys.locationCounts(),
    queryFn: () => businessService.getLocationCounts(),
    staleTime: 10 * 60 * 1000,
  });

  // User verification status
  const userStatusQuery = useQuery({
    queryKey: businessKeys.userStatus(),
    queryFn: () => businessService.getUserVerificationStatus(),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    businessesInfinite.isLoading ||
    categoriesQuery.isLoading ||
    userStatusQuery.isLoading;

  const isFetching = businessesInfinite.isFetching;

  return {
    businessesPages: businessesInfinite.data?.pages ?? [],
    fetchNextPage: businessesInfinite.fetchNextPage,
    hasNextPage: businessesInfinite.hasNextPage,
    isFetchingNextPage: businessesInfinite.isFetchingNextPage,
    isLoading,
    isFetching,
    categories: categoriesQuery.data ?? [],
    locationCounts: locationCountsQuery.data ?? [],
    userStatus: userStatusQuery.data ?? {
      user_status: 'member',
      email: '',
      can_create_business: false,
    },
  };
};
