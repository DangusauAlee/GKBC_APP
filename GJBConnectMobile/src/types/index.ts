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

export interface LikersPreview {
  name: string;
}
