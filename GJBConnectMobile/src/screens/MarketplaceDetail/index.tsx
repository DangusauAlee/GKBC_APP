import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Eye,
  User,
  Star,
  MessageCircle,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import { useMarketplaceData } from '../../hooks/useMarketplaceData';
import { useMarketplaceMutations } from '../../hooks/useMarketplaceMutations';
import { useAuthStore } from '../../store/authStore';
import { marketplaceService } from '../../services/marketplace';
import { formatTimeAgo } from '../../utils/formatters';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialog';
import { FeedbackToast } from '../../components/shared/FeedbackToast';
import VerifiedBadge from '../../components/shared/VerifiedBadge';

export const MarketplaceDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const { id } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { useListing, useReviews } = useMarketplaceData();
  const { toggleFavorite, addReview, deleteListing } = useMarketplaceMutations();

  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: listing, isLoading: listingLoading, error: listingError } = useListing(id);
  const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useReviews(id);

  const safeListing = listing || {
    id: '',
    seller_id: '',
    title: '',
    price: null,
    description: '',
    category: '',
    condition: '',
    location: '',
    images: [],
    views_count: 0,
    created_at: new Date().toISOString(),
    seller_name: 'Unknown',
    seller_verified: false,
    seller_avatar: null,
    is_favorited: false,
    favorite_count: 0,
    is_sold: false,
  };

  const images = safeListing.images;
  const currentImage = images[selectedImage] || '';
  const isOwner = user?.id === safeListing.seller_id;
  const userHasReviewed = reviews.some(r => r.reviewer_id === user?.id);

  useEffect(() => {
    if (listing) {
      marketplaceService.incrementViews(listing.id).catch(console.error);
    }
  }, [listing]);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFavorite = async () => {
    if (!user) {
      showFeedback('Please sign in to favorite listings', 'error');
      return;
    }
    try {
      await toggleFavorite.mutateAsync(id);
    } catch (error: any) {
      showFeedback(error.message || 'Failed to update favorite', 'error');
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      showFeedback('Please sign in to add a review', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      showFeedback('Please enter a comment', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await addReview.mutateAsync({ listingId: id, rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      refetchReviews();
      showFeedback('Review added successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to add review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteListing.mutateAsync(id);
      showFeedback('Listing deleted successfully', 'success');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete listing', 'error');
      setDeleting(false);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      showFeedback('Please sign in to contact the seller', 'error');
      return;
    }
    navigation.navigate('Messages', {
      screen: 'NewConversation',
      params: {
        otherUser: {
          id: safeListing.seller_id,
          name: safeListing.seller_name,
          avatar: safeListing.seller_avatar,
          status: safeListing.seller_verified ? 'verified' : 'member',
        },
        context: 'marketplace',
        listing: { id: safeListing.id, title: safeListing.title },
      },
    });
  };

  if (listingLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (listingError || !listing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Listing not found</Text>
            <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#16a34a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Listing Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Images */}
          <View style={styles.imageSection}>
            <View style={styles.mainImageContainer}>
              {currentImage ? (
                <Image source={{ uri: currentImage }} style={styles.mainImage} />
              ) : (
                <LinearGradient colors={['#e5e7eb', '#d1d5db']} style={styles.mainImagePlaceholder}>
                  <User size={48} color="#9ca3af" />
                </LinearGradient>
              )}
            </View>
            {images.length > 1 && (
              <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => setSelectedImage(index)} style={styles.thumbnail}>
                    <Image source={{ uri: item }} style={[styles.thumbnailImage, selectedImage === index && styles.thumbnailSelected]} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.thumbnailList}
              />
            )}
          </View>

          {/* Details */}
          <View style={styles.detailsCard}>
            {/* Title and price */}
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{safeListing.title}</Text>
                {safeListing.seller_verified && <VerifiedBadge size={14} />}
              </View>
              {!isOwner && (
                <TouchableOpacity onPress={handleFavorite} style={styles.favoriteButton}>
                  <Heart
                    size={20}
                    color={safeListing.is_favorited ? '#ef4444' : '#6b7280'}
                    fill={safeListing.is_favorited ? '#ef4444' : 'none'}
                  />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.price}>
              {safeListing.price ? `₦${safeListing.price.toLocaleString()}` : 'Price Negotiable'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Eye size={14} color="#6b7280" />
                <Text style={styles.metaText}>{safeListing.views_count} views</Text>
              </View>
              <View style={styles.metaItem}>
                <Star size={14} color="#eab308" fill="#eab308" />
                <Text style={styles.metaText}>{reviews.length} reviews</Text>
              </View>
            </View>

            {/* Seller info */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                {safeListing.seller_avatar ? (
                  <Image source={{ uri: safeListing.seller_avatar }} style={styles.sellerAvatarImage} />
                ) : (
                  <LinearGradient colors={['#16a34a', '#15803d']} style={styles.sellerAvatarPlaceholder}>
                    <Text style={styles.sellerAvatarText}>{safeListing.seller_name?.charAt(0) || 'U'}</Text>
                  </LinearGradient>
                )}
                {safeListing.seller_verified && (
                  <View style={styles.sellerAvatarBadge}>
                    <VerifiedBadge size={12} />
                  </View>
                )}
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{safeListing.seller_name}</Text>
                <Text style={styles.sellerTime}>Member since {formatTimeAgo(safeListing.created_at)}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{safeListing.description || 'No description provided.'}</Text>
            </View>

            {/* Details grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{safeListing.category}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{safeListing.condition}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Location</Text>
                <View style={styles.detailLocation}>
                  <MapPin size={12} color="#6b7280" />
                  <Text style={styles.detailValue}>{safeListing.location}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>{formatTimeAgo(safeListing.created_at)}</Text>
              </View>
            </View>

            {/* Action buttons */}
            {!isOwner ? (
              <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                <MessageCircle size={18} color="#fff" />
                <Text style={styles.contactButtonText}>Contact Seller</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate('MarketplaceEdit', { id: safeListing.id })}
                >
                  <Edit2 size={16} color="#16a34a" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                >
                  <Trash2 size={16} color="#dc2626" />
                  <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Reviews section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>

              {user && !isOwner && !userHasReviewed && (
                <View style={styles.reviewForm}>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                        <Star
                          size={20}
                          color={star <= reviewRating ? '#eab308' : '#d1d5db'}
                          fill={star <= reviewRating ? '#eab308' : 'none'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Write your review..."
                    placeholderTextColor="#9ca3af"
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[styles.submitReview, submitting && styles.disabledButton]}
                    onPress={handleAddReview}
                    disabled={submitting || !reviewComment.trim()}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitReviewText}>Submit Review</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {reviewsLoading ? (
                <ActivityIndicator size="small" color="#16a34a" style={styles.reviewsLoader} />
              ) : reviews.length === 0 ? (
                <Text style={styles.noReviews}>No reviews yet.</Text>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerAvatar}>
                        {review.reviewer_avatar ? (
                          <Image source={{ uri: review.reviewer_avatar }} style={styles.reviewerAvatarImage} />
                        ) : (
                          <LinearGradient colors={['#16a34a', '#15803d']} style={styles.reviewerAvatarPlaceholder}>
                            <Text style={styles.reviewerAvatarText}>{review.reviewer_name?.charAt(0) || 'U'}</Text>
                          </LinearGradient>
                        )}
                        {review.reviewer_verified && (
                          <View style={styles.reviewerBadge}>
                            <VerifiedBadge size={8} />
                          </View>
                        )}
                      </View>
                      <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerNameRow}>
                          <Text style={styles.reviewerName}>{review.reviewer_name || 'Anonymous'}</Text>
                          <View style={styles.reviewRating}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                color={i < review.rating ? '#eab308' : '#d1d5db'}
                                fill={i < review.rating ? '#eab308' : 'none'}
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.reviewTime}>{formatTimeAgo(review.created_at)}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        <ConfirmationDialog
          visible={showDeleteConfirm}
          title="Delete Listing"
          message="Are you sure you want to delete this listing? This action cannot be undone."
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isDanger={true}
          isLoading={deleting}
        />

        <FeedbackToast
          visible={!!feedback}
          message={feedback?.message || ''}
          type={feedback?.type || 'success'}
          onClose={() => setFeedback(null)}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#16a34a',
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#16a34a',
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#16a34a',
    top: '30%',
    right: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageSection: {
    padding: 12,
  },
  mainImageContainer: {
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  mainImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailList: {
    gap: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailSelected: {
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  sellerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  sellerAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sellerAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  sellerTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    width: '47%',
  },
  detailLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  detailLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    marginBottom: 16,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 4,
  },
  editButtonText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 4,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewForm: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitReview: {
    backgroundColor: '#16a34a',
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitReviewText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsLoader: {
    marginVertical: 20,
  },
  noReviews: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginVertical: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    position: 'relative',
  },
  reviewerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  reviewerAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTime: {
    fontSize: 10,
    color: '#6b7280',
  },
  reviewComment: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
  },
});
