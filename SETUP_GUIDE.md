# SilverCart - Environment Setup Guide

**Date:** January 31, 2026  
**Project:** SilverCart - Elderly E-Commerce App  
**Developer:** Setup Instructions

---

## Prerequisites Checklist

- [x] Supabase account created
- [x] React Native/Expo installed
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Code editor (VS Code recommended)
- [ ] Expo Go app on your phone (for testing)

---

## Step 1: Initialize Expo Project

Open your terminal and navigate to where you want to create the project:

```bash
# Create new Expo project with TypeScript
npx create-expo-app silvercart-mobile --template blank-typescript

# Navigate into project
cd silvercart-mobile
```

---

## Step 2: Install Core Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Supabase
npm install @supabase/supabase-js

# Async Storage (for caching)
npm install @react-native-async-storage/async-storage

# Voice Recognition
npm install expo-speech
npm install @react-native-voice/voice

# UI Components
npm install react-native-paper
npm install react-native-vector-icons

# Forms & Validation
npm install formik yup

# HTTP Client
npm install axios

# Date handling
npm install date-fns

# Expo modules
npx expo install expo-constants expo-secure-store expo-device expo-notifications

# Icon libraries
npm install @expo/vector-icons
```

---

## Step 3: Project Folder Structure

Create this folder structure in your project:

```
silvercart-mobile/
├── src/
│   ├── screens/              # All 37 mobile screens
│   │   ├── auth/             # A1-A8 (Authentication screens)
│   │   ├── main/             # B1-B4 (Main app screens)
│   │   ├── voice/            # C1 (Voice search)
│   │   ├── products/         # D1-D2, E1 (Product screens)
│   │   ├── checkout/         # G1-G4 (Checkout flow)
│   │   ├── orders/           # H1 (Order detail)
│   │   ├── profile/          # I2-I8 (Profile & settings)
│   │   └── special/          # J1-J3 (Safety, errors)
│   │
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Buttons, inputs, cards
│   │   ├── products/         # Product cards, lists
│   │   ├── cart/             # Cart item, quantity selector
│   │   └── feedback/         # Toasts, loading, empty states
│   │
│   ├── navigation/           # Navigation configuration
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── RootNavigator.tsx
│   │
│   ├── services/             # API & business logic
│   │   ├── supabase.ts       # Supabase client
│   │   ├── authService.ts    # Authentication
│   │   ├── productService.ts # Products CRUD
│   │   ├── cartService.ts    # Cart operations
│   │   ├── orderService.ts   # Orders
│   │   ├── aiService.ts      # Voice AI (Gemini)
│   │   └── notificationService.ts
│   │
│   ├── contexts/             # React Context for state
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useVoice.ts
│   │
│   ├── types/                # TypeScript types
│   │   ├── database.types.ts # Supabase generated types
│   │   ├── models.ts         # User, Product, Order types
│   │   └── navigation.types.ts
│   │
│   ├── utils/                # Helper functions
│   │   ├── constants.ts      # App constants
│   │   ├── validators.ts     # Form validation
│   │   ├── formatters.ts     # Date, currency formatting
│   │   └── errorHandler.ts
│   │
│   ├── theme/                # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   └── assets/               # Images, icons, fonts
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example              # Example env file (commit this)
├── app.json                  # Expo configuration
├── package.json
└── tsconfig.json
```

**Create folders now:**

```bash
# Create all folders at once
mkdir -p src/{screens/{auth,main,voice,products,checkout,orders,profile,special},components/{common,products,cart,feedback},navigation,services,contexts,hooks,types,utils,theme,assets/{images,icons,fonts}}
```

---

## Step 4: Configure Environment Variables

### 4.1 Get Supabase Credentials

1. Go to your Supabase project: https://app.supabase.com/
2. Click on your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL
   - `anon` public key

### 4.2 Create `.env` file

Create `.env` in your project root:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

### 4.3 Create `.env.example`

```bash
# .env.example
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4.4 Update `.gitignore`

Make sure `.env` is in `.gitignore`:

```bash
# Add to .gitignore if not already there
echo ".env" >> .gitignore
```

---

## Step 5: Configure app.json

Update your `app.json`:

```json
{
  "expo": {
    "name": "SilverCart",
    "slug": "silvercart-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./src/assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#007A6A"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.silvercart.app",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "SilverCart needs microphone access for voice search",
        "NSCameraUsageDescription": "SilverCart needs camera access for scanning products",
        "NSSpeechRecognitionUsageDescription": "SilverCart uses speech recognition for voice commands"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/adaptive-icon.png",
        "backgroundColor": "#007A6A"
      },
      "package": "com.silvercart.app",
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
        "android.permission.INTERNET"
      ]
    },
    "web": {
      "favicon": "./src/assets/favicon.png"
    },
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      "geminiApiKey": process.env.EXPO_PUBLIC_GEMINI_API_KEY
    }
  }
}
```

---

## Step 6: Create Core Configuration Files

### 6.1 Theme Configuration

Create `src/theme/colors.ts`:

```typescript
export const colors = {
  // Primary Colors
  primary: '#007A6A',        // Teal Green
  secondary: '#2E7D32',      // Dark Green / Emerald
  accent: '#E0F2F1',         // Light Teal

  // Text Colors
  textPrimary: '#222222',    // Dark Gray/Black
  textSecondary: '#666666',  // Medium Gray
  textDisabled: '#999999',   // Light Gray

  // Background Colors
  background: '#FFFFFF',     // White
  backgroundAlt: '#FFF9E6',  // Soft Cream
  backgroundLight: '#F5F5F5',// Light Gray

  // Status Colors
  success: '#4CAF50',        // Green
  error: '#C62828',          // Red
  warning: '#F57C00',        // Orange
  info: '#1976D2',           // Blue

  // Order Status Colors
  statusPending: '#F57C00',      // Orange
  statusConfirmed: '#1976D2',    // Blue
  statusPreparing: '#9C27B0',    // Purple
  statusDelivering: '#FF9800',   // Amber
  statusDelivered: '#4CAF50',    // Green
  statusCancelled: '#F44336',    // Red
};
```

Create `src/theme/typography.ts`:

```typescript
export const typography = {
  // Font Family
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Font Sizes (Minimum for elderly users)
  fontSize: {
    h1: 32,        // Order numbers, prices
    h2: 28,        // Screen titles
    h3: 24,        // Section headers
    h4: 20,        // Subsections
    bodyLarge: 20, // Prices, important info
    body: 18,      // Standard text
    caption: 16,   // Secondary info
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    heading: 1.2,
    body: 1.5,
  },
};
```

Create `src/theme/spacing.ts`:

```typescript
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Touch targets (minimum for elderly users)
  touchTarget: {
    min: 60,      // Minimum touch target size
    button: 60,   // Button height
    icon: 48,     // Icon size
  },

  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};
```

Create `src/theme/index.ts`:

```typescript
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
};

export type Theme = typeof theme;
```

### 6.2 Supabase Client

Create `src/services/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 6.3 Constants

Create `src/utils/constants.ts`:

```typescript
export const APP_CONFIG = {
  name: 'SilverCart',
  version: '1.0.0',
  supportPhone: '1-300-XX-XXXX',
  supportEmail: 'help@silvercart.com',
  supportWhatsApp: '+60 12-XXX-XXXX',
};

export const DELIVERY_FEE = 5.00;
export const FREE_DELIVERY_THRESHOLD = 50.00;
export const MAX_ORDER_AMOUNT = 500.00;
export const ORDER_CANCELLATION_WINDOW_MINUTES = 5;

export const CATEGORIES = {
  PHARMACY: 'pharmacy',
  GROCERY: 'grocery',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
  COD: 'cod',
  ONLINE_BANKING: 'online_banking',
  E_WALLET: 'e_wallet',
} as const;
```

---

## Step 7: Create TypeScript Types

Create `src/types/models.ts`:

```typescript
export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  name: string;
  address: string;
  biometric_enabled: boolean;
  auth_method: 'email' | 'phone';
  trusted_contact_name?: string;
  trusted_contact_phone?: string;
  trusted_contact_relationship?: string;
  trusted_contact_enabled: boolean;
  trusted_contact_notify_orders: boolean;
  trusted_contact_notify_security: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  delivery_address: string;
  payment_method: string;
  status: string;
  estimated_delivery?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
}
```

---

## Step 8: Test the Setup

### 8.1 Update App.tsx

Replace your `App.tsx` with:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SilverCart</Text>
      <Text style={styles.subtitle}>Environment Setup Complete! ✅</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
  },
});
```

### 8.2 Run the App

```bash
# Start Expo development server
npx expo start
```

You should see:
- QR code in terminal
- Expo DevTools in browser
- Options to run on iOS/Android simulator or physical device

**Scan QR code with:**
- iOS: Camera app
- Android: Expo Go app

---

## Step 9: Verify Supabase Connection

Create `src/services/__tests__/supabase.test.ts`:

```typescript
import { supabase } from '../supabase';

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}
```

---

## Step 10: Install Additional Dev Tools (Optional)

```bash
# TypeScript types for React Native
npm install --save-dev @types/react @types/react-native

# ESLint & Prettier (code formatting)
npm install --save-dev eslint prettier eslint-plugin-react eslint-plugin-react-native

# React Native Debugger
# Download from: https://github.com/jhen0409/react-native-debugger
```

---

## Troubleshooting

### Issue: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: "Supabase connection failed"
- Check `.env` file exists and has correct credentials
- Verify EXPO_PUBLIC_ prefix on env variables
- Restart Expo dev server after changing .env

### Issue: "Expo Go not connecting"
- Make sure phone and computer are on same Wi-Fi
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings

### Issue: TypeScript errors
```bash
# Regenerate TypeScript config
npx expo customize tsconfig.json
```

---

## Next Steps

After setup is complete, you can proceed to:

1. **Database Setup** - Create all 11 tables in Supabase
2. **Authentication** - Build login/signup screens (A1-A8)
3. **Main Navigation** - Set up bottom tab navigator (B1-B4)
4. **Product Catalog** - Create product listing and detail screens
5. **Voice AI** - Integrate Gemini API for voice search

---

## Checklist

- [ ] Expo project initialized
- [ ] All dependencies installed
- [ ] Folder structure created
- [ ] .env file configured with Supabase credentials
- [ ] Theme files created
- [ ] Supabase client configured
- [ ] TypeScript types defined
- [ ] App runs successfully on Expo Go
- [ ] Supabase connection verified

---

**Setup Guide Version:** 1.0  
**Last Updated:** January 31, 2026  
**Next Document:** DATABASE_SETUP_GUIDE.md
