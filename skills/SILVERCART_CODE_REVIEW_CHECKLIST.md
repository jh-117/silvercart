# SilverCart - Code Review Checklist
**Quick Reference Guide - Print This Out**

Version: 1.0 | Date: February 7, 2026 | Use for EVERY file created

---

## 🎯 BEFORE YOU WRITE ANY CODE

### Pre-Creation Checklist
- [ ] **Read the screen spec** from `SilverCart_Complete_Screen_Inventory.md`
- [ ] **Check design requirements** in `DESIGN_SYSTEM.md` for this component type
- [ ] **Verify file location** matches `PROJECT_STRUCTURE_AND_ARCHITECTURE.md`
- [ ] **Check if screen needs SafeAreaView** (see `SilverCart_SDK54_Build_Reminders.md`)
- [ ] **Review navigation flow** - which stack does this belong to?

---

## 📱 SCREEN FILES (`src/screens/**/*.tsx`)

### 🔴 CRITICAL (App-Breaking)
- [ ] **Wrapped in `SafeAreaView`** (if screen is in the 12-screen list)
  - B1 (Home), B2 (Cart), B3 (Orders), B4 (Profile)
  - D1 (Category), D2 (Search), E1 (Product Detail)
  - G1, G2, G3 (Checkout steps), G4 (Confirmation)
  - H1 (Order Detail), C1 (Voice Search)
- [ ] **First line of App.tsx** is `import 'react-native-gesture-handler';` (never move this)
- [ ] **Uses `Pressable`** instead of `TouchableOpacity`
- [ ] **Background color** is `colors.backgroundLight` (#F9F8F2) NOT white (#FFFFFF)

### 🟡 HIGH PRIORITY (Elderly UX-Breaking)
- [ ] **Minimum font size 18pt** for body text (use `fontSize.body` from theme)
- [ ] **All buttons minimum 60dp height** (use `height: 60` in styles)
- [ ] **All touch targets 60x60dp minimum** (buttons, icons, quantity controls)
- [ ] **All interactive elements have `hitSlop={8}`** (helps elderly users tap)
- [ ] **Text color** is `colors.textMain` (#1A1A1A) NOT pure black (#000000)
- [ ] **Prices** use `colors.success` (#2D6A4F) NOT primary teal
- [ ] **All buttons are pill-shaped** (`borderRadius: 30` for height 60)

### 🟢 MEDIUM PRIORITY (Code Quality)
- [ ] **Imports use `@/` alias** (e.g., `import { colors } from '@/theme'`)
- [ ] **Navigation types defined** (e.g., `ScreenNameProps` from `@/navigation/types`)
- [ ] **Loading state for async operations** (button shows spinner when loading)
- [ ] **Error handling with user-friendly messages** (no raw error objects shown)
- [ ] **No console.log statements** left in code
- [ ] **No hardcoded strings** (use constants for text that might be translated)

---

## 🧩 COMPONENT FILES (`src/components/**/*.tsx`)

### 🔴 CRITICAL
- [ ] **Uses `Pressable`** instead of `TouchableOpacity`
- [ ] **All colors from theme** (import from `@/theme/colors`)
- [ ] **PropTypes or TypeScript interface defined** at top of file

### 🟡 HIGH PRIORITY
- [ ] **Touch targets 60x60dp** for tappable elements
- [ ] **Font sizes use theme** (`fontSize.body`, `fontSize.h1`, etc.)
- [ ] **Spacing uses theme** (`spacing.base`, `spacing.lg`, etc.)
- [ ] **Component is reusable** (no hardcoded data, uses props)

### 🟢 MEDIUM PRIORITY
- [ ] **Default props provided** where applicable
- [ ] **Component exported as default** at bottom of file
- [ ] **Destructured props** in function signature
- [ ] **Meaningful variable names** (no `temp`, `data`, `item` without context)

---

## 🎨 STYLE CHECKS (All Files with Styles)

### 🔴 CRITICAL
- [ ] **No hardcoded colors** - ALL colors from `@/theme/colors`
  - ❌ `color: '#FFFFFF'` 
  - ✅ `color: colors.white`
- [ ] **No pure white** (#FFFFFF) for backgrounds - use `colors.backgroundLight` (#F9F8F2)
- [ ] **No pure black** (#000000) for text - use `colors.textMain` (#1A1A1A)

### 🟡 HIGH PRIORITY
- [ ] **Font sizes from theme** - use `fontSize.body`, `fontSize.h1`, etc.
- [ ] **Spacing from theme** - use `spacing.base`, `spacing.lg`, etc.
- [ ] **Border radius from theme** - use `borderRadius.md`, `borderRadius.pill`, etc.
- [ ] **Button styles match design system**:
  - Primary: `backgroundColor: colors.primary`, `borderRadius: 30`
  - Secondary: `borderWidth: 4`, `borderColor: colors.primary`
  - Success: `backgroundColor: colors.success`

### 🟢 MEDIUM PRIORITY
- [ ] **Styles defined in `StyleSheet.create()`** (not inline objects)
- [ ] **No magic numbers** (use constants or theme values)
- [ ] **Consistent naming** (camelCase for style names)

---

## 🔌 SERVICE FILES (`src/services/**/*.ts`)

### 🔴 CRITICAL
- [ ] **All async functions have try-catch** blocks
- [ ] **Errors returned as objects** `{ data, error }` (never throw)
- [ ] **No API keys hardcoded** (use `process.env.EXPO_PUBLIC_*`)
- [ ] **Supabase client imported correctly** from `@/services/supabase`

### 🟡 HIGH PRIORITY
- [ ] **TypeScript return types defined** for all functions
- [ ] **RLS policies considered** (which user can access this data?)
- [ ] **Input validation** before making API calls

### 🟢 MEDIUM PRIORITY
- [ ] **Functions are pure** (no side effects unless necessary)
- [ ] **Descriptive function names** (e.g., `getProductsByCategory` not `getProducts`)
- [ ] **JSDoc comments** for complex functions

---

## 🎣 HOOK FILES (`src/hooks/**/*.ts`)

### 🔴 CRITICAL
- [ ] **`useEffect` has cleanup** function in return (if subscribing to events)
- [ ] **Dependencies array is correct** (no missing dependencies)
- [ ] **No infinite loops** (useEffect that triggers itself)

### 🟡 HIGH PRIORITY
- [ ] **Returns object with clear names** (e.g., `{ data, loading, error, refetch }`)
- [ ] **Loading state tracked** for async operations
- [ ] **Error state tracked** for failures

### 🟢 MEDIUM PRIORITY
- [ ] **Hook name starts with `use`** (e.g., `useProducts`)
- [ ] **TypeScript return type defined**
- [ ] **Reusable across multiple components**

---

## 🎙️ VOICE-RELATED CODE (SDK 54 Specific)

### 🔴 CRITICAL
- [ ] **`Voice.destroy()` called BEFORE setting up listeners** (in useEffect init)
- [ ] **All event handlers wrapped in `useCallback`** (prevents stale closures)
- [ ] **Cleanup in `useEffect` return**:
  ```typescript
  return () => {
    Voice.destroy();
    Voice.removeAllListeners();
  };
  ```
- [ ] **Uses `Reanimated 2` for animations** (NOT old `Animated` API)

### 🟡 HIGH PRIORITY
- [ ] **Microphone button is 80x80dp** (large enough for elderly users)
- [ ] **Clear feedback during recording** (pulsing animation, "Listening..." text)
- [ ] **Error handling for permissions denied**

---

## 🎨 ANIMATION CODE (SDK 54 Specific)

### 🔴 CRITICAL
- [ ] **Uses `react-native-reanimated`** imports:
  ```typescript
  import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming 
  } from 'react-native-reanimated';
  ```
- [ ] **NO old `Animated` API**:
  - ❌ `import { Animated } from 'react-native';`
  - ❌ `new Animated.Value(1)`
  - ❌ `Animated.timing(...).start()`

### 🟡 HIGH PRIORITY
- [ ] **Animations are smooth** (no jank on low-end devices)
- [ ] **Animations are meaningful** (not just for show)

---

## 🔐 SECURITY CHECKS (All Files)

### 🔴 CRITICAL
- [ ] **No passwords or secrets in code** (even in comments)
- [ ] **API keys use environment variables** (`process.env.EXPO_PUBLIC_*`)
- [ ] **No API keys in Git history** (check `.gitignore`)
- [ ] **User data properly scoped** (RLS policies enforce access control)

### 🟡 HIGH PRIORITY
- [ ] **Input sanitized** before sending to API
- [ ] **No SQL injection risks** (use Supabase query builder, not raw SQL)
- [ ] **Authentication checked** before accessing protected routes

---

## ♿ ACCESSIBILITY CHECKS (All Screens)

### 🔴 CRITICAL
- [ ] **Contrast ratio WCAG AAA** (7:1 minimum)
  - Test with WebAIM Contrast Checker
  - Primary (#007A6A) on white = PASS
  - TextMain (#1A1A1A) on backgroundLight (#F9F8F2) = PASS
- [ ] **No information conveyed by color alone** (use text + icons)

### 🟡 HIGH PRIORITY
- [ ] **All interactive elements labeled** (buttons have text or accessible label)
- [ ] **Touch targets 60x60dp minimum**
- [ ] **Font sizes scale-friendly** (users can increase in settings)
- [ ] **No flashing content** (can trigger seizures)

---

## 📋 CONTEXT/STATE MANAGEMENT

### 🔴 CRITICAL
- [ ] **Context value memoized** (use `useMemo` to prevent re-renders)
- [ ] **No circular dependencies** (Context A doesn't import Context B which imports A)

### 🟡 HIGH PRIORITY
- [ ] **State updates are batched** (multiple setState calls together)
- [ ] **No prop drilling** (if passing props >2 levels deep, use Context)

---

## 🧪 TESTING READINESS

### 🟢 MEDIUM PRIORITY
- [ ] **Component can be tested in isolation** (no hard dependencies on global state)
- [ ] **Functions are testable** (pure functions when possible)
- [ ] **Clear success/error paths** (predictable behavior)

---

## 🚀 PRE-COMMIT CHECKLIST

### Before committing ANY code:
- [ ] **All console.logs removed** (or replaced with proper logging)
- [ ] **No commented-out code** (delete it, Git remembers)
- [ ] **No TODO comments without tickets** (create issue or delete)
- [ ] **All imports resolve** (no red squiggly lines)
- [ ] **No TypeScript errors** (run `npx tsc --noEmit`)
- [ ] **File follows naming conventions**:
  - Components: PascalCase (`ProductCard.tsx`)
  - Hooks: camelCase starting with `use` (`useProducts.ts`)
  - Services: camelCase with `.service` suffix (`auth.service.ts`)
  - Utils: camelCase (`validation.ts`)

---

## 🎯 QUICK SEVERITY GUIDE

**🔴 CRITICAL** = App breaks or won't run
- Fix immediately before continuing
- Examples: Missing SafeAreaView, using TouchableOpacity, hardcoded colors

**🟡 HIGH PRIORITY** = Breaks elderly UX or core functionality
- Fix before moving to next feature
- Examples: Font too small, buttons too small, poor contrast

**🟢 MEDIUM PRIORITY** = Code quality or maintainability
- Fix before committing
- Examples: No TypeScript types, inconsistent naming, missing error handling

---

## 🔍 HOW TO USE THIS CHECKLIST

### For Every New File:
1. **Before writing**: Check Pre-Creation section
2. **While writing**: Keep relevant section open (Screen/Component/Service)
3. **After writing**: Run through entire checklist for that file type
4. **Before committing**: Run Pre-Commit checklist

### For AI Agent:
- Use this as the **primary validation document**
- Run ALL applicable sections for each file type
- Report violations by severity (🔴 first, then 🟡, then 🟢)
- Provide fix suggestions with code examples

---

## 📚 REFERENCE DOCUMENTS

When checklist items fail, refer to:
- **DESIGN_SYSTEM.md** - Colors, typography, spacing, components
- **PROJECT_STRUCTURE_AND_ARCHITECTURE.md** - File locations, patterns
- **SilverCart_SDK54_Architecture_Conflicts.md** - SDK 54 specific issues
- **SilverCart_SDK54_Build_Reminders.md** - SafeAreaView requirements
- **SILVERCART_CODING_STANDARDS.md** - Detailed project-specific rules

---

**Print this checklist and keep it visible while coding!**

**Last Updated:** February 7, 2026  
**Version:** 1.0  
**For:** SilverCart Mobile App (Expo SDK 54)
