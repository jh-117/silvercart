# SilverCart — SDK 54 New Architecture Conflict Guide

> **Purpose:** Every item here was pulled from your existing project docs (AI Implementation Guide, PRD, Build Summary). These are real conflicts that will bite you when you build — not generic warnings. Fix each one *before* writing the screen it belongs to.

---

## ⚡ QUICK REFERENCE — What Changed and Why

| Old (SDK 50 / Bridge) | New (SDK 54 / Fabric + JSI) | What breaks if you ignore it |
|---|---|---|
| `TouchableOpacity` works everywhere | Deprecated in favour of `Pressable` | Inconsistent press feedback, especially on Android |
| `Animated.Value` + `useNativeDriver: true` | Use `Reanimated 2` (`useAnimatedStyle`) | Animation may silently drop frames or warn in logs |
| `AsyncStorage` from community package | Must install via `npx expo install` for SDK 54 | Import path changes; old version crashes on Fabric |
| `react-native-voice` direct event assignment | Needs `useEffect` cleanup for Fabric memory model | Memory leak or stale listener on re-render |
| `React Navigation` without gesture handler | `react-native-gesture-handler` is mandatory | Navigation crashes on first screen transition |
| `expo-constants` env access | `Constants.expoConfig?.extra` still works, but key must be in `app.json` `extra` block | API key is `undefined` at runtime |
| `useNativeDriver` optional on some props | Required on **all** animated props | Crashes at runtime if missing |

---

## 🔧 CONFLICT 1 — Animated API in VoiceMicButton

**Where it lives:** `AI Implementation Guide → Section 5.1 → VoiceMicButton.js`

**The problem:** The guide uses the old `Animated` API with `useState(new Animated.Value(...))`. On Fabric this still technically runs, but it bridges every frame back to JS — killing the performance advantage of the New Architecture. It will also produce console warnings.

**What the guide currently says (do NOT copy this as-is):**
```javascript
// ❌ OLD — Bridge-era pattern
import { Animated } from 'react-native';

const [pulseAnim] = useState(new Animated.Value(1));

Animated.loop(
  Animated.sequence([
    Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
    Animated.timing(pulseAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
  ])
).start();
```

**What to use instead when you build C1 / B1:**
```javascript
// ✅ NEW — Fabric-native, runs entirely off the JS thread
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const scale = useSharedValue(1);

// Trigger this inside useEffect when isListening becomes true
scale.value = withRepeat(
  withSequence(
    withTiming(1.2, { duration: 500 }),
    withTiming(1,   { duration: 500 })
  ),
  -1 // -1 = infinite loop
);

// In JSX
const pulseStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

<Animated.View style={pulseStyle}>
  {/* mic icon here */}
</Animated.View>
```

**Install now, use later:**
```bash
npx expo install react-native-reanimated
```

> ⚠️ **DO NOT** add `react-native-reanimated/babel` to `app.json` plugins. That caused a `PluginError` during the SDK 54 migration. The plugin is already correctly placed in `babel.config.js` — see the Migration Log.

---

## 🔧 CONFLICT 2 — TouchableOpacity → Pressable

**Where it lives:** `AI Implementation Guide → Section 5.1` (mic button) and will appear in every product card, cart button, checkout button you build.

**The problem:** `TouchableOpacity` is not removed yet, but on Fabric it does not honour the Android ripple effect and has inconsistent hit-area sizing. For a 60+ user base with motor difficulties, this matters — the 60x60dp touch targets in your design system need reliable press detection.

**What to do when building any tappable element:**
```javascript
// ❌ OLD
import { TouchableOpacity } from 'react-native';
<TouchableOpacity onPress={handler} style={styles.button}>

// ✅ NEW
import { Pressable } from 'react-native';
<Pressable
  onPress={handler}
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  hitSlop={8}   // extra tap area around the button — helps elderly users
  android_ripple={{ color: 'rgba(0,0,0,0.15)' }}
>
```

**Screens this affects (every tappable element):**
B1, B2, B3, B4, D1, D2, E1, G1, G2, G3, G4, H1, C1 — basically all of them. Make `Pressable` your default from the start.

---

## 🔧 CONFLICT 3 — AsyncStorage Version Mismatch

**Where it lives:** `AI Implementation Guide → Section 12.1 → cacheService.js`

**The problem:** The guide lists `"@react-native-async-storage/async-storage": "^1.21.0"` in the dependency section. That version was built for SDK 50. On SDK 54 + Fabric, you need the version Expo resolves for you — not a manually pinned one.

**Do this now (don't wait until you need caching):**
```bash
npx expo install @react-native-async-storage/async-storage
```

The import stays the same. The code in `cacheService.js` from the guide does not need rewriting — just make sure the installed version is the one Expo picked, not a stale `^1.21.0` in your `package.json`.

**Verify after install:**
```bash
npx expo doctor
# Look for any AsyncStorage version mismatch warning
```

---

## 🔧 CONFLICT 4 — react-native-voice Event Listeners

**Where it lives:** `AI Implementation Guide → Section 5.1 → VoiceMicButton.js`

**The problem:** The guide assigns event handlers directly like `Voice.onSpeechStart = onSpeechStart`. On Fabric, components can be unmounted and remounted more aggressively. If the cleanup in the `useEffect` return doesn't fire properly, you get stale listeners that fire on destroyed components.

**What the guide currently says:**
```javascript
// ⚠️ RISKY on Fabric — cleanup may not fire reliably
React.useEffect(() => {
  Voice.onSpeechStart = onSpeechStart;
  Voice.onSpeechEnd = onSpeechEnd;
  Voice.onSpeechResults = onSpeechResults;
  Voice.onSpeechError = onSpeechError;

  return () => {
    Voice.destroy().then(Voice.removeAllListeners);
  };
}, []);
```

**What to do when building C1:**
```javascript
// ✅ Safer pattern for Fabric — explicit destroy + re-init
import { useEffect, useCallback } from 'react';
import Voice from '@react-native-voice/voice';

const onSpeechStart  = useCallback(() => { setIsListening(true); }, []);
const onSpeechEnd    = useCallback(() => { setIsListening(false); }, []);
const onSpeechResults = useCallback((e) => { onTranscript(e.value[0]); }, [onTranscript]);
const onSpeechError  = useCallback((e) => { setIsListening(false); onError(e.error); }, [onError]);

useEffect(() => {
  const init = async () => {
    await Voice.destroy();                  // always destroy first
    Voice.onSpeechStart   = onSpeechStart;
    Voice.onSpeechEnd     = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError   = onSpeechError;
  };
  init();

  return () => {
    Voice.destroy();
    Voice.removeAllListeners();
  };
}, [onSpeechStart, onSpeechEnd, onSpeechResults, onSpeechError]);
```

Key differences: every handler is wrapped in `useCallback` so the `useEffect` dependency array is stable, and `Voice.destroy()` is called at the *start* of init — not just in cleanup.

---

## 🔧 CONFLICT 5 — React Navigation + Gesture Handler

**Where it lives:** `AI Build Summary → Navigation Stack Hierarchy` (the entire nav tree)

**The problem:** React Navigation on SDK 54 requires `react-native-gesture-handler` to be installed AND imported at the very top of your entry file — before anything else runs. If it's missing or imported late, stack navigators crash on the first screen transition.

**Do this now — one time:**
```bash
npx expo install react-native-gesture-handler
```

Then the **first two lines** of your `App.js` (or `app/_layout.js` if using Expo Router) must be:
```javascript
import 'react-native-gesture-handler';  // ← MUST be line 1. Nothing before this.
import { SafeAreaProvider } from 'react-native-safe-area-context';
```

This affects every single navigation transition in the app — Auth Stack → Onboarding → Main Stack → all tab navigators. Get it in place before you wire up the first navigator.

---

## 🔧 CONFLICT 6 — Gemini API Key Access via expo-constants

**Where it lives:** `AI Implementation Guide → Section 4.1`

**The problem:** The guide says to access the key with `Constants.expoConfig?.extra?.geminiApiKey`. This still works on SDK 54, but the key must actually exist in the `extra` block of your `app.json`. If it's missing there, it returns `undefined` silently — no error, just a failed API call.

**Make sure your `app.json` has this block:**
```json
{
  "expo": {
    "extra": {
      "geminiApiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  }
}
```

**And access it like this (no change from the guide):**
```javascript
import Constants from 'expo-constants';
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;
```

**When to set this up:** Right before Phase 4 (Voice AI Integration, Week 9). Don't put a real key in yet — just put a placeholder string so the plumbing is verified.

---

## 🔧 CONFLICT 7 — expo-speech Version for SDK 54

**Where it lives:** `AI Implementation Guide → Section 3.3 → Dependencies`

**The problem:** The guide pins `"expo-speech": "^11.7.0"`. That's SDK 50 era. SDK 54 ships a different compatible version.

**Do this now:**
```bash
npx expo install expo-speech
```

Do **not** manually type a version number. Let Expo pick it. Then delete any manual `expo-speech` entry from `package.json` if one exists — `npx expo install` already wrote the correct one.

---

## 📦 ONE-TIME SETUP CHECKLIST — Run These Now

Everything below should be installed today, before you write a single screen. They're all needed eventually and none of them require code changes to install.

```bash
# Core SDK 54 requirements
npx expo install react-native-gesture-handler
npx expo install react-native-safe-area-context
npx expo install react-native-reanimated

# Voice + AI deps (correct SDK 54 versions)
npx expo install expo-speech
npx expo install @react-native-async-storage/async-storage

# Verify everything is clean
npx expo doctor
```

After running all of these, do one final clear-cache start:
```bash
npx expo start --clear
```

---

## 📋 WHEN TO ACT — Conflict-to-Phase Map

| Conflict | Fix Now (Today) | Act When Building |
|----------|-----------------|-------------------|
| Gesture Handler install | ✅ | Wire into App.js before first navigator |
| SafeAreaView install | ✅ | Wrap every screen listed in the SafeAreaView reminder |
| Reanimated install + babel plugin | ✅ | Rewrite mic button animation when building C1 |
| AsyncStorage install | ✅ | Use as-is in cacheService when building Phase 4 |
| expo-speech install | ✅ | Use when building voice feature in Phase 4 |
| Pressable swap | — | Every screen, starting Phase 3 |
| Voice listener cleanup | — | When building C1 in Phase 4 |
| Gemini key in app.json extra | — | Before Phase 4 (Week 9) |

---

*Created: February 3, 2026*
*Source: Cross-referenced against SilverCart AI Implementation Guide, PRD, AI Build Summary, and SDK 54 upgrade report*
*Review when: Before starting Phase 3 (Core Features) and again before Phase 4 (Voice AI)*
