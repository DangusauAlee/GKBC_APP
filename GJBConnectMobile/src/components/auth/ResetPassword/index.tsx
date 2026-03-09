import React, { useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useResetPasswordForm } from './hooks';
import { updateUserPassword } from './services';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
  Building,
  Smartphone,
} from 'lucide-react-native';

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    formData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    setError,
    isLoading,
    setIsLoading,
    success,
    setSuccess,
    handlePasswordChange,
    handleConfirmPasswordChange,
    validate,
  } = useResetPasswordForm();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigation]);

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateUserPassword(formData.password.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          <View style={styles.successContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../assets/GJBCLOGO.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>GJBC</Text>
            <Text style={styles.tagline}>Driving Economic Growth</Text>

            <View style={styles.successCard}>
              <View style={styles.successIconContainer}>
                <CheckCircle size={48} color="#16a34a" />
              </View>
              <Text style={styles.successTitle}>Password Updated!</Text>
              <Text style={styles.successMessage}>
                Your password has been successfully reset. Redirecting to login...
              </Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => navigation.navigate('Login' as never)}
              >
                <LinearGradient
                  colors={['#16a34a', '#15803d']}
                  style={styles.successButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.successButtonText}>Go to Login Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.footerIcon}>
                  <Shield size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>Secure</Text>
              </View>
              <View style={styles.footerItem}>
                <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.footerIcon}>
                  <Building size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>Verified</Text>
              </View>
              <View style={styles.footerItem}>
                <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.footerIcon}>
                  <Smartphone size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>GJBC</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
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
            </View>

            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Lock size={32} color="#16a34a" />
              </View>
              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>Enter your new password below</Text>

              {error && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#dc2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#16a34a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={18} color="#9ca3af" />
                    ) : (
                      <Eye size={18} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>Password must be at least 6 characters</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#16a34a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9ca3af"
                    value={formData.confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#9ca3af" />
                    ) : (
                      <Eye size={18} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#16a34a', '#15803d']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Reset Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.footerIcon}>
                  <Shield size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>Secure</Text>
              </View>
              <View style={styles.footerItem}>
                <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.footerIcon}>
                  <Building size={12} color="#fff" />
                </LinearGradient>
                <Text style={styles.footerText}>Verified</Text>
              </View>
              <View style={styles.footerItem}>
                <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.footerIcon}>
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
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 24 },
  circle: { position: 'absolute', borderRadius: 999, opacity: 0.1 },
  circle1: { width: 200, height: 200, backgroundColor: '#16a34a', top: -50, right: -50 },
  circle2: { width: 150, height: 150, backgroundColor: '#16a34a', bottom: 100, left: -50 },
  circle3: { width: 100, height: 100, backgroundColor: '#16a34a', top: '30%', right: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
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
  logo: { width: '100%', height: '100%' },
  appName: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 2 },
  tagline: { fontSize: 12, color: '#6b7280', fontWeight: '500', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 20px 35px -10px rgba(22, 163, 74, 0.3)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b', fontWeight: '500' },
  inputGroup: { gap: 6, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    gap: 8,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#111827' },
  hint: { fontSize: 11, color: '#6b7280', marginTop: 2, marginLeft: 4 },
  submitButton: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  submitGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  disabledButton: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
  footerItem: { alignItems: 'center', gap: 4 },
  footerIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 11, color: '#4b5563', fontWeight: '600' },
  // Success screen styles
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginVertical: 24,
    boxShadow: '0 20px 35px -10px rgba(22, 163, 74, 0.3)',
  },
  successIconContainer: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  successMessage: { fontSize: 15, color: '#4b5563', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  successButton: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  successButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  successButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
