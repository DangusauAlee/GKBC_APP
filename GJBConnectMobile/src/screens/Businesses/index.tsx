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
  Plus,
  Store,
  Star,
  MapPin,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { useBusinessData } from '../../hooks/useBusinessData';
import { useBusinessMutations } from '../../hooks/useBusinessMutations';
import { BusinessCard } from '../../components/business/BusinessCard';
import { CreateBusinessModal } from '../../components/business/CreateBusinessModal';
import { useAuthStore } from '../../store/authStore';
import { LOCATION_AXIS } from '../../types/business';
import type { Business } from '../../types/business';
import type { RootStackParamList } from '../../navigation';

type BusinessesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BusinessesScreen: React.FC = () => {
  const navigation = useNavigation<BusinessesScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'products' | 'services' | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const filters = useMemo(() => ({
    business_type: selectedType === 'all' ? undefined : selectedType,
    location_axis: selectedLocation === 'all' ? undefined : selectedLocation,
    search: search || undefined,
  }), [selectedType, selectedLocation, search]);

  const {
    businessesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    userStatus,
  } = useBusinessData(filters);

  const { createBusiness } = useBusinessMutations();

  const businesses = businessesPages.flat();
  const isVerified = userStatus?.can_create_business ?? false;

  const handleCreateClick = useCallback(() => {
    if (!isVerified) {
      setShowVerificationAlert(true);
      setTimeout(() => setShowVerificationAlert(false), 3000);
      return;
    }
    setShowCreateModal(true);
  }, [isVerified]);

  const clearFilters = useCallback(() => {
    setSelectedType('all');
    setSelectedLocation('all');
    setInputValue('');
    setSearch('');
    setShowFilters(false);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (selectedLocation !== 'all') count++;
    if (search) count++;
    return count;
  }, [selectedType, selectedLocation, search]);

  const handleBusinessClick = (businessId: string) => {
    navigation.navigate('BusinessDetails', { id: businessId });
  };

  const renderItem = useCallback(({ item }: { item: Business }) => (
    <BusinessCard business={item} onPress={() => handleBusinessClick(item.id)} />
  ), []);

  const keyExtractor = useCallback((item: Business) => item.id, []);

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
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
        {activeFiltersCount > 0 && !showFilters && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Business Type</Text>
            <View style={styles.typeOptions}>
              <TouchableOpacity
                style={[styles.typeChip, selectedType === 'all' && styles.typeChipSelected]}
                onPress={() => setSelectedType('all')}
              >
                <Text style={[styles.typeChipText, selectedType === 'all' && styles.typeChipTextSelected]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeChip, selectedType === 'products' && styles.typeChipSelected]}
                onPress={() => setSelectedType('products')}
              >
                <Text style={[styles.typeChipText, selectedType === 'products' && styles.typeChipTextSelected]}>
                  Products
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeChip, selectedType === 'services' && styles.typeChipSelected]}
                onPress={() => setSelectedType('services')}
              >
                <Text style={[styles.typeChipText, selectedType === 'services' && styles.typeChipTextSelected]}>
                  Services
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.locationOptions}>
                <TouchableOpacity
                  style={[styles.locationChip, selectedLocation === 'all' && styles.locationChipSelected]}
                  onPress={() => setSelectedLocation('all')}
                >
                  <Text style={[styles.locationChipText, selectedLocation === 'all' && styles.locationChipTextSelected]}>
                    All
                  </Text>
                </TouchableOpacity>
                {LOCATION_AXIS.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.locationChip, selectedLocation === loc && styles.locationChipSelected]}
                    onPress={() => setSelectedLocation(loc)}
                  >
                    <Text style={[styles.locationChipText, selectedLocation === loc && styles.locationChipTextSelected]}>
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Store size={48} color="#16a34a" />
        <Text style={styles.emptyTitle}>No businesses found</Text>
        <Text style={styles.emptyText}>
          {isVerified ? 'Be the first to list a business!' : 'No businesses found in this area.'}
        </Text>
        {isVerified && (
          <TouchableOpacity style={styles.emptyButton} onPress={handleCreateClick}>
            <Text style={styles.emptyButtonText}>List Your Business</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#16a34a" />
        </View>
      );
    }
    if (!hasNextPage && businesses.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerText}>No more businesses</Text>
        </View>
      );
    }
    return null;
  };

  if (isLoading && businesses.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          
          <View style={styles.initialLoading}>
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


        <View style={styles.searchWrapper}>
          {renderHeader()}
        </View>

        {/* Verification Alert */}
        {showVerificationAlert && (
          <View style={styles.alertContainer}>
            <AlertCircle size={16} color="#b45309" />
            <Text style={styles.alertText}>
              Only verified members can create businesses. Contact support to upgrade.
            </Text>
            <TouchableOpacity onPress={() => setShowVerificationAlert(false)}>
              <X size={14} color="#b45309" />
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={businesses}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
          onEndReachedThreshold={0.5}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        {isVerified && (
          <TouchableOpacity style={styles.fab} onPress={handleCreateClick}>
            <LinearGradient
              colors={['#16a34a', '#15803d']}
              style={styles.fabGradient}
            >
              <Plus size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <CreateBusinessModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listHeader: {
    gap: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    position: 'relative',
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
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: 38,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  filterItem: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  typeChipText: {
    fontSize: 12,
    color: '#4b5563',
  },
  typeChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  locationOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  locationChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  locationChipText: {
    fontSize: 11,
    color: '#4b5563',
  },
  locationChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  initialLoading: {
    flex: 1,
    justifyContent: 'center',
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
  footerEnd: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: '#b45309',
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
