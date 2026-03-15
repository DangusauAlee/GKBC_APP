import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';
import { messagingKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';

export const useUnreadCounts = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: messagingKeys.unreadCounts(),
    queryFn: () => messagingService.getUnreadCounts(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};
