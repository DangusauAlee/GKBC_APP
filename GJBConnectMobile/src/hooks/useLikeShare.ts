import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services/supabase/feed';
import { feedKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';

export const useLikeShare = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const feedQueryKey = feedKeys.lists();

  const likeMutation = useMutation({
    mutationFn: (postId: string) => feedService.toggleLike(postId, user!.id),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });
      const previousData = queryClient.getQueryData(feedQueryKey);

      queryClient.setQueryData(feedQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    has_liked: !post.has_liked,
                    likes_count: post.has_liked
                      ? post.likes_count - 1
                      : post.likes_count + 1,
                  }
                : post
            )
          ),
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(feedQueryKey, context?.previousData);
    },
    // Do NOT invalidate on success – keep feed stable
  });

  const shareMutation = useMutation({
    mutationFn: (postId: string) => feedService.sharePost(postId, user!.id),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });
      const previousData = queryClient.getQueryData(feedQueryKey);

      queryClient.setQueryData(feedQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    has_shared: !post.has_shared,
                    shares_count: post.has_shared
                      ? post.shares_count - 1
                      : post.shares_count + 1,
                  }
                : post
            )
          ),
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(feedQueryKey, context?.previousData);
    },
  });

  return {
    toggleLike: likeMutation.mutateAsync,
    toggleShare: shareMutation.mutateAsync,
  };
};
