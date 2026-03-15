import React, { useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  useSharedValue,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import {
  Home,
  Users,
  Store,
  Building2,
  Compass,
  Plus,
  MessageCircle, // <-- import the missing icon
} from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 6; // Updated to 6 tabs

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const icons = {
  Home,
  Members: Users,
  Marketplace: Store,
  Businesses: Building2,
  Explore: Compass,
  Messages: MessageCircle, // <-- add the mapping
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  // Shared values for each tab's scale
  const scales = useRef(state.routes.map(() => useSharedValue(1))).current;

  const handlePress = (routeName: string, isFocused: boolean, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }

    // Animate the pressed tab
    scales[index].value = withSequence(
      withSpring(0.9, { damping: 1, stiffness: 150 }),
      withSpring(1.2, { damping: 2, stiffness: 150 }),
      withSpring(1, { damping: 1, stiffness: 150 })
    );
  };

  const handleLongPress = (routeName: string) => {
    navigation.emit({
      type: 'tabLongPress',
      target: routeName,
    });
  };

  return (
    <BlurView
      intensity={80}
      tint="light"
      style={[
        styles.container,
        {
          height: tabBarHeight,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Get icon component – now Messages will map correctly
          const IconComponent = icons[route.name as keyof typeof icons] || Home;

          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: scales[index].value }],
            };
          });

          const activeBackgroundStyle = useAnimatedStyle(() => {
            const opacity = isFocused ? withTiming(1) : withTiming(0);
            return {
              opacity,
            };
          });

          const iconColor = isFocused ? '#16a34a' : '#6b7280';

          return (
            <AnimatedTouchable
              key={route.key}
              style={[styles.tab, animatedStyle]}
              onPress={() => handlePress(route.name, isFocused, index)}
              onLongPress={() => handleLongPress(route.name)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Animated.View style={[styles.activeBackground, activeBackgroundStyle]} />
                <IconComponent
                  color={iconColor}
                  size={isFocused ? 26 : 22}
                  strokeWidth={isFocused ? 2 : 1.5}
                />
              </View>
              {options.tabBarLabel !== undefined && (
                <Text style={[styles.label, isFocused && styles.labelFocused]}>
                  {options.tabBarLabel as string}
                </Text>
              )}
            </AnimatedTouchable>
          );
        })}
      </View>

      {/* Floating Action Button for Create Post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Navigate to create post modal or open modal
          console.log('Open create post modal');
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Plus color="#fff" size={24} strokeWidth={3} />
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    elevation: 0,
    overflow: 'hidden',
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  labelFocused: {
    color: '#16a34a',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});