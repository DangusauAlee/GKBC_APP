import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exploreService } from '../services/explore';
import { jobKeys } from './queryKeys';
import type { JobFilters } from '../types';

export const useJobs = (filters: JobFilters = {}) => {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => exploreService.getJobs(filters),
    staleTime: 5 * 60 * 1000,
  });

  const createJob = useMutation({
    mutationFn: exploreService.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });

  const updateJob = useMutation({
    mutationFn: ({ jobId, ...data }: any) => exploreService.updateJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });

  const deleteJob = useMutation({
    mutationFn: exploreService.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });

  const incrementViews = useMutation({
    mutationFn: exploreService.incrementJobViews,
  });

  return {
    jobs: jobsQuery.data ?? [],
    isLoading: jobsQuery.isLoading,
    isFetching: jobsQuery.isFetching,
    error: jobsQuery.error,
    refetch: jobsQuery.refetch,
    createJob: createJob.mutateAsync,
    updateJob: updateJob.mutateAsync,
    deleteJob: deleteJob.mutateAsync,
    isCreating: createJob.isPending,
    isUpdating: updateJob.isPending,
    isDeleting: deleteJob.isPending,
    incrementViews: incrementViews.mutate,
  };
};
