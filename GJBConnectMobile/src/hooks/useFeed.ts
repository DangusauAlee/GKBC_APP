import { useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '../services/supabase/feed';
import { useAuthStore } from '../store/authStore';
import { feedKeys } from './queryKeys';

const POSTS_PER_PAGE = 10;

export const useFeed = () => {
  const user = useAuthStore((state) => state.user);

  return useInfiniteQuery({
    queryKey: feedKeys.lists(),
    queryFn: ({ pageParam = 0 }) =>
      feedService.getHomeFeed(user?.id!, POSTS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < POSTS_PER_PAGE) return undefined;
      return allPages.length * POSTS_PER_PAGE;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes cache
    placeholderData: (previousData) => previousData,
    enabled: !!user?.id,
  });
};
