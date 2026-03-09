export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export type UserType = 'regular' | 'verified';

export interface SignUpScreenProps {
  navigation: any; // will be properly typed when navigation is set up
}
