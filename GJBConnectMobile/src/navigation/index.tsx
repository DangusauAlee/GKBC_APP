import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../components/auth/Login';
import { SignUpScreen } from '../components/auth/SignUp';
import { ForgotPasswordScreen } from '../components/auth/ForgotPassword';
import { ResetPasswordScreen } from '../components/auth/ResetPassword';
import { TermsScreen } from '../components/static/Terms';
import { PrivacyScreen } from '../components/static/Privacy';

// Placeholder for other screens
const HomeScreen = () => null;

export type RootStackParamList = {
  Login: { prefilledEmail?: string; message?: string; messageType?: 'success' | 'error' } | undefined;
  SignUp: { prefilledEmail?: string } | undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Terms: undefined;
  Privacy: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
