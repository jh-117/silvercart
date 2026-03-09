# SilverCart — SDK 54 Migration Log
**Date:** February 3, 2026
**Project:** SilverCart Mobile
**Status:** ✅ Configuration Fixed & Ready for Development

---

## ✅ WHAT HAS BEEN DONE (Do Not Redo)

### 1. The Critical Fix — PluginError Resolved
- **Problem:** `PluginError: Failed to resolve plugin for module "react-native-reanimated/babel"` — the Babel plugin was incorrectly placed inside `app.json` Expo plugins (which is for native config only).
- **Fix:** Removed from `app.json`. Created `babel.config.js` with the plugin in the correct location.

### 2. Files Changed

#### `babel.config.js` — Created ✅
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Must be listed last
    ],
  };
};
```

#### `app.json` — Cleaned ✅
- `"newArchEnabled": true` — New Architecture enabled
- `"android": { "edgeToEdgeEnabled": true }` — Edge-to-edge on Android
- `"extra": { "geminiApiKey": "..." }` — Placeholder ready for Phase 4
- Removed the incorrect `react-native-reanimated/babel` from plugins array

#### `App.tsx` — Entry Point Updated ✅
- Line 1: `import 'react-native-gesture-handler';` — must stay as line 1, never move
- Root wrapped in `<SafeAreaProvider>` — required because `edgeToEdgeEnabled` is on

### 3. All Dependencies Installed via `npx expo install` ✅

| Package | Purpose | Status |
|---------|---------|--------|
| `react-native-reanimated` | Animations (replaces old `Animated`) | ✅ Installed |
| `react-native-gesture-handler` | Touch & swipe, required by Navigation | ✅ Installed |
| `react-native-safe-area-context` | Handles notch/status bar | ✅ Installed |
| `expo-speech` | Voice recognition (SDK 54 version) | ✅ Installed |
| `@react-native-async-storage/async-storage` | Caching (SDK 54 version) | ✅ Installed |

---

## 📏 DEVELOPMENT RULES — Follow These For Every Screen

These are non-negotiable. Every screen and component built from here on must follow all four.

### Rule 1 — Import Order in App.tsx
`import 'react-native-gesture-handler'` must remain line 1 of `App.tsx`. Never move it. Never delete it.
- **What breaks:** App crashes instantly on any screen transition on Android.

### Rule 2 — Use Pressable, Not TouchableOpacity
```javascript
// ❌ Never use this
import { TouchableOpacity } from 'react-native';

// ✅ Always use this
import { Pressable } from 'react-native';

<Pressable
  onPress={handler}
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  hitSlop={8}
  android_ripple={{ color: 'rgba(0,0,0,0.15)' }}
>
```
- **Why:** Fabric doesn't honour `TouchableOpacity` ripple on Android. `hitSlop={8}` also helps the 60+ target users with motor difficulties.
- **Affects:** Every tappable element — buttons, product cards, menu items, quantity controls.

### Rule 3 — Use Reanimated, Not Animated
```javascript
// ❌ Never use this
import { Animated } from 'react-native';
const [anim] = useState(new Animated.Value(1));

// ✅ Always use this
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
const scale = useSharedValue(1);
const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
```
- **Why:** Old `Animated` bridges every frame back to JS on Fabric — kills performance and produces warnings.
- **Affects:** Mic button pulse (C1), any loading spinners, success animations (G4), any future transitions.

### Rule 4 — Always Cleanup Event Listeners in useEffect
```javascript
// ❌ Never do this (stale listeners on Fabric)
useEffect(() => {
  Voice.onSpeechStart = handler;
}, []);

// ✅ Always do this
const handler = useCallback(() => { /* ... */ }, []);

useEffect(() => {
  const init = async () => {
    await Voice.destroy();       // destroy first
    Voice.onSpeechStart = handler;
  };
  init();

  return () => {                 // cleanup on unmount
    Voice.destroy();
    Voice.removeAllListeners();
  };
}, [handler]);
```
- **Why:** Fabric unmounts/remounts components more aggressively. Without cleanup, listeners fire on destroyed components → memory leaks.
- **Affects:** Voice search screen (C1), any real-time subscriptions (Supabase), any device sensor listeners.

---

## 📋 QUICK CHECKLIST — Before Writing Any Screen

Before you start coding a new screen, run through this:

- [ ] Is there any tappable element? → Use `Pressable`, not `TouchableOpacity`
- [ ] Is there any animation? → Use `useSharedValue` / `useAnimatedStyle`, not `Animated`
- [ ] Does the screen sit behind the status bar? → Wrap in `SafeAreaView` (see `SilverCart_SDK54_Build_Reminders.md`)
- [ ] Does the screen listen to any events or subscriptions? → Wrap in `useEffect` with cleanup
- [ ] Is this the voice search screen (C1)? → Follow Rule 3 + Rule 4 together

---

## 🔜 STILL TO DO (Not Yet Actioned)

These are noted but not yet needed. Act on them at the phase indicated.

| Item | When to Act | Reference |
|------|-------------|-----------|
| Put real Gemini API key into `app.json` `extra` block | Before Phase 4 (Week 9) | Conflict 6 in Architecture Conflicts doc |
| Rewrite mic button animation using Reanimated | When building C1 (Phase 4) | Conflict 1 in Architecture Conflicts doc |
| Rewrite Voice listener pattern using useCallback + destroy | When building C1 (Phase 4) | Conflict 4 in Architecture Conflicts doc |
| Wrap all main screens in SafeAreaView | When building each screen (Phase 3+) | Build Reminders doc |

---

## 📁 Related Documents

| Document | What it covers |
|----------|----------------|
| `SilverCart_SDK54_Build_Reminders.md` | Which screens need SafeAreaView and the copy-paste template |
| `SilverCart_SDK54_Architecture_Conflicts.md` | All 7 conflicts with old vs new code side by side |
| This file (`SilverCart_SDK54_Migration_Log.md`) | What's done, the 4 rules, and what's still pending |

---

*Last Updated: February 3, 2026*
*Status: Ready for Phase 3 (Core Features)*
