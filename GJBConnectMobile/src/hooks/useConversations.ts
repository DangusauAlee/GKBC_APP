import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';
import { messagingKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';

export const useConversations = (context?: string) => {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: messagingKeys.conversationsWithContext(context),
    queryFn: () => messagingService.getConversations(userId!, context),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
