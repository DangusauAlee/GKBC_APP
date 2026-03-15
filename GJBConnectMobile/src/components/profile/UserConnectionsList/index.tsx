import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { UserCheck, UserPlus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { connectionsService } from '../../../services/connections';
import { connectionKeys } from '../../../hooks/queryKeys';
import { MemberCard } from '../../members/MemberCard';
import { useAuthStore } from '../../../store/authStore';

interface UserConnectionsListProps {
  userId: string;
  viewerId: string;
}

export const UserConnectionsList: React.FC<UserConnectionsListProps> = ({ userId, viewerId }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch the profile owner's friends
  const {
    data: connections = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: connectionKeys.userFriends(userId),
    queryFn: () => connectionsService.getFriendsList(userId),
  });

  // Fetch viewer's own friends to know which ones are already connected
  const { data: myFriends = [] } = useQuery({
    queryKey: connectionKeys.friends(),
    queryFn: () => connectionsService.getFriends(),
  });

  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId: string) => connectionsService.sendConnectionRequest(targetUserId),
    onMutate: async (targetUserId) => {
      // Cancel outgoing refetches for myFriends and this userFriends list
      await queryClient.cancelQueries({ queryKey: connectionKeys.friends() });
      await queryClient.cancelQueries({ queryKey: connectionKeys.userFriends(userId) });

      // Snapshot previous states
      const previousMyFriends = queryClient.getQueryData(connectionKeys.friends());
      const previousUserFriends = queryClient.getQueryData(connectionKeys.userFriends(userId));

      // Optimistically update myFriends? Actually sending request doesn't change myFriends,
      // but we want to update the button state. The button state depends on isAlreadyConnected
      // which uses myFriends. We can't mark as connected because it's pending. Instead, we
      // need to add to sentRequests cache? But the button uses myFriends only.
      // For simplicity, we'll rely on the sentRequests cache which is already updated by
      // useConnectionMutations. However, this component uses its own mutation, so we should
      // also update sentRequests cache if we have it.
      // Since we don't have sentRequests query here, we'll just invalidate after mutation.

      return { previousMyFriends, previousUserFriends };
    },
    onError: (err, targetUserId, context) => {
      queryClient.setQueryData(connectionKeys.friends(), context?.previousMyFriends);
      queryClient.setQueryData(connectionKeys.userFriends(userId), context?.previousUserFriends);
    },
    onSettled: () => {
      // Invalidate all relevant queries to refetch
      queryClient.invalidateQueries({ queryKey: connectionKeys.friends() });
      queryClient.invalidateQueries({ queryKey: connectionKeys.sent() });
      queryClient.invalidateQueries({ queryKey: connectionKeys.userFriends(userId) });
    },
  });

  const getUserInitials = (first?: string, last?: string): string => {
    const f = first?.charAt(0) || '';
    const l = last?.charAt(0) || '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  const handleProfileClick = (memberId: string) => {
    navigation.navigate('Profile', { userId: memberId });
  };

  const handleConnect = (targetUserId: string) => {
    sendRequestMutation.mutate(targetUserId);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isAlreadyConnected = myFriends.some((f: any) => f.user_id === item.user_id);
    const isSelf = item.user_id === viewerId;

    const connectionButton = isSelf ? null : (
      <View style={styles.buttonContainer}>
        {isAlreadyConnected ? (
          <View style={[styles.button, styles.connectedButton]}>
            <UserCheck size={14} color="#16a34a" />
            <Text style={styles.connectedButtonText}>Connected</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={() => handleConnect(item.user_id)}
            disabled={sendRequestMutation.isPending}
          >
            {sendRequestMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <UserPlus size={14} color="#fff" />
                <Text style={styles.connectButtonText}>Connect</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );

    return (
      <MemberCard
        member={{
          id: item.user_id,
          first_name: item.user_name?.split(' ')[0] || '',
          last_name: item.user_name?.split(' ').slice(1).join(' ') || '',
          avatar_url: item.user_avatar,
          user_status: item.user_status,
          business_name: '',
          business_type: '',
          market_area: '',
          location: '',
          bio: '',
          role: '',
        }}
        connectionButton={connectionButton}
        onProfileClick={handleProfileClick}
        getUserInitials={getUserInitials}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.emptyGradient}>
        <UserCheck size={48} color="#16a34a" />
        <Text style={styles.emptyTitle}>No connections yet</Text>
        <Text style={styles.emptyText}>This user hasn't connected with anyone yet.</Text>
      </LinearGradient>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <FlatList
      data={connections}
      keyExtractor={(item) => item.user_id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyGradient: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  connectButton: {
    backgroundColor: '#16a34a',
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  connectedButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  connectedButtonText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 12,
  },
});
