import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home';
import { MembersScreen } from '../screens/Members';
import { MarketplaceScreen } from '../screens/Marketplace';
import { BusinessesScreen } from '../screens/Businesses';
import { ExploreScreen } from '../screens/Explore';
import { CustomTabBar } from './CustomTabBar';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { useApp } from '../context/AppContext';

export type BottomTabParamList = {
  Home: undefined;
  Members: undefined;
  Marketplace: undefined;
  Businesses: undefined;
  Explore: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = () => {
  const { isCreatePostModalVisible, setCreatePostModalVisible } = useApp();

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="Members" component={MembersScreen} options={{ tabBarLabel: 'Members' }} />
        <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarLabel: 'Market' }} />
        <Tab.Screen name="Businesses" component={BusinessesScreen} options={{ tabBarLabel: 'Business' }} />
        <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: 'Explore' }} />
      </Tab.Navigator>

      <CreatePostModal
        visible={isCreatePostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
        onPostCreated={() => {
          // Optionally refetch feed – handled by useFeed's invalidation
        }}
      />
    </>
  );
};
