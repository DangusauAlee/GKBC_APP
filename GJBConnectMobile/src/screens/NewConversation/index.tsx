import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserCheck, UserPlus, Clock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { messagingService } from '../../services/messaging';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { messagingKeys } from '../../hooks/queryKeys';
import VerifiedBadge from '../../components/shared/VerifiedBadge';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'verified' | 'member';
  connection_status?: 'connected' | 'pending' | null;
}

export const NewConversationScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'discover'>('connections');
  const [connectionStatusMap, setConnectionStatusMap] = useState<Map<string, 'connected' | 'pending'>>(new Map());

  const userStatus = profile?.user_status;

  // Redirect members
  useEffect(() => {
    if (userStatus === 'member') {
      navigation.navigate('Marketplace');
    }
  }, [userStatus, navigation]);

  // Fetch connection status map
  useEffect(() => {
    if (!user) return;

    const fetchConnections = async () => {
      const { data, error } = await supabase
        .from('connections')
        .select('user_id, connected_user_id, status')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching connections:', error);
        return;
      }

      const map = new Map<string, 'connected' | 'pending'>();
      data.forEach((conn: any) => {
        const otherId = conn.user_id === user.id ? conn.connected_user_id : conn.user_id;
        if (conn.status === 'connected' || conn.status === 'pending') {
          map.set(otherId, conn.status);
        }
      });
      setConnectionStatusMap(map);
    };

    fetchConnections();
  }, [user]);

  useEffect(() => {
    if (userStatus === 'verified') {
      loadConnections();
    }
  }, [userStatus, connectionStatusMap]);

  useEffect(() => {
    if (activeTab === 'discover' && searchQuery.trim() && userStatus === 'verified') {
      const delay = setTimeout(() => searchUsers(), 300);
      return () => clearTimeout(delay);
    } else if (activeTab === 'discover' && !searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab, userStatus]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const data = await messagingService.getConnectedVerifiedUsers();
      const enriched = data.map(u => ({
        ...u,
        status: 'verified' as const,
        connection_status: connectionStatusMap.get(u.id) || null,
      }));
      setConnections(enriched);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('user_status', 'verified')
        .neq('id', user.id)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
        .limit(20);
      if (error) throw error;
      const results = (data || []).map(p => ({
        id: p.id,
        username: `${p.first_name} ${p.last_name}`.trim(),
        avatar_url: p.avatar_url,
        status: 'verified' as const,
        connection_status: connectionStatusMap.get(p.id) || null,
      }));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendConnectionRequest = async (otherUserId: string) => {
    try {
      await messagingService.sendConnectionRequest(otherUserId);
      // Optimistic update
      setConnectionStatusMap(prev => new Map(prev).set(otherUserId, 'pending'));
      setConnections(prev =>
        prev.map(u => (u.id === otherUserId ? { ...u, connection_status: 'pending' } : u))
      );
      setSearchResults(prev =>
        prev.map(u => (u.id === otherUserId ? { ...u, connection_status: 'pending' } : u))
      );
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send request');
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user) return;
    try {
      const validation = await messagingService.canStartConnectionChat(user.id, otherUserId);
      if (!validation || !validation.canStart) {
        Alert.alert('Cannot start', validation?.reason || 'Cannot start conversation');
        return;
      }
      const conversationId = await messagingService.getOrCreateConversation(user.id, otherUserId, 'connection');
      const otherUser = (activeTab === 'connections' ? connections : searchResults).find(u => u.id === otherUserId);
      navigation.navigate('ChatWindow', {
        conversationId,
        otherUser: {
          id: otherUserId,
          name: otherUser?.username,
          avatar: otherUser?.avatar_url,
          status: 'verified',
        },
        context: 'connection',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start conversation');
    }
  };

  const displayedUsers = activeTab === 'connections' ? connections : searchResults;

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.username?.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          )}
          <View style={styles.avatarBadge}>
            <VerifiedBadge size={12} />
          </View>
        </View>
        <View style={styles.userDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>{item.username}</Text>
            <VerifiedBadge size={12} />
          </View>
          <Text style={styles.connectionStatus}>
            {item.connection_status === 'connected'
              ? 'Connected'
              : item.connection_status === 'pending'
              ? 'Request Pending'
              : 'Not connected'}
          </Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        {item.connection_status === 'connected' ? (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleStartConversation(item.id)}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        ) : item.connection_status === 'pending' ? (
          <TouchableOpacity style={styles.pendingButton} disabled>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.pendingButtonText}>Pending</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => sendConnectionRequest(item.id)}
          >
            <UserPlus size={16} color="#16a34a" />
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.emptyGradient}>
        <View style={styles.emptyIcon}>
          {activeTab === 'connections' ? (
            <UserCheck size={48} color="#16a34a" />
          ) : (
            <Search size={48} color="#16a34a" />
          )}
        </View>
        <Text style={styles.emptyTitle}>
          {activeTab === 'connections'
            ? 'No verified connections yet'
            : searchQuery
            ? 'No users found'
            : 'Search for verified users'}
        </Text>
        <Text style={styles.emptyText}>
          {activeTab === 'connections'
            ? 'Connect with verified members to start chatting'
            : 'Try searching by name'}
        </Text>
      </LinearGradient>
    </View>
  );

  if (userStatus !== 'verified') return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#16a34a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Conversation</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={16} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'connections' ? 'Search connections...' : 'Search verified users...'}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
            onPress={() => setActiveTab('connections')}
          >
            <UserCheck size={14} color={activeTab === 'connections' ? '#16a34a' : '#6b7280'} />
            <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>Connections</Text>
            {connections.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{connections.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Search size={14} color={activeTab === 'discover' ? '#16a34a' : '#6b7280'} />
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Discover</Text>
          </TouchableOpacity>
        </View>

        {loading && activeTab === 'connections' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : searching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : (
          <FlatList
            data={displayedUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
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
    margin: 12,
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
    paddingHorizontal: 12,
    marginBottom: 8,
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
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
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
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  connectionStatus: {
    fontSize: 11,
    color: '#6b7280',
  },
  actionContainer: {
    marginLeft: 8,
  },
  messageButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  pendingButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  connectButtonText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
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
  emptyIcon: {
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
