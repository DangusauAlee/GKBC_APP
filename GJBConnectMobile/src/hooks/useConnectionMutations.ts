import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsService } from '../services/connections';
import { memberKeys, connectionKeys } from './queryKeys';

export const useConnectionMutations = (
  search: string,
  businessType: string,
  marketArea: string
) => {
  const queryClient = useQueryClient();

  const sendRequest = useMutation({
    mutationFn: (userId: string) => connectionsService.sendConnectionRequest(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({
        queryKey: memberKeys.filtered(search, businessType, marketArea),
      });
      const previousMembers = queryClient.getQueryData(
        memberKeys.filtered(search, businessType, marketArea)
      );

      // Optimistically update members list (mark as pending)
      queryClient.setQueryData(
        memberKeys.filtered(search, businessType, marketArea),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any[]) =>
              page.map((member) =>
                member.id === userId ? { ...member, _optimisticStatus: 'pending' } : member
              )
            ),
          };
        }
      );

      return { previousMembers };
    },
    onError: (err, userId, context) => {
      queryClient.setQueryData(
        memberKeys.filtered(search, businessType, marketArea),
        context?.previousMembers
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.filtered(search, businessType, marketArea),
      });
      queryClient.invalidateQueries({ queryKey: connectionKeys.sent() });
    },
  });

  const acceptRequest = useMutation({
    mutationFn: (requestId: string) => connectionsService.acceptRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: connectionKeys.received() });
      await queryClient.cancelQueries({ queryKey: connectionKeys.friends() });

      const prevReceived = queryClient.getQueryData(connectionKeys.received());
      const prevFriends = queryClient.getQueryData(connectionKeys.friends());

      const request = (prevReceived as any[])?.find((r) => r.id === requestId);
      if (request) {
        // Remove from received
        queryClient.setQueryData(connectionKeys.received(), (old: any[]) =>
          old.filter((r) => r.id !== requestId)
        );
        // Add to friends
        queryClient.setQueryData(connectionKeys.friends(), (old: any[]) => [
          ...old,
          {
            user_id: request.sender_id,
            user_name: request.sender_name,
            user_avatar: request.sender_avatar,
            user_email: request.sender_email,
            connected_at: new Date().toISOString(),
            user_status: request.sender_status || 'member',
          },
        ]);
      }

      return { prevReceived, prevFriends };
    },
    onError: (err, requestId, context) => {
      queryClient.setQueryData(connectionKeys.received(), context?.prevReceived);
      queryClient.setQueryData(connectionKeys.friends(), context?.prevFriends);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
  });

  const rejectRequest = useMutation({
    mutationFn: (requestId: string) => connectionsService.rejectRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: connectionKeys.received() });
      const prevReceived = queryClient.getQueryData(connectionKeys.received());
      queryClient.setQueryData(connectionKeys.received(), (old: any[]) =>
        old.filter((r) => r.id !== requestId)
      );
      return { prevReceived };
    },
    onError: (err, requestId, context) => {
      queryClient.setQueryData(connectionKeys.received(), context?.prevReceived);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.received() });
    },
  });

  const withdrawRequest = useMutation({
    mutationFn: (requestId: string) => connectionsService.withdrawRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: connectionKeys.sent() });
      const prevSent = queryClient.getQueryData(connectionKeys.sent());
      queryClient.setQueryData(connectionKeys.sent(), (old: any[]) =>
        old.filter((r) => r.id !== requestId)
      );
      return { prevSent };
    },
    onError: (err, requestId, context) => {
      queryClient.setQueryData(connectionKeys.sent(), context?.prevSent);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.sent() });
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
  });

  return {
    sendRequest: sendRequest.mutateAsync,
    acceptRequest: acceptRequest.mutateAsync,
    rejectRequest: rejectRequest.mutateAsync,
    withdrawRequest: withdrawRequest.mutateAsync,
  };
};
