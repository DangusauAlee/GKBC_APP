import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../components/auth/Login';
import { SignUpScreen } from '../components/auth/SignUp';
import { ForgotPasswordScreen } from '../components/auth/ForgotPassword';
import { ResetPasswordScreen } from '../components/auth/ResetPassword';
import { TermsScreen } from '../components/static/Terms';
import { PrivacyScreen } from '../components/static/Privacy';
import { BottomTabNavigator } from './BottomTabNavigator';
import { BusinessDetailsScreen } from '../screens/BusinessDetails';
import { MarketplaceDetailScreen } from '../screens/MarketplaceDetail';
import { MarketplaceEditScreen } from '../screens/MarketplaceEdit';
import { ConversationsListScreen } from '../screens/ConversationsList';
import { ChatWindowScreen } from '../screens/ChatWindow';
import { NewConversationScreen } from '../screens/NewConversation';
import { NotificationsScreen } from '../screens/Notifications';
import { ProfileScreen } from '../screens/Profile';
import { HelpSupportScreen } from '../screens/HelpSupport';
import { AnnouncementDetailScreen } from '../screens/AnnouncementDetail';
import { AppHeader } from '../components/AppHeader'; // adjust path if needed

export type RootStackParamList = {
  Login: { prefilledEmail?: string; message?: string; messageType?: 'success' | 'error' } | undefined;
  SignUp: { prefilledEmail?: string } | undefined;
  MainTabs: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Terms: undefined;
  Privacy: undefined;
  BusinessDetails: { id: string };
  MarketplaceDetail: { id: string };
  MarketplaceEdit: { id: string };
  ConversationsList: undefined;
  ChatWindow: { conversationId: string; otherUser: any; context: string; listing?: any };
  NewConversation: undefined;
  Notifications: undefined;
  Profile: { userId?: string } | undefined;
  HelpSupport: undefined;
  AnnouncementDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ route }) => {
          // List of routes that should show the custom header
          const authenticatedRoutes = [
            'MainTabs',
            'BusinessDetails',
            'MarketplaceDetail',
            'MarketplaceEdit',
            'ConversationsList',
            'ChatWindow',
            'NewConversation',
            'Notifications',
            'Profile',
            'HelpSupport',
            'AnnouncementDetail',
          ];
          const showHeader = authenticatedRoutes.includes(route.name);

          return {
            header: showHeader ? () => <AppHeader /> : undefined,
            headerShown: showHeader,
          };
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
        <Stack.Screen name="MarketplaceDetail" component={MarketplaceDetailScreen} />
        <Stack.Screen name="MarketplaceEdit" component={MarketplaceEditScreen} />
        <Stack.Screen name="ConversationsList" component={ConversationsListScreen} />
        <Stack.Screen name="ChatWindow" component={ChatWindowScreen} />
        <Stack.Screen name="NewConversation" component={NewConversationScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}