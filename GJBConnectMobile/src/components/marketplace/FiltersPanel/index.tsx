import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Filter, X } from 'lucide-react-native';

interface Props {
  categories: string[];
  conditions: { value: string; label: string }[];
  selectedCategory: string;
  filters: {
    minPrice: string;
    maxPrice: string;
    condition: string;
  };
  onCategoryChange: (category: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
  activeFilterCount: number;
}

export const FiltersPanel: React.FC<Props> = ({
  categories,
  conditions,
  selectedCategory,
  filters,
  onCategoryChange,
  onFilterChange,
  onApply,
  onClear,
  activeFilterCount,
}) => {
  const [visible, setVisible] = useState(false);

  const handleApply = () => {
    onApply();
    setVisible(false);
  };

  const handleClear = () => {
    onClear();
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.filterButton}>
        <Filter size={18} color="#16a34a" />
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Filters</Text>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                  <X size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.content}>
                {/* Category */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Category</Text>
                  <View style={styles.categoryGrid}>
                    <TouchableOpacity
                      style={[styles.categoryChip, selectedCategory === 'All' && styles.categoryChipSelected]}
                      onPress={() => onCategoryChange('All')}
                    >
                      <Text style={[styles.categoryText, selectedCategory === 'All' && styles.categoryTextSelected]}>
                        All
                      </Text>
                    </TouchableOpacity>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
                        onPress={() => onCategoryChange(cat)}
                      >
                        <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextSelected]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price range */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Price Range (₦)</Text>
                  <View style={styles.priceRow}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      placeholderTextColor="#9ca3af"
                      value={filters.minPrice}
                      onChangeText={(val) => onFilterChange('minPrice', val)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.priceSeparator}>-</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      placeholderTextColor="#9ca3af"
                      value={filters.maxPrice}
                      onChangeText={(val) => onFilterChange('maxPrice', val)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Condition */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Condition</Text>
                  <View style={styles.conditionRow}>
                    <TouchableOpacity
                      style={[styles.conditionChip, filters.condition === 'all' && styles.conditionChipSelected]}
                      onPress={() => onFilterChange('condition', 'all')}
                    >
                      <Text style={[styles.conditionText, filters.condition === 'all' && styles.conditionTextSelected]}>
                        All
                      </Text>
                    </TouchableOpacity>
                    {conditions.map(cond => (
                      <TouchableOpacity
                        key={cond.value}
                        style={[styles.conditionChip, filters.condition === cond.value && styles.conditionChipSelected]}
                        onPress={() => onFilterChange('condition', cond.value)}
                      >
                        <Text style={[styles.conditionText, filters.condition === cond.value && styles.conditionTextSelected]}>
                          {cond.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
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
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryText: {
    fontSize: 11,
    color: '#4b5563',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  priceSeparator: {
    fontSize: 14,
    color: '#6b7280',
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  conditionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  conditionChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  conditionText: {
    fontSize: 11,
    color: '#4b5563',
  },
  conditionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
