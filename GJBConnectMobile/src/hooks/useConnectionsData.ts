import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { connectionsService } from '../services/connections';
import { memberKeys, connectionKeys } from './queryKeys';

export const useConnectionsData = (
  search: string,
  businessType: string,
  marketArea: string
) => {
  // Queries for connection data
  const receivedQuery = useQuery({
    queryKey: connectionKeys.received(),
    queryFn: () => connectionsService.getReceivedRequests(),
  });

  const sentQuery = useQuery({
    queryKey: connectionKeys.sent(),
    queryFn: () => connectionsService.getSentRequests(),
  });

  const friendsQuery = useQuery({
    queryKey: connectionKeys.friends(),
    queryFn: () => connectionsService.getFriends(),
  });

  // Infinite query for members - only enabled if at least one filter is applied
  const membersInfiniteQuery = useInfiniteQuery({
    queryKey: memberKeys.filtered(search, businessType, marketArea),
    queryFn: ({ pageParam = 0 }) =>
      connectionsService.getMembers(search, businessType, marketArea, pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    enabled: search !== '' || businessType !== '' || marketArea !== '', // Only fetch when filter is applied
  });

  const isLoading =
    membersInfiniteQuery.isLoading ||
    receivedQuery.isLoading ||
    sentQuery.isLoading ||
    friendsQuery.isLoading;

  const isFetching = membersInfiniteQuery.isFetching;

  return {
    receivedRequests: receivedQuery.data ?? [],
    sentRequests: sentQuery.data ?? [],
    friends: friendsQuery.data ?? [],
    membersPages: membersInfiniteQuery.data?.pages ?? [],
    fetchNextPage: membersInfiniteQuery.fetchNextPage,
    hasNextPage: membersInfiniteQuery.hasNextPage,
    isFetchingNextPage: membersInfiniteQuery.isFetchingNextPage,
    isLoading,
    isFetching,
    refetchConnections: () => {
      receivedQuery.refetch();
      sentQuery.refetch();
      friendsQuery.refetch();
    },
  };
};
