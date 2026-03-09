import { useState, useCallback } from 'react';
import { LoginFormData } from './types';

export const useLoginForm = (initialEmail: string = '') => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: initialEmail,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleInputChange = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  }, []);

  return {
    formData,
    showPassword,
    setShowPassword,
    message,
    setMessage,
    handleInputChange,
  };
};
