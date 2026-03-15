import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { messagingKeys } from './queryKeys';

export const useConversationSubscription = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Invalidate messages query to fetch new messages
          queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) });
          // Also invalidate conversations and unread counts
          queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
          queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
};
