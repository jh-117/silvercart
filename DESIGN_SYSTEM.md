# SilverCart Design System Reference
**Extracted from UI Mockups - February 4, 2026**

> **CRITICAL:** Use this design system for ALL screen implementations. Every component, color, spacing, and typography value must match these specifications exactly.

---

## 🎨 COLOR PALETTE

### Primary Colors
```javascript
const colors = {
  // Primary Brand Colors
  primary: '#007A6A',      // Teal (main brand color)
  secondary: '#2D6A4F',    // Emerald/Success green
  
  // Background Colors
  backgroundLight: '#F9F8F2',  // Eggshell (off-white, soft cream)
  backgroundDark: '#0f2311',   // Dark mode background
  
  // Text Colors
  textMain: '#1A1A1A',     // Off-black (not pure black)
  textMuted: '#658086',    // Muted gray for secondary text
  
  // Status Colors
  alert: '#D90429',        // Red for errors/alerts
  success: '#2D6A4F',      // Green for success states
  
  // UI Colors
  white: '#FFFFFF',
  cardWhite: '#FFFFFF',
  borderLight: '#E5E5E5',
  borderGray: 'rgba(0,0,0,0.1)',
};
```

### Color Usage Rules
- **Primary (#007A6A):** Main CTAs, active states, icons, focus states
- **Secondary/Success (#2D6A4F):** Success buttons, positive feedback, prices
- **Alert (#D90429):** Errors, warnings, delete actions, logout
- **Background (#F9F8F2):** Screen backgrounds (never pure white #FFF)
- **Text Main (#1A1A1A):** Primary text (never pure black #000)
- **Text Muted (#658086):** Secondary text, descriptions, hints

---

## 📝 TYPOGRAPHY

### Font Family
```javascript
fontFamily: {
  primary: 'Plus Jakarta Sans',  // From design kit HTML
  fallback: 'system-ui, -apple-system, sans-serif'
}
```

### Font Sizes (Elderly-Optimized)
```javascript
fontSize: {
  // Headers
  h1: 32,        // Screen titles, order numbers, prices
  h2: 24,        // Section headers
  h3: 22,        // Card titles
  
  // Body
  bodyLarge: 20, // Body text, descriptions
  body: 18,      // Standard text (minimum for elderly)
  
  // UI Elements
  button: 20,    // Button text (bold)
  input: 18,     // Input field text
  label: 12,     // Small labels (uppercase, bold)
  caption: 14,   // Very small text (use sparingly)
  
  // Navigation
  tabLabel: 12,  // Bottom tab text
  tabIcon: 32,   // Bottom tab icons (material symbols)
}
```

### Font Weights
```javascript
fontWeight: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

### Typography Styles (React Native)
```javascript
const typography = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 38,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 30,
  },
  h3: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 28,
  },
  bodyLarge: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 28,
  },
  body: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 26,
  },
  bodyMuted: {
    fontSize: 18,
    fontWeight: '400',
    color: '#658086',
    lineHeight: 26,
  },
  button: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007A6A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
```

---

## 🔲 SPACING & LAYOUT

### Spacing Scale
```javascript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,   // Standard padding/margin
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
}
```

### Container Padding
```javascript
containerPadding: {
  horizontal: 16,  // Screen edges
  vertical: 16,    // Top/bottom
  section: 24,     // Between major sections
}
```

### Touch Targets (Critical for Elderly)
```javascript
touchTargets: {
  minimum: 60,     // Minimum height for any tappable element
  button: 60,      // Standard button height
  input: 60,       // Input field height
  icon: 48,        // Icon button minimum
  tabBar: 70,      // Bottom tab bar height
  navIcon: 32,     // Navigation icon size
}
```

---

## 🎯 BUTTONS

### Primary Button (Filled)
```javascript
// Used for: Main CTAs (Checkout, Add to Cart, Submit)
<Pressable style={styles.buttonPrimary}>
  <Text style={styles.buttonText}>Primary Action</Text>
</Pressable>

const styles = StyleSheet.create({
  buttonPrimary: {
    backgroundColor: '#007A6A',
    height: 60,
    borderRadius: 30,        // Fully rounded (pill shape)
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
```

### Success Button (Filled Green)
```javascript
// Used for: Confirm, Complete, Success actions
buttonSuccess: {
  backgroundColor: '#2D6A4F',  // Emerald green
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 24,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 4,
}
```

### Secondary Button (Outlined)
```javascript
// Used for: Cancel, Back, Alternative actions
buttonSecondary: {
  backgroundColor: 'transparent',
  borderWidth: 4,              // Thick border for visibility
  borderColor: '#007A6A',
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 24,
}
buttonTextSecondary: {
  fontSize: 20,
  fontWeight: '700',
  color: '#007A6A',
}
```

### Icon Button (Circular)
```javascript
// Used for: Quantity +/-, Close, Edit
iconButton: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#007A6A',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 3,
}
```

### Button States (Pressable)
```javascript
<Pressable
  style={({ pressed }) => [
    styles.buttonPrimary,
    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
  ]}
  hitSlop={8}  // Extra tap area
>
```

---

## 📥 INPUT FIELDS

### Default Input
```javascript
inputDefault: {
  height: 60,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5E5E5',
  borderRadius: 16,          // Rounded corners (not pill)
  paddingHorizontal: 20,
  fontSize: 18,
  fontWeight: '400',
  color: '#1A1A1A',
}
```

### Focused Input
```javascript
inputFocused: {
  borderWidth: 2,
  borderColor: '#007A6A',
  backgroundColor: '#FFFFFF',
}
```

### Error Input
```javascript
inputError: {
  borderWidth: 2,
  borderColor: '#D90429',
  backgroundColor: '#FFFFFF',
}
errorText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#D90429',
  marginTop: 4,
  paddingHorizontal: 4,
}
```

### Success Input (with checkmark)
```javascript
inputSuccess: {
  borderWidth: 1,
  borderColor: '#2D6A4F',
  backgroundColor: '#FFFFFF',
}
// Add checkmark icon positioned absolutely at right: 16
```

### Input Labels
```javascript
inputLabel: {
  fontSize: 12,
  fontWeight: '700',
  color: '#007A6A',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 8,
  paddingHorizontal: 4,
}
```

---

## 🎴 CARDS & CONTAINERS

### Product Card
```javascript
productCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.05)',
}
productImage: {
  width: '100%',
  height: 192,    // Fixed height
  backgroundColor: '#F5F5F5',
}
productContent: {
  padding: 16,
}
productTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: '#1A1A1A',
  marginBottom: 4,
}
productDescription: {
  fontSize: 18,
  fontWeight: '400',
  color: '#658086',
  marginBottom: 12,
}
productPrice: {
  fontSize: 30,
  fontWeight: '700',
  color: '#2D6A4F',  // Success green for prices
}
```

### Menu Card (Profile Screen)
```javascript
menuCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 88,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 1,
  borderWidth: 1,
  borderColor: '#F0F0F0',
}
menuIconContainer: {
  width: 56,
  height: 56,
  borderRadius: 12,
  backgroundColor: 'rgba(0,122,106,0.1)',  // primary/10
  justifyContent: 'center',
  alignItems: 'center',
}
```

### Trust Badge Card
```javascript
trustBadge: {
  backgroundColor: 'rgba(0,122,106,0.1)',
  borderWidth: 2,
  borderColor: 'rgba(0,122,106,0.2)',
  borderRadius: 12,
  padding: 20,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
}
```

---

## 🧮 QUANTITY SELECTOR

```javascript
quantityContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 32,
  justifyContent: 'center',
  paddingVertical: 24,
}
quantityButton: {
  width: 64,
  height: 64,
  borderRadius: 32,
  justifyContent: 'center',
  alignItems: 'center',
}
quantityButtonMinus: {
  backgroundColor: '#F5F5F5',
  borderWidth: 2,
  borderColor: '#E0E0E0',
}
quantityButtonPlus: {
  backgroundColor: '#007A6A',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 3,
}
quantityText: {
  fontSize: 36,
  fontWeight: '700',
  color: '#1A1A1A',
}
```

---

## 📱 BOTTOM TAB BAR

```javascript
tabBarStyle: {
  height: 70,
  paddingBottom: 10,
  paddingTop: 10,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E5E5',
}
tabBarLabelStyle: {
  fontSize: 12,
  fontWeight: '700',
  marginTop: 4,
}
tabBarIconSize: 32,  // Material icons
tabBarActiveTintColor: '#007A6A',
tabBarInactiveTintColor: '#999999',
```

### Tab Icons (Material Symbols)
- Home: `home` / `home-outline`
- Cart: `shopping_cart` / `shopping_cart_outline`
- Orders: `receipt_long` / `list-outline`
- Profile: `person` / `person-outline`

---

## 🎪 FLOATING ACTION BUTTON (Voice Mic)

```javascript
floatingMic: {
  position: 'absolute',
  bottom: 90,      // Above tab bar (70 + 20 spacing)
  right: 24,
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#007A6A',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 8,
}
floatingMicRing: {
  position: 'absolute',
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: 'rgba(0,122,106,0.2)',
  top: -8,
  left: -8,
}
micIconSize: 40,
```

---

## 🎯 STATUS BADGES (Pills)

```javascript
badgeContainer: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 16,
  alignSelf: 'flex-start',
}
badgePending: {
  backgroundColor: '#FFF3E0',  // Light orange
}
badgeShipped: {
  backgroundColor: '#E0F2F1',  // Light teal
}
badgeDelivered: {
  backgroundColor: '#E8F5E9',  // Light green
}
badgeCancelled: {
  backgroundColor: '#FFEBEE',  // Light red
}
badgeText: {
  fontSize: 14,
  fontWeight: '700',
  textTransform: 'uppercase',
}
badgeTextPending: {
  color: '#E65100',
}
badgeTextShipped: {
  color: '#007A6A',
}
badgeTextDelivered: {
  color: '#2D6A4F',
}
badgeTextCancelled: {
  color: '#D90429',
}
```

---

## 🎨 BORDER RADIUS SCALE

```javascript
borderRadius: {
  none: 0,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  pill: 9999,  // Fully rounded (buttons)
  circle: '50%', // Perfect circle (icons)
}
```

### Usage
- **Buttons:** `pill` (30 for height 60)
- **Cards:** `md` (16)
- **Inputs:** `md` (16)
- **Icon Buttons:** `circle` or half of width/height
- **Product Images:** `md` (16)

---

## 🌑 SHADOWS & ELEVATION

```javascript
shadows: {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}
```

### Usage
- **Cards:** `md`
- **Buttons (Primary):** `lg`
- **Floating Mic:** `xl`
- **Modals:** `xl`

---

## 🖼️ SCREEN LAYOUTS

### Standard Screen Structure
```javascript
<SafeAreaView style={styles.container}>
  {/* Header */}
  <View style={styles.header}>
    <Pressable style={styles.backButton}>
      <Icon name="arrow-back" />
    </Pressable>
    <Text style={styles.headerTitle}>Screen Title</Text>
    <View style={{ width: 48 }} /> {/* Spacer for centering */}
  </View>

  {/* Content */}
  <ScrollView style={styles.content}>
    {/* Screen content */}
  </ScrollView>

  {/* Optional: Bottom Fixed Button */}
  <View style={styles.bottomButton}>
    <Pressable style={styles.buttonPrimary}>
      <Text style={styles.buttonText}>Action</Text>
    </Pressable>
  </View>
</SafeAreaView>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(249,248,242,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bottomButton: {
    padding: 16,
    backgroundColor: '#F9F8F2',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
```

---

## 📐 COMPONENT SIZING REFERENCE

### From Mockups Analysis

**Welcome Screen (A1):**
- Logo circle: 200x200
- Tagline: 20pt regular
- Main heading: 32pt bold
- Subtitle: 18pt medium
- Button gap: 16
- Buttons: Height 60, full width - 32 horizontal padding
- "Already have account" link: 18pt, underlined, teal color

**Onboarding Slides (A8):**
- Illustration area: 60% of screen height
- Heading: 32pt bold
- Description: 18pt regular
- Page indicators: 8x8 dots, 8 spacing, active = primary color
- Next button: Height 60, width 200, pill shape
- Skip button: Text only, top right, 18pt

**Profile Screen (B4):**
- Avatar: 144x144 (large circle)
- Name: 30pt bold
- Subtitle: 18pt medium, muted color
- Menu items: Min height 88
- Icon container: 56x56, rounded 12
- Gap between items: 12

**Product Card:**
- Image: Full width, height 192
- Title: 24pt bold
- Description: 18pt regular, muted
- Price: 30pt bold, success color
- Add button: Height 48, rounded pill

---

## 🎨 FULL COMPONENT LIBRARY

### Complete StyleSheet Template

```javascript
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007A6A',
  secondary: '#2D6A4F',
  backgroundLight: '#F9F8F2',
  backgroundDark: '#0f2311',
  textMain: '#1A1A1A',
  textMuted: '#658086',
  alert: '#D90429',
  success: '#2D6A4F',
  white: '#FFFFFF',
  borderLight: '#E5E5E5',
  borderGray: 'rgba(0,0,0,0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  pill: 9999,
};

export const typography = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: '700', color: colors.textMain, lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '700', color: colors.textMain, lineHeight: 30 },
  h3: { fontSize: 22, fontWeight: '700', color: colors.textMain, lineHeight: 28 },
  bodyLarge: { fontSize: 20, fontWeight: '500', color: colors.textMain, lineHeight: 28 },
  body: { fontSize: 18, fontWeight: '400', color: colors.textMain, lineHeight: 26 },
  bodyMuted: { fontSize: 18, fontWeight: '400', color: colors.textMuted, lineHeight: 26 },
  button: { fontSize: 20, fontWeight: '700', color: colors.white },
  label: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
});

export const components = StyleSheet.create({
  // Buttons
  buttonPrimary: {
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
    height: 60,
    borderRadius: borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: colors.primary,
    height: 60,
    borderRadius: borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  // Inputs
  input: {
    height: 60,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    fontWeight: '400',
    color: colors.textMain,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  inputError: {
    borderWidth: 2,
    borderColor: colors.alert,
  },
  
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
});
```

---

## ⚠️ CRITICAL RULES

1. **NEVER use pure white (#FFFFFF) for screen backgrounds** - Always use `#F9F8F2` (eggshell)
2. **NEVER use pure black (#000000) for text** - Always use `#1A1A1A` (off-black)
3. **Minimum font size is 18pt** for body text (elderly readability)
4. **Minimum touch target is 60x60dp** for all interactive elements
5. **Always use pill-shaped buttons** (borderRadius: 30 for height 60)
6. **Prices always use success green** (#2D6A4F), never primary teal
7. **Icons always use Material Symbols Outlined** font
8. **Bottom tab bar height is always 70** (not 60)

---

**Last Updated:** February 4, 2026  
**Source:** SilverCart UI Mockups + Design System HTML  
**Status:** Design System Locked ✅
