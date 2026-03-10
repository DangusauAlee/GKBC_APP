import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Member } from '../../../types/member';
import VerifiedBadge from '../../shared/VerifiedBadge';

interface MemberCardProps {
  member: Member;
  connectionButton: React.ReactNode;
  onProfileClick: (memberId: string) => void;
  getUserInitials: (first?: string, last?: string) => string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  connectionButton,
  onProfileClick,
  getUserInitials,
}) => {
  const isVerified = member.user_status === 'verified';
  const fullName = `${member.first_name} ${member.last_name}`;
  const initials = getUserInitials(member.first_name, member.last_name);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onProfileClick(member.id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {member.avatar_url ? (
                <Image
                  source={{ uri: member.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              {isVerified && (
                <View style={styles.badgeContainer}>
                  <VerifiedBadge size={14} />
                </View>
              )}
            </View>
            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {fullName}
                </Text>
                {isVerified && <VerifiedBadge size={14} />}
              </View>
              {member.business_name && (
                <Text style={styles.businessName} numberOfLines={1}>
                  {member.business_name}
                </Text>
              )}
            </View>
          </View>
        </View>

        {member.business_type && (
          <View style={styles.badgeRow}>
            <View style={styles.businessTypeBadge}>
              <Text style={styles.businessTypeText}>{member.business_type}</Text>
            </View>
          </View>
        )}

        {member.market_area && (
          <View style={styles.marketAreaRow}>
            <View style={styles.marketAreaBadge}>
              <Text style={styles.marketAreaText}>{member.market_area}</Text>
            </View>
          </View>
        )}

        {member.location && member.location !== member.market_area && (
          <Text style={styles.location} numberOfLines={1}>
            {member.location}
          </Text>
        )}

        {member.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {member.bio}
          </Text>
        )}
      </View>

      <View style={styles.footer}>{connectionButton}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    zIndex: 10,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    flexShrink: 1,
  },
  businessName: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },
  badgeRow: {
    marginBottom: 8,
  },
  businessTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  businessTypeText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  marketAreaRow: {
    marginBottom: 8,
  },
  marketAreaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  marketAreaText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  location: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
  },
  bio: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 16,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
});
