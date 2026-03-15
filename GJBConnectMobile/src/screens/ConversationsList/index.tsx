import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageCircle,
  Store,
  Users,
  Search,
  Plus,
  RefreshCw,
  Clock,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useConversations } from '../../hooks/useConversations';
import { useUnreadCounts } from '../../hooks/useUnreadCounts';
import { formatTimeAgo } from '../../utils/formatters';
import VerifiedBadge from '../../components/shared/VerifiedBadge';

export const ConversationsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'network' | 'marketplace'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const userStatus = profile?.user_status;

  const { data: conversations = [], isLoading, refetch } = useConversations(
    activeTab === 'all' ? undefined : activeTab === 'network' ? 'connection' : 'marketplace'
  );
  const { data: unreadCounts } = useUnreadCounts();

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    if (userStatus === 'member') {
      filtered = filtered.filter(c => c.context === 'marketplace');
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.other_user_name?.toLowerCase().includes(query) ||
        conv.listing_title?.toLowerCase().includes(query) ||
        conv.last_message?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [conversations, searchQuery, userStatus]);

  const getUnreadForTab = useCallback((tab: string) => {
    if (!unreadCounts) return 0;
    if (tab === 'all') return unreadCounts.total;
    if (tab === 'network') return unreadCounts.connection;
    return unreadCounts.marketplace;
  }, [unreadCounts]);

  const handleConversationPress = useCallback((conversation: any) => {
    navigation.navigate('ChatWindow', {
      conversationId: conversation.id,
      otherUser: {
        id: conversation.other_user_id,
        name: conversation.other_user_name,
        avatar: conversation.other_user_avatar,
        status: conversation.other_user_status,
      },
      context: conversation.context,
      listing: conversation.listing_id ? {
        id: conversation.listing_id,
        title: conversation.listing_title,
      } : null,
    });
  }, [navigation]);

  const handleNewConversation = useCallback(() => {
    if (userStatus === 'verified') {
      navigation.navigate('NewConversation');
    } else {
      navigation.navigate('Marketplace');
    }
  }, [userStatus, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          {item.other_user_avatar ? (
            <Image source={{ uri: item.other_user_avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.other_user_name?.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          )}
          {item.other_user_status === 'verified' && (
            <View style={styles.avatarBadge}>
              <VerifiedBadge size={12} />
            </View>
          )}
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread_count > 9 ? '9+' : item.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.row}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.other_user_name}</Text>
            {item.other_user_status === 'verified' && <VerifiedBadge size={12} />}
          </View>
          {item.context === 'marketplace' && (
            <View style={styles.marketplaceTag}>
              <Store size={10} color="#f97316" />
            </View>
          )}
        </View>
        {item.context === 'marketplace' && item.listing_title && (
          <Text style={styles.listingTitle} numberOfLines={1}>{item.listing_title}</Text>
        )}
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Start a conversation...'}
        </Text>
        <View style={styles.footer}>
          <Clock size={10} color="#6b7280" />
          <Text style={styles.time}>{formatTimeAgo(item.last_message_at)}</Text>
          {item.unread_count > 0 && (
            <Text style={styles.newCount}>{item.unread_count} new</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [handleConversationPress]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIcon}>
            <MessageCircle size={20} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Messages</Text>
          {unreadCounts?.total ? (
            <View style={styles.totalUnread}>
              <Text style={styles.totalUnreadText}>{unreadCounts.total}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity onPress={refetch} style={styles.refreshButton}>
          <RefreshCw size={18} color="#16a34a" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Search size={16} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        onPress={() => setActiveTab('all')}
      >
        <MessageCircle size={14} color={activeTab === 'all' ? '#16a34a' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        {getUnreadForTab('all') > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{getUnreadForTab('all')}</Text>
          </View>
        )}
      </TouchableOpacity>

      {userStatus === 'verified' && (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'network' && styles.activeTab]}
          onPress={() => setActiveTab('network')}
        >
          <Users size={14} color={activeTab === 'network' ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'network' && styles.activeTabText]}>Network</Text>
          {getUnreadForTab('network') > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{getUnreadForTab('network')}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
        onPress={() => setActiveTab('marketplace')}
      >
        <Store size={14} color={activeTab === 'marketplace' ? '#16a34a' : '#6b7280'} />
        <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>Marketplace</Text>
        {getUnreadForTab('marketplace') > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{getUnreadForTab('marketplace')}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.emptyGradient}>
        <View style={styles.emptyIconContainer}>
          {activeTab === 'network' ? (
            <Users size={48} color="#16a34a" />
          ) : activeTab === 'marketplace' ? (
            <Store size={48} color="#16a34a" />
          ) : (
            <MessageCircle size={48} color="#16a34a" />
          )}
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No matches found' : 'No conversations yet'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'Try a different search term'
            : activeTab === 'network'
            ? 'Connect with verified members to start chatting'
            : activeTab === 'marketplace'
            ? 'Start a conversation about a product'
            : 'Start a conversation with someone'}
        </Text>
        {!searchQuery && (
          <TouchableOpacity style={styles.emptyButton} onPress={handleNewConversation}>
            <Text style={styles.emptyButtonText}>
              {activeTab === 'marketplace' ? 'Browse Marketplace' : 'New Conversation'}
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  if (isLoading && conversations.length === 0) {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {renderHeader()}
        {renderTabs()}

        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#16a34a']}
              tintColor="#16a34a"
            />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {userStatus === 'verified' && (
          <TouchableOpacity style={styles.fab} onPress={handleNewConversation}>
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.fabGradient}>
              <Plus size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalUnread: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  totalUnreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
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
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  marketplaceTag: {
    backgroundColor: '#fff7ed',
    padding: 2,
    borderRadius: 10,
  },
  listingTitle: {
    fontSize: 11,
    color: '#f97316',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 10,
    color: '#6b7280',
  },
  newCount: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyGradient: {
    alignItems: 'center',
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
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
