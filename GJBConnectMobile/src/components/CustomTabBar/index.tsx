import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Users, Store, Building2, Compass } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const animatedValues = useRef(state.routes.map(() => new Animated.Value(1))).current;

  const icons = [
    { name: 'Home', Icon: Home },
    { name: 'Members', Icon: Users },
    { name: 'Marketplace', Icon: Store },
    { name: 'Businesses', Icon: Building2 },
    { name: 'Explore', Icon: Compass },
  ];

  useEffect(() => {
    // Animate active tab
    state.routes.forEach((_: any, index: number) => {
      Animated.spring(animatedValues[index], {
        toValue: index === state.index ? 1.2 : 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  const handlePress = (routeName: string, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)']}
        style={styles.gradient}
      />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;
        const { Icon } = icons[index];
        const scale = animatedValues[index];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => handlePress(route.name, isFocused)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
              {/* Semi‑transparent green background for active tab */}
              {isFocused && (
                <LinearGradient
                  colors={['rgba(22, 163, 74, 0.2)', 'rgba(21, 128, 61, 0.2)']}
                  style={styles.iconBackground}
                />
              )}
              <Icon color={isFocused ? '#16a34a' : '#6b7280'} size={22} />
            </Animated.View>
            <Animated.Text style={[styles.label, isFocused && styles.labelFocused]}>
              {label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  iconBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  labelFocused: {
    color: '#16a34a',
    fontWeight: '600',
  },
});
