import { supabase } from '../../../lib/supabase';
import * as FileSystem from 'expo-file-system';

export const checkUserExists = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('checkUserExists error:', error);
    return false; // assume not exists on error
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

  // Insert into profiles table (trigger should handle this, but ensure)
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      user_status: 'active',
    });
    if (profileError) console.error('Profile upsert error:', profileError);
  }

  return data;
};

export const storePendingVerification = async (userId: string, fileUri: string, fileName: string, fileType: string): Promise<void> => {
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

// We'll need AsyncStorage – will import later
import AsyncStorage from '@react-native-async-storage/async-storage';
