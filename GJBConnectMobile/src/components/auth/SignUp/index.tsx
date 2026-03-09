import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { StatusModal } from '../../shared/StatusModal';
import { useSignUpForm } from './hooks';
import { checkUserExists, createNewUser, storePendingVerification } from './services';
import { supabase } from '../../../lib/supabase';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  User,
  AlertCircle,
  Loader2,
  Shield,
  Building,
  Smartphone,
  X,
  Upload,
} from 'lucide-react-native';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    formData,
    userType,
    setUserType,
    receiptFile,
    setReceiptFile,
    showPassword,
    setShowPassword,
    validationErrors,
    handleInputChange,
    validateForm,
    passwordStrength,
  } = useSignUpForm();

  const [isLoading, setIsLoading] = useState(false);
  const [isStoringReceipt, setIsStoringReceipt] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState<'already_registered' | 'new_user_success'>('new_user_success');
  const [redirectSeconds, setRedirectSeconds] = useState(10);
  const [modalEmail, setModalEmail] = useState('');

  // For countdown
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to upload receipt.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setReceiptFile({
        uri: asset.uri,
        name: asset.fileName || 'receipt.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const email = formData.email.trim();
      const userExists = await checkUserExists(email);

      if (userExists) {
        setModalEmail(email);
        setModalType('already_registered');
        setRedirectSeconds(3);
        setShowStatusModal(true);

        let seconds = 3;
        countdownInterval.current = setInterval(() => {
          seconds -= 1;
          setRedirectSeconds(seconds);
          if (seconds <= 0) {
            clearInterval(countdownInterval.current!);
            setShowStatusModal(false);
            navigation.navigate('Login' as never, { prefilledEmail: email } as never);
          }
        }, 1000);
      } else {
        const data = await createNewUser(
          email,
          formData.password,
          formData.firstName,
          formData.lastName,
          formData.phone
        );

        if (userType === 'verified' && data.user && receiptFile) {
          setIsStoringReceipt(true);
          try {
            await storePendingVerification(data.user.id, receiptFile.uri, receiptFile.name, receiptFile.type);
          } catch (storageError: any) {
            setServerError(storageError.message || 'Failed to store receipt. Your account was created, but please contact support.');
          } finally {
            setIsStoringReceipt(false);
          }
        }

        setModalEmail(email);
        setModalType('new_user_success');
        setRedirectSeconds(10);
        setShowStatusModal(true);

        let seconds = 10;
        countdownInterval.current = setInterval(() => {
          seconds -= 1;
          setRedirectSeconds(seconds);
          if (seconds <= 0) {
            clearInterval(countdownInterval.current!);
            setShowStatusModal(false);
            navigation.navigate('Login' as never, {
              message: userType === 'verified'
                ? 'Your account was created. After email verification, please log in to complete your verification request.'
                : 'Please check your email to verify your account',
              email,
              messageType: 'success',
            } as never);
          }
        }, 1000);
      }
    } catch (error: any) {
      let userMessage = error.message || 'Registration failed. Please try again.';
      if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
        userMessage = 'This email is already registered. Please try logging in.';
      } else if (error.message?.includes('rate limit')) {
        userMessage = 'Too many attempts. Please wait a few minutes before trying again.';
      } else if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      setServerError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return '#dc2626';
    if (passwordStrength < 80) return '#eab308';
    return '#16a34a';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        email={modalEmail}
        type={modalType}
        redirectSeconds={redirectSeconds}
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
          {/* Header with logo */}
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
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join Greater Jigawa and grow your business</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {serverError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* First Name & Last Name */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>First Name *</Text>
                  <View style={styles.inputWrapper}>
                    <User size={16} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, validationErrors.firstName && styles.inputError]}
                      placeholder="Ahmad"
                      placeholderTextColor="#9ca3af"
                      value={formData.firstName}
                      onChangeText={(text) => handleInputChange('firstName', text)}
                    />
                  </View>
                  {validationErrors.firstName && (
                    <Text style={styles.errorMessage}>
                      <X size={10} color="#dc2626" /> {validationErrors.firstName}
                    </Text>
                  )}
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={[styles.input, validationErrors.lastName && styles.inputError]}
                    placeholder="Abubakar"
                    placeholderTextColor="#9ca3af"
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                  />
                  {validationErrors.lastName && (
                    <Text style={styles.errorMessage}>
                      <X size={10} color="#dc2626" /> {validationErrors.lastName}
                    </Text>
                  )}
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, validationErrors.email && styles.inputError]}
                    placeholder="ahmad@company.com"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {validationErrors.email && (
                  <Text style={styles.errorMessage}>
                    <X size={10} color="#dc2626" /> {validationErrors.email}
                  </Text>
                )}
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, validationErrors.phone && styles.inputError]}
                    placeholder="+2348000000000"
                    placeholderTextColor="#9ca3af"
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    keyboardType="phone-pad"
                  />
                </View>
                {validationErrors.phone && (
                  <Text style={styles.errorMessage}>
                    <X size={10} color="#dc2626" /> {validationErrors.phone}
                  </Text>
                )}
                <Text style={styles.hint}>Format: +234 followed by 10 digits</Text>
              </View>

              {/* Account Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Type *</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Why become a Verified Member?</Text>
                  <Text style={styles.infoText}>• Enhanced Trust & Credibility</Text>
                  <Text style={styles.infoText}>• Full Platform Access</Text>
                  <Text style={styles.infoText}>• Direct Customer Communication</Text>
                  <Text style={styles.infoText}>• Showcase Your Products</Text>
                  <Text style={styles.infoText}>• Priority Support</Text>
                  <Text style={styles.infoNote}>
                    After payment, upload your receipt and complete signup.
                  </Text>
                </View>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setUserType('regular')}
                  >
                    <View style={[styles.radioCircle, userType === 'regular' && styles.radioSelected]} />
                    <Text style={styles.radioLabel}>Regular User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setUserType('verified')}
                  >
                    <View style={[styles.radioCircle, userType === 'verified' && styles.radioSelected]} />
                    <Text style={styles.radioLabel}>Verified User</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Verified User Fields */}
              {userType === 'verified' && (
                <View style={styles.verifiedSection}>
                  <Text style={styles.sectionTitle}>Verified Member Application</Text>
                  <View style={styles.feeBox}>
                    <Text style={styles.feeText}>Annual Fee: ₦10,000</Text>
                  </View>
                  <View style={styles.bankDetails}>
                    <Text style={styles.bankText}>Bank Name: Kayi Microfinance Bank</Text>
                    <Text style={styles.bankText}>Account Name: Greater Jigawa Business Community</Text>
                    <Text style={styles.bankText}>Account Number: 4102542176</Text>
                    <Text style={styles.bankText}>
                      WhatsApp:{' '}
                      <Text style={styles.link} onPress={() => {/* open whatsapp */}}>
                        +234 802 310 4333
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Upload Payment Receipt *</Text>
                    <TouchableOpacity style={styles.filePicker} onPress={pickReceipt}>
                      <Upload size={16} color="#16a34a" />
                      <Text style={styles.filePickerText}>
                        {receiptFile ? receiptFile.name : 'Choose file'}
                      </Text>
                    </TouchableOpacity>
                    {validationErrors.receipt && (
                      <Text style={styles.errorMessage}>
                        <X size={10} color="#dc2626" /> {validationErrors.receipt}
                      </Text>
                    )}
                    <Text style={styles.hint}>Upload a screenshot or PDF of your payment receipt.</Text>
                  </View>
                </View>
              )}

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
                    style={[styles.input, validationErrors.password && styles.inputError]}
                    placeholder="Create a strong password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    secureTextEntry={!showPassword}
                  />
                </View>
                {formData.password ? (
                  <View style={styles.strengthContainer}>
                    <Text style={styles.strengthLabel}>
                      Password strength: <Text style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthLabel()}</Text>
                    </Text>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          { width: `${passwordStrength}%`, backgroundColor: getPasswordStrengthColor() },
                        ]}
                      />
                    </View>
                  </View>
                ) : null}
                {validationErrors.password && (
                  <Text style={styles.errorMessage}>
                    <X size={10} color="#dc2626" /> {validationErrors.password}
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={[styles.input, validationErrors.confirmPassword && styles.inputError]}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9ca3af"
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  secureTextEntry={!showPassword}
                />
                {validationErrors.confirmPassword && (
                  <Text style={styles.errorMessage}>
                    <X size={10} color="#dc2626" /> {validationErrors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Terms Agreement */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
                >
                  <View style={[styles.checkboxBox, formData.agreeToTerms && styles.checkboxChecked]}>
                    {formData.agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.link} onPress={() => navigation.navigate('Terms' as never)}>
                    Terms & Conditions
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.link} onPress={() => navigation.navigate('Privacy' as never)}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
              {validationErrors.agreeToTerms && (
                <Text style={styles.errorMessage}>
                  <X size={10} color="#dc2626" /> {validationErrors.agreeToTerms}
                </Text>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (isLoading || isStoringReceipt) && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading || isStoringReceipt}
              >
                {isLoading || isStoringReceipt ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.submitText}>
                      {isStoringReceipt ? 'Saving...' : 'Processing...'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitText}>Create Account</Text>
                    <ArrowRight size={16} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>Already have an account?</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login' as never)}
              >
                <Text style={styles.secondaryButtonText}>Sign In Instead</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Footer */}
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
  inputError: {
    borderColor: '#f87171',
  },
  errorMessage: {
    fontSize: 10,
    color: '#dc2626',
    marginTop: 2,
    marginLeft: 4,
  },
  hint: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    marginLeft: 4,
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 2,
  },
  infoNote: {
    fontSize: 12,
    color: '#166534',
    marginTop: 6,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  radioSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#16a34a',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  verifiedSection: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  feeBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  feeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  bankDetails: {
    gap: 4,
  },
  bankText: {
    fontSize: 12,
    color: '#374151',
  },
  link: {
    color: '#16a34a',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  filePickerText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  strengthContainer: {
    marginTop: 4,
    gap: 4,
  },
  strengthLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    padding: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
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
