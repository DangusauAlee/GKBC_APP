import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../components/auth/Login';
import { SignUpScreen } from '../components/auth/SignUp';

// Placeholder for other screens – you'll add them later
const HomeScreen = () => null;

export type RootStackParamList = {
  Login: { prefilledEmail?: string; message?: string; messageType?: 'success' | 'error' } | undefined;
  SignUp: { prefilledEmail?: string } | undefined;
  Home: undefined;
  ForgotPassword: undefined;
  Terms: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ForgotPassword" component={PlaceholderScreen} />
        <Stack.Screen name="Terms" component={PlaceholderScreen} />
        <Stack.Screen name="Privacy" component={PlaceholderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Temporary placeholder screen
const PlaceholderScreen = () => null;
