import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCheck, Bell } from 'lucide-react-native';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCard } from '../../components/notifications/NotificationCard';
import { Notification } from '../../hooks/useNotifications';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    markAsRead,
    refetch,
  } = useNotifications();

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    notifications.forEach((n) => {
      const type = n.type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(n);
    });
    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));
  }, [notifications]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    // Mark as read if not already
    if (!notification.read) {
      markAsRead(notification.id);
    }

    const { type, reference_id, sender_id } = notification;

    switch (type) {
      case 'post':
        if (reference_id) navigation.navigate('PostDetail', { id: reference_id });
        break;
      case 'connection':
        if (sender_id) navigation.navigate('Profile', { userId: sender_id });
        break;
      case 'marketplace':
        if (reference_id) navigation.navigate('MarketplaceDetail', { id: reference_id });
        break;
      case 'business':
        if (reference_id) navigation.navigate('BusinessDetails', { id: reference_id });
        break;
      case 'event':
        if (reference_id) navigation.navigate('EventDetail', { id: reference_id });
        break;
      case 'support':
        if (reference_id) navigation.navigate('TicketDetail', { id: reference_id });
        break;
      case 'announcement':
        if (reference_id) navigation.navigate('AnnouncementDetail', { id: reference_id });
        break;
      case 'system':
        if (sender_id) navigation.navigate('Profile', { userId: sender_id });
        break;
      default:
        break;
    }
  }, [navigation, markAsRead]);

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationCard notification={item} onPress={handleNotificationPress} />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Bell size={48} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyText}>
        When you receive notifications, they'll appear here.
      </Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notifications</Text>
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={() => markAllAsRead()}
        >
          <LinearGradient
            colors={['#16a34a', '#15803d']}
            style={styles.markAllGradient}
          >
            <CheckCheck size={16} color="#fff" />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && notifications.length === 0) {
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

        <SectionList
          sections={groupedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={['#16a34a']}
              tintColor="#16a34a"
            />
          }
          showsVerticalScrollIndicator={false}
        />
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
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  markAllButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  markAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  markAllText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
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
});
