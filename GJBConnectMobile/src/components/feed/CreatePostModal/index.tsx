import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../lib/supabase';
import { feedService } from '../../../services/supabase/feed';
import { useAuthStore } from '../../../store/authStore';
import { X, ImageIcon, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: (postId: string) => void; // Now returns the new post ID
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onPostCreated,
}) => {
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<{ uri: string; type: string; name: string }[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to upload.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type || 'image',
        name: asset.fileName || `file_${Date.now()}.${asset.uri.split('.').pop()}`,
      }));
      setFiles(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      Alert.alert('Error', 'Please add content or media');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Please login to post');
      return;
    }

    setIsPosting(true);
    try {
      // Upload files
      const mediaUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `posts/${user.id}/${fileName}`;

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type.startsWith('video') ? 'video/mp4' : 'image/jpeg',
        } as any);

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

        if (uploadError) throw new Error(`Upload failed: ${file.name}`);

        const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(filePath);
        mediaUrls.push(urlData.publicUrl);
      }

      const mediaType = files.length === 0
        ? 'text'
        : files.length === 1
        ? (files[0].type.startsWith('video') ? 'video' : 'image')
        : 'gallery';

      const tags = content.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];

      const newPostId = await feedService.createPost(
        user.id,
        content.trim(),
        mediaUrls,
        mediaType as any,
        tags
      );

      setContent('');
      setFiles([]);
      onPostCreated(newPostId); // Pass the new post ID up
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#4b5563" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Post</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          <ScrollView style={styles.content}>
            {files.length > 0 && (
              <View style={styles.previewContainer}>
                {files.map((file, idx) => (
                  <View key={idx} style={styles.previewItem}>
                    <Image source={{ uri: file.uri }} style={styles.previewMedia} />
                    <TouchableOpacity
                      onPress={() => removeFile(idx)}
                      style={styles.removeButton}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={content}
              onChangeText={setContent}
              maxLength={2000}
            />
            <Text style={styles.charCount}>{content.length}/2000</Text>

            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
                <ImageIcon size={20} color="#16a34a" />
                <Text style={styles.mediaButtonText}>Photo/Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={() => {}}>
                <MapPin size={20} color="#16a34a" />
                <Text style={styles.mediaButtonText}>Location</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.postButton, (!content.trim() && files.length === 0) && styles.postDisabled]}
              onPress={handleSubmit}
              disabled={isPosting || (!content.trim() && files.length === 0)}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  previewItem: {
    width: (width - 64) / 4,
    height: (width - 64) / 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  mediaButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  postButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  postDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
