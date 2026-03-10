import { supabase } from '../lib/supabase';
import type { MarketplaceListing, MarketplaceReview } from '../types';

export const marketplaceService = {
  async getListings(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceListing[]> {
    try {
      const { data, error } = await supabase.rpc('get_marketplace_listings', {
        p_category: filters?.category || null,
        p_min_price: filters?.minPrice || null,
        p_max_price: filters?.maxPrice || null,
        p_condition: filters?.condition || null,
        p_search: filters?.search || null,
        p_limit: filters?.limit || 20,
        p_offset: filters?.offset || 0
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  },

  async getListingById(listingId: string): Promise<MarketplaceListing | null> {
    try {
      const { data, error } = await supabase.rpc('get_listing_by_id', {
        p_listing_id: listingId
      });
      if (error) throw error;
      return (data && data.length > 0) ? data[0] : null;
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  },

  async getMyListings(): Promise<MarketplaceListing[]> {
    try {
      const { data, error } = await supabase.rpc('get_my_listings');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching my listings:', error);
      return [];
    }
  },

  async createListing(listingData: {
    title: string;
    description: string;
    price: number | null;
    category: string;
    condition: string;
    location: string;
    images: string[];
  }): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_listing', {
        p_title: listingData.title,
        p_description: listingData.description,
        p_price: listingData.price, // can be null
        p_category: listingData.category,
        p_condition: listingData.condition,
        p_location: listingData.location,
        p_images: listingData.images
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create listing');
    }
  },

  async updateListing(listingId: string, updates: Partial<{
    title: string;
    description: string;
    price: number | null;
    category: string;
    condition: string;
    location: string;
    images: string[];
  }>): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_listing', {
        p_listing_id: listingId,
        p_title: updates.title || null,
        p_description: updates.description || null,
        p_price: updates.price !== undefined ? updates.price : null,
        p_category: updates.category || null,
        p_condition: updates.condition || null,
        p_location: updates.location || null,
        p_images: updates.images || null
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update listing');
    }
  },

  async deleteListing(listingId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('delete_listing', {
        p_listing_id: listingId
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete listing');
    }
  },

  async toggleFavorite(listingId: string): Promise<{ is_favorited: boolean; favorite_count: number }> {
    try {
      const { data, error } = await supabase.rpc('toggle_favorite', {
        p_listing_id: listingId
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle favorite');
    }
  },

  async addReview(listingId: string, rating: number, comment: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('add_review', {
        p_listing_id: listingId,
        p_rating: rating,
        p_comment: comment
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add review');
    }
  },

  async getReviews(listingId: string): Promise<MarketplaceReview[]> {
    try {
      const { data, error } = await supabase.rpc('get_listing_reviews', {
        p_listing_id: listingId
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  async incrementViews(listingId: string): Promise<void> {
    try {
      await supabase.rpc('increment_listing_views', {
        p_listing_id: listingId
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }
};
