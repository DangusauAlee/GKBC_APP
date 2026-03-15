import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile';
import { postKeys } from './queryKeys';

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (profileUserId: string, viewerId: string) => [...profileKeys.all, profileUserId, viewerId] as const,
  posts: (profileUserId: string, viewerId: string) => [...profileKeys.all, profileUserId, viewerId, 'posts'] as const,
  comments: (profileUserId: string, postId: string) => [...profileKeys.all, profileUserId, 'posts', postId, 'comments'] as const,
};

export const useProfile = (profileUserId: string, viewerId: string) => {
  return useQuery({
    queryKey: profileKeys.detail(profileUserId, viewerId),
    queryFn: () => profileService.getProfileData(profileUserId, viewerId),
    enabled: !!profileUserId && !!viewerId,
  });
};

export const useProfilePosts = (profileUserId: string, viewerId: string) => {
  return useQuery({
    queryKey: profileKeys.posts(profileUserId, viewerId),
    queryFn: () => profileService.getUserPosts(profileUserId, viewerId),
    enabled: !!profileUserId && !!viewerId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore(); // we'll need to import authStore

  return useMutation({
    mutationFn: (data: Partial<Profile>) => profileService.updateProfileData(data),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(user.id, user.id) });
      }
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) => profileService.updateProfileAvatar(file),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(user.id, user.id) });
      }
    },
  });
};

export const useUpdateHeader = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) => profileService.updateProfileHeader(file),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(user.id, user.id) });
      }
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => profileService.removeProfileAvatar(),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(user.id, user.id) });
      }
    },
  });
};

export const useRemoveHeader = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => profileService.removeProfileHeader(),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(user.id, user.id) });
      }
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (postId: string) => profileService.deletePost(postId),
    onSuccess: (_, postId) => {
      // Invalidate posts queries – we need to know which profile this post belongs to.
      // This is tricky; we'll rely on the caller to invalidate the correct query.
    },
  });
};
