import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';
import { messagingKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';

export const useMarkAsRead = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => messagingService.markMessagesAsRead(conversationId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
    },
  });
};
