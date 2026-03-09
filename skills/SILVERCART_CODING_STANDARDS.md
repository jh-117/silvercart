# SilverCart - Coding Standards
**Project-Specific Rules & Patterns**

Version: 1.0 | Date: February 7, 2026 | Mandatory for ALL code

---

## 📖 TABLE OF CONTENTS

1. [Introduction](#introduction)
2. [Banned Patterns (Auto-Reject)](#banned-patterns)
3. [Required Patterns (Auto-Check)](#required-patterns)
4. [SilverCart-Specific Rules](#silvercart-specific-rules)
5. [File Structure Standards](#file-structure-standards)
6. [Naming Conventions](#naming-conventions)
7. [Import Standards](#import-standards)
8. [Component Patterns](#component-patterns)
9. [State Management Patterns](#state-management-patterns)
10. [Error Handling Standards](#error-handling-standards)
11. [Accessibility Standards](#accessibility-standards)
12. [Performance Standards](#performance-standards)
13. [Auto-Fix Suggestions](#auto-fix-suggestions)

---

## 1. INTRODUCTION

This document defines the **coding standards** for the SilverCart project. These are **mandatory rules** that apply to every file created. Violations should be caught by automated code review before committing.

### Why These Standards Matter:
- **Target users are 60+** - Accessibility is non-negotiable
- **SDK 54 New Architecture** - Old patterns break or perform poorly
- **Individual project** - Consistency prevents debugging nightmares
- **Academic deadline** - No time to refactor bad code later

### Severity Levels:
- 🚫 **BANNED** - Auto-reject, code will not work or breaks UX
- ✅ **REQUIRED** - Auto-check, missing these causes bugs
- 📋 **RECOMMENDED** - Best practice, fix before committing

---

## 2. BANNED PATTERNS (Auto-Reject)

### 🚫 NEVER USE THESE (Code Review Fails Immediately)

#### 2.1 Banned Components

```typescript
// ❌ BANNED - Does not work properly on SDK 54 Fabric
import { TouchableOpacity } from 'react-native';

<TouchableOpacity onPress={handlePress}>
  <Text>Button</Text>
</TouchableOpacity>

// ✅ REQUIRED - Use Pressable instead
import { Pressable } from 'react-native';

<Pressable 
  onPress={handlePress}
  hitSlop={8}
  android_ripple={{ color: 'rgba(0,0,0,0.15)' }}
>
  <Text>Button</Text>
</Pressable>
```

**Why:** `TouchableOpacity` doesn't respect Android ripple effects on Fabric and has inconsistent hit area behavior. For elderly users with motor difficulties, this is a UX failure.

---

#### 2.2 Banned Animation API

```typescript
// ❌ BANNED - Bridges every frame back to JS (slow on Fabric)
import { Animated } from 'react-native';

const [fadeAnim] = useState(new Animated.Value(0));

Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 500,
  useNativeDriver: true, // Still bridges!
}).start();

// ✅ REQUIRED - Use Reanimated 2
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';

const opacity = useSharedValue(0);

// Trigger animation
opacity.value = withTiming(1, { duration: 500 });

// Use in JSX
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

<Animated.View style={animatedStyle}>
  {/* content */}
</Animated.View>
```

**Why:** Old `Animated` API bridges every frame to JS thread on Fabric, causing jank. Reanimated 2 runs entirely on UI thread (60fps guaranteed).

---

#### 2.3 Banned Colors (Hardcoded Values)

```typescript
// ❌ BANNED - Pure white and pure black
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // Pure white - BANNED
    backgroundColor: 'white',    // Pure white - BANNED
    backgroundColor: '#FFF',     // Pure white - BANNED
  },
  text: {
    color: '#000000', // Pure black - BANNED
    color: 'black',   // Pure black - BANNED
    color: '#000',    // Pure black - BANNED
  },
  button: {
    backgroundColor: '#007A6A', // Hardcoded - BANNED
  },
});

// ✅ REQUIRED - Use theme colors
import { colors } from '@/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight, // #F9F8F2 (eggshell)
  },
  text: {
    color: colors.textMain, // #1A1A1A (off-black)
  },
  button: {
    backgroundColor: colors.primary, // #007A6A (teal)
  },
});
```

**Why:** 
- Pure white (#FFF) is too harsh for elderly eyes - use soft eggshell (#F9F8F2)
- Pure black (#000) is too harsh - use off-black (#1A1A1A)
- Hardcoded colors prevent theming and create inconsistencies

---

#### 2.4 Banned Font Sizes (Too Small)

```typescript
// ❌ BANNED - Font sizes below 18pt for body text
const styles = StyleSheet.create({
  bodyText: {
    fontSize: 14, // Too small for elderly users
    fontSize: 16, // Still too small
  },
  button: {
    fontSize: 16, // Too small for button text
  },
});

// ✅ REQUIRED - Minimum 18pt for body, 20pt for buttons
import { fontSize } from '@/theme';

const styles = StyleSheet.create({
  bodyText: {
    fontSize: fontSize.body, // 18pt minimum
  },
  button: {
    fontSize: fontSize.button, // 20pt
  },
  heading: {
    fontSize: fontSize.h1, // 32pt
  },
});
```

**Exception:** Only labels (12pt) are allowed to be smaller than 18pt, and they must be uppercase and bold.

```typescript
// ✅ ALLOWED - Small labels (12pt) only if uppercase + bold
const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.label, // 12pt
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.primary,
  },
});
```

**Why:** Elderly users (60+) have vision impairment. 18pt is the minimum readable size based on accessibility research.

---

#### 2.5 Banned Touch Targets (Too Small)

```typescript
// ❌ BANNED - Touch targets below 60x60dp
const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 44, // Standard iOS height - TOO SMALL for elderly
  },
  iconButton: {
    width: 48,
    height: 48, // Standard Material Design - TOO SMALL
  },
});

// ✅ REQUIRED - Minimum 60x60dp for ALL interactive elements
const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 60, // Minimum for elderly users
  },
  iconButton: {
    width: 60,
    height: 60, // Minimum for elderly users
  },
  quantityButton: {
    width: 64,
    height: 64, // Even larger for precision tapping
  },
});
```

**Why:** Users with arthritis and trembling hands need larger touch targets. 60x60dp is the minimum for reliable tapping.

---

#### 2.6 Banned Import Patterns

```typescript
// ❌ BANNED - Relative imports (hard to refactor)
import { colors } from '../../theme/colors';
import { Button } from '../../components/common/Button';

// ✅ REQUIRED - Absolute imports with @ alias
import { colors } from '@/theme/colors';
import { Button } from '@/components/common/Button';
```

**Why:** Relative imports break when moving files. Absolute imports with `@` alias are maintainable.

---

#### 2.7 Banned Voice Listener Pattern (SDK 54)

```typescript
// ❌ BANNED - Direct event assignment without cleanup
useEffect(() => {
  Voice.onSpeechStart = handleStart;
  Voice.onSpeechEnd = handleEnd;
  // Missing cleanup and destroy before init
}, []);

// ✅ REQUIRED - Proper cleanup with useCallback
const handleStart = useCallback(() => {
  setIsListening(true);
}, []);

const handleEnd = useCallback(() => {
  setIsListening(false);
}, []);

useEffect(() => {
  const init = async () => {
    await Voice.destroy(); // CRITICAL - destroy first!
    Voice.onSpeechStart = handleStart;
    Voice.onSpeechEnd = handleEnd;
  };
  init();

  return () => {
    Voice.destroy();
    Voice.removeAllListeners();
  };
}, [handleStart, handleEnd]);
```

**Why:** Fabric's memory model unmounts/remounts components aggressively. Without proper cleanup, you get stale listeners and memory leaks.

---

## 3. REQUIRED PATTERNS (Auto-Check)

### ✅ ALWAYS INCLUDE THESE

#### 3.1 SafeAreaView for Main Screens

```typescript
// ✅ REQUIRED - All main screens must wrap in SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      {/* Screen content */}
    </SafeAreaView>
  );
}
```

**Required for these 12 screens:**
- B1 (Home), B2 (Cart), B3 (Orders), B4 (Profile)
- D1 (Category), D2 (Search), E1 (Product Detail)
- G1, G2, G3 (Checkout steps), G4 (Confirmation)
- H1 (Order Detail), C1 (Voice Search)

**Why:** `edgeToEdgeEnabled: true` in app.json means content renders behind status bar without SafeAreaView.

---

#### 3.2 Pressable with hitSlop

```typescript
// ✅ REQUIRED - All interactive elements need hitSlop
<Pressable
  onPress={handlePress}
  hitSlop={8} // REQUIRED - adds 8dp padding around tap area
  style={({ pressed }) => [
    styles.button,
    pressed && { opacity: 0.9 }
  ]}
>
  <Text>Button Text</Text>
</Pressable>
```

**Why:** hitSlop extends the tap area beyond the visual bounds, making it easier for elderly users with motor difficulties to tap accurately.

---

#### 3.3 Error Handling for All Async Operations

```typescript
// ✅ REQUIRED - All async operations need try-catch
const handleSubmit = async () => {
  setLoading(true);
  setError(null); // Clear previous errors
  
  try {
    const { data, error } = await submitForm();
    
    if (error) {
      setError('Could not submit form. Please try again.');
      return;
    }
    
    // Success handling
    navigation.navigate('Success');
  } catch (err) {
    setError('Something went wrong. Please check your connection.');
    console.error('Submit error:', err);
  } finally {
    setLoading(false);
  }
};
```

**Why:** Network failures, API errors, and validation errors must be handled gracefully with user-friendly messages.

---

#### 3.4 Loading States for Buttons

```typescript
// ✅ REQUIRED - Buttons must show loading state
const [loading, setLoading] = useState(false);

<Pressable
  onPress={handleSubmit}
  disabled={loading} // Prevent double-tap
  style={[styles.button, loading && styles.buttonDisabled]}
>
  {loading ? (
    <ActivityIndicator size="small" color={colors.white} />
  ) : (
    <Text style={styles.buttonText}>Submit</Text>
  )}
</Pressable>

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
```

**Why:** Visual feedback prevents users from tapping multiple times and wondering if button worked.

---

#### 3.5 TypeScript Types for Props

```typescript
// ✅ REQUIRED - All components need prop types
interface ProductCardProps {
  product: Product;
  onPress: () => void;
  showPrice?: boolean; // Optional props marked with ?
}

export default function ProductCard({ 
  product, 
  onPress, 
  showPrice = true // Default value
}: ProductCardProps) {
  return (
    <Pressable onPress={onPress}>
      {/* Component content */}
    </Pressable>
  );
}
```

**Why:** TypeScript catches prop errors at compile time, preventing runtime crashes.

---

#### 3.6 Cleanup in useEffect

```typescript
// ✅ REQUIRED - All subscriptions/listeners need cleanup
useEffect(() => {
  // Setup subscription
  const subscription = supabase
    .from('orders')
    .on('*', handleOrderUpdate)
    .subscribe();

  // REQUIRED - Cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

**Why:** Without cleanup, subscriptions continue after component unmounts, causing memory leaks and stale state updates.

---

## 4. SILVERCART-SPECIFIC RULES

### 📋 Project-Specific Patterns (Beyond General Best Practices)

#### 4.1 Price Display Rule

```typescript
// 📋 SILVERCART RULE - Prices ALWAYS use success green, never primary
const styles = StyleSheet.create({
  price: {
    fontSize: 30, // Large and prominent
    fontWeight: '700',
    color: colors.success, // #2D6A4F (GREEN) - NOT primary teal!
  },
});
```

**Why:** Design system decision - prices in green create visual separation from other UI elements and associate with "positive" action (buying).

---

#### 4.2 Button Shape Rule

```typescript
// 📋 SILVERCART RULE - All buttons MUST be pill-shaped
const styles = StyleSheet.create({
  primaryButton: {
    height: 60,
    borderRadius: 30, // ALWAYS half of height for perfect pill
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    height: 60,
    borderRadius: 30, // Even outlined buttons use pill shape
    borderWidth: 4,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
});
```

**Why:** Consistent pill-shape across all buttons creates visual unity and is easier for elderly users to recognize as "tappable".

---

#### 4.3 Modal Close Button Rule

```typescript
// 📋 SILVERCART RULE - All modals MUST have large, obvious close button
function MyModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* REQUIRED - Close button top right, 60x60dp minimum */}
        <Pressable 
          onPress={onClose}
          hitSlop={8}
          style={styles.closeButton}
        >
          <Icon name="close" size={32} color={colors.textMain} />
        </Pressable>
        
        {/* Modal content */}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
```

**Why:** Elderly users may panic if they can't find how to close a modal. Large, obvious close button in consistent position reduces anxiety.

---

#### 4.4 Form Validation Display Rule

```typescript
// 📋 SILVERCART RULE - Validation errors shown in RED below input
function MyForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={[styles.input, error && styles.inputError]}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputError: {
    borderWidth: 2,
    borderColor: colors.alert, // Red border
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.alert, // Red text
    marginTop: 4,
  },
});
```

**Why:** Consistent error display pattern helps users understand what went wrong and how to fix it.

---

#### 4.5 Quantity Selector Pattern

```typescript
// 📋 SILVERCART RULE - Quantity controls ALWAYS large +/- buttons, no manual input
function QuantitySelector({ quantity, onIncrement, onDecrement, min = 1, max = 99 }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrement}
        disabled={quantity <= min}
        hitSlop={8}
        style={[
          styles.button,
          styles.buttonMinus,
          quantity <= min && styles.buttonDisabled
        ]}
      >
        <Icon name="remove" size={32} color={colors.textMain} />
      </Pressable>

      <Text style={styles.quantity}>{quantity}</Text>

      <Pressable
        onPress={onIncrement}
        disabled={quantity >= max}
        hitSlop={8}
        style={[
          styles.button,
          styles.buttonPlus,
          quantity >= max && styles.buttonDisabled
        ]}
      >
        <Icon name="add" size={32} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonMinus: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  buttonPlus: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  quantity: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textMain,
    minWidth: 60,
    textAlign: 'center',
  },
});
```

**Why:** Manual number input is error-prone for elderly users. Large +/- buttons are foolproof and prevent invalid quantities.

---

#### 4.6 Floating Action Button (Voice Mic) Pattern

```typescript
// 📋 SILVERCART RULE - Voice mic is ALWAYS floating bottom-right, 80x80dp
function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Screen content */}
      
      {/* REQUIRED - Floating voice button */}
      <Pressable
        onPress={handleVoiceSearch}
        hitSlop={8}
        style={styles.floatingMic}
      >
        <Icon name="mic" size={40} color={colors.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  floatingMic: {
    position: 'absolute',
    bottom: 90, // Above tab bar (70) + spacing (20)
    right: 24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});
```

**Why:** Consistent position helps users find voice search quickly. Floating above tab bar ensures it's always accessible.

---

## 5. FILE STRUCTURE STANDARDS

### 📁 Every File Must Be in Correct Location

```
src/
├── screens/           # Full-screen components (one per route)
│   ├── auth/         # Authentication screens (A1-A4a)
│   ├── main/         # Main tab screens (B1-B4)
│   ├── products/     # Product browsing (D1, D2, E1)
│   ├── checkout/     # Checkout flow (G1-G4)
│   ├── orders/       # Order management (H1, I6)
│   ├── profile/      # Profile & settings (I2-I7)
│   └── special/      # Onboarding, safety, error (A5-A8, J1, J3)
│
├── components/        # Reusable UI components
│   ├── common/       # Buttons, inputs, cards, badges
│   ├── cart/         # Cart-specific components
│   ├── products/     # Product cards, grids
│   └── feedback/     # Loading, errors, toasts
│
├── navigation/        # Navigation configuration
│   ├── types.ts      # TypeScript navigation types
│   ├── AppNavigator.tsx
│   ├── AuthStack.tsx
│   └── MainTabs.tsx
│
├── services/          # API calls and business logic
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── products.service.ts
│   └── voice.service.ts
│
├── contexts/          # React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
│
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   └── useProducts.ts
│
├── theme/             # Design system values
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── index.ts
│
└── utils/             # Helper functions
    ├── constants.ts
    ├── validation.ts
    └── formatting.ts
```

**Rule:** If file location doesn't match this structure, move it before committing.

---

## 6. NAMING CONVENTIONS

### Component Files
```typescript
// ✅ CORRECT - PascalCase for components
ProductCard.tsx
HomeScreen.tsx
Button.tsx
CartItem.tsx

// ❌ WRONG
productCard.tsx
home-screen.tsx
button.tsx
```

### Hook Files
```typescript
// ✅ CORRECT - camelCase starting with 'use'
useAuth.ts
useProducts.ts
useCart.ts

// ❌ WRONG
UseAuth.ts
auth.ts (missing 'use')
use-products.ts
```

### Service Files
```typescript
// ✅ CORRECT - camelCase with .service suffix
auth.service.ts
products.service.ts
cart.service.ts

// ❌ WRONG
AuthService.ts
auth.ts (missing .service)
products-service.ts
```

### Utility Files
```typescript
// ✅ CORRECT - camelCase, descriptive
validation.ts
formatting.ts
constants.ts

// ❌ WRONG
Validation.ts
utils.ts (too generic)
helper.ts (too generic)
```

### Style Objects
```typescript
// ✅ CORRECT - camelCase for style names
const styles = StyleSheet.create({
  container: { ... },
  primaryButton: { ... },
  errorText: { ... },
});

// ❌ WRONG
const styles = StyleSheet.create({
  Container: { ... }, // PascalCase
  'primary-button': { ... }, // kebab-case
  error_text: { ... }, // snake_case
});
```

---

## 7. IMPORT STANDARDS

### Import Order
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, Pressable } from 'react-native';

// 3. Third-party library imports
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue } from 'react-native-reanimated';

// 4. Local imports (use @ alias, grouped by type)
import { colors, spacing, fontSize } from '@/theme';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { ProductsService } from '@/services/products.service';
import { Product } from '@/types/product.types';

// 5. Type imports (if needed separately)
import type { HomeScreenProps } from '@/navigation/types';
```

### Absolute vs Relative Imports
```typescript
// ✅ CORRECT - Use @ alias for all local imports
import { colors } from '@/theme/colors';
import { Button } from '@/components/common/Button';

// ❌ WRONG - Never use relative imports
import { colors } from '../../theme/colors';
import { Button } from '../../components/common/Button';
```

---

## 8. COMPONENT PATTERNS

### Functional Component Structure
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '@/theme';

// 1. TypeScript interface
interface MyComponentProps {
  title: string;
  onPress: () => void;
  isActive?: boolean;
}

// 2. Component function
export default function MyComponent({ 
  title, 
  onPress, 
  isActive = false 
}: MyComponentProps) {
  // 3. State hooks
  const [loading, setLoading] = useState(false);

  // 4. Effect hooks
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, []);

  // 5. Event handlers
  const handlePress = async () => {
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  // 6. Render helpers (if needed)
  const renderContent = () => {
    if (loading) return <Text>Loading...</Text>;
    return <Text>{title}</Text>;
  };

  // 7. Return JSX
  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.button}>
        {renderContent()}
      </Pressable>
    </View>
  );
}

// 8. Styles (always at bottom)
const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
  },
  button: {
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## 9. STATE MANAGEMENT PATTERNS

### Context Pattern
```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState, useMemo } from 'react';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    // Implementation
  };

  const signOut = async () => {
    // Implementation
  };

  // CRITICAL - Memoize context value to prevent re-renders
  const value = useMemo(
    () => ({ user, signIn, signOut }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 10. ERROR HANDLING STANDARDS

### Service Layer Error Handling
```typescript
// ✅ CORRECT - Return { data, error } tuple
export async function getProducts(category?: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { 
      data: null, 
      error: 'Something went wrong. Please try again.' 
    };
  }
}

// ❌ WRONG - Throwing errors (hard to handle in components)
export async function getProducts(category?: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);

  if (error) throw error; // Don't throw!
  return data;
}
```

### Component Error Handling
```typescript
// ✅ CORRECT - Display user-friendly errors
function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await getProducts();

    if (error) {
      setError('Could not load products. Please check your connection.');
      setLoading(false);
      return;
    }

    setProducts(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadProducts} />;
  if (products.length === 0) return <EmptyState />;

  return (
    <FlatList data={products} renderItem={renderProduct} />
  );
}
```

---

## 11. ACCESSIBILITY STANDARDS

### Contrast Requirements
```typescript
// ✅ CORRECT - WCAG AAA compliant (7:1 minimum)
const styles = StyleSheet.create({
  text: {
    color: colors.textMain, // #1A1A1A on #F9F8F2 = 13.3:1 ✓
  },
  button: {
    backgroundColor: colors.primary, // #007A6A on white = 7.1:1 ✓
  },
});

// ❌ WRONG - Poor contrast
const styles = StyleSheet.create({
  text: {
    color: '#999999', // Too light on #F9F8F2
  },
});
```

### Touch Target Sizing
```typescript
// ✅ CORRECT - Minimum 60x60dp for elderly users
const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 60, // Minimum
  },
  iconButton: {
    width: 60, // Minimum
    height: 60,
  },
});
```

### Accessible Labels
```typescript
// ✅ CORRECT - Always include accessible labels
<Pressable 
  onPress={handleClose}
  accessibilityLabel="Close modal"
  accessibilityRole="button"
>
  <Icon name="close" size={32} />
</Pressable>

// ❌ WRONG - Icon without label (screen reader can't read it)
<Pressable onPress={handleClose}>
  <Icon name="close" size={32} />
</Pressable>
```

---

## 12. PERFORMANCE STANDARDS

### List Rendering
```typescript
// ✅ CORRECT - Use FlatList with proper optimization
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>

// ❌ WRONG - Using .map() (re-renders all items)
<ScrollView>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</ScrollView>
```

### Memoization
```typescript
// ✅ CORRECT - Memoize expensive renders
const ProductCard = React.memo(({ product, onPress }) => {
  return (
    <Pressable onPress={() => onPress(product.id)}>
      {/* Card content */}
    </Pressable>
  );
});

// ✅ CORRECT - Memoize callbacks
const handlePress = useCallback((id: string) => {
  navigation.navigate('ProductDetail', { id });
}, [navigation]);
```

---

## 13. AUTO-FIX SUGGESTIONS

### Simple Replacements (Can Be Auto-Fixed)

| Find | Replace With | Reason |
|------|-------------|---------|
| `TouchableOpacity` | `Pressable` | SDK 54 requirement |
| `backgroundColor: '#FFFFFF'` | `backgroundColor: colors.backgroundLight` | Never pure white |
| `backgroundColor: 'white'` | `backgroundColor: colors.backgroundLight` | Never pure white |
| `color: '#000000'` | `color: colors.textMain` | Never pure black |
| `color: 'black'` | `color: colors.textMain` | Never pure black |
| `import { Animated }` | `import Animated, { ... } from 'react-native-reanimated'` | SDK 54 requirement |
| `fontSize: 14` (in body text) | `fontSize: fontSize.body` (18pt) | Elderly readability |
| `height: 44` (in buttons) | `height: 60` | Minimum touch target |
| `../../theme/colors` | `@/theme/colors` | Absolute imports |

### Complex Issues (Report Only, Manual Fix Required)

- Missing SafeAreaView on required screens
- Missing error handling in async functions
- Missing cleanup in useEffect
- Missing TypeScript types
- Logic errors
- Architectural issues

---

## 📚 RELATED DOCUMENTS

When you need more context:
- **DESIGN_SYSTEM.md** - Visual specifications
- **SILVERCART_CODE_REVIEW_CHECKLIST.md** - Quick checklist
- **PROJECT_STRUCTURE_AND_ARCHITECTURE.md** - File organization
- **SilverCart_SDK54_Architecture_Conflicts.md** - SDK 54 specific issues

---

**Last Updated:** February 7, 2026  
**Version:** 1.0  
**For:** SilverCart Mobile App (Expo SDK 54)
