export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  user_status: 'member' | 'verified';
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_first_name?: string;
  author_last_name?: string;
  author_verified: boolean;
  author_status: 'member' | 'verified';
  content: string;
  media_urls: string[];
  media_type: 'text' | 'image' | 'video' | 'gallery';
  location?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  has_liked: boolean;
  has_shared: boolean;
}

export interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_verified: boolean;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  has_liked: boolean;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  salary: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  location: string;
  contact_info: Record<string, any>;
  experience_level?: string;
  category?: string;
  is_verified?: boolean;
  views_count: number;
  created_at: string;
  company_name: string;
  company_avatar: string;
  company_verified?: boolean;
  contact_email?: string;
  contact_phone?: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  rsvp_count: number;
  created_at: string;
  organizer_name: string;
  organizer_avatar: string;
  organizer_verified?: boolean;
  user_rsvp_status: string | null;
}

export interface RSVPResult {
  action: string;
  rsvp_status: string | null;
  rsvp_count: number;
}

export interface JobFilters {
  jobType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface EventFilters {
  upcomingOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LikersPreview {
  name: string;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  images: string[];
  views_count: number;
  is_sold: boolean;
  created_at: string;
  seller_name: string;
  seller_avatar: string | null;
  seller_verified: boolean;
  is_favorited: boolean;
  favorite_count: number;
}

export interface MarketplaceReview {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string | null;
  reviewer_verified?: boolean;
}

export type ConversationContext = 'connection' | 'marketplace';
export type MessageType = 'text' | 'image' | 'video' | 'audio';

export interface Conversation {
  id: string;
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string | null;
  other_user_status?: 'verified' | 'member' | null;
  last_message?: string;
  last_message_at: string;
  unread_count: number;
  context: ConversationContext;
  listing_id?: string | null;
  listing_title?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string | null;
  sender_status?: 'verified' | 'member' | null;
  type: MessageType;
  content?: string | null;
  listing_id?: string | null;
  listing_title?: string | null;
  media_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCounts {
  total: number;
  marketplace: number;
  connection: number;
}


export * from './business';
