import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  type: string;
  subtype: string | null;
  sender_id: string | null;
  reference_id: string | null;
  content: string | null;
  data: any;
  read: boolean;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!sender_id(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
  });

  // Compute unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Realtime subscription
  useEffect(() => {
    let channel: any;

    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        )
        .subscribe();
    };

    setupChannel();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Mark all as read mutation
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('mark_all_notifications_read');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => ({ ...n, read: true })) ?? []
      );
    },
  });

  // Mark single as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? []
      );
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead: markAllAsRead.mutate,
    markAsRead: markAsRead.mutate,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  };
};
