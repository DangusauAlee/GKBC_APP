import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, MessageCircle, ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useUnread } from '../../contexts/UnreadContext';
import VerifiedBadge from '../shared/VerifiedBadge';

const LOGO = require('../../../assets/GJBCLOGO.png');

export const AppHeader: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { unreadMessages, unreadNotifications } = useUnread();

  const canGoBack = navigation.canGoBack();

  const goToNotifications = () => {
    navigation.navigate('Notifications' as never);
  };

  const goToMessages = () => {
    navigation.navigate('ConversationsList' as never);
  };

  const goToProfile = () => {
    navigation.navigate('Profile' as never);
  };

  const userInitials = (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '') || 'M';

  return (
    <BlurView
      intensity={Platform.OS === 'ios' ? 80 : 100}
      tint={Platform.OS === 'ios' ? 'light' : 'default'}
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: Platform.OS === 'android' ? '#ffffff' : undefined,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={24} color="#16a34a" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Home' as never)} style={styles.logoContainer}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity onPress={goToNotifications} style={styles.iconButton}>
            <Bell size={20} color="#16a34a" />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToMessages} style={styles.iconButton}>
            <MessageCircle size={20} color="#16a34a" />
            {unreadMessages > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToProfile} style={styles.profileButton}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{userInitials}</Text>
              </View>
            )}
            {profile?.user_status === 'verified' && (
              <View style={styles.verifiedBadge}>
                <VerifiedBadge size={10} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#16a34a',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 8,
    padding: 2,
  },
  logo: {
    width: 40,
    height: 40,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  avatarInitials: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});