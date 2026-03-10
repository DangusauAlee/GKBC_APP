import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { UserCheck, Clock, X } from 'lucide-react-native';
import VerifiedBadge from '../../shared/VerifiedBadge';
import type { ConnectionRequest, Friend, SentRequest } from '../../../services/connections';

interface ConnectionsTabProps {
  receivedRequests: ConnectionRequest[];
  friends: Friend[];
  sentRequests: SentRequest[];
  onAccept: (requestId: string, senderName: string) => void;
  onReject: (requestId: string, senderName: string) => void;
  onWithdraw: (requestId: string, userName: string) => void;
  onProfileClick: (userId: string) => void;
  formatTimeAgo: (date: string) => string;
}

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  receivedRequests,
  friends,
  sentRequests,
  onAccept,
  onReject,
  onWithdraw,
  onProfileClick,
  formatTimeAgo,
}) => {
  if (receivedRequests.length === 0 && friends.length === 0 && sentRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <UserCheck size={32} color="#16a34a" />
        </View>
        <Text style={styles.emptyTitle}>No connections yet</Text>
        <Text style={styles.emptyText}>Connect with members to build your network</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {receivedRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Requests</Text>
          <FlatList
            data={receivedRequests}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <TouchableOpacity
                  style={styles.requestContent}
                  onPress={() => onProfileClick(item.sender_id)}
                >
                  <View style={styles.avatarWrapper}>
                    {item.sender_avatar ? (
                      <Image source={{ uri: item.sender_avatar }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>{item.sender_name.charAt(0)}</Text>
                      </View>
                    )}
                    {item.sender_status === 'verified' && (
                      <View style={styles.badgeContainer}>
                        <VerifiedBadge size={14} />
                      </View>
                    )}
                  </View>
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.sender_name}
                      </Text>
                      {item.sender_status === 'verified' && <VerifiedBadge size={12} />}
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    </View>
                    <Text style={styles.email} numberOfLines={1}>
                      {item.sender_email}
                    </Text>
                    <Text style={styles.time}>Sent {formatTimeAgo(item.created_at)}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => onAccept(item.id, item.sender_name)}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => onReject(item.id, item.sender_name)}
                  >
                    <X size={14} color="#991b1b" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {friends.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Connections</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.user_id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.friendCard}
                onPress={() => onProfileClick(item.user_id)}
              >
                <View style={styles.avatarWrapper}>
                  {item.user_avatar ? (
                    <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>{item.user_name.charAt(0)}</Text>
                    </View>
                  )}
                  {item.user_status === 'verified' && (
                    <View style={styles.badgeContainer}>
                      <VerifiedBadge size={14} />
                    </View>
                  )}
                </View>
                <View style={styles.friendInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.user_name}
                    </Text>
                    {item.user_status === 'verified' && <VerifiedBadge size={12} />}
                  </View>
                  <Text style={styles.email} numberOfLines={1}>
                    {item.user_email}
                  </Text>
                  <Text style={styles.time}>Connected {formatTimeAgo(item.connected_at)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewProfileButton}
                  onPress={() => onProfileClick(item.user_id)}
                >
                  <Text style={styles.viewProfileText}>View</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {sentRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sent Requests</Text>
          <FlatList
            data={sentRequests}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <TouchableOpacity
                  style={styles.requestContent}
                  onPress={() => onProfileClick(item.connected_user_id)}
                >
                  <View style={styles.avatarWrapper}>
                    {item.user_avatar ? (
                      <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>{item.user_name.charAt(0)}</Text>
                      </View>
                    )}
                    {item.user_status === 'verified' && (
                      <View style={styles.badgeContainer}>
                        <VerifiedBadge size={14} />
                      </View>
                    )}
                  </View>
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.user_name}
                      </Text>
                      {item.user_status === 'verified' && <VerifiedBadge size={12} />}
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    </View>
                    <Text style={styles.email} numberOfLines={1}>
                      {item.user_email}
                    </Text>
                    <Text style={styles.time}>Sent {formatTimeAgo(item.created_at)}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewProfileButton]}
                    onPress={() => onProfileClick(item.connected_user_id)}
                  >
                    <Text style={styles.viewProfileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.withdrawButton]}
                    onPress={() => onWithdraw(item.id, item.user_name)}
                  >
                    <Text style={styles.withdrawText}>Withdraw</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pendingBadge: {
    backgroundColor: '#fef9c3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  pendingText: {
    fontSize: 9,
    color: '#854d0e',
    fontWeight: '600',
  },
  email: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  time: {
    fontSize: 10,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#16a34a',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 13,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  friendInfo: {
    flex: 1,
  },
  viewProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  viewProfileText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 12,
  },
  withdrawButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  withdrawText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 13,
  },
});
