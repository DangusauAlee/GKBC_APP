import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '../services/marketplace';
import { marketplaceKeys } from './queryKeys';
import { useAuthStore } from '../store/authStore';
import type { MarketplaceListing } from '../types';

export const useMarketplaceMutations = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuthStore();

  const updateInfinitePages = (
    oldData: any,
    listingId: string,
    updater: (listing: MarketplaceListing) => MarketplaceListing
  ) => {
    if (!oldData?.pages) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: MarketplaceListing[]) =>
        page.map((listing) =>
          listing.id === listingId ? updater(listing) : listing
        )
      ),
    };
  };

  const addToInfinitePages = (oldData: any, newListing: MarketplaceListing) => {
    if (!oldData?.pages) return oldData;
    return {
      ...oldData,
      pages: [
        [newListing, ...(oldData.pages[0] || [])],
        ...oldData.pages.slice(1),
      ],
    };
  };

  const removeFromInfinitePages = (oldData: any, listingId: string) => {
    if (!oldData?.pages) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: MarketplaceListing[]) =>
        page.filter((listing) => listing.id !== listingId)
      ),
    };
  };

  const createListing = useMutation({
    mutationFn: (listingData: Parameters<typeof marketplaceService.createListing>[0]) =>
      marketplaceService.createListing(listingData),
    onMutate: async (listingData) => {
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

      const previousBrowse = queryClient.getQueryData(marketplaceKeys.listingsWithFilters({}));
      const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings());

      const optimisticListing: MarketplaceListing = {
        id: 'temp-' + Date.now(),
        seller_id: user?.id || '',
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        category: listingData.category,
        condition: listingData.condition as 'new' | 'used' | 'refurbished',
        location: listingData.location,
        images: listingData.images,
        views_count: 0,
        is_sold: false,
        created_at: new Date().toISOString(),
        seller_name: profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : 'You',
        seller_avatar: profile?.avatar_url || null,
        seller_verified: profile?.user_status === 'verified',
        is_favorited: false,
        favorite_count: 0,
      };

      queryClient.setQueryData(marketplaceKeys.listingsWithFilters({}), (old: any) =>
        addToInfinitePages(old, optimisticListing)
      );

      if (previousMyListings) {
        queryClient.setQueryData(
          marketplaceKeys.myListings(),
          (old: MarketplaceListing[]) => [optimisticListing, ...(old || [])]
        );
      }

      return { previousBrowse, previousMyListings };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(marketplaceKeys.listingsWithFilters({}), context?.previousBrowse);
      if (context?.previousMyListings) {
        queryClient.setQueryData(marketplaceKeys.myListings(), context.previousMyListings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });

  const updateListing = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof marketplaceService.updateListing>[1] }) =>
      marketplaceService.updateListing(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

      const previousBrowse = queryClient.getQueryData(marketplaceKeys.listingsWithFilters({}));
      const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings());

      queryClient.setQueryData(marketplaceKeys.listingsWithFilters({}), (old: any) =>
        updateInfinitePages(old, id, (listing: MarketplaceListing) => ({
          ...listing,
          ...updates,
          condition: updates.condition as 'new' | 'used' | 'refurbished',
          images: updates.images || listing.images,
        }))
      );

      queryClient.setQueryData(
        marketplaceKeys.myListings(),
        (old: MarketplaceListing[]) =>
          old?.map((listing) =>
            listing.id === id
              ? {
                  ...listing,
                  ...updates,
                  condition: updates.condition as 'new' | 'used' | 'refurbished',
                  images: updates.images || listing.images,
                }
              : listing
          ) ?? []
      );

      return { previousBrowse, previousMyListings };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(marketplaceKeys.listingsWithFilters({}), context?.previousBrowse);
      queryClient.setQueryData(marketplaceKeys.myListings(), context?.previousMyListings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });

  const deleteListing = useMutation({
    mutationFn: (listingId: string) => marketplaceService.deleteListing(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

      const previousBrowse = queryClient.getQueryData(marketplaceKeys.listingsWithFilters({}));
      const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings());

      queryClient.setQueryData(marketplaceKeys.listingsWithFilters({}), (old: any) =>
        removeFromInfinitePages(old, listingId)
      );

      queryClient.setQueryData(
        marketplaceKeys.myListings(),
        (old: MarketplaceListing[]) => old?.filter((l) => l.id !== listingId) ?? []
      );

      return { previousBrowse, previousMyListings };
    },
    onError: (_err, _listingId, context) => {
      queryClient.setQueryData(marketplaceKeys.listingsWithFilters({}), context?.previousBrowse);
      queryClient.setQueryData(marketplaceKeys.myListings(), context?.previousMyListings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: (listingId: string) => marketplaceService.toggleFavorite(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

      const previousBrowse = queryClient.getQueryData(marketplaceKeys.listingsWithFilters({}));
      const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings());

      queryClient.setQueriesData(
        { queryKey: marketplaceKeys.listingsWithFilters({}) },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: MarketplaceListing[]) =>
              page.map((listing) =>
                listing.id === listingId
                  ? {
                      ...listing,
                      is_favorited: !listing.is_favorited,
                      favorite_count: listing.favorite_count + (listing.is_favorited ? -1 : 1),
                    }
                  : listing
              )
            ),
          };
        }
      );

      queryClient.setQueryData(
        marketplaceKeys.myListings(),
        (old: MarketplaceListing[]) =>
          old?.map((listing) =>
            listing.id === listingId
              ? {
                  ...listing,
                  is_favorited: !listing.is_favorited,
                  favorite_count: listing.favorite_count + (listing.is_favorited ? -1 : 1),
                }
              : listing
          ) ?? []
      );

      return { previousBrowse, previousMyListings };
    },
    onError: (_err, _listingId, context) => {
      queryClient.setQueryData(marketplaceKeys.listingsWithFilters({}), context?.previousBrowse);
      queryClient.setQueryData(marketplaceKeys.myListings(), context?.previousMyListings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });

  const addReview = useMutation({
    mutationFn: ({ listingId, rating, comment }: { listingId: string; rating: number; comment: string }) =>
      marketplaceService.addReview(listingId, rating, comment),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.reviews(listingId) });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.detail(listingId) });
    },
  });

  return {
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    addReview,
  };
};
