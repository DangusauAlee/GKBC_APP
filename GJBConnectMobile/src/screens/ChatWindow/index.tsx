import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GiftedChat, Bubble, Send, InputToolbar, Composer, Actions, IMessage } from 'react-native-gifted-chat';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Paperclip, Store, X, Check, CheckCheck, Mic, StopCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';
import { useMessages } from '../../hooks/useMessages';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useMarkAsRead } from '../../hooks/useMarkAsRead';
import { useConversationSubscription } from '../../hooks/useConversationSubscription';
import { useUserLastSeen } from '../../hooks/useUserLastSeen';
import { messagingService } from '../../services/messaging';
import { formatTimeAgo } from '../../utils/formatters';
import VerifiedBadge from '../../components/shared/VerifiedBadge';

// Convert our Message type to GiftedChat IMessage
const toGiftedMessage = (msg: any, isOwn: boolean): IMessage => ({
  _id: msg.id,
  text: msg.content || '',
  createdAt: new Date(msg.created_at),
  user: {
    _id: msg.sender_id,
    name: msg.sender_name,
    avatar: msg.sender_avatar,
  },
  image: msg.type === 'image' ? msg.media_url : undefined,
  video: msg.type === 'video' ? msg.media_url : undefined,
  audio: msg.type === 'audio' ? msg.media_url : undefined,
  // Custom fields for our design
  sender_status: msg.sender_status,
  is_read: msg.is_read,
  pending: msg.id.startsWith('temp-'),
});

// Custom bubble component with verified badge
const CustomBubble = (props: any) => {
  const { currentMessage, position } = props;
  const isOwn = position === 'right';

  return (
    <View style={[styles.bubbleWrapper, isOwn ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
      {currentMessage.image ? (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: currentMessage.image }} style={styles.mediaImage} resizeMode="cover" />
        </View>
      ) : currentMessage.video ? (
        <View style={styles.mediaContainer}>
          <Text>Video (playback not implemented)</Text>
        </View>
      ) : currentMessage.audio ? (
        <View style={styles.mediaContainer}>
          <Text>Audio message</Text>
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
          currentMessage.image && styles.bubbleNoText,
        ]}
      >
        {currentMessage.text ? (
          <Text style={[styles.bubbleText, isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther]}>
            {currentMessage.text}
          </Text>
        ) : null}
      </View>
      {currentMessage.user && currentMessage.user.name && !isOwn && (
        <View style={styles.senderNameContainer}>
          <Text style={styles.senderName}>{currentMessage.user.name}</Text>
          {currentMessage.sender_status === 'verified' && <VerifiedBadge size={10} />}
        </View>
      )}
      <View style={[styles.messageFooter, isOwn ? styles.messageFooterRight : styles.messageFooterLeft]}>
        <Text style={styles.timeText}>{formatTimeAgo(currentMessage.createdAt.toISOString())}</Text>
        {isOwn && (
          <>
            {currentMessage.pending ? (
              <ActivityIndicator size="small" color="#9ca3af" style={styles.statusIcon} />
            ) : currentMessage.is_read ? (
              <CheckCheck size={14} color="#34d399" style={styles.statusIcon} />
            ) : (
              <Check size={14} color="#9ca3af" style={styles.statusIcon} />
            )}
          </>
        )}
      </View>
    </View>
  );
};

const CustomSend = (props: any) => {
  return (
    <Send {...props} containerStyle={styles.sendContainer} disabled={!props.text}>
      <View style={styles.sendButton}>
        <LinearGradient colors={['#16a34a', '#15803d']} style={styles.sendGradient}>
          <Text style={styles.sendText}>Send</Text>
        </LinearGradient>
      </View>
    </Send>
  );
};

const CustomInputToolbar = (props: any) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputToolbarPrimary}
    />
  );
};

const CustomComposer = (props: any) => {
  return (
    <Composer
      {...props}
      textInputStyle={styles.composer}
      placeholderTextColor="#9ca3af"
    />
  );
};

export const ChatWindowScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { conversationId } = route.params;
  const { user, profile } = useAuthStore();
  const [otherUser, setOtherUser] = useState(route.params?.otherUser || {
    id: '',
    name: 'Unknown',
    avatar: null,
    status: 'member',
  });
  const context = route.params?.context || 'connection';
  const listing = route.params?.listing;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const markAsRead = useMarkAsRead(conversationId);
  useConversationSubscription(conversationId);

  const { data: lastSeen } = useUserLastSeen(otherUser.id);
  const isOnline = lastSeen
    ? (new Date().getTime() - new Date(lastSeen).getTime()) < 2 * 60 * 1000
    : false;

  // Convert server messages to GiftedChat format
  useEffect(() => {
    if (messagesData) {
      const allMessages = messagesData.pages.flat().reverse(); // GiftedChat expects newest last
      const giftedMessages = allMessages.map((msg) => toGiftedMessage(msg, msg.sender_id === user?.id));
      setMessages(giftedMessages);
    }
  }, [messagesData, user]);

  // Mark messages as read on mount
  useEffect(() => {
    if (conversationId && user) {
      markAsRead.mutate();
    }
  }, [conversationId, user]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const [message] = newMessages;
    if (!message.text.trim()) return;

    // Optimistic update already handled by useSendMessage's onMutate,
    // but we need to clear input. GiftedChat will add the message via its own state,
    // but we'll rely on our query invalidation to sync.
    await sendMessage.mutateAsync({
      content: message.text,
      type: 'text',
    });
  }, [sendMessage]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };
      await uploadAndSendFile(file, 'image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
        };
        await uploadAndSendFile(file, 'file'); // We'll treat as text with link for now
      }
    } catch (error) {
      console.error('Document pick error:', error);
    }
  };

  const uploadAndSendFile = async (file: { uri: string; name: string; type: string }, fileType: string) => {
    setUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const mediaUrl = await messagingService.uploadMedia(conversationId, file);
      let messageType: 'image' | 'video' | 'audio' | 'text' = 'text';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      else if (file.type.startsWith('audio/')) messageType = 'audio';

      await sendMessage.mutateAsync({
        content: file.name,
        type: messageType,
        mediaUrl,
      });
    } catch (error) {
      Alert.alert('Upload failed', 'Could not upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingInstance(recording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recordingInstance) return;
    setIsRecording(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await recordingInstance.stopAndUnloadAsync();
      const uri = recordingInstance.getURI();
      if (uri) {
        const file = {
          uri,
          name: `voice_${Date.now()}.m4a`,
          type: 'audio/m4a',
        };
        await uploadAndSendFile(file, 'audio');
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    } finally {
      setRecordingInstance(null);
    }
  };

  const cancelRecording = () => {
    if (recordingInstance) {
      recordingInstance.stopAndUnloadAsync();
      setRecordingInstance(null);
      setIsRecording(false);
    }
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity onPress={pickImage} style={styles.actionButton} disabled={uploading}>
        <Paperclip size={20} color="#6b7280" />
      </TouchableOpacity>
      <TouchableOpacity onPress={pickDocument} style={styles.actionButton} disabled={uploading}>
        <Text style={styles.actionText}>📄</Text>
      </TouchableOpacity>
      {isRecording ? (
        <TouchableOpacity onPress={stopRecording} style={[styles.actionButton, styles.recordingActive]}>
          <StopCircle size={20} color="#ef4444" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={startRecording} style={styles.actionButton} disabled={uploading}>
          <Mic size={20} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#16a34a" />
          </TouchableOpacity>
          <View style={styles.headerUser}>
            <View style={styles.avatarWrapper}>
              {otherUser.avatar ? (
                <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={['#16a34a', '#15803d']} style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{otherUser.name?.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
              )}
              {otherUser.status === 'verified' && (
                <View style={styles.avatarBadge}>
                  <VerifiedBadge size={12} />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>{otherUser.name}</Text>
                {otherUser.status === 'verified' && <VerifiedBadge size={12} />}
              </View>
              <Text style={styles.userStatus}>
                {isOnline ? 'Online' : lastSeen ? `Last seen ${formatTimeAgo(lastSeen)}` : ''}
              </Text>
              {listing && (
                <View style={styles.listingInfo}>
                  <Store size={12} color="#f97316" />
                  <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: user?.id || '' }}
            renderBubble={CustomBubble}
            renderSend={CustomSend}
            renderInputToolbar={CustomInputToolbar}
            renderComposer={CustomComposer}
            renderActions={renderActions}
            renderAvatar={null} // We show avatar in header
            loadEarlier={hasNextPage}
            onLoadEarlier={() => fetchNextPage()}
            isLoadingEarlier={isFetchingNextPage}
            renderLoadEarlier={(props) => (
              <TouchableOpacity {...props} style={styles.loadEarlier}>
                <Text style={styles.loadEarlierText}>Load older messages</Text>
              </TouchableOpacity>
            )}
            infiniteScroll
            alwaysShowSend
            scrollToBottom
            scrollToBottomStyle={styles.scrollToBottom}
            minInputToolbarHeight={60}
          />
        </KeyboardAvoidingView>

        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#16a34a',
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#16a34a',
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#16a34a',
    top: '30%',
    right: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    marginRight: 10,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userStatus: {
    fontSize: 11,
    color: '#6b7280',
  },
  listingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  listingTitle: {
    fontSize: 10,
    color: '#f97316',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  bubbleWrapper: {
    marginBottom: 8,
  },
  bubbleWrapperRight: {
    alignItems: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  bubbleOwn: {
    backgroundColor: '#16a34a',
  },
  bubbleOther: {
    backgroundColor: '#f3f4f6',
  },
  bubbleText: {
    fontSize: 14,
  },
  bubbleTextOwn: {
    color: '#fff',
  },
  bubbleTextOther: {
    color: '#1f2937',
  },
  bubbleNoText: {
    padding: 0,
  },
  mediaContainer: {
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: 200,
    height: 200,
  },
  senderNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    marginLeft: 4,
    gap: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginHorizontal: 4,
    gap: 4,
  },
  messageFooterRight: {
    justifyContent: 'flex-end',
  },
  messageFooterLeft: {
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  statusIcon: {
    marginLeft: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionButton: {
    padding: 8,
    marginRight: 4,
  },
  actionText: {
    fontSize: 16,
  },
  recordingActive: {
    backgroundColor: '#fee2e2',
    borderRadius: 20,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingVertical: 4,
  },
  inputToolbarPrimary: {
    alignItems: 'center',
  },
  composer: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadEarlier: {
    padding: 10,
    alignItems: 'center',
  },
  loadEarlierText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  scrollToBottom: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1f2937',
  },
});
