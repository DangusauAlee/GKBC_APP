import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Building } from 'lucide-react-native';
import { Business } from '../../../types/business';
import VerifiedBadge from '../../shared/VerifiedBadge';

interface Props {
  business: Business;
  onPress: () => void;
}

export const BusinessCard: React.FC<Props> = React.memo(({ business, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <LinearGradient colors={['#fff', '#f9fafb']} style={styles.gradient}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          {business.banner_url ? (
            <Image source={{ uri: business.banner_url }} style={styles.banner} />
          ) : (
            <LinearGradient colors={['#e5e7eb', '#d1d5db']} style={styles.bannerPlaceholder}>
              <Building size={24} color="#9ca3af" />
            </LinearGradient>
          )}

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              {business.logo_url ? (
                <Image source={{ uri: business.logo_url }} style={styles.logo} />
              ) : (
                <LinearGradient colors={['#16a34a', '#15803d']} style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>{business.name.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Name and Badge - Fixed layout */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {business.name}
            </Text>
            {business.owner_verified && <VerifiedBadge size={12} />}
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Star size={10} color="#eab308" fill="#eab308" />
              <Text style={styles.ratingText}>{business.average_rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>({business.review_count})</Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {business.description}
          </Text>

          <View style={styles.footer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{business.category}</Text>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={10} color="#6b7280" />
              <Text style={styles.locationText} numberOfLines={1}>{business.location_axis}</Text>
            </View>
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
  bannerContainer: {
    height: 100,
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
  logoContainer: {
    position: 'absolute',
    bottom: -16,
    left: 12,
  },
  logoWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    flexShrink: 1,
    maxWidth: '90%',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewCount: {
    fontSize: 10,
    color: '#6b7280',
  },
  description: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 10,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  categoryText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 10,
    color: '#6b7280',
    maxWidth: 100,
  },
});
