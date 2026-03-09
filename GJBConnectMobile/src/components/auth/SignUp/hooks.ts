import { useState, useCallback } from 'react';
import { SignUpFormData, UserType } from './types';
import { Alert } from 'react-native';

export const useSignUpForm = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [userType, setUserType] = useState<UserType>('regular');
  const [receiptFile, setReceiptFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback((field: keyof SignUpFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for that field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateNigerianPhone = (phone: string): boolean => {
    if (!phone) return true; // optional
    const phoneRegex = /^\+234[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (formData.phone && !validateNigerianPhone(formData.phone)) errors.phone = 'Phone must be +234xxxxxxxxxx';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    if (userType === 'verified' && !receiptFile) errors.receipt = 'Please upload your payment receipt';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, userType, receiptFile]);

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  return {
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
  };
};
