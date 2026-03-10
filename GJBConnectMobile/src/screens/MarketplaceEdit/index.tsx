import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Upload,
  X,
  DollarSign,
  MapPin,
  Camera,
  AlertCircle,
} from 'lucide-react-native';
import { useMarketplaceData } from '../../hooks/useMarketplaceData';
import { useMarketplaceMutations } from '../../hooks/useMarketplaceMutations';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../services/storage';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

const CATEGORIES = ['Electronics', 'Fashion', 'Vehicles', 'Property', 'Services', 'Others'];
const CONDITIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'used', label: 'Used - Good' },
  { value: 'refurbished', label: 'Refurbished' }
];
const MAX_IMAGES = 5;

export const MarketplaceEditScreen: React.FC = () => {
  const route = useRoute<any>();
  const { id } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuthStore();
  const { useListing } = useMarketplaceData();
  const { updateListing } = useMarketplaceMutations();

  const { data: listing, isLoading, error } = useListing(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [location, setLocation] = useState('');
  const [newImages, setNewImages] = useState<{ uri: string; name: string; type: string }[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description || '');
      setPrice(listing.price ? listing.price.toString() : '');
      setCategory(listing.category);
      setCondition(listing.condition);
      setLocation(listing.location);
      setExistingImages(listing.images || []);
    }
  }, [listing]);

  const isOwner = user?.id === listing?.seller_id;
  const isVerified = profile?.user_status === 'verified';

  useEffect(() => {
    if (!isLoading && (!listing || !isOwner || !isVerified)) {
      navigation.goBack();
    }
  }, [isLoading, listing, isOwner, isVerified, navigation]);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required';
    else if (title.length < 3) errors.title = 'Title must be at least 3 characters';

    if (price && parseFloat(price) <= 0) errors.price = 'Price must be greater than 0';

    if (!category) errors.category = 'Category is required';
    if (!location.trim()) errors.location = 'Location is required';
    if (existingImages.length === 0 && newImages.length === 0) {
      errors.images = 'At least one image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !listing) return;

    setUploading(true);
    try {
      let imageUrls = [...existingImages];

      if (newImages.length > 0) {
        const newUrls = await storageService.uploadMarketplaceImages(newImages, user?.id || '');
        imageUrls = [...imageUrls, ...newUrls];
      }

      await updateListing.mutateAsync({
        id: listing.id,
        updates: {
          title: title.trim(),
          description: description.trim(),
          price: price ? parseFloat(price) : null,
          category,
          condition,
          location: location.trim(),
          images: imageUrls,
        },
      });

      showFeedback('Listing updated successfully', 'success');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      showFeedback(error.message || 'Failed to update listing', 'error');
    } finally {
      setUploading(false);
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - (existingImages.length + newImages.length),
      quality: 0.8,
    });

    if (!result.canceled) {
      const addedImages = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      }));
      const total = existingImages.length + newImages.length + addedImages.length;
      if (total > MAX_IMAGES) {
        Alert.alert('Limit reached', `You can only upload up to ${MAX_IMAGES} images.`);
        return;
      }
      setNewImages(prev => [...prev, ...addedImages]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
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

  if (!listing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Listing not found</Text>
            <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
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

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#16a34a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Title *</Text>
              <TextInput
                style={[styles.input, formErrors.title && styles.inputError]}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              {formErrors.title && (
                <View style={styles.errorRow}>
                  <AlertCircle size={10} color="#dc2626" />
                  <Text style={styles.errorText}>{formErrors.title}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={1000}
              />
              <Text style={styles.charCount}>{description.length}/1000</Text>
            </View>

            {/* Price and Category */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Price (₦)</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={14} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, formErrors.price && styles.inputError]}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="Optional"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                {formErrors.price && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={10} color="#dc2626" />
                    <Text style={styles.errorText}>{formErrors.price}</Text>
                  </View>
                )}
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={[styles.input, formErrors.category && styles.inputError]}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Select category"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {formErrors.category && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={10} color="#dc2626" />
                    <Text style={styles.errorText}>{formErrors.category}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Condition and Location */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Condition *</Text>
                <View style={styles.conditionGrid}>
                  {CONDITIONS.map(({ value, label }) => (
                    <TouchableOpacity
                      key={value}
                      style={[styles.conditionButton, condition === value && styles.conditionButtonSelected]}
                      onPress={() => setCondition(value)}
                    >
                      <Text style={[styles.conditionText, condition === value && styles.conditionTextSelected]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={14} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, formErrors.location && styles.inputError]}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="City, State"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                {formErrors.location && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={10} color="#dc2626" />
                    <Text style={styles.errorText}>{formErrors.location}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Images */}
            <View style={styles.inputGroup}>
              <View style={styles.imagesHeader}>
                <Text style={styles.label}>Product Images *</Text>
                <Text style={styles.imageCount}>{existingImages.length + newImages.length}/{MAX_IMAGES}</Text>
              </View>
              <View style={styles.imageGrid}>
                {/* Existing images */}
                {existingImages.map((url, index) => (
                  <View key={`existing-${index}`} style={styles.imageItem}>
                    <Image source={{ uri: url }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.imageRemove}
                      onPress={() => removeExistingImage(index)}
                    >
                      <X size={10} color="#fff" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverText}>Cover</Text>
                      </View>
                    )}
                  </View>
                ))}
                {/* New images */}
                {newImages.map((img, index) => (
                  <View key={`new-${index}`} style={styles.imageItem}>
                    <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.imageRemove}
                      onPress={() => removeNewImage(index)}
                    >
                      <X size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Add button */}
                {existingImages.length + newImages.length < MAX_IMAGES && (
                  <TouchableOpacity style={styles.imageAdd} onPress={pickImages}>
                    <Camera size={20} color="#16a34a" />
                    <Text style={styles.imageAddText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
              {formErrors.images && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color="#dc2626" />
                  <Text style={styles.errorText}>{formErrors.images}</Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, uploading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 12,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#1f2937',
    paddingHorizontal: 8,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  charCount: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  errorText: {
    fontSize: 10,
    color: '#dc2626',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  categoryScroll: {
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryChipText: {
    fontSize: 11,
    color: '#4b5563',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  conditionGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  conditionButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  conditionText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  conditionTextSelected: {
    color: '#fff',
  },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageCount: {
    fontSize: 11,
    color: '#6b7280',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#16a34a',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  imageAdd: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAddText: {
    fontSize: 10,
    color: '#16a34a',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
