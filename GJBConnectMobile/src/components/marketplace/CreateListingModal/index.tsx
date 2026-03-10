import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { X, Upload, DollarSign, MapPin, Camera, AlertCircle, Info } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { storageService } from '../../../services/storage';

const CATEGORIES = ['Electronics', 'Fashion', 'Vehicles', 'Property', 'Services', 'Others'];
const CONDITIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'used', label: 'Used - Good' },
  { value: 'refurbished', label: 'Refurbished' }
];
const MAX_IMAGES = 5;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (listingData: any) => Promise<void>;
}

export const CreateListingModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<{ uri: string; name: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required';
    else if (title.length < 3) errors.title = 'Title must be at least 3 characters';

    if (price && parseFloat(price) <= 0) errors.price = 'Price must be greater than 0';

    if (!category) errors.category = 'Category is required';
    if (!location.trim()) errors.location = 'Location is required';
    if (images.length === 0) errors.images = 'At least one image is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, price, category, location, images]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setUploading(true);
    try {
      const imageUrls = await storageService.uploadMarketplaceImages(images, user?.id || '');
      const listingData = {
        title: title.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : null,
        category,
        condition,
        location: location.trim(),
        images: imageUrls,
      };
      await onSubmit(listingData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setCondition('used');
    setLocation('');
    setImages([]);
    setFormErrors({});
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
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      }));
      const total = images.length + newImages.length;
      if (total > MAX_IMAGES) {
        Alert.alert('Limit reached', `You can only upload up to ${MAX_IMAGES} images.`);
        return;
      }
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (title || description || price || category || location || images.length > 0) {
      Alert.alert('Unsaved changes', 'You have unsaved changes. Cancel?', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Discard', onPress: () => { resetForm(); onClose(); }, style: 'destructive' },
      ]);
    } else {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Upload size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Create New Listing</Text>
                  <Text style={styles.headerSubtitle}>Sell your items on GJBC Marketplace</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Title *</Text>
                <TextInput
                  style={[styles.input, formErrors.title && styles.inputError]}
                  placeholder="What are you selling?"
                  placeholderTextColor="#9ca3af"
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
                  placeholder="Describe your item in detail..."
                  placeholderTextColor="#9ca3af"
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
                      placeholder="Optional"
                      placeholderTextColor="#9ca3af"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
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
                    placeholder="Select category"
                    placeholderTextColor="#9ca3af"
                    value={category}
                    onChangeText={setCategory}
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
                      placeholder="City, State"
                      placeholderTextColor="#9ca3af"
                      value={location}
                      onChangeText={setLocation}
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
                  <Text style={styles.imageCount}>{images.length}/{MAX_IMAGES}</Text>
                </View>
                <View style={styles.imageGrid}>
                  {images.map((img, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.imageRemove}
                        onPress={() => removeImage(index)}
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
                  {images.length < MAX_IMAGES && (
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

              {/* Guidelines */}
              <View style={styles.guidelines}>
                <Info size={14} color="#16a34a" />
                <View style={styles.guidelinesText}>
                  <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
                  <Text style={styles.guidelinesItem}>• Upload up to {MAX_IMAGES} clear photos</Text>
                  <Text style={styles.guidelinesItem}>• First photo is cover image</Text>
                  <Text style={styles.guidelinesItem}>• Max 5MB per photo</Text>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.submitButton, uploading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Post Listing</Text>
                    <Upload size={16} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContent: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
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
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  guidelines: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  guidelinesText: {
    flex: 1,
  },
  guidelinesTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 2,
  },
  guidelinesItem: {
    fontSize: 10,
    color: '#166534',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
