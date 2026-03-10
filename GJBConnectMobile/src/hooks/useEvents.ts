import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exploreService } from '../services/explore';
import { eventKeys } from './queryKeys';
import type { EventFilters } from '../types';

export const useEvents = (filters: EventFilters = {}) => {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => exploreService.getEvents(filters),
    staleTime: 5 * 60 * 1000,
  });

  const createEvent = useMutation({
    mutationFn: exploreService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });

  const updateEvent = useMutation({
    mutationFn: ({ eventId, ...data }: any) => exploreService.updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: exploreService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });

  const toggleRSVP = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: string }) =>
      exploreService.toggleEventRSVP(eventId, status),
    onMutate: async ({ eventId, status }) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });
      const previousEvents = queryClient.getQueryData(eventKeys.list(filters));
      queryClient.setQueryData(eventKeys.list(filters), (old: any[] = []) =>
        old.map(event =>
          event.id === eventId
            ? {
                ...event,
                user_rsvp_status: status,
                rsvp_count: event.user_rsvp_status ? event.rsvp_count : event.rsvp_count + 1,
              }
            : event
        )
      );
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(eventKeys.list(filters), context?.previousEvents);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    isFetching: eventsQuery.isFetching,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    createEvent: createEvent.mutateAsync,
    updateEvent: updateEvent.mutateAsync,
    deleteEvent: deleteEvent.mutateAsync,
    isCreating: createEvent.isPending,
    isUpdating: updateEvent.isPending,
    isDeleting: deleteEvent.isPending,
    toggleRSVP: toggleRSVP.mutateAsync,
  };
};
