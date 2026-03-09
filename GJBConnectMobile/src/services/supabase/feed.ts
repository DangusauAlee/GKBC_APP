import { supabase } from '../../lib/supabase';
import type { Post, Comment, LikersPreview } from '../../types';

export const feedService = {
  async getHomeFeed(userId: string, limit: number, offset: number): Promise<Post[]> {
    const { data, error } = await supabase.rpc('get_home_feed', {
      p_current_user_id: userId,
      p_limit_count: limit,
      p_offset_count: offset,
    });
    if (error) throw error;
    return (data || []).map((post: any) => ({
      id: post.id,
      author_id: post.author_id,
      author_name: post.author_name || 'User',
      author_avatar: post.author_avatar || '',
      author_first_name: post.author_first_name,
      author_last_name: post.author_last_name,
      author_verified: post.author_verified ?? (post.author_status === 'verified'),
      author_status: post.author_status || 'member',
      content: post.content || '',
      media_urls: post.media_urls || [],
      media_type: post.media_type || 'text',
      location: post.location || null,
      tags: post.tags || [],
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      has_liked: post.has_liked || false,
      has_shared: post.has_shared || false,
    }));
  },

  async getPostById(postId: string, userId: string): Promise<Post> {
    const { data, error } = await supabase.rpc('get_post_by_id', {
      p_post_id: postId,
      p_current_user_id: userId,
    });
    if (error) throw error;
    const post = data[0];
    return {
      id: post.id,
      author_id: post.author_id,
      author_name: post.author_name || 'User',
      author_avatar: post.author_avatar || '',
      author_first_name: post.author_first_name,
      author_last_name: post.author_last_name,
      author_verified: post.author_verified ?? (post.author_status === 'verified'),
      author_status: post.author_status || 'member',
      content: post.content || '',
      media_urls: post.media_urls || [],
      media_type: post.media_type || 'text',
      location: post.location || null,
      tags: post.tags || [],
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      has_liked: post.has_liked || false,
      has_shared: post.has_shared || false,
    };
  },

  async toggleLike(postId: string, userId: string): Promise<{ likes_count: number; has_liked: boolean }> {
    const { data, error } = await supabase.rpc('toggle_post_like', {
      p_post_id: postId,
      p_user_id: userId,
    });
    if (error) throw error;
    return data[0];
  },

  async sharePost(postId: string, userId: string): Promise<{ shares_count: number; has_shared: boolean; action: string }> {
    const { data, error } = await supabase.rpc('share_post', {
      p_post_id: postId,
      p_user_id: userId,
    });
    if (error) throw error;
    return data[0];
  },

  async addComment(postId: string, userId: string, content: string): Promise<{ comment_id: string; comments_count: number }> {
    const { data, error } = await supabase.rpc('add_comment', {
      p_post_id: postId,
      p_author_id: userId,
      p_comment_content: content,
    });
    if (error) throw error;
    return data[0];
  },

  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        likes_count,
        profiles!comments_author_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          user_status
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []).map((c: any) => {
      const profile = c.profiles || {};
      const authorName = profile.first_name || profile.last_name
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'User';
      return {
        id: c.id,
        author_id: c.author_id,
        author_name: authorName,
        author_avatar: profile.avatar_url || '',
        author_verified: profile.user_status === 'verified',
        content: c.content,
        likes_count: c.likes_count || 0,
        created_at: c.created_at,
        updated_at: c.created_at,
        has_liked: false,
      };
    });
  },

  async getPostLikersPreview(postId: string, limit: number = 3): Promise<LikersPreview[]> {
    const { data, error } = await supabase.rpc('get_post_likers_preview', {
      p_post_id: postId,
      p_limit: limit,
    });
    if (error) {
      console.warn('getPostLikersPreview error', error);
      return [];
    }
    return data || [];
  },

  async getPostFirstComment(postId: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .rpc('get_post_first_comment', { p_post_id: postId });
    if (error || !data) return null;
    return {
      id: data.id,
      author_id: data.author_id,
      author_name: data.author_name || 'User',
      author_avatar: data.author_avatar || '',
      author_verified: data.author_verified || false,
      content: data.content,
      likes_count: data.likes_count || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      has_liked: false,
    };
  },

  async createPost(
    userId: string,
    content: string,
    mediaUrls: string[],
    mediaType: 'text' | 'image' | 'video' | 'gallery',
    tags: string[]
  ): Promise<string> {
    const { data, error } = await supabase.rpc('create_post', {
      p_author_id: userId,
      p_post_content: content,
      p_media_urls: mediaUrls,
      p_media_type: mediaType,
      p_tags: tags,
    });
    if (error) throw error;
    return data;
  },
};
