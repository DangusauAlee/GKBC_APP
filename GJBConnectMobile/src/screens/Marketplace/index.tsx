import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Plus,
  MessageCircle,
  Shield,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useMarketplaceData } from '../../hooks/useMarketplaceData';
import { useMarketplaceMutations } from '../../hooks/useMarketplaceMutations';
import { MarketplaceListingCard } from '../../components/marketplace/MarketplaceListingCard';
import { CreateListingModal } from '../../components/marketplace/CreateListingModal';
import { FiltersPanel } from '../../components/marketplace/FiltersPanel';
import { FeedbackToast } from '../../components/shared/FeedbackToast';
import { AppHeader } from '../../components/AppHeader';
import type { MarketplaceListing } from '../../types';
import type { RootStackParamList } from '../../navigation';

const CATEGORIES = ['Electronics', 'Fashion', 'Vehicles', 'Property', 'Services', 'Others'];
const CONDITIONS = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
];

type MarketplaceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation<MarketplaceScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'browse' | 'myListings'>('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: 'all',
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isVerified = profile?.user_status === 'verified';

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Build API filters
  const apiFilters = useMemo(() => {
    const params: any = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
    if (filters.condition !== 'all') params.condition = filters.condition;
    if (search) params.search = search;
    return params;
  }, [selectedCategory, filters, search]);

  const {
    browseQuery,
    myListings,
    isLoadingMyListings,
    refetchMyListings,
  } = useMarketplaceData(apiFilters);

  const { createListing, deleteListing, toggleFavorite } = useMarketplaceMutations();

  const listings = browseQuery.data?.pages.flat() ?? [];
  const isLoadingBrowse = browseQuery.isLoading && listings.length === 0;
  const isFetchingMore = browseQuery.isFetchingNextPage;
  const isRefreshing = browseQuery.isRefetching;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.condition !== 'all') count++;
    if (selectedCategory !== 'All') count++;
    if (search) count++;
    return count;
  }, [filters, selectedCategory, search]);

  const showFeedback = useCallback((message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleCreateListing = useCallback(async (listingData: any) => {
    try {
      await createListing.mutateAsync(listingData);
      showFeedback('Listing created successfully', 'success');
      setShowCreateModal(false);
    } catch (error: any) {
      showFeedback(error.message || 'Failed to create listing', 'error');
    }
  }, [createListing, showFeedback]);

  const handleDeleteListing = useCallback(async (listingId: string) => {
    try {
      await deleteListing.mutateAsync(listingId);
      showFeedback('Listing deleted', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete listing', 'error');
    }
  }, [deleteListing, showFeedback]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('All');
    setFilters({ minPrice: '', maxPrice: '', condition: 'all' });
    setInputValue('');
    setSearch('');
  }, []);

  const loadMore = () => {
    if (browseQuery.hasNextPage && !isFetchingMore) {
      browseQuery.fetchNextPage();
    }
  };

  const onRefresh = useCallback(() => {
    if (activeTab === 'browse') {
      browseQuery.refetch();
    } else {
      refetchMyListings();
    }
  }, [activeTab, browseQuery, refetchMyListings]);

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            placeholderTextColor="#9ca3af"
            value={inputValue}
            onChangeText={setInputValue}
          />
          {inputValue ? (
            <TouchableOpacity onPress={() => setInputValue('')} style={styles.clearSearch}>
              <X size={14} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
        <FiltersPanel
          categories={CATEGORIES}
          conditions={CONDITIONS}
          selectedCategory={selectedCategory}
          filters={filters}
          onCategoryChange={setSelectedCategory}
          onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          onApply={() => browseQuery.refetch()}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>Browse</Text>
          {listings.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{listings.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        {isVerified && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myListings' && styles.activeTab]}
            onPress={() => setActiveTab('myListings')}
          >
            <Text style={[styles.tabText, activeTab === 'myListings' && styles.activeTabText]}>My Listings</Text>
            {myListings.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{myListings.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderItem = useCallback(({ item }: { item: MarketplaceListing }) => (
    <MarketplaceListingCard
      listing={item}
      onPress={() => navigation.navigate('MarketplaceDetail', { id: item.id })}
      onEdit={activeTab === 'myListings' ? (listing) => navigation.navigate('MarketplaceEdit', { id: listing.id }) : undefined}
      onDelete={activeTab === 'myListings' ? handleDeleteListing : undefined}
      showManage={activeTab === 'myListings'}
    />
  ), [activeTab, navigation, handleDeleteListing]);

  const renderEmpty = () => {
    if (activeTab === 'browse' ? isLoadingBrowse : isLoadingMyListings) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <MessageCircle size={48} color="#16a34a" />
        <Text style={styles.emptyTitle}>
          {activeTab === 'browse' ? 'No listings found' : 'No listings yet'}
        </Text>
        <Text style={styles.emptyText}>
          {activeTab === 'browse'
            ? activeFilterCount > 0
              ? 'Try adjusting your filters'
              : 'Be the first to create a listing'
            : 'Create your first listing to start selling'}
        </Text>
        {activeTab === 'browse' && activeFilterCount > 0 ? (
          <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
            <Text style={styles.emptyButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        ) : activeTab === 'myListings' && isVerified ? (
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowCreateModal(true)}>
            <Text style={styles.emptyButtonText}>Create Listing</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderFooter = () => {
    if (activeTab === 'browse' && isFetchingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#16a34a" />
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <AppHeader title="Marketplace" />

        {/* Search and filters (outside FlatList) */}
        {activeTab === 'browse' && renderHeader()}

        {/* Main content */}
        {activeTab === 'browse' ? (
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={['#16a34a']}
                tintColor="#16a34a"
              />
            }
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 80 }
            ]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={myListings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingMyListings}
                onRefresh={onRefresh}
                colors={['#16a34a']}
                tintColor="#16a34a"
              />
            }
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 80 }
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB for verified users (only in browse) */}
        {activeTab === 'browse' && isVerified && (
          <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.fabGradient}>
              <Plus size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Create modal */}
        <CreateListingModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateListing}
        />

        {/* Feedback toast */}
        <FeedbackToast
          visible={!!feedback}
          message={feedback?.message || ''}
          type={feedback?.type || 'success'}
          onClose={() => setFeedback(null)}
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
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  clearSearch: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    paddingTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
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
  footerLoader: {
    paddingVertical: 16,
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
