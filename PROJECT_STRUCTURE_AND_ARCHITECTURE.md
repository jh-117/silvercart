# SilverCart - Project Structure & Architecture Documentation

**Version:** 3.0 - Updated March 22, 2026  
**Status:** In Development - Phase 4 (Polish & Testing)  
**SDK:** Expo SDK 54 with New Architecture  

---

## 📁 PROJECT STRUCTURE

### Root Directory (`silvercart-mobile/`)

```
silvercart-mobile/
├── .expo/                      # Expo build cache (gitignored)
├── .git/                       # Git repository
├── assets/                     # Root-level static assets (Expo default)
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash.png
├── node_modules/               # Dependencies (gitignored)
├── src/                        # ⭐ Main source code directory
│   ├── assets/                 # App-specific assets
│   ├── components/             # Reusable UI components
│   ├── contexts/               # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── navigation/             # Navigation configuration
│   ├── screens/                # Screen components (organized by feature)
│   ├── services/               # API services, Supabase client
│   ├── theme/                  # Design system (colors, spacing, typography)
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions and constants
├── .env                        # Environment variables (gitignored)
├── .env.example                # Environment template (committed)
├── .gitignore                  # Git ignore rules
├── App.tsx                     # Root application component
├── app.json                    # Expo configuration
├── babel.config.js             # Babel configuration (includes Reanimated plugin)
├── package.json                # Dependencies and scripts
├── package-lock.json           # Dependency lock file
└── tsconfig.json               # TypeScript configuration
```

---

## 🗂️ DETAILED SOURCE STRUCTURE (`src/`)

### 1. Assets (`src/assets/`)

```
src/assets/
├── fonts/                      # Custom fonts (if any)
│   └── (empty for now - using system fonts)
├── icons/                      # Custom SVG icons
│   └── (empty - using @expo/vector-icons)
└── images/                     # App-specific images
    ├── logo.png
    ├── onboarding/
    │   ├── voice-search.png
    │   ├── large-ui.png
    │   └── easy-checkout.png
    └── safety/
        ├── scam-warning.png
        └── trust-badge.png
```

**Purpose:** Static assets that are bundled with the app.

**Usage:**
```typescript
import logo from '@/assets/images/logo.png';
<Image source={logo} />
```

---

### 2. Components (`src/components/`)

#### 2.1 Cart Components (`src/components/cart/`)
```
src/components/cart/
├── CartItem.tsx                # Single cart item with quantity controls
├── CartSummary.tsx             # Cart total summary (sticky bottom)
├── EmptyCart.tsx               # Empty cart state with CTA
└── QuantitySelector.tsx        # Large +/- quantity buttons (60x60dp)
```

**Design Requirements:**
- All buttons must be 60x60dp minimum
- Use `Pressable` instead of `TouchableOpacity`
- Follow DESIGN_SYSTEM.md color palette

**Example Component Structure:**
```typescript
// CartItem.tsx
import { Pressable, View, Text, Image } from 'react-native';
import { colors, spacing } from '@/theme';

interface CartItemProps {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartItem({ ... }: CartItemProps) {
  // Component implementation
}
```

#### 2.2 Common Components (`src/components/common/`)
```
src/components/common/
├── Button.tsx                  # Primary/Secondary/Success button variants
├── Input.tsx                   # Text input with validation states
├── Card.tsx                    # Product/Menu card container
├── Badge.tsx                   # Status pills (Pending/Delivered/etc)
├── Loading.tsx                 # Loading spinner
├── ErrorMessage.tsx            # Error display component
└── SafeAreaWrapper.tsx         # SafeAreaView wrapper with bg color
```

**Button Variants:**
- `primary` - Teal background (#007A6A), white text
- `secondary` - Transparent with teal border (4px)
- `success` - Green background (#2D6A4F)
- `icon` - Circular icon button (60x60dp)

#### 2.3 Feedback Components (`src/components/feedback/`)
```
src/components/feedback/
├── SuccessAnimation.tsx        # Checkmark animation for order confirmation
├── LoadingSkeleton.tsx         # Skeleton loading for product cards
└── Toast.tsx                   # Toast notifications (add to cart, errors)
```

#### 2.4 Product Components (`src/components/products/`)
```
src/components/products/
├── ProductCard.tsx             # Product card (2-column grid)
├── ProductGrid.tsx             # Grid container for products
├── CategoryCard.tsx            # Large category cards (Home screen)
├── ProductImage.tsx            # Product image with loading state
└── StockBadge.tsx              # In Stock / Out of Stock badge
```

**ProductCard Specs (from DESIGN_SYSTEM.md):**
- Image: Full width, height 192dp
- Title: 24pt bold
- Description: 18pt regular, muted color
- Price: 30pt bold, success green (#2D6A4F)
- Border radius: 16dp
- Shadow: elevation 2

---

### 3. Contexts (`src/contexts/`)

```
src/contexts/
├── AuthContext.tsx             # Authentication state & methods
├── CartContext.tsx             # Shopping cart state management
├── OrderContext.tsx            # Order history and current order
└── ThemeContext.tsx            # Theme switching (light/dark - Phase 2)
```

#### AuthContext Structure:
```typescript
interface AuthContextType {
  // State
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  
  // Methods
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPhone: (phone: string) => Promise<AuthResult>;
  verifyOTP: (phone: string, otp: string) => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithPhone: (phone: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
}
```

#### CartContext Structure:
```typescript
interface CartContextType {
  // State
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  loading: boolean;
  
  // Methods
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}
```

---

### 4. Hooks (`src/hooks/`)

```
src/hooks/
├── useAuth.ts                  # Hook to access AuthContext
├── useCart.ts                  # Hook to access CartContext
├── useProducts.ts              # Fetch and cache products from Supabase
├── useOrders.ts                # Fetch and manage orders
├── useDebounce.ts              # Debounce search input
└── useKeyboard.ts              # Keyboard visibility detection
```

**Example Custom Hook:**
```typescript
// useProducts.ts
export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    // Fetch from Supabase
  };

  return { products, loading, error, refetch: fetchProducts };
}
```

---

### 5. Navigation (`src/navigation/`)

```
src/navigation/
├── types.ts                    # TypeScript navigation types
├── AppNavigator.tsx            # Root navigator (Auth/Onboarding/Main)
├── AuthStack.tsx               # Auth screens stack (A1-A4a)
├── OnboardingStack.tsx         # Onboarding screens stack (A5-A8)
├── MainTabs.tsx                # Bottom tab navigator (4 tabs)
├── HomeStack.tsx               # Home tab nested stack
├── CartStack.tsx               # Cart tab nested stack (includes checkout)
├── OrdersStack.tsx             # Orders tab nested stack
└── ProfileStack.tsx            # Profile tab nested stack
```

#### Navigation Hierarchy:

```
AppNavigator (Root)
├── AuthStack (Not authenticated)
│   ├── WelcomeScreen (A1)
│   ├── EmailRegisterScreen (A2)
│   ├── EmailVerificationScreen (A2a)
│   ├── PhoneRegisterScreen (A3)
│   ├── OTPVerificationScreen (A3a)
│   ├── SetPasswordScreen (A3b)
│   ├── LoginScreen (A4)
│   └── ForgotPasswordScreen (A4a)
│
├── OnboardingStack (First-time user)
│   ├── ProfileSetupScreen (A5)
│   ├── TrustedContactSetupScreen (A6)
│   ├── BiometricSetupScreen (A7)
│   ├── TutorialScreen (A8) - 3 slides
│   └── SafetyEducationScreen (J1) - 4 slides
│
└── MainTabs (Authenticated + Onboarded)
    ├── HomeTab → HomeStack
    │   ├── HomeScreen (B1)
    │   ├── CategoryScreen (D1)
    │   ├── SearchResultsScreen (D2)
    │   ├── ProductDetailScreen (E1)
    │   └── VoiceSearchScreen (C1)
    │
    ├── CartTab → CartStack
    │   ├── CartScreen (B2)
    │   ├── CheckoutAddressScreen (G1)
    │   ├── CheckoutPaymentScreen (G2)
    │   ├── CheckoutReviewScreen (G3)
    │   └── OrderConfirmationScreen (G4)
    │
    ├── OrdersTab → OrdersStack
    │   ├── OrdersListScreen (B3)
    │   ├── OrderDetailScreen (H1)
    │   └── CancelOrderScreen (I6)
    │
    └── ProfileTab → ProfileStack
        ├── ProfileMenuScreen (B4)
        ├── TrustedContactScreen (I2)
        ├── TrustedContactFormScreen (I2a)
        ├── EditProfileScreen (I3)
        ├── SecuritySettingsScreen (I4)
        ├── ChangePasswordScreen (I4a)
        ├── HelpSupportScreen (I5)
        └── AppSettingsScreen (I7)
```

#### Navigation Types (`types.ts`):
```typescript
// Full type definitions for all navigators
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Welcome: undefined;
  EmailRegister: undefined;
  EmailVerification: { email: string };
  // ... etc
};

// Screen props helper
export type WelcomeScreenProps = NativeStackScreenProps<
  AuthStackParamList, 
  'Welcome'
>;
```

---

### 6. Screens (`src/screens/`)

#### 6.1 Auth Screens (`src/screens/auth/`)
```
src/screens/auth/
├── WelcomeScreen.tsx           # A1 - First screen (2 signup options)
├── EmailRegisterScreen.tsx     # A2 - Email + password signup
├── EmailVerificationScreen.tsx # A2a - 6-digit email code
├── PhoneRegisterScreen.tsx     # A3 - Phone number input
├── OTPVerificationScreen.tsx   # A3a - 6-digit OTP
├── SetPasswordScreen.tsx       # A3b - Set password after phone auth
├── LoginScreen.tsx             # A4 - Email/Phone tabbed login
└── ForgotPasswordScreen.tsx    # A4a - Password reset via email
```

**Screen Template (WelcomeScreen.tsx):**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
import { WelcomeScreenProps } from '@/navigation/types';
import { colors } from '@/theme';

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      {/* Screen content */}
    </SafeAreaView>
  );
}
```

#### 6.2 Main Screens (`src/screens/main/`)
```
src/screens/main/
├── HomeScreen.tsx              # B1 - Voice search + categories
├── CartScreen.tsx              # B2 - Cart items + checkout CTA
├── OrdersScreen.tsx            # B3 - Order history list
└── ProfileScreen.tsx           # B4 - User menu
```

#### 6.3 Checkout Screens (`src/screens/checkout/`)
```
src/screens/checkout/
├── CheckoutAddressScreen.tsx   # G1 - Confirm delivery address
├── CheckoutPaymentScreen.tsx   # G2 - Select payment method
├── CheckoutReviewScreen.tsx    # G3 - Final order review
└── OrderConfirmationScreen.tsx # G4 - Success screen with order #
```

#### 6.4 Orders Screens (`src/screens/orders/`)
```
src/screens/orders/
├── OrderDetailScreen.tsx       # H1 - Single order details
└── CancelOrderScreen.tsx       # I6 - Cancel order (5-min timer)
```

#### 6.5 Products Screens (`src/screens/products/`)
```
src/screens/products/
├── CategoryScreen.tsx          # D1 - Product grid by category
├── SearchResultsScreen.tsx     # D2 - Voice/text search results
└── ProductDetailScreen.tsx     # E1 - Single product detail
```

#### 6.6 Profile Screens (`src/screens/profile/`)
```
src/screens/profile/
├── TrustedContactScreen.tsx    # I2 - Manage trusted contact
├── TrustedContactFormScreen.tsx # I2a - Add/edit form
├── EditProfileScreen.tsx       # I3 - Edit name/address
├── SecuritySettingsScreen.tsx  # I4 - Biometric, password, 2FA
├── ChangePasswordScreen.tsx    # I4a - Password change form
├── HelpSupportScreen.tsx       # I5 - Contact options + FAQ
└── AppSettingsScreen.tsx       # I7 - Language, notifications, accessibility
```

#### 6.7 Special Screens (`src/screens/special/`)
```
src/screens/special/
├── OnboardingProfileScreen.tsx # A5 - Profile setup
├── OnboardingTrustedContactScreen.tsx # A6 - Trusted contact
├── OnboardingBiometricScreen.tsx # A7 - Biometric prompt
├── OnboardingTutorialScreen.tsx # A8 - 3 slides tutorial
├── SafetyEducationScreen.tsx   # J1 - 4 slides safety tips
└── ErrorScreen.tsx             # J3 - Error/offline states
```

#### 6.8 Voice Screens (`src/screens/voice/`)
```
src/screens/voice/
└── VoiceSearchScreen.tsx       # C1 - Active voice recording
```

---

### 7. Services (`src/services/`)

```
src/services/
├── supabase.ts                 # Supabase client initialization
├── auth.service.ts             # Auth-related API calls
├── products.service.ts         # Product CRUD operations
├── cart.service.ts             # Cart CRUD operations
├── orders.service.ts           # Order management
├── voice.service.ts            # Voice AI integration (Gemini API)
└── notifications.service.ts    # SMS notifications (mock for MVP)
```

#### Supabase Client (`supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface User { /* from database schema */ }
export interface Product { /* from database schema */ }
// ... etc
```

#### Products Service (`products.service.ts`):
```typescript
import { supabase } from './supabase';

export async function getProducts(category?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('stock_status', 'in_stock');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function searchProducts(searchTerm: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,search_keywords.cs.{${searchTerm}}`)
    .eq('stock_status', 'in_stock');
  
  if (error) throw error;
  return data;
}
```

---

### 8. Theme (`src/theme/`)

```
src/theme/
├── colors.ts                   # Color palette (from DESIGN_SYSTEM.md)
├── spacing.ts                  # Spacing scale
├── typography.ts               # Font sizes and weights
└── index.ts                    # Re-exports all theme values
```

#### Current Implementation:
```typescript
// colors.ts
export const colors = {
  primary: '#007A6A',           // Teal
  secondary: '#2D6A4F',         // Emerald green
  backgroundLight: '#F9F8F2',   // Eggshell (NOT white!)
  textMain: '#1A1A1A',          // Off-black (NOT pure black!)
  textMuted: '#658086',
  alert: '#D90429',
  success: '#2D6A4F',
  white: '#FFFFFF',
  borderLight: '#E5E5E5',
};

// spacing.ts
export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, 
  lg: 20, xl: 24, xxl: 32, xxxl: 48
};

// typography.ts
export const fontSize = {
  h1: 32, h2: 24, h3: 22,
  bodyLarge: 20, body: 18,
  button: 20, input: 18, label: 12,
  tabLabel: 12, tabIcon: 32
};

// index.ts
export * from './colors';
export * from './spacing';
export * from './typography';
```

---

### 9. Types (`src/types/`)

```
src/types/
├── auth.types.ts               # Auth-related types
├── product.types.ts            # Product types
├── order.types.ts              # Order types
├── cart.types.ts               # Cart types
└── navigation.types.ts         # Navigation types (imported from navigation/)
```

**Example Type File:**
```typescript
// product.types.ts
export interface Product {
  id: string;
  name: string;
  category: 'pharmacy' | 'grocery';
  description: string;
  price: number;
  image_url: string;
  stock_status: 'in_stock' | 'out_of_stock';
  search_keywords: string[];
  created_at: string;
  updated_at: string;
}
```

---

### 10. Utils (`src/utils/`)

```
src/utils/
├── constants.ts                # App constants
├── validation.ts               # Form validation helpers
├── formatting.ts               # Date, currency, phone formatting
└── helpers.ts                  # General utility functions
```

#### Constants (`constants.ts`):
```typescript
// Currently in file
export const APP_NAME = 'SilverCart';
export const DELIVERY_FEE = 5.00;

// Should add:
export const PHONE_PREFIX = '+60';
export const MIN_PASSWORD_LENGTH = 8;
export const OTP_LENGTH = 6;
export const ORDER_CANCELLATION_WINDOW = 5; // minutes
export const CART_ITEM_MAX_QUANTITY = 99;
```

---

## 🏗️ ARCHITECTURE PATTERNS

### 1. State Management Strategy

**Global State (React Context):**
- Auth state (user, session, role)
- Cart state (items, totals)
- Order state (current order, history)

**Local State (useState):**
- Form inputs
- UI state (loading, errors, modals)
- Screen-specific data

**Server State (Custom Hooks):**
- Products (useProducts)
- Orders (useOrders)
- User profile (useAuth)

### 2. Data Flow

```
User Action → Screen Component → Context/Service → Supabase → Update State → Re-render
```

**Example: Add to Cart**
```typescript
// 1. User taps "Add to Cart" button
<Pressable onPress={() => addToCart(product.id)}>

// 2. Screen calls context method
const { addItem } = useCart();
await addItem(product.id, 1);

// 3. Context calls service
await cartService.addItem(userId, productId, quantity);

// 4. Service updates Supabase
await supabase.from('cart_items').insert({ ... });

// 5. Context updates local state
setItems([...items, newItem]);

// 6. UI re-renders with new cart count
```

### 3. Error Handling Strategy

**Levels of Error Handling:**

1. **Service Level** - Catch API errors
```typescript
try {
  const data = await supabase.from('products').select();
  return { data, error: null };
} catch (error) {
  return { data: null, error };
}
```

2. **Context Level** - Handle auth/business logic errors
```typescript
const signIn = async (email, password) => {
  const { error } = await authService.signIn(email, password);
  if (error) {
    setError('Invalid credentials');
    return;
  }
  // Success
};
```

3. **Component Level** - Display errors to user
```typescript
{error && <ErrorMessage message={error} />}
```

### 4. Loading States

**Pattern:**
- Show skeleton loaders for initial load
- Show spinner for actions (button loading)
- Disable buttons during async operations

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitForm();
  } finally {
    setLoading(false);
  }
};

<Button loading={loading} onPress={handleSubmit} />
```

---

## 🔐 SECURITY ARCHITECTURE

### 1. Authentication Flow

```
1. User signs up/logs in → Supabase Auth creates session
2. Session stored in AsyncStorage (encrypted by OS)
3. JWT token auto-refreshed by Supabase client
4. Row Level Security (RLS) enforces data access
```

### 2. Data Access Control

**RLS Policies (Supabase):**
- Users can only view/edit their own profile
- Users can only view their own orders
- Users can only manage their own cart
- Products are public (read-only)
- Admins can manage all data

### 3. Sensitive Data Handling

**Never Store:**
- Passwords (hashed by Supabase)
- Payment card details (COD only in MVP)
- OTP codes (verify immediately, don't store)

**Store Securely:**
- Session tokens (AsyncStorage - encrypted)
- User preferences (AsyncStorage)
- Cached products (AsyncStorage - public data)

---

## 📊 PERFORMANCE OPTIMIZATION

### 1. Caching Strategy

**AsyncStorage Cache:**
- Product catalog (refresh every 1 hour)
- User profile (refresh on app launch)
- Cart items (sync with server on app resume)

**Memory Cache:**
- Images (React Native Image cache)
- Navigation state (React Navigation)

### 2. Code Splitting

**Not Needed Yet** - Expo handles this automatically for:
- Screens (lazy loaded via React Navigation)
- Assets (only loaded when displayed)

### 3. Image Optimization

**Requirements:**
- Product images: 800x800px max
- Use WebP format when possible
- Lazy load images in lists (FlatList)
- Use placeholder/skeleton while loading

---

## 🧪 TESTING STRATEGY (Phase 2 - Future)

### Unit Tests
- Utility functions
- Validation helpers
- Service methods

### Integration Tests
- Auth flow (signup → verify → login)
- Cart operations (add → update → checkout)
- Order placement

### E2E Tests
- Critical user journeys
- Elderly user flows

---

## 📝 DEVELOPMENT WORKFLOW

### 1. Feature Development Cycle

```
1. Create screen component in correct folder
2. Add to navigation stack
3. Create required services/hooks
4. Implement UI following DESIGN_SYSTEM.md
5. Add to context if global state needed
6. Test on device (elderly usability)
```

### 2. Git Workflow

```
main (production-ready)
  ↑
develop (integration)
  ↑
feature/screen-name (feature branches)
```

### 3. Code Style

**Naming Conventions:**
- Components: PascalCase (`ProductCard.tsx`)
- Files: camelCase or kebab-case (`auth.service.ts`)
- Folders: lowercase (`src/screens/auth/`)
- Constants: UPPER_SNAKE_CASE (`DELIVERY_FEE`)

**Import Order:**
```typescript
// 1. React imports
import React, { useState } from 'react';

// 2. React Native imports
import { View, Text } from 'react-native';

// 3. Third-party imports
import { SafeAreaView } from 'react-native-safe-area-context';

// 4. Local imports (use @ alias)
import { colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
```

---

## 🚀 CURRENT STATE & RECENT UPDATES (March 2026)

### Recently Completed Features:

1. **Voice AI Integration**
   - Direct calling of Trusted Contacts parsed from voice intents.
   - Dynamic global microphone visibility (hidden on Home/Onboarding).
   - Scrollable voice hint overlays.

2. **Security & Onboarding**
   - Biometric authentication enforcement (Face ID/Fingerprint).
   - SecureStore integration for auth tokens.

3. **Core Shopping Flow**
   - Quick Reorder cart logic from previous orders.
   - Database integrity cleanup (matching catalog).

4. **UX & Notifications**
   - Local push notifications integrated.
   - Native dialer and email links from Help & Support.
   - Clear UI differentiation for Live Chat vs Guides.

---

## 📄 RELATED DOCUMENTS

- **DESIGN_SYSTEM.md** - Complete design specifications
- **SilverCart_SDK54_Migration_Log.md** - SDK 54 upgrade notes
- **SilverCart_SDK54_Architecture_Conflicts.md** - Code patterns to follow
- **SilverCart_SDK54_Build_Reminders.md** - SafeAreaView requirements
- **DATABASE_SETUP_GUIDE_V2.md** - Database schema and setup

---

**Document Version:** 2.0  
**Last Updated:** February 5, 2026  
**Author:** SilverCart Development Team  
**Status:** Living Document - Updated as project evolves
