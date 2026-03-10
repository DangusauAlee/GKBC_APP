import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Calendar, MapPin, CalendarDays, Clock } from 'lucide-react-native';
import { Event } from '../../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => Promise<void>;
  initialData: Event;
  isLoading?: boolean;
}

export const EditEventModal: React.FC<Props> = ({ visible, onClose, onSubmit, initialData, isLoading = false }) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || '');
  const [date, setDate] = useState(new Date(initialData.event_date));
  const [time, setTime] = useState(new Date(initialData.event_date));
  const [location, setLocation] = useState(initialData.location || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDate(new Date(initialData.event_date));
      setTime(new Date(initialData.event_date));
      setLocation(initialData.location || '');
    }
  }, [visible, initialData]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !date || !time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const eventDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      event_date: eventDate.toISOString(),
      location: location.trim(),
      image_url: initialData.image_url,
    });
  }, [title, description, date, time, location, initialData.image_url, onSubmit]);

  const getTomorrowDate = useCallback((): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
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
                  <CalendarDays size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Edit Event</Text>
                  <Text style={styles.headerSubtitle}>Update your event details</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Event Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                />
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

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date *</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                  <Calendar size={16} color="#16a34a" />
                  <Text style={styles.pickerText}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={getTomorrowDate()}
                  />
                )}
              </View>

              {/* Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Time *</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
                  <Clock size={16} color="#16a34a" />
                  <Text style={styles.pickerText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
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
                  <Text style={styles.submitText}>Update Event</Text>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  pickerText: {
    fontSize: 14,
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
