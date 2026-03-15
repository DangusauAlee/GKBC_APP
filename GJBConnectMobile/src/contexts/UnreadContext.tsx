import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { messagingService } from '../services/messaging';
import { supabase } from '../lib/supabase';

interface UnreadContextType {
  unreadMessages: number;
  unreadNotifications: number;
  refreshUnread: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export const UnreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const refreshUnread = async () => {
    if (!user) return;
    try {
      // Get message unread count from existing messagingService.getUnreadCounts
      const counts = await messagingService.getUnreadCounts(user.id);
      setUnreadMessages(counts.total);

      // Get notification unread count directly from database (simpler than creating a new service)
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      setUnreadNotifications(count || 0);
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  };

  useEffect(() => {
    refreshUnread();
    
    // Set up realtime subscription for notifications
    const channel = supabase
      .channel('unread-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          refreshUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <UnreadContext.Provider value={{ unreadMessages, unreadNotifications, refreshUnread }}>
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => {
  const context = useContext(UnreadContext);
  if (!context) throw new Error('useUnread must be used within UnreadProvider');
  return context;
};
