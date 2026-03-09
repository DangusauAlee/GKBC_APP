import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LoginStatusModal } from '../../shared/LoginStatusModal';
import { useLoginForm } from './hooks';
import {
  signInWithPassword,
  getUserProfile,
  checkProfileExists,
  processPendingVerification,
  resendVerificationEmail,
} from './services';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Building,
  Smartphone,
} from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;
  const prefilledEmail = params?.prefilledEmail || '';

  const {
    formData,
    showPassword,
    setShowPassword,
    message,
    setMessage,
    handleInputChange,
  } = useLoginForm(prefilledEmail);

  const [isLoading, setIsLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'unverified' | 'banned' | 'no_account' | 'credentials_incorrect'>('credentials_incorrect');

  useEffect(() => {
    if (params?.message) {
      setMessage({ text: params.message, type: params.messageType || 'success' });
    }
  }, [params]);

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage({ text: 'Please enter both email and password', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const email = formData.email.trim();
      const password = formData.password;

      const data = await signInWithPassword(email, password);

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      if (!data.user.email_confirmed_at) {
        setLoginStatus('unverified');
        setShowStatusModal(true);
        setIsLoading(false);
        return;
      }

      const profile = await getUserProfile(data.user.id);
      if (profile?.user_status === 'banned') {
        setLoginStatus('banned');
        setShowStatusModal(true);
        setIsLoading(false);
        return;
      }

      // Process pending verification if any
      const result = await processPendingVerification(data.user.id);
      if (result?.success) {
        setMessage({ text: result.message, type: 'success' });
      } else if (result && !result.success) {
        setMessage({ text: result.message, type: 'error' });
      }

      // Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        const exists = await checkProfileExists(formData.email);
        if (!exists) {
          setLoginStatus('no_account');
        } else {
          setLoginStatus('credentials_incorrect');
        }
        setShowStatusModal(true);
      } else if (error.message.includes('Email not confirmed')) {
        setLoginStatus('unverified');
        setShowStatusModal(true);
      } else {
        setMessage({ text: error.message || 'Login failed', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowStatusModal(false);
    if (loginStatus === 'credentials_incorrect') {
      handleInputChange('password', '');
    }
    if (loginStatus === 'no_account') {
      handleInputChange('email', '');
    }
  };

  const handleSignupFromModal = () => {
    setShowStatusModal(false);
    navigation.navigate('SignUp' as never, { prefilledEmail: formData.email } as never);
  };

  const handleTryAgain = () => {
    setShowStatusModal(false);
    handleInputChange('password', '');
  };

  const handleForgotPassword = () => {
    setShowStatusModal(false);
    navigation.navigate('ForgotPassword' as never);
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(formData.email);
      setMessage({ text: 'Verification email sent!', type: 'success' });
      setShowStatusModal(false);
    } catch (err: any) {
      setMessage({ text: 'Failed to resend verification', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoginStatusModal
        visible={showStatusModal}
        onClose={handleModalClose}
        email={formData.email}
        status={loginStatus}
        onSignupClick={handleSignupFromModal}
        onTryAgain={loginStatus === 'unverified' ? handleResendVerification : handleTryAgain}
        onForgotPassword={handleForgotPassword}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../assets/GJBCLOGO.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>GJBC</Text>
            <Text style={styles.tagline}>Driving Economic Growth</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your business network</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {message && (
              <View style={[styles.messageContainer, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
                {message.type === 'success' ? (
                  <CheckCircle size={16} color="#16a34a" />
                ) : (
                  <AlertCircle size={16} color="#dc2626" />
                )}
                <Text style={[styles.messageText, message.type === 'success' ? styles.successText : styles.errorText]}>
                  {message.text}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password *</Text>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <Lock size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.submitText}>Signing In...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitText}>Sign In</Text>
                    <ArrowRight size={16} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.linksContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
                  <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
                  <Text style={styles.linkText}>Forgot your password?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <View style={styles.footerIcon}>
                <Shield size={12} color="#fff" />
              </View>
              <Text style={styles.footerText}>Secure</Text>
            </View>
            <View style={styles.footerItem}>
              <View style={styles.footerIcon}>
                <Building size={12} color="#fff" />
              </View>
              <Text style={styles.footerText}>Verified</Text>
            </View>
            <View style={styles.footerItem}>
              <View style={styles.footerIcon}>
                <Smartphone size={12} color="#fff" />
              </View>
              <Text style={styles.footerText}>GJBC</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  successText: {
    color: '#166534',
  },
  errorText: {
    color: '#991b1b',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 4,
  },
  toggleText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#111827',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  linkText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginTop: 8,
  },
  footerItem: {
    alignItems: 'center',
    gap: 2,
  },
  footerIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '500',
  },
});
