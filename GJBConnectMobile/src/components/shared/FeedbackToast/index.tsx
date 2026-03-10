import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, X } from 'lucide-react-native';

interface FeedbackToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  visible,
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, duration]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, type === 'success' ? styles.successContainer : styles.errorContainer]}>
          {type === 'success' ? (
            <CheckCircle size={20} color="#16a34a" />
          ) : (
            <AlertCircle size={20} color="#dc2626" />
          )}
          <Text style={[styles.message, type === 'success' ? styles.successText : styles.errorText]}>
            {message}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 8,
  },
  successContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  errorContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    color: '#166534',
  },
  errorText: {
    color: '#991b1b',
  },
  closeButton: {
    padding: 4,
  },
});
