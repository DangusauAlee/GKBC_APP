import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';

export const useUserLastSeen = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userLastSeen', userId],
    queryFn: () => messagingService.getUserLastSeen(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
    staleTime: 10000,
  });
};
