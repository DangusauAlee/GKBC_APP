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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

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

      <LinearGradient
        colors={['#f9fafb', '#f0fdf4']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

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
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'email' && styles.inputWrapperFocused
                  ]}>
                    <Mail size={18} color="#16a34a" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="#9ca3af"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
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
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused
                  ]}>
                    <Lock size={18} color="#16a34a" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#9ca3af"
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
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
                  <LinearGradient
                    colors={['#16a34a', '#15803d']}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.submitText}>Signing In...</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.submitText}>Sign In</Text>
                        <ArrowRight size={18} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
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
                <LinearGradient
                  colors={['#16a34a', '#22c55e']}
                  style={styles.footerIcon}
                >
                  <Shield size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>Secure</Text>
              </View>
              <View style={styles.footerItem}>
                <LinearGradient
                  colors={['#16a34a', '#22c55e']}
                  style={styles.footerIcon}
                >
                  <Building size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>Verified</Text>
              </View>
              <View style={styles.footerItem}>
                <LinearGradient
                  colors={['#16a34a', '#22c55e']}
                  style={styles.footerIcon}
                >
                  <Smartphone size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>GJBC</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#16a34a',
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#16a34a',
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#16a34a',
    top: '30%',
    right: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.2)',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 28,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 20px 35px -10px rgba(22, 163, 74, 0.3)',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: '500',
  },
  successText: {
    color: '#166534',
  },
  errorText: {
    color: '#991b1b',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    transition: 'border-color 0.2s',
  },
  inputWrapperFocused: {
    borderColor: '#16a34a',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#111827',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
    alignSelf: 'center',
    backdropFilter: 'blur(10px)',
  },
  footerItem: {
    alignItems: 'center',
    gap: 4,
  },
  footerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
  },
});
