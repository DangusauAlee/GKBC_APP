import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Upload, X, MapPin, Mail, Phone, Globe, ExternalLink, Calendar } from 'lucide-react-native';
import { Profile } from '../../../types';
import VerifiedBadge from '../../shared/VerifiedBadge';
import { formatTimeAgo } from '../../../utils/formatters';

interface ProfileHeaderProps {
  profile: Profile;
  isOwner: boolean;
  isVerified: boolean;
  onEditProfile: () => void;
  onRemoveAvatar: () => void;
  onRemoveHeader: () => void;
  uploadingAvatar: boolean;
  uploadingHeader: boolean;
  onPickAvatar: () => void;
  onPickHeader: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwner,
  isVerified,
  onEditProfile,
  onRemoveAvatar,
  onRemoveHeader,
  uploadingAvatar,
  uploadingHeader,
  onPickAvatar,
  onPickHeader,
}) => {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <View style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {profile.header_image_url ? (
          <Image source={{ uri: profile.header_image_url }} style={styles.coverImage} />
        ) : (
          <LinearGradient colors={['#16a34a', '#15803d']} style={styles.coverPlaceholder} />
        )}
        {isOwner && (
          <View style={styles.coverActions}>
            {profile.header_image_url && (
              <TouchableOpacity
                style={styles.coverActionButton}
                onPress={onRemoveHeader}
                disabled={uploadingHeader}
              >
                {uploadingHeader ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <X size={18} color="#ef4444" />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.coverActionButton}
              onPress={onPickHeader}
              disabled={uploadingHeader}
            >
              {uploadingHeader ? (
                <ActivityIndicator size="small" color="#16a34a" />
              ) : (
                <Camera size={18} color="#16a34a" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{profile.first_name?.charAt(0) || '?'}</Text>
            </LinearGradient>
          )}
          {isVerified && (
            <View style={styles.avatarBadge}>
              <VerifiedBadge size={20} />
            </View>
          )}
        </View>
        {isOwner && (
          <View style={styles.avatarActions}>
            {profile.avatar_url && (
              <TouchableOpacity
                style={[styles.avatarActionButton, styles.avatarActionRemove]}
                onPress={onRemoveAvatar}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <X size={14} color="#ef4444" />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.avatarActionButton, styles.avatarActionUpload]}
              onPress={onPickAvatar}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Upload size={14} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{fullName}</Text>
          {isVerified && <VerifiedBadge size={16} />}
        </View>
        {profile.business_name && (
          <Text style={styles.businessName}>{profile.business_name}</Text>
        )}
        {!isVerified && (
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Member Account</Text>
          </View>
        )}

        {profile.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {/* Contact Info */}
        {(profile.email || profile.phone || profile.location || profile.website) && (
          <View style={styles.contactGrid}>
            {profile.email && (
              <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`mailto:${profile.email}`)}>
                <Mail size={14} color="#16a34a" />
                <Text style={styles.contactText}>Email</Text>
              </TouchableOpacity>
            )}
            {profile.phone && (
              <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`tel:${profile.phone}`)}>
                <Phone size={14} color="#16a34a" />
                <Text style={styles.contactText}>Call</Text>
              </TouchableOpacity>
            )}
            {profile.location && (
              <View style={styles.contactItem}>
                <MapPin size={14} color="#6b7280" />
                <Text style={styles.contactText}>{profile.location}</Text>
              </View>
            )}
            {profile.website && (
              <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(profile.website!)}>
                <Globe size={14} color="#16a34a" />
                <Text style={styles.contactText}>Website</Text>
                <ExternalLink size={10} color="#16a34a" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Member Since */}
        <View style={styles.memberSince}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.memberSinceText}>Member since {formatTimeAgo(profile.created_at)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  coverContainer: {
    height: 144,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
  },
  coverActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  coverActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginTop: -48,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  avatarActions: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    gap: 8,
  },
  avatarActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarActionRemove: {
    backgroundColor: '#fee2e2',
  },
  avatarActionUpload: {
    backgroundColor: '#16a34a',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  businessName: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  memberBadge: {
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fde047',
    marginBottom: 12,
  },
  memberBadgeText: {
    fontSize: 10,
    color: '#854d0e',
    fontWeight: '600',
  },
  bioContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bio: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#374151',
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    marginTop: 8,
  },
  memberSinceText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
