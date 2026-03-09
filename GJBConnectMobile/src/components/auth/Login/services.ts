import { supabase } from '../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export const checkProfileExists = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error('checkProfileExists error:', error);
    return false;
  }
  return !!data;
};

export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_status')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const processPendingVerification = async (userId: string) => {
  try {
    const pendingJson = await AsyncStorage.getItem('pendingVerification');
    if (!pendingJson) return null;

    const pending = JSON.parse(pendingJson);
    if (pending.userId !== userId) {
      await AsyncStorage.removeItem('pendingVerification');
      return null;
    }

    // Extract base64 data
    const base64Data = pending.receiptData.split(',')[1];
    const fileUri = FileSystem.documentDirectory + pending.fileName;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload to Supabase
    const fileExt = pending.fileName.split('.').pop() || 'jpg';
    const newFileName = `receipt-${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${newFileName}`;

    console.log('Uploading to storage:', filePath);
    const { error: uploadError } = await supabase.storage
      .from('verification-receipts')
      .upload(filePath, fileUri);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('verification-receipts')
      .getPublicUrl(filePath);
    const receiptUrl = urlData.publicUrl;

    console.log('Inserting verification request with receipt URL:', receiptUrl);
    const { error: insertError } = await supabase
      .from('verified_user_requests')
      .insert({
        user_id: userId,
        receipt_url: receiptUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('DB insert error:', insertError);
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    await AsyncStorage.removeItem('pendingVerification');
    return { success: true, message: 'Verification request submitted' };
  } catch (error) {
    console.error('Pending verification processing failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process verification',
    };
  }
};

export const resendVerificationEmail = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw error;
};
