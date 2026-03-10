import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MapPin, Eye, User, MoreVertical, Edit2, Trash2 } from 'lucide-react-native';
import { MarketplaceListing } from '../../../types';
import { formatTimeAgo } from '../../../utils/formatters';
import { useAuthStore } from '../../../store/authStore';
import { useMarketplaceMutations } from '../../../hooks/useMarketplaceMutations';
import VerifiedBadge from '../../shared/VerifiedBadge';

interface Props {
  listing: MarketplaceListing;
  onPress: () => void;
  onEdit?: (listing: MarketplaceListing) => void;
  onDelete?: (listingId: string) => void;
  showManage?: boolean;
}

export const MarketplaceListingCard: React.FC<Props> = React.memo(({
  listing,
  onPress,
  onEdit,
  onDelete,
  showManage = false,
}) => {
  const { user } = useAuthStore();
  const { toggleFavorite } = useMarketplaceMutations();
  const [showMenu, setShowMenu] = React.useState(false);

  const isOwner = user?.id === listing.seller_id;

  const handleFavorite = useCallback(async (e: any) => {
    e.stopPropagation();
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to favorite listings');
      return;
    }
    try {
      await toggleFavorite.mutateAsync(listing.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite');
    }
  }, [listing.id, toggleFavorite, user]);

  const getConditionBadgeStyle = useCallback(() => {
    switch (listing.condition) {
      case 'new': return styles.conditionNew;
      case 'used': return styles.conditionUsed;
      case 'refurbished': return styles.conditionRefurbished;
      default: return styles.conditionDefault;
    }
  }, [listing.condition]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <LinearGradient colors={['#fff', '#f9fafb']} style={styles.gradient}>
        {/* Image container */}
        <View style={styles.imageContainer}>
          {listing.images[0] ? (
            <Image source={{ uri: listing.images[0] }} style={styles.image} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#e5e7eb', '#d1d5db']} style={styles.imagePlaceholder}>
              <User size={24} color="#9ca3af" />
            </LinearGradient>
          )}

          {/* Favorite button */}
          {user && !isOwner && (
            <TouchableOpacity onPress={handleFavorite} style={styles.favoriteButton}>
              <Heart
                size={16}
                color={listing.is_favorited ? '#ef4444' : '#6b7280'}
                fill={listing.is_favorited ? '#ef4444' : 'none'}
              />
            </TouchableOpacity>
          )}

          {/* Owner badge */}
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Your Listing</Text>
            </View>
          )}

          {/* Condition badge */}
          <View style={[styles.conditionBadge, getConditionBadgeStyle()]}>
            <Text style={styles.conditionText}>{listing.condition.toUpperCase()}</Text>
          </View>

          {/* Management menu */}
          {showManage && isOwner && (
            <View style={styles.manageMenu}>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
                <MoreVertical size={16} color="#374151" />
              </TouchableOpacity>
              {showMenu && (
                <View style={styles.menuDropdown}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { onEdit?.(listing); setShowMenu(false); }}
                  >
                    <Edit2 size={12} color="#374151" />
                    <Text style={styles.menuItemText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemDanger]}
                    onPress={() => { onDelete?.(listing.id); setShowMenu(false); }}
                  >
                    <Trash2 size={12} color="#dc2626" />
                    <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
            {listing.seller_verified && <VerifiedBadge size={12} />}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {listing.price ? `₦${listing.price.toLocaleString()}` : 'Price Negotiable'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={10} color="#6b7280" />
              <Text style={styles.metaText} numberOfLines={1}>{listing.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Eye size={10} color="#6b7280" />
              <Text style={styles.metaText}>{listing.views_count}</Text>
            </View>
          </View>

          {/* Seller info */}
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              {listing.seller_avatar ? (
                <Image source={{ uri: listing.seller_avatar }} style={styles.avatarImage} />
              ) : (
                <LinearGradient colors={['#16a34a', '#15803d']} style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{listing.seller_name?.charAt(0) || 'U'}</Text>
                </LinearGradient>
              )}
              {listing.seller_verified && (
                <View style={styles.sellerBadge}>
                  <VerifiedBadge size={10} />
                </View>
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName} numberOfLines={1}>{listing.seller_name}</Text>
              <Text style={styles.sellerTime}>{formatTimeAgo(listing.created_at)}</Text>
            </View>
          </View>

          {/* Category */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionNew: {
    backgroundColor: '#dbeafe',
  },
  conditionUsed: {
    backgroundColor: '#fef9c3',
  },
  conditionRefurbished: {
    backgroundColor: '#f3e8ff',
  },
  conditionDefault: {
    backgroundColor: '#e5e7eb',
  },
  conditionText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  manageMenu: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuDropdown: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 12,
    color: '#374151',
  },
  menuItemTextDanger: {
    color: '#dc2626',
  },
  content: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  priceRow: {
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 10,
    color: '#6b7280',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sellerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
  },
  sellerTime: {
    fontSize: 9,
    color: '#6b7280',
  },
  categoryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 9,
    color: '#166534',
    fontWeight: '600',
  },
});
