import { supabase } from '../lib/supabase';

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  sender_email: string;
  sender_status?: 'verified' | 'member';
  status: string;
  created_at: string;
}

export interface Friend {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  user_email: string;
  connected_at: string;
  user_status: 'verified' | 'member';
}

export interface SentRequest {
  id: string;
  connected_user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  user_status?: 'verified' | 'member';
  created_at: string;
}

export const connectionsService = {
  // Members list with filters (infinite scroll)
  async getMembers(
    search?: string,
    businessType?: string,
    marketArea?: string,
    page = 0,
    limit = 20
  ): Promise<any[]> {
    const offset = page * limit;
    try {
      const { data, error } = await supabase.rpc('get_member_directory', {
        p_search: search || null,
        p_business_type: businessType || null,
        p_market_area: marketArea || null,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getMembers error:', error);
      throw new Error('Failed to load members');
    }
  },

  // Received connection requests
  async getReceivedRequests(): Promise<ConnectionRequest[]> {
    const { data, error } = await supabase.rpc('get_received_connection_requests');
    if (error) throw error;
    return data || [];
  },

  // Sent connection requests
  async getSentRequests(): Promise<SentRequest[]> {
    const { data, error } = await supabase.rpc('get_sent_connection_requests');
    if (error) throw error;
    return data || [];
  },

  // Friends list
  async getFriends(): Promise<Friend[]> {
    const { data, error } = await supabase.rpc('get_friends_list');
    if (error) throw error;
    return data || [];
  },

  // Accept request
  async acceptRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_connection_request', {
      p_request_id: requestId,
    });
    if (error) throw error;
  },

  // Reject request
  async rejectRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('reject_connection_request', {
      p_request_id: requestId,
    });
    if (error) throw error;
  },

  //Delete Connection
  async RemoveConnection(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('remove_connection', {
      p_request_id: requestId,
    });
    if (error) throw error;
  },

  // Withdraw request
  async withdrawRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('withdraw_connection_request', {
      p_request_id: requestId,
    });
    if (error) throw error;
  },

  // Send connection request
  async sendConnectionRequest(userId: string): Promise<{ id: string }> {
    const { data, error } = await supabase.rpc('send_connection_request', {
      p_connected_user_id: userId,
    });
    if (error) throw new Error(error.message || 'Failed to send request');
    return data;
  },
};
