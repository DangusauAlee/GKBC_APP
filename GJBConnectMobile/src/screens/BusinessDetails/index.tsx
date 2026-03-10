import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Share2,
  User,
  AlertCircle,
} from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useBusinessMutations } from '../../hooks/useBusinessMutations';
import { businessKeys } from '../../hooks/queryKeys';
import { useAuthStore } from '../../store/authStore';
import { formatTimeAgo } from '../../utils/formatters';
import VerifiedBadge from '../../components/shared/VerifiedBadge';

export const BusinessDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const { id } = route.params;
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addReview } = useBusinessMutations();

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: () => businessService.getBusinessDetails(id),
    staleTime: 5 * 60 * 1000,
  });

  const business = data?.business;
  const reviews = data?.reviews || [];

  const isOwner = business?.owner_id === user?.id;
  const hasSubmittedReview = useMemo(() => {
    if (!user) return false;
    return reviews.some(r => r.user_id === user.id);
  }, [user, reviews]);

  const handleAddReview = useCallback(async () => {
    if (!business || !newReview.comment.trim() || !user) return;
    if (isOwner) {
      setError('You cannot review your own business');
      return;
    }
    if (hasSubmittedReview) {
      setError('You have already submitted a review');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addReview({ businessId: business.id, rating: newReview.rating, comment: newReview.comment });
      setNewReview({ rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(business.id) });
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }, [business, newReview, user, isOwner, hasSubmittedReview, addReview, queryClient]);

  const getAnonymousName = useCallback((userId: string, index: number): string => {
    const colors = ['Green', 'Blue', 'Red', 'Yellow', 'Purple', 'Orange', 'Pink', 'Teal'];
    const animals = ['Lion', 'Tiger', 'Bear', 'Wolf', 'Fox', 'Eagle', 'Dolphin', 'Hawk', 'Spider'];
    const colorIndex = Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    const animalIndex = Math.abs(userId.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)) % animals.length;
    return `${colors[colorIndex]} ${animals[animalIndex]}`;
  }, []);

  if (isLoading) {
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

  if (!business) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#16a34a" />
            <Text style={styles.errorTitle}>Business Not Found</Text>
            <Text style={styles.errorText}>The business doesn't exist or has been removed.</Text>
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
          <Text style={styles.headerTitle} numberOfLines={1}>{business.name}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={18} color="#16a34a" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <View style={styles.bannerContainer}>
            {business.banner_url ? (
              <Image source={{ uri: business.banner_url }} style={styles.banner} />
            ) : (
              <LinearGradient colors={['#e5e7eb', '#d1d5db']} style={styles.bannerPlaceholder}>
                <Globe size={32} color="#9ca3af" />
              </LinearGradient>
            )}
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Your Business</Text>
              </View>
            )}
          </View>

          {/* Business Info */}
          <View style={styles.infoContainer}>
            <View style={styles.logoRow}>
              <View style={styles.logoWrapper}>
                <View style={styles.logoBorder}>
                  {business.logo_url ? (
                    <Image source={{ uri: business.logo_url }} style={styles.logo} />
                  ) : (
                    <LinearGradient colors={['#16a34a', '#15803d']} style={styles.logoPlaceholder}>
                      <Text style={styles.logoText}>{business.name.charAt(0).toUpperCase()}</Text>
                    </LinearGradient>
                  )}
                </View>
              </View>
              <View style={styles.nameRating}>
                <View style={styles.nameRow}>
                  <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
                  {business.owner_verified && <VerifiedBadge size={14} />}
                  {business.is_registered && business.verification_status === 'approved' && (
                    <View style={styles.verifiedBusinessBadge}>
                      <Text style={styles.verifiedBusinessText}>Verified</Text>
                    </View>
                  )}
                </View>
                {business.owner_name && (
                  <Text style={styles.ownerName}>By {business.owner_name}</Text>
                )}
                <View style={styles.ratingLocation}>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#eab308" fill="#eab308" />
                    <Text style={styles.ratingText}>{business.average_rating.toFixed(1)}</Text>
                    <Text style={styles.reviewCount}>({business.review_count})</Text>
                  </View>
                  <View style={styles.locationBadge}>
                    <MapPin size={10} color="#6b7280" />
                    <Text style={styles.locationText}>{business.location_axis}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Type & Category */}
            <View style={styles.typeRow}>
              <View style={[styles.typeBadge, business.business_type === 'products' ? styles.productsBadge : styles.servicesBadge]}>
                <Text style={styles.typeText}>
                  {business.business_type === 'products' ? 'Products' : 'Services'}
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{business.category}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{business.description}</Text>
            </View>

            {/* Contact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactGrid}>
                {business.address && (
                  <View style={styles.contactItem}>
                    <View style={styles.contactIcon}>
                      <MapPin size={14} color="#16a34a" />
                    </View>
                    <Text style={styles.contactLabel}>Address</Text>
                    <Text style={styles.contactValue}>{business.address}</Text>
                  </View>
                )}
                {business.phone && (
                  <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`tel:${business.phone}`)}>
                    <View style={styles.contactIcon}>
                      <Phone size={14} color="#16a34a" />
                    </View>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{business.phone}</Text>
                  </TouchableOpacity>
                )}
                {business.email && (
                  <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`mailto:${business.email}`)}>
                    <View style={styles.contactIcon}>
                      <Mail size={14} color="#16a34a" />
                    </View>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue} numberOfLines={1}>{business.email}</Text>
                  </TouchableOpacity>
                )}
                {business.website && (
                  <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(business.website!)}>
                    <View style={styles.contactIcon}>
                      <Globe size={14} color="#16a34a" />
                    </View>
                    <Text style={styles.contactLabel}>Website</Text>
                    <Text style={styles.contactValue} numberOfLines={1}>
                      {business.website.replace(/^https?:\/\//, '')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorMessage}>
                <AlertCircle size={14} color="#dc2626" />
                <Text style={styles.errorMessageText}>{error}</Text>
              </View>
            ) : null}

            {/* Reviews */}
            {!isOwner && (
              <View style={styles.section}>
                <View style={styles.reviewsHeader}>
                  <Text style={styles.sectionTitle}>Reviews</Text>
                  <View style={styles.reviewsSummary}>
                    <Star size={14} color="#eab308" fill="#eab308" />
                    <Text style={styles.reviewsSummaryText}>
                      {business.average_rating.toFixed(1)} ({business.review_count})
                    </Text>
                  </View>
                </View>

                {/* Add Review Form */}
                {user && !hasSubmittedReview && (
                  <View style={styles.addReviewCard}>
                    <Text style={styles.addReviewTitle}>Add Your Review</Text>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setNewReview(prev => ({ ...prev, rating: star }))}>
                          <Star
                            size={24}
                            color={star <= newReview.rating ? '#eab308' : '#d1d5db'}
                            fill={star <= newReview.rating ? '#eab308' : 'transparent'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.selectedRating}>{newReview.rating} star{newReview.rating !== 1 ? 's' : ''}</Text>
                    <TextInput
                      style={styles.reviewInput}
                      placeholder="Share your experience..."
                      placeholderTextColor="#9ca3af"
                      value={newReview.comment}
                      onChangeText={text => setNewReview(prev => ({ ...prev, comment: text }))}
                      multiline
                      maxLength={500}
                    />
                    <View style={styles.reviewInputFooter}>
                      <View style={styles.anonymousNote}>
                        <User size={12} color="#6b7280" />
                        <Text style={styles.anonymousNoteText}>Your review will be anonymous</Text>
                      </View>
                      <Text style={styles.charCount}>{newReview.comment.length}/500</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.submitReview, (!newReview.comment.trim() || submitting) && styles.submitReviewDisabled]}
                      onPress={handleAddReview}
                      disabled={!newReview.comment.trim() || submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitReviewText}>Submit Review</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <View style={styles.reviewsList}>
                    {reviews.slice(0, 5).map((review, index) => (
                      <View key={review.id || index} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                          <View style={styles.reviewerAvatar}>
                            <Text style={styles.reviewerInitial}>
                              {getAnonymousName(review.user_id || `review_${index}`, index).charAt(0)}
                            </Text>
                          </View>
                          <View style={styles.reviewerInfo}>
                            <View style={styles.reviewerNameRow}>
                              <Text style={styles.reviewerName}>
                                {getAnonymousName(review.user_id || `review_${index}`, index)}
                              </Text>
                              {review.user_verified && <VerifiedBadge size={10} />}
                            </View>
                            <View style={styles.reviewRating}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={10}
                                  color={i < review.rating ? '#eab308' : '#d1d5db'}
                                  fill={i < review.rating ? '#eab308' : 'transparent'}
                                />
                              ))}
                            </View>
                            <Text style={styles.reviewTime}>{formatTimeAgo(review.created_at)}</Text>
                          </View>
                        </View>
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noReviews}>
                    <Star size={32} color="#d1d5db" />
                    <Text style={styles.noReviewsTitle}>No Reviews Yet</Text>
                    <Text style={styles.noReviewsText}>Be the first to review this business!</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerContainer: {
    height: 180,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ownerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  logoRow: {
    flexDirection: 'row',
    marginTop: -32,
    marginBottom: 12,
  },
  logoWrapper: {
    marginRight: 12,
  },
  logoBorder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  nameRating: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  verifiedBusinessBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedBusinessText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  ownerName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  ratingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reviewCount: {
    fontSize: 10,
    color: '#6b7280',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  productsBadge: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  servicesBadge: {
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  categoryText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  contactGrid: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    width: 60,
    fontSize: 12,
    color: '#6b7280',
  },
  contactValue: {
    flex: 1,
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorMessageText: {
    flex: 1,
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '500',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  addReviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 16,
  },
  addReviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedRating: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reviewInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  anonymousNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  anonymousNoteText: {
    fontSize: 11,
    color: '#6b7280',
  },
  charCount: {
    fontSize: 11,
    color: '#6b7280',
  },
  submitReview: {
    backgroundColor: '#16a34a',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitReviewDisabled: {
    opacity: 0.5,
  },
  submitReviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  reviewTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  reviewComment: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noReviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  noReviewsText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
