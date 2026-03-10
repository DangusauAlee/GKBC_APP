import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Store,
  MapPin,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Building,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Upload,
} from 'lucide-react-native';
import { useBusinessData } from '../../../hooks/useBusinessData';
import { useBusinessMutations } from '../../../hooks/useBusinessMutations';
import { useAuthStore } from '../../../store/authStore';
import { LOCATION_AXIS } from '../../../types/business';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const CreateBusinessModal: React.FC<Props> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { createBusiness } = useBusinessMutations();
  const { categories, userStatus } = useBusinessData({});

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    business_type: 'products' as 'products' | 'services',
    category: '',
    location_axis: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    is_registered: false,
  });
  const [logoFile, setLogoFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [bannerFile, setBannerFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isVerified = userStatus?.user_status === 'verified';

  const validateForm = useCallback((): boolean => {
    if (!formData.name.trim()) {
      setError('Business name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return false;
    }
    if (!formData.location_axis.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(formData.phone.trim().replace(/\s/g, ''))) {
      setError('Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  }, [formData]);

  const formatWebsiteUrl = useCallback((url: string): string => {
    if (!url.trim()) return '';
    let formattedUrl = url.trim().toLowerCase();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    return formattedUrl;
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isVerified) {
      setError('Only verified members can create businesses. Please contact support.');
      return;
    }
    if (!validateForm()) return;
    setUploading(true);
    setError('');
    try {
      await createBusiness({
        name: formData.name.trim(),
        description: formData.description.trim(),
        business_type: formData.business_type,
        category: formData.category.trim(),
        location_axis: formData.location_axis,
        address: formData.address.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        website: formData.website.trim() ? formatWebsiteUrl(formData.website) : undefined,
        logo_file: logoFile || undefined,
        banner_file: bannerFile || undefined,
        is_registered: formData.is_registered,
      });
      setSuccess('Business submitted successfully! It will be reviewed before listing.');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create business. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [formData, logoFile, bannerFile, isVerified, validateForm, formatWebsiteUrl, createBusiness, onClose]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      business_type: 'products',
      category: '',
      location_axis: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      is_registered: false,
    });
    setLogoFile(null);
    setBannerFile(null);
    setStep(1);
    setError('');
    setSuccess('');
  }, []);

  const pickImage = async (type: 'logo' | 'banner') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: type === 'logo',
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || `${type}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };
      if (type === 'logo') {
        setLogoFile(file);
      } else {
        setBannerFile(file);
      }
    }
  };

  const removeFile = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoFile(null);
    } else {
      setBannerFile(null);
    }
  };

  const updateFormData = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goToNextStep = useCallback(() => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.description.trim() || !formData.category.trim()) {
        setError('Please fill in all required fields');
        return;
      }
    }
    if (step === 2 && !formData.location_axis.trim()) {
      setError('Please select a location');
      return;
    }
    setError('');
    setStep(step + 1);
  }, [step, formData]);

  const goToPrevStep = useCallback(() => {
    setError('');
    setStep(step - 1);
  }, [step]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.business_type === formData.business_type);
  }, [categories, formData.business_type]);

  const isStepValid = useCallback((): boolean => {
    switch (step) {
      case 1:
        return !uploading && !!formData.name.trim() && !!formData.description.trim() && !!formData.category.trim();
      case 2:
        return !uploading && !!formData.location_axis.trim();
      case 3:
        return !uploading && !!formData.phone.trim();
      default:
        return false;
    }
  }, [step, uploading, formData]);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
          <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Building size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Create Business</Text>
                  <Text style={styles.headerSubtitle}>Join GJBC business network</Text>
                </View>
                {step === 3 && (
                  <TouchableOpacity
                    style={[styles.submitButton, (!isStepValid() || uploading) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!isStepValid() || uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <CheckCircle size={14} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => { if (!uploading) { resetForm(); onClose(); } }} style={styles.closeButton} disabled={uploading}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Step Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.stepRow}>
                {[1, 2, 3].map((stepNumber) => (
                  <View key={stepNumber} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        step === stepNumber && styles.stepCircleActive,
                        step > stepNumber && styles.stepCircleCompleted,
                      ]}
                    >
                      {step > stepNumber ? (
                        <CheckCircle size={12} color="#fff" />
                      ) : (
                        <Text style={[styles.stepCircleText, step === stepNumber && styles.stepCircleTextActive]}>
                          {stepNumber}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.stepLabel, step === stepNumber && styles.stepLabelActive]}>
                      {stepNumber === 1 ? 'Basic' : stepNumber === 2 ? 'Details' : 'Contact'}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((step - 1) / 2) * 100}%` }]} />
              </View>
            </View>

            {/* Error/Success */}
            {(error || success) && (
              <View style={[styles.messageContainer, error ? styles.errorMessage : styles.successMessage]}>
                {error ? (
                  <AlertCircle size={16} color="#dc2626" />
                ) : (
                  <CheckCircle size={16} color="#16a34a" />
                )}
                <Text style={[styles.messageText, error ? styles.errorText : styles.successText]}>
                  {error || success}
                </Text>
              </View>
            )}

            {!success ? (
              <ScrollView contentContainerStyle={styles.formContent}>
                {/* Step 1 */}
                {step === 1 && (
                  <View style={styles.stepContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Business Name *</Text>
                      <View style={styles.inputWrapper}>
                        <Store size={14} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your business name"
                          placeholderTextColor="#9ca3af"
                          value={formData.name}
                          onChangeText={(text) => updateFormData('name', text)}
                          maxLength={100}
                        />
                      </View>
                      <Text style={styles.charCount}>{formData.name.length}/100</Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Description *</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe what your business does..."
                        placeholderTextColor="#9ca3af"
                        value={formData.description}
                        onChangeText={(text) => updateFormData('description', text)}
                        multiline
                        maxLength={500}
                      />
                      <View style={styles.descriptionFooter}>
                        <Text style={styles.hint}>Brief description helps customers understand your business</Text>
                        <Text style={styles.charCount}>{formData.description.length}/500</Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Business Type *</Text>
                        <View style={styles.typeButtons}>
                          <TouchableOpacity
                            style={[
                              styles.typeButton,
                              formData.business_type === 'products' && styles.typeButtonActive,
                            ]}
                            onPress={() => updateFormData('business_type', 'products')}
                          >
                            <Text style={[styles.typeButtonText, formData.business_type === 'products' && styles.typeButtonTextActive]}>
                              Products
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.typeButton,
                              formData.business_type === 'services' && styles.typeButtonActive,
                            ]}
                            onPress={() => updateFormData('business_type', 'services')}
                          >
                            <Text style={[styles.typeButtonText, formData.business_type === 'services' && styles.typeButtonTextActive]}>
                              Services
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            style={styles.input}
                            placeholder="Select or type category"
                            placeholderTextColor="#9ca3af"
                            value={formData.category}
                            onChangeText={(text) => updateFormData('category', text)}
                          />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                          {filteredCategories.map(cat => (
                            <TouchableOpacity
                              key={cat.category}
                              style={[styles.categoryChip, formData.category === cat.category && styles.categoryChipActive]}
                              onPress={() => updateFormData('category', cat.category)}
                            >
                              <Text style={[styles.categoryChipText, formData.category === cat.category && styles.categoryChipTextActive]}>
                                {cat.category}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </View>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <View style={styles.stepContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Location Axis *</Text>
                      <View style={styles.inputWrapper}>
                        <Navigation size={14} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Select your business area"
                          placeholderTextColor="#9ca3af"
                          value={formData.location_axis}
                          onChangeText={(text) => updateFormData('location_axis', text)}
                        />
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
                        {LOCATION_AXIS.map(loc => (
                          <TouchableOpacity
                            key={loc}
                            style={[styles.locationChip, formData.location_axis === loc && styles.locationChipActive]}
                            onPress={() => updateFormData('location_axis', loc)}
                          >
                            <Text style={[styles.locationChipText, formData.location_axis === loc && styles.locationChipTextActive]}>
                              {loc}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Address</Text>
                      <View style={styles.inputWrapper}>
                        <MapPin size={14} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Street, building, landmark details"
                          placeholderTextColor="#9ca3af"
                          value={formData.address}
                          onChangeText={(text) => updateFormData('address', text)}
                          maxLength={200}
                        />
                      </View>
                    </View>

                    <View style={styles.row}>
                      {/* Logo Upload */}
                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Logo (Optional)</Text>
                        <TouchableOpacity
                          style={[styles.uploadBox, logoFile && styles.uploadBoxFilled]}
                          onPress={() => pickImage('logo')}
                          disabled={uploading}
                        >
                          {logoFile ? (
                            <>
                              <Image source={{ uri: logoFile.uri }} style={styles.uploadPreview} />
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeFile('logo')}
                                disabled={uploading}
                              >
                                <X size={12} color="#fff" />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <View style={styles.uploadPlaceholder}>
                              <Upload size={16} color="#16a34a" />
                              <Text style={styles.uploadText}>Upload Logo</Text>
                              <Text style={styles.uploadHint}>Square, max 5MB</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Banner Upload */}
                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Banner (Optional)</Text>
                        <TouchableOpacity
                          style={[styles.uploadBox, bannerFile && styles.uploadBoxFilled, styles.bannerBox]}
                          onPress={() => pickImage('banner')}
                          disabled={uploading}
                        >
                          {bannerFile ? (
                            <>
                              <Image source={{ uri: bannerFile.uri }} style={styles.uploadPreview} />
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeFile('banner')}
                                disabled={uploading}
                              >
                                <X size={12} color="#fff" />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <View style={styles.uploadPlaceholder}>
                              <Upload size={16} color="#16a34a" />
                              <Text style={styles.uploadText}>Upload Banner</Text>
                              <Text style={styles.uploadHint}>Wide, max 10MB</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <View style={styles.stepContainer}>
                    <View style={styles.row}>
                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Email (Optional)</Text>
                        <View style={styles.inputWrapper}>
                          <Mail size={14} color="#9ca3af" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="business@email.com"
                            placeholderTextColor="#9ca3af"
                            value={formData.email}
                            onChangeText={(text) => updateFormData('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <View style={styles.inputWrapper}>
                          <Phone size={14} color="#9ca3af" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="080XXXXXXXX or +234..."
                            placeholderTextColor="#9ca3af"
                            value={formData.phone}
                            onChangeText={(text) => updateFormData('phone', text)}
                            keyboardType="phone-pad"
                          />
                        </View>
                        <Text style={styles.hint}>Nigerian format (080 or +234)</Text>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Website (Optional)</Text>
                      <View style={styles.inputWrapper}>
                        <Globe size={14} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="example.com or www.example.com"
                          placeholderTextColor="#9ca3af"
                          value={formData.website}
                          onChangeText={(text) => updateFormData('website', text)}
                          autoCapitalize="none"
                        />
                      </View>
                      <Text style={styles.hint}>Enter domain without https://</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.registeredBox, formData.is_registered && styles.registeredBoxActive]}
                      onPress={() => updateFormData('is_registered', !formData.is_registered)}
                      disabled={uploading}
                    >
                      <View style={[styles.checkbox, formData.is_registered && styles.checkboxChecked]}>
                        {formData.is_registered && <CheckCircle size={12} color="#fff" />}
                      </View>
                      <View style={styles.registeredContent}>
                        <Text style={styles.registeredTitle}>Registered Business</Text>
                        <Text style={styles.registeredText}>
                          Check if your business is officially registered with CAC. Verified businesses get increased trust.
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.successContainer}>
                <LinearGradient colors={['#16a34a', '#15803d']} style={styles.successIcon}>
                  <CheckCircle size={32} color="#fff" />
                </LinearGradient>
                <Text style={styles.successTitle}>Business Submitted!</Text>
                <Text style={styles.successDescription}>
                  Your business has been submitted for review. It will be listed after admin approval.
                </Text>
                <TouchableOpacity style={styles.successButton} onPress={onClose}>
                  <Text style={styles.successButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Navigation Buttons */}
            {!success && (
              <View style={styles.navigation}>
                {step > 1 && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={goToPrevStep}
                    disabled={uploading}
                  >
                    <ChevronLeft size={16} color="#16a34a" />
                    <Text style={styles.navButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
                {step < 3 ? (
                  <TouchableOpacity
                    style={[styles.navButton, styles.navButtonPrimary, !isStepValid() && styles.navButtonDisabled]}
                    onPress={goToNextStep}
                    disabled={!isStepValid() || uploading}
                  >
                    <Text style={styles.navButtonPrimaryText}>Continue</Text>
                    <ChevronRight size={16} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      styles.navButtonPrimary,
                      (!isStepValid() || uploading || !isVerified) && styles.navButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!isStepValid() || uploading || !isVerified}
                  >
                    <Text style={styles.navButtonPrimaryText}>
                      {uploading ? 'Submitting...' : isVerified ? 'Submit Business' : 'Verified Only'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#16a34a',
  },
  stepCircleCompleted: {
    backgroundColor: '#16a34a',
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepCircleTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  stepLabelActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16a34a',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    color: '#991b1b',
  },
  successText: {
    color: '#166534',
  },
  formContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stepContainer: {
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: {
    fontSize: 10,
    color: '#6b7280',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  typeButtonTextActive: {
    color: '#fff',
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
  categoryChipActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryChipText: {
    fontSize: 11,
    color: '#4b5563',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  locationScroll: {
    marginTop: 4,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  locationChipActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  locationChipText: {
    fontSize: 11,
    color: '#4b5563',
  },
  locationChipTextActive: {
    color: '#fff',
  },
  uploadBox: {
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerBox: {
    aspectRatio: 16 / 9,
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: '#16a34a',
  },
  uploadPreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: 8,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
  },
  uploadHint: {
    fontSize: 8,
    color: '#9ca3af',
  },
  registeredBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  registeredBoxActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  registeredContent: {
    flex: 1,
  },
  registeredTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  registeredText: {
    fontSize: 11,
    color: '#6b7280',
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  navButtonPrimary: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  navButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
