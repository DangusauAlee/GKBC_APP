import { supabase } from '../../../lib/supabase';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkUserExists = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('checkUserExists error:', error);
    return false;
  }
  return !!data;
};

export const createNewUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
    },
  });

  if (error) throw error;
  return data; // profile will be created by database trigger
};

export const storePendingVerification = async (
  userId: string,
  fileUri: string,
  fileName: string,
  fileType: string
): Promise<void> => {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const pendingData = {
      userId,
      receiptData: `data:${fileType};base64,${base64}`,
      fileName,
      fileType,
    };

    await AsyncStorage.setItem('pendingVerification', JSON.stringify(pendingData));
  } catch (error) {
    throw new Error('Failed to store receipt locally.');
  }
};
