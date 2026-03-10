import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, isDanger && styles.dangerButton]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isDanger ? ['#ef4444', '#dc2626'] : ['#16a34a', '#15803d']}
                style={styles.confirmGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmText}>{confirmText}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  dangerButton: {},
});
