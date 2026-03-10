import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, DollarSign, MapPin, Briefcase, Mail, Phone, FileText } from 'lucide-react-native';
import { Job } from '../../../types';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => Promise<void>;
  initialData: Job;
  isLoading?: boolean;
}

export const EditJobModal: React.FC<Props> = ({ visible, onClose, onSubmit, initialData, isLoading = false }) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || '');
  const [salary, setSalary] = useState(initialData.salary || '');
  const [jobType, setJobType] = useState(initialData.job_type);
  const [location, setLocation] = useState(initialData.location || '');
  const [contactEmail, setContactEmail] = useState(initialData.contact_info?.email || '');
  const [contactPhone, setContactPhone] = useState(initialData.contact_info?.phone || '');

  useEffect(() => {
    if (visible) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setSalary(initialData.salary || '');
      setJobType(initialData.job_type);
      setLocation(initialData.location || '');
      setContactEmail(initialData.contact_info?.email || '');
      setContactPhone(initialData.contact_info?.phone || '');
    }
  }, [visible, initialData]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Job title is required');
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      salary: salary.trim(),
      job_type: jobType,
      location: location.trim(),
      contact_info: {
        email: contactEmail.trim(),
        phone: contactPhone.trim()
      }
    });
  }, [title, description, salary, jobType, location, contactEmail, contactPhone, onSubmit]);

  const formatJobType = useCallback((type: string): string => {
    return type.replace('-', ' ').toUpperCase();
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Briefcase size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Edit Job</Text>
                  <Text style={styles.headerSubtitle}>Update the job details</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title *</Text>
                <View style={styles.inputWrapper}>
                  <FileText size={14} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
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

              {/* Salary & Job Type */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Salary</Text>
                  <View style={styles.inputWrapper}>
                    <DollarSign size={14} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={salary}
                      onChangeText={setSalary}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Job Type *</Text>
                  <View style={styles.pickerWrapper}>
                    <Briefcase size={14} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={jobType}
                      editable={false}
                    />
                  </View>
                  <View style={styles.jobTypeOptions}>
                    {JOB_TYPES.map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.jobTypeChip, jobType === type && styles.jobTypeChipSelected]}
                        onPress={() => setJobType(type)}
                      >
                        <Text style={[styles.jobTypeChipText, jobType === type && styles.jobTypeChipTextSelected]}>
                          {formatJobType(type)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={14} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              {/* Contact Info */}
              <View style={styles.contactSection}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactIcon}>
                    <Mail size={12} color="#16a34a" />
                  </View>
                  <Text style={styles.contactHeaderText}>Contact Information</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={14} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={contactEmail}
                      onChangeText={setContactEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={14} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={contactPhone}
                      onChangeText={setContactPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.submitButton, (isLoading || !title.trim()) && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading || !title.trim()}
              >
                {isLoading ? (
                  <Text style={styles.submitText}>Updating...</Text>
                ) : (
                  <Text style={styles.submitText}>Update Job</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  jobTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  jobTypeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  jobTypeChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  jobTypeChipText: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '500',
  },
  jobTypeChipTextSelected: {
    color: '#fff',
  },
  contactSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  contactIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
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
