import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { X, AlertCircle, UserX, CheckCircle } from 'lucide-react-native';

type LoginStatus = 'unverified' | 'banned' | 'no_account' | 'credentials_incorrect';

interface LoginStatusModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  status: LoginStatus;
  onSignupClick: () => void;
  onTryAgain?: () => void;
  onForgotPassword?: () => void;
}

export const LoginStatusModal: React.FC<LoginStatusModalProps> = ({
  visible,
  onClose,
  email,
  status,
  onSignupClick,
  onTryAgain,
  onForgotPassword,
}) => {
  const getConfig = () => {
    switch (status) {
      case 'unverified':
        return {
          title: 'Email Not Verified',
          icon: <AlertCircle size={32} color="#d97706" />,
          message: (
            <>
              <Text style={styles.messageText}>
                Your email <Text style={styles.highlight}>{email}</Text> has not been verified yet.
              </Text>
              <Text style={styles.messageText}>
                Please check your inbox for the verification link. If you didn't receive it, check your spam folder.
              </Text>
            </>
          ),
          primaryButton: 'Resend Verification',
          secondaryButton: 'Close',
          primaryAction: onTryAgain,
          secondaryAction: onClose,
        };
      case 'banned':
        return {
          title: 'Account Restricted',
          icon: <UserX size={32} color="#dc2626" />,
          message: (
            <>
              <Text style={styles.messageText}>Your account has been restricted.</Text>
              <Text style={styles.messageText}>Please contact support@GJBC.com for assistance.</Text>
            </>
          ),
          primaryButton: 'Contact Support',
          secondaryButton: 'Close',
          primaryAction: () => Linking.openURL('mailto:support@GJBC.com'),
          secondaryAction: onClose,
        };
      case 'no_account':
        return {
          title: 'No Account Found',
          icon: <UserX size={32} color="#16a34a" />,
          message: (
            <>
              <Text style={styles.messageText}>
                No account found with email <Text style={styles.highlight}>{email}</Text>.
              </Text>
              <Text style={styles.messageText}>
                Please sign up to create a new account.
              </Text>
            </>
          ),
          primaryButton: 'Sign Up',
          secondaryButton: 'Try Different Email',
          primaryAction: onSignupClick,
          secondaryAction: onClose,
        };
      case 'credentials_incorrect':
        return {
          title: 'Incorrect Credentials',
          icon: <AlertCircle size={32} color="#dc2626" />,
          message: (
            <Text style={styles.messageText}>
              The email or password you entered is incorrect. Please try again.
            </Text>
          ),
          primaryButton: 'Try Again',
          secondaryButton: 'Forgot Password?',
          primaryAction: onTryAgain,
          secondaryAction: onForgotPassword,
        };
    }
  };

  const config = getConfig();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>{config.icon}</View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{config.title}</Text>
          <View style={styles.messageContainer}>{config.message}</View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={config.primaryAction}
            >
              <Text style={styles.primaryButtonText}>{config.primaryButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={config.secondaryAction}
            >
              <Text style={styles.secondaryButtonText}>{config.secondaryButton}</Text>
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
  messageContainer: {
    marginBottom: 20,
  },
  messageText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: '600',
    color: '#16a34a',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#16a34a',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 16,
  },
});
