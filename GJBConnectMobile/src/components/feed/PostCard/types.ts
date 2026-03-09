import type { Post } from '../../../types';

export interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => Promise<any> | void;
  isVisible?: boolean;
  onPlayVideo?: (postId: string | null) => void;
}
