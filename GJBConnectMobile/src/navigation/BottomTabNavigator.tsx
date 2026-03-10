import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home';
import { MembersScreen } from '../screens/Members';
import { BusinessesScreen } from '../screens/Businesses';
import { ExploreScreen } from '../screens/Explore';
import { MarketplaceScreen } from '../screens/Marketplace';
import { CustomTabBar } from '../components/CustomTabBar';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { useApp } from '../context/AppContext';

export type BottomTabParamList = {
  Home: undefined;
  Members: undefined;
  Businesses: undefined;
  Explore: undefined;
  Marketplace: undefined;
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
        <Tab.Screen name="Businesses" component={BusinessesScreen} options={{ tabBarLabel: 'Business' }} />
        <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: 'Explore' }} />
        <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarLabel: 'Market' }} />
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
