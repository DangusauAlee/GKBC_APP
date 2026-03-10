import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const storageService = {
  async uploadMarketplaceImages(
    images: { uri: string; name: string; type: string }[],
    userId: string
  ): Promise<string[]> {
    const uploadPromises = images.map(async (image) => {
      const base64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64);
      const fileExt = image.name.split('.').pop() || 'jpg';
      const fileName = `${userId}/${Date.now()}_${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('marketplace-images')
        .upload(fileName, arrayBuffer, {
          contentType: image.type,
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(data.path);
      return urlData.publicUrl;
    });
    return Promise.all(uploadPromises);
  },
};
