import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
    Welcome: undefined;
    EmailRegister: undefined;
    PhoneRegister: undefined;
    Login: undefined;
    ForgotPassword: undefined;
    OtpVerification: { phone: string };
    VerifyResetOtp: { email: string };
    SetPassword: undefined;
    ProfileSetup: undefined;
    Support: undefined;
    SupportForm: undefined;
    SafetyGuide: undefined;
};

export type OnboardingStackParamList = {
    OnboardingBiometric: undefined;
    OnboardingTutorial: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Orders: undefined;
    Cart: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    Cart: undefined;
    SearchResults: { category: string };
    ProductDetails: { productId: string; productName?: string; price?: string; image?: string };
    // Checkout Flow
    CheckoutAddress: undefined;
    CheckoutPayment: undefined;
    CheckoutReview: undefined;
    OrderSuccess: { orderId: string };
    // Orders
    OrderDetails: { orderId: string };
    CancelOrder: undefined;
    // Profile
    TrustedContact: undefined;
    AddTrustedContact: undefined;
    EditTrustedContact: { contactId: string };
    EditProfile: undefined;
    SecuritySettings: undefined;
    ChangePassword: undefined;
    AppSettings: undefined;
    Support: undefined;
    SafetyGuide: undefined;
    // Auth
    EmailVerification: undefined;
    // Global/Special
    Error: { title?: string; message?: string };
    VoiceSearch: undefined;
    Category: { category: string };
};

export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;
export type EmailRegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'EmailRegister'>;
export type PhoneRegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'PhoneRegister'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export type OnboardingBiometricScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingBiometric'>;
export type OnboardingTutorialScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTutorial'>;
