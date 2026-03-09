import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import { useFeed } from '../../hooks/useFeed';
import { feedService } from '../../services/supabase/feed';
import { feedKeys } from '../../hooks/queryKeys';
import { useAuthStore } from '../../store/authStore';
import { PostCard } from '../../components/feed/PostCard';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import { Plus } from 'lucide-react-native';

export const HomeScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useFeed();

  const [showPostModal, setShowPostModal] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const posts = data?.pages.flat() ?? [];

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 300,
    }),
    []
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    const visibleVideo = viewableItems.find(
      (item) => item.item.media_type === 'video'
    );
    setPlayingVideoId(visibleVideo ? visibleVideo.item.id : null);
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePostCreated = async (postId: string) => {
    try {
      // Fetch the newly created post
      const newPost = await feedService.getPostById(postId, user!.id);

      // Insert it at the beginning of the first page in the cache
      queryClient.setQueryData(feedKeys.lists(), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: [
            [newPost, ...(oldData.pages[0] || [])],
            ...oldData.pages.slice(1),
          ],
        };
      });

      // Scroll to top to show the new post
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      // Do NOT refetch automatically – let the user pull to refresh if they want
      // This keeps the new post at the top until manual refresh
    } catch (error) {
      console.error('Failed to fetch new post', error);
      // Fallback: just refetch
      refetch();
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        isVisible={item.id === playingVideoId}
        onPlayVideo={setPlayingVideoId}
      />
    ),
    [playingVideoId]
  );

  const keyExtractor = (item) => item.id;

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => setShowPostModal(true)}
      >
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          style={styles.createPostGradient}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.createPostText}>Create Post</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#16a34a" />
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }
    if (!hasNextPage && posts.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerText}>You've reached the end</Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>Be the first to share something!</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => setShowPostModal(true)}
        >
          <Text style={styles.emptyButtonText}>Create First Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <FlatList
          ref={flatListRef}
          data={posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#16a34a']}
              tintColor="#16a34a"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={5}
          windowSize={7}
          initialNumToRender={5}
          updateCellsBatchingPeriod={50}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        />

        <CreatePostModal
          visible={showPostModal}
          onClose={() => setShowPostModal(false)}
          onPostCreated={handlePostCreated}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 12,
  },
  createPostButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createPostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  createPostText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerEnd: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
