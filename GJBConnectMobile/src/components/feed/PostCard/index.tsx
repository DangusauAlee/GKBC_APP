import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Dimensions,
  AppState,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useLikeShare } from '../../../hooks/useLikeShare';
import { useComments } from '../../../hooks/useComments';
import { feedService } from '../../../services/supabase/feed';
import type { PostCardProps } from './types';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  MapPin,
  Send,
  Trash2,
  Play,
} from 'lucide-react-native';

// Conditionally import Video only on native
let Video: any = null;
let ResizeMode: any = null;
if (Platform.OS !== 'web') {
  const ExpoAV = require('expo-av');
  Video = ExpoAV.Video;
  ResizeMode = ExpoAV.ResizeMode;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 12;
const MEDIA_WIDTH = screenWidth - CARD_HORIZONTAL_PADDING * 2;

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onDelete,
  isVisible = false,
  onPlayVideo,
}) => {
  const navigation = useNavigation();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [likersPreview, setLikersPreview] = useState<{ name: string }[]>([]);
  const [firstComment, setFirstComment] = useState<any>(null);
  const { toggleLike, toggleShare } = useLikeShare();
  const { comments, addComment, isLoading: commentsLoading } = useComments(post.id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<any>(null);

  useEffect(() => {
    const fetchPreviews = async () => {
      if (post.likes_count > 0) {
        const likers = await feedService.getPostLikersPreview(post.id);
        setLikersPreview(likers);
      }
      if (post.comments_count > 0) {
        const comment = await feedService.getPostFirstComment(post.id);
        setFirstComment(comment);
      }
    };
    fetchPreviews();
  }, [post.id, post.likes_count, post.comments_count]);

  // Control video playback based on visibility and app state (native only)
  useEffect(() => {
    if (Platform.OS === 'web' || post.media_type !== 'video' || !isVideoLoaded) return;
    if (isVisible) {
      videoRef.current?.playAsync();
      setIsPlaying(true);
      onPlayVideo?.(post.id);
    } else {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    }
  }, [isVisible, post.media_type, post.id, onPlayVideo, isVideoLoaded]);

  // Pause video when app goes to background (native only)
  useEffect(() => {
    if (Platform.OS === 'web' || post.media_type !== 'video') return;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        videoRef.current?.pauseAsync();
        setIsPlaying(false);
      } else if (nextAppState === 'active' && isVisible && isVideoLoaded) {
        videoRef.current?.playAsync();
        setIsPlaying(true);
      }
    });
    return () => subscription.remove();
  }, [post.media_type, isVisible, isVideoLoaded]);

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  // Double tap gesture using Gesture.Race
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onStart(() => {
      if (!post.has_liked) {
        toggleLike(post.id);
      }
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onStart(() => {
      // Handle single tap – e.g., navigate to post detail
      // navigation.navigate('PostDetail', { postId: post.id });
    });

  const tapGesture = Gesture.Race(doubleTap, singleTap);

  const handleLike = () => toggleLike(post.id);
  const handleShare = () => toggleShare(post.id);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    await addComment(newComment.trim());
    setNewComment('');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile', { userId: post.author_id });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete(post.id);
  };

  const renderLikersPreview = () => {
    if (post.likes_count === 0) return null;
    if (likersPreview.length === 0) {
      return <Text style={styles.statsText}>{post.likes_count} likes</Text>;
    }
    const names = likersPreview.map(l => l.name).join(', ');
    if (post.likes_count > likersPreview.length) {
      const others = post.likes_count - likersPreview.length;
      return (
        <Text style={styles.statsText}>
          Liked by <Text style={styles.bold}>{names}</Text> and {others} others
        </Text>
      );
    }
    return (
      <Text style={styles.statsText}>
        Liked by <Text style={styles.bold}>{names}</Text>
      </Text>
    );
  };

  const renderCommentPreview = () => {
    if (post.comments_count === 0) return null;
    if (firstComment) {
      return (
        <View style={styles.commentPreview}>
          <Text style={styles.commentPreviewAuthor}>{firstComment.author_name}</Text>
          <Text style={styles.commentPreviewContent} numberOfLines={1}>
            {firstComment.content}
          </Text>
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={() => setShowComments(true)}>
        <Text style={styles.viewAllComments}>
          View all {post.comments_count} comments
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMedia = () => {
    if (post.media_urls.length === 0) return null;

    // Common media wrapper with centering
    const MediaWrapper = ({ children }: { children: React.ReactNode }) => (
      <View style={styles.mediaWrapper}>
        <View style={[styles.mediaContainer, { width: MEDIA_WIDTH }]}>
          {children}
        </View>
      </View>
    );

    if (post.media_type === 'video') {
      if (Platform.OS === 'web') {
        return (
          <GestureDetector gesture={tapGesture}>
            <MediaWrapper>
              <View style={[styles.media, { height: MEDIA_WIDTH * 0.5625 }]}>
                <Image
                  source={{ uri: post.media_urls[0] }}
                  style={styles.mediaContent}
                  resizeMode="cover"
                />
                <View style={styles.playButton}>
                  <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    style={styles.playButtonGradient}
                  >
                    <Play size={24} color="#fff" fill="#fff" />
                  </LinearGradient>
                </View>
              </View>
            </MediaWrapper>
          </GestureDetector>
        );
      }

      return (
        <GestureDetector gesture={tapGesture}>
          <MediaWrapper>
            <View style={[styles.media, { height: MEDIA_WIDTH * 0.5625 }]}>
              <Video
                ref={videoRef}
                source={{ uri: post.media_urls[0] }}
                style={styles.mediaContent}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isLooping={false}
                onLoad={() => setIsVideoLoaded(true)}
                onError={(error) => console.log('Video error', error)}
              />
              {!isPlaying && (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => {
                    if (isVideoLoaded) {
                      videoRef.current?.playAsync();
                      setIsPlaying(true);
                    }
                  }}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    style={styles.playButtonGradient}
                  >
                    <Play size={24} color="#fff" fill="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </MediaWrapper>
        </GestureDetector>
      );
    }

    if (post.media_type === 'image') {
      return (
        <GestureDetector gesture={tapGesture}>
          <MediaWrapper>
            <Image
              source={{ uri: post.media_urls[0] }}
              style={[styles.media, styles.mediaImage]}
              resizeMode="contain"
            />
          </MediaWrapper>
        </GestureDetector>
      );
    }

    if (post.media_type === 'gallery') {
      return (
        <GestureDetector gesture={tapGesture}>
          <MediaWrapper>
            <View style={[styles.media, styles.galleryContainer]}>
              {post.media_urls.slice(0, 4).map((url, index) => (
                <View key={index} style={styles.galleryItem}>
                  <Image
                    source={{ uri: url }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  {index === 3 && post.media_urls.length > 4 && (
                    <View style={styles.galleryOverlay}>
                      <Text style={styles.galleryOverlayText}>+{post.media_urls.length - 4}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </MediaWrapper>
        </GestureDetector>
      );
    }

    return null;
  };

  return (
    <BlurView intensity={20} tint="light" style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {post.author_avatar ? (
              <Image source={{ uri: post.author_avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>
                  {post.author_name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            {post.author_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.authorName}>{post.author_name}</Text>
            <View style={styles.timeLocation}>
              <Text style={styles.time}>{formatTimeAgo(post.created_at)}</Text>
              {post.location && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <MapPin size={10} color="#6b7280" />
                  <Text style={styles.location}>{post.location}</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {onDelete && (
          <View>
            <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
              <MoreVertical size={20} color="#6b7280" />
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleDelete}>
                  <Trash2 size={16} color="#dc2626" />
                  <Text style={styles.dropdownText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      {post.content ? (
        <Text style={styles.content}>{post.content}</Text>
      ) : null}

      {/* Tags */}
      {post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, idx) => (
            <Text key={idx} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
      )}

      {/* Media */}
      {renderMedia()}

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Heart size={14} color="#ef4444" fill={post.has_liked ? '#ef4444' : 'none'} />
          <Text style={styles.statCount}>{post.likes_count}</Text>
        </View>
        <View style={styles.statItem}>
          <MessageCircle size={14} color="#6b7280" />
          <Text style={styles.statCount}>{post.comments_count}</Text>
        </View>
        <View style={styles.statItem}>
          <Share2 size={14} color="#6b7280" />
          <Text style={styles.statCount}>{post.shares_count}</Text>
        </View>
      </View>

      {/* Likers preview */}
      <View style={styles.likersPreview}>
        {renderLikersPreview()}
      </View>

      {/* Comment preview */}
      <View style={styles.commentPreviewSection}>
        {renderCommentPreview()}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, post.has_liked && styles.actionActive]}
          onPress={handleLike}
        >
          <Heart
            size={22}
            color={post.has_liked ? '#ef4444' : '#6b7280'}
            fill={post.has_liked ? '#ef4444' : 'none'}
          />
          <Text style={[styles.actionText, post.has_liked && styles.actionTextActive]}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <MessageCircle size={22} color="#6b7280" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, post.has_shared && styles.actionActive]}
          onPress={handleShare}
        >
          <Share2 size={22} color={post.has_shared ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.actionText, post.has_shared && styles.actionTextActive]}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comments section */}
      {showComments && (
        <View style={styles.commentsSection}>
          {/* Add comment input */}
          <View style={styles.addComment}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#9ca3af"
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={handleCommentSubmit}
            />
            <TouchableOpacity
              onPress={handleCommentSubmit}
              disabled={!newComment.trim()}
              style={[styles.sendButton, !newComment.trim() && styles.sendDisabled]}
            >
              <Send size={16} color={newComment.trim() ? '#16a34a' : '#9ca3af'} />
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          {commentsLoading ? (
            <ActivityIndicator size="small" color="#16a34a" style={styles.commentsLoader} />
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile', { userId: comment.author_id })}
                >
                  {comment.author_avatar ? (
                    <Image source={{ uri: comment.author_avatar }} style={styles.commentAvatar} />
                  ) : (
                    <LinearGradient colors={['#16a34a', '#15803d']} style={styles.commentAvatarPlaceholder}>
                      <Text style={styles.commentAvatarText}>{comment.author_name.charAt(0)}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>
                    {comment.author_name}
                    {comment.author_verified && <Text style={styles.verifiedCommentIcon}> ✓</Text>}
                  </Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>No comments yet.</Text>
          )}
        </View>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  verifiedIcon: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: '#6b7280',
  },
  dot: {
    fontSize: 11,
    color: '#6b7280',
    marginHorizontal: 2,
  },
  location: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 2,
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    elevation: 3,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: '#dc2626',
  },
  content: {
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
  },
  tag: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  mediaWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  mediaContainer: {
    position: 'relative',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
    height: MEDIA_WIDTH, // default height for images/gallery
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaContent: {
    width: '100%',
    height: '100%',
  },
  mediaImage: {
    // handled by resizeMode prop
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: MEDIA_WIDTH,
  },
  galleryItem: {
    width: '50%',
    height: '50%',
    borderWidth: 0.5,
    borderColor: '#fff',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryOverlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  likersPreview: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#1f2937',
  },
  bold: {
    fontWeight: '600',
  },
  commentPreviewSection: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  commentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentPreviewAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  commentPreviewContent: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  viewAllComments: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 8,
    paddingTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionActive: {
    backgroundColor: '#f0fdf4',
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#16a34a',
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    padding: 12,
  },
  addComment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  commentsLoader: {
    marginVertical: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentAvatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  verifiedCommentIcon: {
    fontSize: 10,
    color: '#16a34a',
  },
  commentText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  noComments: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    padding: 12,
  },
});
