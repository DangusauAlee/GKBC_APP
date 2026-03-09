import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services/supabase/feed';
import { commentKeys, feedKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const commentsQueryKey = commentKeys.list(postId);
  const feedQueryKey = feedKeys.lists();

  const commentsQuery = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () => feedService.getComments(postId),
    staleTime: 2 * 60 * 1000,
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      feedService.addComment(postId, user!.id, content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });
      await queryClient.cancelQueries({ queryKey: feedQueryKey });

      const previousComments = queryClient.getQueryData(commentsQueryKey);
      const previousFeed = queryClient.getQueryData(feedQueryKey);

      const tempId = `temp-${Date.now()}`;
      const newComment = {
        id: tempId,
        author_id: user!.id,
        author_name: (user!.user_metadata?.first_name || '') + ' ' + (user!.user_metadata?.last_name || '') || 'You',
        author_avatar: user!.user_metadata?.avatar_url || '',
        author_verified: false,
        content,
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        has_liked: false,
      };

      queryClient.setQueryData(commentsQueryKey, (old: any[] = []) => [
        newComment,
        ...old,
      ]);

      queryClient.setQueryData(feedQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) =>
            page.map((post) =>
              post.id === postId
                ? { ...post, comments_count: post.comments_count + 1 }
                : post
            )
          ),
        };
      });

      return { previousComments, previousFeed, tempId };
    },
    onError: (err, content, context) => {
      queryClient.setQueryData(commentsQueryKey, context?.previousComments);
      queryClient.setQueryData(feedQueryKey, context?.previousFeed);
    },
    onSettled: (data, error, variables, context) => {
      if (data) {
        queryClient.setQueryData(commentsQueryKey, (old: any[]) => {
          return old.map(comment =>
            comment.id === context?.tempId
              ? { ...data, id: data.comment_id }
              : comment
          );
        });
      }
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      }, 5000);
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutateAsync,
  };
};
