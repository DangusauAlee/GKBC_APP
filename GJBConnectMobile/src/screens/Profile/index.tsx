import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, MoreVertical, Edit3, Share2, LogOut, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useProfile, useProfilePosts, profileKeys } from '../../hooks/useProfile';
import { useConnectionsData } from '../../hooks/useConnectionsData';
import { useConnectionMutations } from '../../hooks/useConnectionMutations';
import { connectionKeys } from '../../hooks/queryKeys';
import { connectionsService } from '../../services/connections';
import { profileService } from '../../services/profile';
import { AppHeader } from '../../components/AppHeader';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileStats } from '../../components/profile/ProfileStats';
import { ProfileTabs } from '../../components/profile/ProfileTabs';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialog';
import { FeedbackToast } from '../../components/shared/FeedbackToast';
import { ProfileSkeleton } from '../../components/profile/ProfileSkeleton';

export const ProfileScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { userId } = route.params || {};
  const { user, profile: currentUserProfile } = useAuthStore();
  const viewerId = user?.id || '';

  const [activeTab, setActiveTab] = useState<'posts' | 'connections'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'connect' | 'withdraw' | 'accept' | 'reject' | 'disconnect' | 'deletePost' | 'deleteAvatar' | 'deleteHeader';
    targetId?: string;
    userName?: string;
  } | null>(null);

  const profileUserId = userId || viewerId;
  const { data: profileData, isLoading } = useProfile(profileUserId, viewerId);
  const { data: posts = [] } = useProfilePosts(profileUserId, viewerId);
  const { receivedRequests, sentRequests, friends } = useConnectionsData('', '', '');
  const mutations = useConnectionMutations('', '', '');

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Profile not loaded');
      await connectionsService.removeConnection(profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileUserId, viewerId) });
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      showNotification('Disconnected', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Failed to disconnect', 'error');
    },
  });

  if (isLoading || !profileData?.profile) {
    return <ProfileSkeleton />;
  }

  const { profile, stats, relationship } = profileData;
  const isOwner = !!relationship?.is_owner;
  const isConnected = !!relationship?.is_connected;

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Connection action handlers
  const handleConnect = () => {
    setConfirmAction({ type: 'connect', targetId: profile.id, userName: `${profile.first_name} ${profile.last_name}` });
    setShowConfirmModal(true);
  };

  const handleWithdraw = () => {
    const pending = sentRequests.find(r => r.connected_user_id === profile.id);
    if (pending) {
      setConfirmAction({ type: 'withdraw', targetId: pending.id, userName: `${profile.first_name} ${profile.last_name}` });
      setShowConfirmModal(true);
    }
  };

  const handleAccept = () => {
    const pending = receivedRequests.find(r => r.sender_id === profile.id);
    if (pending) {
      setConfirmAction({ type: 'accept', targetId: pending.id, userName: `${profile.first_name} ${profile.last_name}` });
      setShowConfirmModal(true);
    }
  };

  const handleReject = () => {
    const pending = receivedRequests.find(r => r.sender_id === profile.id);
    if (pending) {
      setConfirmAction({ type: 'reject', targetId: pending.id, userName: `${profile.first_name} ${profile.last_name}` });
      setShowConfirmModal(true);
    }
  };

  const handleAcceptRequest = (requestId: string, senderName: string) => {
    setConfirmAction({ type: 'accept', targetId: requestId, userName: senderName });
    setShowConfirmModal(true);
  };

  const handleRejectRequest = (requestId: string, senderName: string) => {
    setConfirmAction({ type: 'reject', targetId: requestId, userName: senderName });
    setShowConfirmModal(true);
  };

  const handleWithdrawRequest = (requestId: string, userName: string) => {
    setConfirmAction({ type: 'withdraw', targetId: requestId, userName });
    setShowConfirmModal(true);
  };

  const handleDisconnect = () => {
    setConfirmAction({ type: 'disconnect', targetId: profile.id, userName: `${profile.first_name} ${profile.last_name}` });
    setShowConfirmModal(true);
  };

  const confirmConnectionAction = async () => {
    if (!confirmAction || !profile) return;
    try {
      if (confirmAction.type === 'connect') {
        await mutations.sendRequest(profile.id);
        showNotification('Connection request sent', 'success');
      } else if (confirmAction.type === 'withdraw' && confirmAction.targetId) {
        await mutations.withdrawRequest(confirmAction.targetId);
        showNotification('Request withdrawn', 'success');
      } else if (confirmAction.type === 'accept' && confirmAction.targetId) {
        await mutations.acceptRequest(confirmAction.targetId);
        showNotification('Connection accepted', 'success');
      } else if (confirmAction.type === 'reject' && confirmAction.targetId) {
        await mutations.rejectRequest(confirmAction.targetId);
        showNotification('Request rejected', 'success');
      } else if (confirmAction.type === 'disconnect') {
        await disconnectMutation.mutateAsync();
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileUserId, viewerId) });
    } catch (error: any) {
      showNotification(error.message || 'Action failed', 'error');
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  // Avatar/header upload handlers
  const pickImage = async (type: 'avatar' | 'header') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: type === 'avatar',
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };
      if (type === 'avatar') {
        setUploadingAvatar(true);
        try {
          await profileService.updateProfileAvatar(file);
          showNotification('Profile picture updated', 'success');
          queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileUserId, viewerId) });
        } catch (error: any) {
          showNotification(error.message || 'Upload failed', 'error');
        } finally {
          setUploadingAvatar(false);
        }
      } else {
        setUploadingHeader(true);
        try {
          await profileService.updateProfileHeader(file);
          showNotification('Cover photo updated', 'success');
          queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileUserId, viewerId) });
        } catch (error: any) {
          showNotification(error.message || 'Upload failed', 'error');
        } finally {
          setUploadingHeader(false);
        }
      }
    }
  };

  const handleRemoveAvatar = () => {
    setConfirmAction({ type: 'deleteAvatar', userName: 'profile picture' });
    setShowConfirmModal(true);
  };

  const handleRemoveHeader = () => {
    setConfirmAction({ type: 'deleteHeader', userName: 'cover photo' });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'deleteAvatar') {
        await profileService.removeProfileAvatar();
        showNotification('Avatar removed', 'success');
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileUserId, viewerId) });
      } else if (confirmAction.type === 'deleteHeader') {
        await profileService.removeProfileHeader();
        showNotification('Cover photo removed', 'success');
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileUserId, viewerId) });
      }
    } catch (error: any) {
      showNotification(error.message || 'Delete failed', 'error');
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const shareProfile = async () => {
    try {
      const url = `yourapp://profile/${profile.id}`; // replace with your deep link
      await Share.share({
        message: `Check out ${profile.first_name}'s profile on GJBC!`,
        url,
      });
      setShowShareMenu(false);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderPrimaryActionButton = () => {
    if (isOwner) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowEditModal(true)}
        >
          <LinearGradient colors={['#16a34a', '#15803d']} style={styles.actionGradient}>
            <Edit3 size={20} color="#fff" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    if (isConnected) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDisconnect}
        >
          <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.actionGradient}>
            <Text style={styles.actionText}>Disconnect</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    const pendingSent = sentRequests.find(r => r.connected_user_id === profile.id);
    const pendingReceived = receivedRequests.find(r => r.sender_id === profile.id);
    if (pendingSent) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleWithdraw}
        >
          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.actionGradient}>
            <Text style={styles.actionText}>Withdraw Request</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    if (pendingReceived) {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.flex1]}
            onPress={handleAccept}
          >
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.actionGradient}>
              <Text style={styles.actionText}>Accept</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.flex1]}
            onPress={handleReject}
          >
            <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.actionGradient}>
              <Text style={styles.actionText}>Reject</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleConnect}
      >
        <LinearGradient colors={['#16a34a', '#15803d']} style={styles.actionGradient}>
          <Text style={styles.actionText}>Connect</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <AppHeader title="Profile" showBack />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader
            profile={profile}
            isOwner={isOwner}
            isVerified={profile.user_status === 'verified'}
            onEditProfile={() => setShowEditModal(true)}
            onRemoveAvatar={handleRemoveAvatar}
            onRemoveHeader={handleRemoveHeader}
            uploadingAvatar={uploadingAvatar}
            uploadingHeader={uploadingHeader}
            onPickAvatar={() => pickImage('avatar')}
            onPickHeader={() => pickImage('header')}
          />

          <ProfileStats
            postsCount={stats?.posts_count ?? 0}
            connectionsCount={stats?.connections_count ?? 0}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <View style={styles.actionContainer}>
            {renderPrimaryActionButton()}
          </View>

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profileUserId={profile.id}
            viewerId={viewerId}
            isOwner={isOwner}
            isConnected={isConnected}
            posts={posts}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            friends={friends}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onWithdrawRequest={handleWithdrawRequest}
            connectionsCount={stats?.connections_count ?? 0}
          />
        </ScrollView>

        <EditProfileModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialData={profile}
          onSave={async (updatedData) => {
            try {
              await profileService.updateProfileData(updatedData);
              showNotification('Profile updated', 'success');
              queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileUserId, viewerId) });
              setShowEditModal(false);
            } catch (error: any) {
              showNotification(error.message || 'Update failed', 'error');
              throw error;
            }
          }}
        />

        <ConfirmationDialog
          visible={showConfirmModal}
          title={
            confirmAction?.type === 'connect' ? `Connect with ${confirmAction.userName}?` :
            confirmAction?.type === 'withdraw' ? `Withdraw request to ${confirmAction.userName}?` :
            confirmAction?.type === 'accept' ? `Accept connection from ${confirmAction.userName}?` :
            confirmAction?.type === 'reject' ? `Reject connection from ${confirmAction.userName}?` :
            confirmAction?.type === 'disconnect' ? `Remove ${confirmAction.userName} from your connections?` :
            confirmAction?.type === 'deleteAvatar' ? 'Remove profile picture?' :
            confirmAction?.type === 'deleteHeader' ? 'Remove cover photo?' : ''
          }
          message={
            confirmAction?.type === 'connect' ? 'They will be notified and need to accept.' :
            confirmAction?.type === 'withdraw' ? 'Your pending request will be cancelled.' :
            confirmAction?.type === 'accept' ? 'You will be able to message each other.' :
            confirmAction?.type === 'reject' ? 'They will not be notified.' :
            confirmAction?.type === 'disconnect' ? 'This action cannot be undone.' :
            confirmAction?.type?.includes('delete') ? 'This action cannot be undone.' : ''
          }
          confirmText={
            confirmAction?.type === 'connect' ? 'Send Request' :
            confirmAction?.type === 'withdraw' ? 'Withdraw' :
            confirmAction?.type === 'accept' ? 'Accept' :
            confirmAction?.type === 'reject' ? 'Reject' :
            confirmAction?.type === 'disconnect' ? 'Remove' :
            'Delete'
          }
          onConfirm={() => {
            if (confirmAction?.type?.includes('delete')) {
              confirmDelete();
            } else {
              confirmConnectionAction();
            }
          }}
          onCancel={() => setShowConfirmModal(false)}
          isDanger={confirmAction?.type === 'reject' || confirmAction?.type === 'disconnect' || confirmAction?.type?.includes('delete')}
        />

        <FeedbackToast
          visible={!!notification}
          message={notification?.message || ''}
          type={notification?.type || 'success'}
          onClose={() => setNotification(null)}
        />

        {showShareMenu && (
          <View style={styles.shareOverlay}>
            <TouchableOpacity style={styles.shareBackdrop} onPress={() => setShowShareMenu(false)} />
            <View style={styles.shareMenu}>
              <Text style={styles.shareTitle}>Share Profile</Text>
              <TouchableOpacity style={styles.shareOption} onPress={shareProfile}>
                <Text style={styles.shareOptionText}>Copy Profile Link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareCancel} onPress={() => setShowShareMenu(false)}>
                <Text style={styles.shareCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    paddingBottom: 20,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  actionButton: {
    borderRadius: 30,
    overflow: 'hidden',
    height: 50,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  shareOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  shareMenu: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  shareOption: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '600',
  },
  shareCancel: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shareCancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
