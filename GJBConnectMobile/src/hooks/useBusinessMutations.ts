import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService } from '../services/business';
import { businessKeys } from './queryKeys';

export const useBusinessMutations = () => {
  const queryClient = useQueryClient();

  // Invalidate all business lists after any change
  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: businessKeys.lists() });
  };

  const createBusiness = useMutation({
    mutationFn: (businessData: Parameters<typeof businessService.createBusiness>[0]) =>
      businessService.createBusiness(businessData),
    onSuccess: () => {
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: businessKeys.userStatus() });
    },
  });

  const addReview = useMutation({
    mutationFn: ({
      businessId,
      rating,
      comment,
    }: {
      businessId: string;
      rating: number;
      comment?: string;
    }) => businessService.addReview(businessId, rating, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(variables.businessId) });
      invalidateLists();
    },
  });

  const deleteBusiness = useMutation({
    mutationFn: (businessId: string) => businessService.deleteBusiness(businessId),
    onSuccess: () => {
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: businessKeys.userStatus() });
    },
  });

  return {
    createBusiness: createBusiness.mutateAsync,
    addReview: addReview.mutateAsync,
    deleteBusiness: deleteBusiness.mutateAsync,
  };
};
