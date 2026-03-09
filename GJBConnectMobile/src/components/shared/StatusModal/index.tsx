import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { X, AlertCircle, UserX, CheckCircle } from 'lucide-react-native';

type StatusModalType = 'already_registered' | 'new_user_success';

interface StatusModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  type: StatusModalType;
  redirectSeconds: number;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  onClose,
  email,
  type,
  redirectSeconds,
}) => {
  const config = {
    already_registered: {
      title: 'Account Already Exists',
      icon: <AlertCircle size={32} color="#d97706" />,
      message: `An account with ${email} already exists. You will be redirected to login in ${redirectSeconds} seconds.`,
      buttonText: 'OK',
    },
    new_user_success: {
      title: 'Account Created Successfully!',
      icon: <CheckCircle size={32} color="#16a34a" />,
      message: `A verification link has been sent to ${email}. Please check your email to verify your account. Redirecting to login in ${redirectSeconds} seconds...`,
      buttonText: 'Continue',
    },
  };

  const { title, icon, message, buttonText } = config[type];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>{icon}</View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
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
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    alignSelf: 'flex-start',
  },
  closeButton: {
    padding: 4,
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
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
