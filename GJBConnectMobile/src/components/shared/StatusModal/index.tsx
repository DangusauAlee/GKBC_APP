import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, AlertCircle, CheckCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = {
    already_registered: {
      title: 'Account Already Exists',
      icon: <AlertCircle size={48} color="#d97706" />,
      gradientColors: ['#fef3c7', '#fde68a'] as const,
      message: `An account with ${email} already exists. You will be redirected to login in ${redirectSeconds} second${redirectSeconds !== 1 ? 's' : ''}.`,
    },
    new_user_success: {
      title: 'Account Created Successfully!',
      icon: <CheckCircle size={48} color="#16a34a" />,
      gradientColors: ['#dcfce7', '#bbf7d0'] as const,
      message: `A verification link has been sent to ${email}. Please check your email to verify your account. Redirecting to login in ${redirectSeconds} second${redirectSeconds !== 1 ? 's' : ''}...`,
    },
  };

  const { title, icon, gradientColors, message } = config[type];

  // Handle Android back button
  useEffect(() => {
    if (!visible) return;
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Fixed overlay that doesn't shift */}
      <View style={styles.overlay}>
        {/* Modal container with fixed dimensions */}
        <View style={styles.modalWrapper}>
          <LinearGradient
            colors={gradientColors}
            style={styles.modalContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Close button */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#4b5563" />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>{icon}</View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Countdown indicator */}
            <View style={styles.countdownContainer}>
              <View style={styles.countdownBarBackground}>
                <View
                  style={[
                    styles.countdownBarFill,
                    { width: `${(redirectSeconds / (type === 'already_registered' ? 3 : 10)) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.countdownText}>{redirectSeconds}s</Text>
            </View>

            {/* OK Button */}
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  modalWrapper: {
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContainer: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'white', // Fallback
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  countdownContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  countdownBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  countdownBarFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: 3,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  button: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
