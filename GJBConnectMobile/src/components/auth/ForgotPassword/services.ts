import { supabase } from '../../../lib/supabase';

export const resetPasswordForEmail = async (email: string) => {
  // In Expo, the redirect URL should be deep link or web. For web, we can use window.location.origin
  // But for mobile, we need to handle deep links. For now, we'll use the same redirectTo.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'yourapp://reset-password', // You can change this later
  });
  if (error) throw error;
};
