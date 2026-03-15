import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';
import type { Conversation, Message, UnreadCounts, ConversationContext, MessageType } from '../types';

// Helper: compress image (web version – not needed for native because we'll use base64 upload)
// For native, we'll handle directly in uploadMedia

export const messagingService = {
  // ==================== CONVERSATIONS ====================
  async getConversations(userId: string, context?: string): Promise<Conversation[]> {
    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: userId,
      p_context: context || null,
    });
    if (error) {
      console.error('RPC error details:', error);
      throw error;
    }
    return (data || []).map((item: any) => ({
      ...item,
      id: item.conversation_id,
    }));
  },

  async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    context: ConversationContext,
    listingId?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: userId,
      p_user2_id: otherUserId,
      p_context: context,
      p_listing_id: listingId || null,
    });
    if (error) throw error;
    return data;
  },

  async searchVerifiedUsers(query: string, currentUserId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, user_status')
      .neq('id', currentUserId)
      .eq('user_status', 'verified')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .order('first_name')
      .limit(20);
    if (error) throw error;
    return data || [];
  },

  async areUsersConnected(userId1: string, userId2: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('connections')
      .select('status')
      .or(`and(user_id.eq.${userId1},connected_user_id.eq.${userId2}),and(user_id.eq.${userId2},connected_user_id.eq.${userId1})`)
      .eq('status', 'connected')
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async getConnectedVerifiedUsers(): Promise<Array<{ id: string; username: string; avatar_url: string | null }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.rpc('get_connected_verified_users', { p_user_id: user.id });
    if (error) throw error;
    return data || [];
  },

  // ==================== CONNECTION REQUESTS ====================
  async sendConnectionRequest(otherUserId: string): Promise<{ id: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.rpc('send_connection_request', {
      p_connected_user_id: otherUserId,
    });
    if (error) throw error;
    return data;
  },

  // ==================== MESSAGES ====================
  async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    const { data, error } = await supabase.rpc('get_conversation_messages', {
      p_conversation_id: conversationId,
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw error;
    return (data || []).reverse();
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = 'text',
    listingId?: string,
    mediaUrl?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('send_message', {
      p_conversation_id: conversationId,
      p_sender_id: senderId,
      p_content: content,
      p_type: type,
      p_listing_id: listingId || null,
      p_media_url: mediaUrl || null,
    });
    if (error) throw error;
    return data;
  },

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });
    if (error) throw error;
  },

  // ==================== UNREAD COUNTS ====================
  async getUnreadCounts(userId: string): Promise<UnreadCounts> {
    const { data, error } = await supabase.rpc('get_unread_counts', { p_user_id: userId });
    if (error) throw error;
    const row = data?.[0] || { total_unread: 0, marketplace_unread: 0, connection_unread: 0 };
    return {
      total: row.total_unread,
      marketplace: row.marketplace_unread,
      connection: row.connection_unread,
    };
  },

  // ==================== CONNECTION CHAT VALIDATION ====================
  async canStartConnectionChat(userId: string, otherUserId: string): Promise<{ canStart: boolean; reason?: string }> {
    const { data, error } = await supabase.rpc('can_start_connection_chat', {
      p_user_id: userId,
      p_other_user_id: otherUserId,
    });
    if (error) throw error;
    return data;
  },

  // ==================== ONLINE PRESENCE ====================
  async updateLastSeen(userId: string): Promise<void> {
    const { error } = await supabase.rpc('update_last_seen', { p_user_id: userId });
    if (error) console.error('Failed to update last seen', error);
  },

  async getUserLastSeen(userId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('get_user_last_seen', { p_user_id: userId });
    if (error) throw error;
    return data;
  },

  // ==================== MEDIA UPLOAD (React Native version) ====================
  async uploadMedia(
    conversationId: string,
    file: { uri: string; name: string; type: string }
  ): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64);

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${conversationId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `chat-media/${fileName}`;

      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(filePath, arrayBuffer, {
          contentType: file.type || 'image/jpeg',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Failed to upload media');
    }
  },
};
