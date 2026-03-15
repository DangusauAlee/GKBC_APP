import { useInfiniteQuery } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';
import { messagingKeys } from './queryKeys';

export const useMessages = (conversationId: string, limit = 50) => {
  return useInfiniteQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: ({ pageParam = 0 }) =>
      messagingService.getMessages(conversationId, limit, pageParam * limit),
    enabled: !!conversationId && conversationId !== 'undefined',
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};
