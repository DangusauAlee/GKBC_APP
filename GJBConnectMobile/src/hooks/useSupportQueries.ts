import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '../services/support';
import { supportKeys } from './queryKeys';
import type { SubmitTicketData } from '../types';

export const useUserTickets = () => {
  return useQuery({
    queryKey: supportKeys.tickets(),
    queryFn: () => supportService.getUserTickets(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTicketReplies = (ticketId: string | null) => {
  return useQuery({
    queryKey: supportKeys.replies(ticketId!),
    queryFn: () => supportService.getTicketReplies(ticketId!),
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useSubmitTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitTicketData) => supportService.submitTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
    },
  });
};

export const useAddReply = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => supportService.addReply(ticketId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.replies(ticketId) });
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
    },
  });
};

export const useCloseTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => supportService.closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: supportKeys.replies(ticketId) });
    },
  });
};
