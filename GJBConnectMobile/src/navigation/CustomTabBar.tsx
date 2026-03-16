import React, { useRef, useEffect } from 'react';
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
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Home,
  Users,
  Store,
  Building2,
  Compass,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const iconMap = {
  Home,
  Members: Users,
  Marketplace: Store,
  Businesses: Building2,
  Explore: Compass,
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

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

    scales[index].value = withSequence(
      withSpring(0.92, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
  };

  const handleLongPress = (routeName: string) => {
    navigation.emit({
      type: 'tabLongPress',
      target: routeName,
    });
  };

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint={Platform.OS === 'ios' ? 'light' : 'default'}
        style={[
          styles.container,
          {
            height: tabBarHeight - insets.bottom,
            backgroundColor: Platform.select({ android: '#ffffff', web: '#ffffff', ios: undefined }),
          },
        ]}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const IconComponent = iconMap[route.name as keyof typeof iconMap] || Home;
            const iconSize = isFocused ? 26 : 22;
            const iconColor = '#16a34a'; 

            const labelText =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;

            const animatedScaleStyle = useAnimatedStyle(() => ({
              transform: [{ scale: scales[index].value }],
            }));

            return (
              <AnimatedTouchable
                key={route.key}
                style={[styles.tab, animatedScaleStyle]}
                onPress={() => handlePress(route.name, isFocused, index)}
                onLongPress={() => handleLongPress(route.name)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
              >
                <View style={styles.iconContainer}>
                  {isFocused && <View style={styles.activeBackground} />}
                  <IconComponent
                    color={iconColor}
                    size={iconSize}
                    strokeWidth={isFocused ? 2 : 1.8}
                  />
                </View>
                <Text style={styles.label} numberOfLines={1}>
                  {labelText}
                </Text>
              </AnimatedTouchable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 30,
    marginHorizontal: 10,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
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
    paddingVertical: 6,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  label: {
    fontSize: 11,
    color: '#16a34a', // always green
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
});