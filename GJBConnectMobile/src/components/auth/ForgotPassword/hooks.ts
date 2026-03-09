import { useState, useCallback } from 'react';
import { ForgotPasswordFormData } from './types';

export const useForgotPasswordForm = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEmailChange = useCallback((text: string) => {
    setFormData({ email: text });
    setError(null);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    formData,
    error,
    setError,
    isLoading,
    setIsLoading,
    showSuccess,
    setShowSuccess,
    handleEmailChange,
    validateEmail,
  };
};
