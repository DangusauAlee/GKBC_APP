export interface LoginFormData {
  email: string;
  password: string;
}

export type LoginStatus = 'unverified' | 'banned' | 'no_account' | 'credentials_incorrect';

export interface LoginScreenProps {
  navigation: any;
  route: any;
}
