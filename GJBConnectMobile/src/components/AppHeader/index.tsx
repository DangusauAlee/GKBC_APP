import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Bell, MessageCircle, ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useUnread } from '../../contexts/UnreadContext';
import VerifiedBadge from '../shared/VerifiedBadge';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightActions,
}) => {
  const navigation = useNavigation();
  const { profile } = useAuthStore();
  const { unreadMessages, unreadNotifications } = useUnread();

  const handleBack = () => {
    if (onBack) onBack();
    else navigation.goBack();
  };

  const goToNotifications = () => {
    navigation.navigate('Notifications' as never);
  };

  const goToMessages = () => {
    navigation.navigate('ConversationsList' as never);
  };

  const goToProfile = () => {
    navigation.navigate('Profile' as never);
  };

  const userName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : 'Member';

  const userInitials = (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '') || 'M';

  return (
    <>
      <LinearGradient
        colors={['#16a34a', '#15803d']}
        style={styles.header}
      >
        <View style={styles.container}>
          <View style={styles.leftSection}>
            {showBack ? (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ChevronLeft size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('Home' as never)} style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>GKBC</Text>
                </View>
                <View style={styles.logoTextContainer}>
                  <Text style={styles.logoTitle}>GKBC</Text>
                  <Text style={styles.logoSubtitle}>Greater Kano</Text>
                </View>
              </TouchableOpacity>
            )}
            {title && <Text style={styles.title}>{title}</Text>}
          </View>

          <View style={styles.rightSection}>
            {rightActions ? (
              rightActions
            ) : (
              <>
                <TouchableOpacity onPress={goToNotifications} style={styles.iconButton}>
                  <Bell size={20} color="#fff" />
                  {unreadNotifications > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={goToMessages} style={styles.iconButton}>
                  <MessageCircle size={20} color="#fff" />
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
              </>
            )}
          </View>
        </View>
      </LinearGradient>
      <View style={styles.statusBarPlaceholder} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#16a34a',
    fontWeight: '900',
    fontSize: 12,
  },
  logoTextContainer: {
    justifyContent: 'center',
  },
  logoTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
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
  statusBarPlaceholder: {
    height: 0, // The actual status bar is handled by the SafeAreaView in the screen
  },
});
