import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import type { Profile, ProfileData, ProfileStats, ProfileRelationship } from '../types';

export const profileService = {
  async getProfileData(profileUserId: string, viewerId: string): Promise<ProfileData> {
    const { data, error } = await supabase.rpc('get_user_profile_data', {
      p_profile_user_id: profileUserId,
      p_viewer_id: viewerId
    });
    if (error) throw error;
    return data;
  },

  async updateProfileData(profileData: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        bio: profileData.bio,
        phone: profileData.phone,
        address: profileData.address,
        business_name: profileData.business_name,
        business_type: profileData.business_type,
        market_area: profileData.market_area,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfileAvatar(file: { uri: string; name: string; type: string }): Promise<{ avatar_url: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true
      });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('avatar_url')
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfileHeader(file: { uri: string; name: string; type: string }): Promise<{ header_image_url: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `header_${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true
      });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('profiles')
      .update({ header_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('header_image_url')
      .single();
    if (error) throw error;
    return data;
  },

  async removeProfileAvatar(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw error;
  },

  async removeProfileHeader(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('profiles')
      .update({ header_image_url: null, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw error;
  },

  async getUserPosts(profileUserId: string, viewerId: string): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_user_posts', {
      p_profile_user_id: profileUserId,
      p_viewer_id: viewerId
    });
    if (error) throw error;
    return data || [];
  },

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase.rpc('delete_post', { p_post_id: postId });
    if (error) throw error;
  }
};
