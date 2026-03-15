import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { UserCheck } from 'lucide-react-native';
import { ConnectionsTab } from '../../members/ConnectionsTab';
import { UserConnectionsList } from '../UserConnectionsList';
import { useProfilePosts } from '../../../hooks/useProfile';
import { formatTimeAgo } from '../../../utils/formatters';

interface ProfileTabsProps {
  activeTab: 'posts' | 'connections';
  onTabChange: (tab: 'posts' | 'connections') => void;
  profileUserId: string;
  viewerId: string;
  isOwner: boolean;
  isConnected: boolean;
  posts: any[];
  receivedRequests: any[];
  sentRequests: any[];
  friends: any[];
  onAcceptRequest: (requestId: string, senderName: string) => void;
  onRejectRequest: (requestId: string, senderName: string) => void;
  onWithdrawRequest: (requestId: string, userName: string) => void;
  connectionsCount: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  profileUserId,
  viewerId,
  isOwner,
  isConnected,
  posts,
  receivedRequests,
  sentRequests,
  friends,
  onAcceptRequest,
  onRejectRequest,
  onWithdrawRequest,
  connectionsCount,
}) => {
  const renderPosts = () => {
    if (!isOwner && !isConnected) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🔒</Text>
          </View>
          <Text style={styles.emptyTitle}>Connect to view posts</Text>
          <Text style={styles.emptyText}>Connect with this user to see their posts.</Text>
        </View>
      );
    }
    if (posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📝</Text>
          </View>
          <Text style={styles.emptyTitle}>No Posts</Text>
          <Text style={styles.emptyText}>No posts to display.</Text>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.postsContainer}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postPlaceholder}>
            <Text>{post.content}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderConnections = () => {
    if (isOwner) {
      return (
        <ConnectionsTab
          receivedRequests={receivedRequests}
          friends={friends}
          sentRequests={sentRequests}
          onAccept={onAcceptRequest}
          onReject={onRejectRequest}
          onWithdraw={onWithdrawRequest}
          onProfileClick={(userId) => navigation.navigate('Profile', { userId })}
          formatTimeAgo={formatTimeAgo}
        />
      );
    }
    if (isConnected) {
      return <UserConnectionsList userId={profileUserId} viewerId={viewerId} />;
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <UserCheck size={32} color="#9ca3af" />
        </View>
        <Text style={styles.emptyTitle}>{connectionsCount} Connections</Text>
        <Text style={styles.emptyText}>Connect with this user to see who they are connected with.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => onTabChange('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
          onPress={() => onTabChange('connections')}
        >
          <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>Connections</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {activeTab === 'posts' ? renderPosts() : renderConnections()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  postsContainer: {
    paddingBottom: 20,
  },
  postPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});
