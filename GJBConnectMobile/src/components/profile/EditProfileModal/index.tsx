import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, AlertCircle, CheckCircle } from 'lucide-react-native';
import { Profile } from '../../../types';

const MARKET_AREAS = [
  'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa',
  'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun',
  'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari',
  'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'
];

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: Profile;
  onSave: (data: any) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    address: '',
    business_name: '',
    business_type: '',
    market_area: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        bio: initialData.bio || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        business_name: initialData.business_name || '',
        business_type: initialData.business_type || '',
        market_area: initialData.market_area || '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.business_type) newErrors.business_type = 'Business type is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to save changes' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
              {success && (
                <View style={styles.successMessage}>
                  <CheckCircle size={20} color="#16a34a" />
                  <Text style={styles.successText}>Changes saved successfully!</Text>
                </View>
              )}

              {errors.general && (
                <View style={styles.errorMessage}>
                  <AlertCircle size={20} color="#dc2626" />
                  <Text style={styles.errorText}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.input, errors.first_name && styles.inputError]}
                  value={formData.first_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
                  placeholder="First name"
                />
                {errors.first_name && <Text style={styles.fieldError}>{errors.first_name}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.last_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
                  placeholder="Last name"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                  placeholder="Tell us about yourself..."
                  multiline
                  maxLength={500}
                />
                <Text style={styles.charCount}>{formData.bio.length}/500</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="+234 800 000 0000"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="City, State"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Business Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.business_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, business_name: text }))}
                  placeholder="Your business name"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Business Type *</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.business_type === 'products' && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, business_type: 'products' }))}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      formData.business_type === 'products' && styles.typeButtonTextActive,
                    ]}>Products</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.business_type === 'services' && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, business_type: 'services' }))}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      formData.business_type === 'services' && styles.typeButtonTextActive,
                    ]}>Services</Text>
                  </TouchableOpacity>
                </View>
                {errors.business_type && <Text style={styles.fieldError}>{errors.business_type}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Market Area</Text>
                <TextInput
                  style={styles.input}
                  value={formData.market_area}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, market_area: text }))}
                  placeholder="Select market area"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketAreaScroll}>
                  {MARKET_AREAS.map(area => (
                    <TouchableOpacity
                      key={area}
                      style={[styles.marketChip, formData.market_area === area && styles.marketChipSelected]}
                      onPress={() => setFormData(prev => ({ ...prev, market_area: area }))}
                    >
                      <Text style={[styles.marketChipText, formData.market_area === area && styles.marketChipTextSelected]}>
                        {area}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 24,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    fontWeight: '500',
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  fieldError: {
    fontSize: 10,
    color: '#dc2626',
    marginLeft: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
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
  marketAreaScroll: {
    marginTop: 4,
  },
  marketChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  marketChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  marketChipText: {
    fontSize: 11,
    color: '#4b5563',
  },
  marketChipTextSelected: {
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
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
