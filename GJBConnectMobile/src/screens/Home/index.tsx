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
  ViewToken,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import { useFeed } from '../../hooks/useFeed';
import { feedService } from '../../services/supabase/feed';
import { feedKeys } from '../../hooks/queryKeys';
import { useAuthStore } from '../../store/authStore';
import { PostCard } from '../../components/feed/PostCard';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import VerifiedBadge from '../../components/shared/VerifiedBadge';
import type { Post } from '../../types';

export const HomeScreen: React.FC = () => {
  const { user, profile } = useAuthStore();
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

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleVideo = viewableItems.find(
      (item) => (item.item as Post).media_type === 'video'
    );
    setPlayingVideoId(visibleVideo ? (visibleVideo.item as Post).id : null);
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
      const newPost = await feedService.getPostById(postId, user!.id);

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

      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error('Failed to fetch new post', error);
      refetch();
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        isVisible={item.id === playingVideoId}
        onPlayVideo={setPlayingVideoId}
      />
    ),
    [playingVideoId]
  );

  const keyExtractor = (item: Post) => item.id;

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.createPostTextBox}
        onPress={() => setShowPostModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.createPostContent}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.createPostAvatar} />
            ) : (
              <View style={styles.createPostAvatarPlaceholder}>
                <Text style={styles.createPostAvatarInitials}>
                  {profile?.first_name?.[0]}{profile?.last_name?.[0] || 'U'}
                </Text>
              </View>
            )}
            {profile?.user_status === 'verified' && (
              <View style={styles.verifiedBadge}>
                <VerifiedBadge size={10} />
              </View>
            )}
          </View>
          <Text style={styles.createPostPlaceholder}>What's on your mind?</Text>
        </View>
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
  createPostTextBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#16a34a', // 👈 changed from gray to green
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  createPostContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  createPostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  createPostAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  createPostAvatarInitials: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  createPostPlaceholder: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
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