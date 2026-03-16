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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  UserPlus,
  Clock,
  Building,
  Map,
  Users,
  UserCheck,
  X,
  User,
} from 'lucide-react-native';
import { useConnectionsData } from '../../hooks/useConnectionsData';
import { useConnectionMutations } from '../../hooks/useConnectionMutations';
import { MemberCard } from '../../components/members/MemberCard';
import { ConnectionsTab } from '../../components/members/ConnectionsTab';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialog';
import { FeedbackToast } from '../../components/shared/FeedbackToast';
import { formatTimeAgo } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import type { RootStackParamList } from '../../navigation';
import type { Member } from '../../types/member';

const marketAreas = [
  'Central / Old City',
  'Sabon Gari / Kantin Kwari',
  'Farm Center / Beirut',
  'France Road',
  'Zoo Road',
  'Zaria Road',
  'Dawanau',
  'Sharada / Challawa',
  'Hotoro',
  'Gyadi-Gyadi / Tarauni',
  'Jigawa Road',
  'Mariri / Sheka',
  'Bompai',
  'Transport (Jigawa Line / Sabon Gari Park)',
  'Others',
];

type MembersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MembersScreen: React.FC = () => {
  const navigation = useNavigation<MembersScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'all' | 'connections'>('all');
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [marketArea, setMarketArea] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    type: 'connect' | 'accept' | 'reject' | 'withdraw';
    userId?: string;
    requestId?: string;
    userName: string;
    callback: () => Promise<unknown>;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const hasFilters = search.trim() !== '' || businessType !== '' || marketArea !== '';

  const {
    receivedRequests,
    sentRequests,
    friends,
    membersPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useConnectionsData(search, businessType, marketArea); // Removed fourth argument

  const mutations = useConnectionMutations(search, businessType, marketArea);

  const allMembers = membersPages.flat();
  const filteredMembers = useMemo(() => {
    return allMembers.filter((member) => {
      if (member.role === 'admin') return false;
      if (user?.id && member.id === user.id) return false;
      const isFriend = friends.some((f) => f.user_id === member.id);
      if (isFriend) return false;
      const isReceived = receivedRequests.some((req) => req.sender_id === member.id);
      if (isReceived) return false;
      const isSent = sentRequests.some((req) => req.connected_user_id === member.id);
      if (isSent) return false;
      return true;
    });
  }, [allMembers, friends, receivedRequests, sentRequests, user?.id]);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const showConfirmation = (
    type: 'connect' | 'accept' | 'reject' | 'withdraw',
    userName: string,
    callback: () => Promise<unknown>,
    userId?: string,
    requestId?: string
  ) => {
    setConfirm({ isOpen: true, type, userId, requestId, userName, callback });
  };

  const closeConfirmation = () => setConfirm(null);

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      await confirm.callback();
      showFeedback(
        confirm.type === 'connect'
          ? 'Connection request sent'
          : confirm.type === 'accept'
          ? 'Connected'
          : confirm.type === 'reject'
          ? 'Request rejected'
          : 'Request withdrawn',
        'success'
      );
    } catch (error: any) {
      showFeedback(error?.message || `Failed to ${confirm.type} connection`, 'error');
    } finally {
      closeConfirmation();
    }
  };

  const handleConnect = (memberId: string, memberName: string) => {
    showConfirmation('connect', memberName, () => mutations.sendRequest(memberId), memberId);
  };

  const handleAcceptRequest = (requestId: string, senderName: string) => {
    showConfirmation('accept', senderName, () => mutations.acceptRequest(requestId), undefined, requestId);
  };

  const handleRejectRequest = (requestId: string, senderName: string) => {
    showConfirmation('reject', senderName, () => mutations.rejectRequest(requestId), undefined, requestId);
  };

  const handleWithdrawRequest = (requestId: string, userName: string) => {
    showConfirmation('withdraw', userName, () => mutations.withdrawRequest(requestId), undefined, requestId);
  };

  const clearFilters = () => {
    setInputValue('');
    setSearch('');
    setBusinessType('');
    setMarketArea('');
    setShowFilters(false);
  };

  const handleProfileClick = (memberId: string) => {
    navigation.navigate('Profile', { userId: memberId });
  };

  const getUserInitials = (first?: string, last?: string): string => {
    const f = first?.charAt(0) || '';
    const l = last?.charAt(0) || '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  const getConnectionStatus = useCallback(
    (member: any) => {
      if (friends.some((f) => f.user_id === member.id)) return 'friend';
      if (receivedRequests.some((req) => req.sender_id === member.id)) return 'received';
      if (sentRequests.some((req) => req.connected_user_id === member.id)) return 'sent';
      return 'none';
    },
    [friends, receivedRequests, sentRequests]
  );

  const getConnectionButton = useCallback(
    (member: any) => {
      const status = getConnectionStatus(member);

      if (status === 'friend') {
        return (
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => handleProfileClick(member.id)}
          >
            <User size={14} color="#16a34a" />
            <Text style={styles.viewProfileButtonText}>View Profile</Text>
          </TouchableOpacity>
        );
      }

      if (status === 'received') {
        const request = receivedRequests.find((req) => req.sender_id === member.id);
        if (!request) return null;
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.smallButton, styles.acceptSmallButton]}
              onPress={() => handleAcceptRequest(request.id, `${member.first_name} ${member.last_name}`)}
            >
              <Text style={styles.acceptSmallText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, styles.rejectSmallButton]}
              onPress={() => handleRejectRequest(request.id, `${member.first_name} ${member.last_name}`)}
            >
              <X size={14} color="#991b1b" />
            </TouchableOpacity>
          </View>
        );
      }

      if (status === 'sent') {
        return (
          <View style={styles.pendingButton}>
            <Clock size={14} color="#854d0e" />
            <Text style={styles.pendingButtonText}>Pending</Text>
          </View>
        );
      }

      return (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => handleConnect(member.id, `${member.first_name} ${member.last_name}`)}
        >
          <UserPlus size={14} color="#fff" />
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      );
    },
    [getConnectionStatus, receivedRequests, sentRequests]
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, business..."
            placeholderTextColor="#9ca3af"
            value={inputValue}
            onChangeText={setInputValue}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={showFilters ? '#16a34a' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filtersGrid}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>
                <Building size={14} color="#6b7280" /> Business Type
              </Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, businessType === '' && styles.filterOptionSelected]}
                  onPress={() => setBusinessType('')}
                >
                  <Text style={[styles.filterOptionText, businessType === '' && styles.filterOptionTextSelected]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, businessType === 'products' && styles.filterOptionSelected]}
                  onPress={() => setBusinessType('products')}
                >
                  <Text style={[styles.filterOptionText, businessType === 'products' && styles.filterOptionTextSelected]}>
                    Products
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, businessType === 'services' && styles.filterOptionSelected]}
                  onPress={() => setBusinessType('services')}
                >
                  <Text style={[styles.filterOptionText, businessType === 'services' && styles.filterOptionTextSelected]}>
                    Services
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>
                <Map size={14} color="#6b7280" /> Market Area
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketAreaScroll}>
                <View style={styles.marketAreaOptions}>
                  <TouchableOpacity
                    style={[styles.marketAreaChip, marketArea === '' && styles.marketAreaChipSelected]}
                    onPress={() => setMarketArea('')}
                  >
                    <Text style={[styles.marketAreaChipText, marketArea === '' && styles.marketAreaChipTextSelected]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {marketAreas.map((area) => (
                    <TouchableOpacity
                      key={area}
                      style={[styles.marketAreaChip, marketArea === area && styles.marketAreaChipSelected]}
                      onPress={() => setMarketArea(area)}
                    >
                      <Text
                        style={[styles.marketAreaChipText, marketArea === area && styles.marketAreaChipTextSelected]}
                        numberOfLines={1}
                      >
                        {area}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (isLoading && !hasFilters) {
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

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Users size={18} color={activeTab === 'all' ? '#16a34a' : '#6b7280'} />
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
            onPress={() => setActiveTab('connections')}
          >
            <UserCheck size={18} color={activeTab === 'connections' ? '#16a34a' : '#6b7280'} />
            <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>Connections</Text>
            {receivedRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{receivedRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {activeTab === 'all' ? (
          <>
            {/* Search input outside FlatList to prevent remount */}
            <View style={styles.searchWrapper}>
              {renderListHeader()}
            </View>

            {!hasFilters ? (
              <View style={styles.emptyContainer}>
                <Search size={48} color="#16a34a" />
                <Text style={styles.emptyTitle}>Start Searching</Text>
                <Text style={styles.emptyText}>Type a name or business to find members</Text>
              </View>
            ) : (
              <FlatList
                data={filteredMembers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <MemberCard
                    member={item}
                    connectionButton={getConnectionButton(item)}
                    onProfileClick={handleProfileClick}
                    getUserInitials={getUserInitials}
                  />
                )}
                ListEmptyComponent={
                  isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Building size={40} color="#16a34a" />
                      <Text style={styles.emptyTitle}>No members found</Text>
                      <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
                      <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                        <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
                onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <View style={styles.footerLoader}>
                      <ActivityIndicator size="small" color="#16a34a" />
                    </View>
                  ) : null
                }
                contentContainerStyle={[
                  styles.listContent,
                  { paddingBottom: insets.bottom + 80 }
                ]}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        ) : (
          <ScrollView 
            contentContainerStyle={[
              styles.connectionsContent,
              { paddingBottom: insets.bottom + 80 }
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <ConnectionsTab
              receivedRequests={receivedRequests}
              friends={friends}
              sentRequests={sentRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              onWithdraw={handleWithdrawRequest}
              onProfileClick={handleProfileClick}
              formatTimeAgo={formatTimeAgo}
            />
          </ScrollView>
        )}

        {confirm && (
          <ConfirmationDialog
            visible={confirm.isOpen}
            title={
              confirm.type === 'connect'
                ? `Connect with ${confirm.userName}?`
                : confirm.type === 'accept'
                ? `Accept connection from ${confirm.userName}?`
                : confirm.type === 'reject'
                ? `Reject connection from ${confirm.userName}?`
                : `Withdraw request to ${confirm.userName}?`
            }
            message={
              confirm.type === 'connect'
                ? 'This will send a connection request to this member.'
                : confirm.type === 'accept'
                ? 'You will be connected and can message each other.'
                : confirm.type === 'reject'
                ? 'This will decline the connection request.'
                : 'This will cancel your pending connection request.'
            }
            confirmText={
              confirm.type === 'connect'
                ? 'Send Request'
                : confirm.type === 'accept'
                ? 'Accept'
                : confirm.type === 'reject'
                ? 'Reject'
                : 'Withdraw'
            }
            onConfirm={handleConfirm}
            onCancel={closeConfirmation}
            isDanger={confirm.type === 'reject' || confirm.type === 'withdraw'}
          />
        )}

        <FeedbackToast
          visible={!!feedback}
          message={feedback?.message || ''}
          type={feedback?.type || 'success'}
          onClose={closeFeedback}
        />
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 20,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  listHeader: {
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  filtersPanel: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  clearText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  filtersGrid: {
    gap: 16,
  },
  filterItem: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: '#4b5563',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#4b5563',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  marketAreaScroll: {
    flexGrow: 0,
  },
  marketAreaOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  marketAreaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  marketAreaChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  marketAreaChipText: {
    fontSize: 11,
    color: '#4b5563',
  },
  marketAreaChipTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#16a34a',
    borderRadius: 24,
  },
  clearFiltersText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectionsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  viewProfileButtonText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptSmallButton: {
    backgroundColor: '#16a34a',
  },
  acceptSmallText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  rejectSmallButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  pendingButtonText: {
    color: '#854d0e',
    fontWeight: '600',
    fontSize: 12,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
