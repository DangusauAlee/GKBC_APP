import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';
import { messagingKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';
import type { Message, MessageType } from '../types';

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuthStore();

  return useMutation({
    mutationFn: ({
      content,
      type = 'text',
      listingId,
      mediaUrl,
    }: {
      content: string;
      type?: MessageType;
      listingId?: string;
      mediaUrl?: string;
    }) => messagingService.sendMessage(conversationId, user!.id, content, type, listingId, mediaUrl),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: messagingKeys.messages(conversationId) });

      const previousMessages = queryClient.getQueryData(messagingKeys.messages(conversationId));

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user!.id,
        sender_name: profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : 'You',
        sender_avatar: profile?.avatar_url,
        sender_status: profile?.user_status,
        type: variables.type || 'text',
        content: variables.content,
        listing_id: variables.listingId,
        listing_title: null,
        media_url: variables.mediaUrl,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(messagingKeys.messages(conversationId), (old: any) => {
        if (!old) return { pages: [[tempMessage]], pageParams: [0] };
        return {
          ...old,
          pages: old.pages.map((page: Message[], index: number) =>
            index === 0 ? [tempMessage, ...page] : page
          ),
        };
      });

      return { previousMessages };
    },

    onError: (_err, _variables, context) => {
      queryClient.setQueryData(messagingKeys.messages(conversationId), context?.previousMessages);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
    },
  });
};
