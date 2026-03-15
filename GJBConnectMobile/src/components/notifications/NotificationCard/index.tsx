import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MessageCircle,
  User,
  ShoppingBag,
  Briefcase,
  Calendar,
  LifeBuoy,
  Megaphone,
  UserCheck,
} from 'lucide-react-native';
import { Notification } from '../../../hooks/useNotifications';
import { formatTimeAgo } from '../../../utils/formatters';
import VerifiedBadge from '../../shared/VerifiedBadge';

interface Props {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

const getIconForType = (type: string) => {
  const size = 18;
  switch (type) {
    case 'post':
      return <MessageCircle size={size} color="#3b82f6" />;
    case 'connection':
      return <User size={size} color="#16a34a" />;
    case 'marketplace':
      return <ShoppingBag size={size} color="#a855f7" />;
    case 'business':
      return <Briefcase size={size} color="#f97316" />;
    case 'event':
      return <Calendar size={size} color="#ec4899" />;
    case 'support':
      return <LifeBuoy size={size} color="#6366f1" />;
    case 'announcement':
      return <Megaphone size={size} color="#ef4444" />;
    case 'system':
      return <UserCheck size={size} color="#6b7280" />;
    default:
      return null;
  }
};

export const NotificationCard: React.FC<Props> = ({ notification, onPress }) => {
  const { type, content, data, created_at, read, sender } = notification;
  const icon = getIconForType(type);
  const isAnnouncement = type === 'announcement';
  const displayContent = isAnnouncement && data?.title ? data.title : content || '';

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
      style={[styles.card, !read && styles.unreadCard]}
    >
      <LinearGradient
        colors={['#fff', '#f9fafb']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Avatar or Icon */}
          <View style={styles.leftColumn}>
            {sender?.avatar_url ? (
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: sender.avatar_url }}
                  style={styles.avatar}
                />
                {/* We don't have sender verification status here yet; could add if available */}
                {/* <View style={styles.verifiedBadge}><VerifiedBadge size={10} /></View> */}
              </View>
            ) : (
              <View style={[styles.iconContainer, { backgroundColor: '#f3f4f6' }]}>
                {icon || <User size={18} color="#6b7280" />}
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={styles.centerColumn}>
            <Text style={styles.message} numberOfLines={2}>
              {displayContent}
            </Text>
            <Text style={styles.time}>{formatTimeAgo(created_at)}</Text>
            {data?.snippet && (
              <Text style={styles.snippet} numberOfLines={1}>
                {data.snippet}
              </Text>
            )}
          </View>

          {/* Unread Indicator */}
          {!read && <View style={styles.unreadDot} />}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  gradient: {
    flex: 1,
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    marginRight: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  centerColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  snippet: {
    fontSize: 12,
    color: '#4b5563',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginLeft: 8,
  },
});
