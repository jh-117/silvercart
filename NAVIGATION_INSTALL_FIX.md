# React Navigation Installation Fix - Expo SDK 54

## ❌ Problem

Expo SDK 54 installs React Navigation v6, but the latest packages are v7, causing a peer dependency conflict.

## ✅ Solution

Install the specific versions compatible with Expo SDK 54:

```bash
npm install @react-navigation/native@^6.1.18 @react-navigation/native-stack@^6.11.0 @react-navigation/bottom-tabs@^6.6.1
```

Or use the `--legacy-peer-deps` flag:

```bash
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens --legacy-peer-deps
```

## 📦 Recommended Approach (Version Lock)

Run this command to install compatible versions:

```bash
npm install --save @react-navigation/native@6.1.18 @react-navigation/native-stack@6.11.0 @react-navigation/bottom-tabs@6.6.1
```

Then install the native dependencies:

```bash
npx expo install react-native-screens
```

## ✅ Verify Installation

After installation, check your `package.json`:

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/native-stack": "^6.11.0", 
    "@react-navigation/bottom-tabs": "^6.6.1",
    "react-native-screens": "4.3.0" // or whatever Expo installed
  }
}
```

## 🧹 If Still Failing

1. **Delete node_modules and package-lock.json:**
   ```bash
   rm -rf node_modules package-lock.json
   # On Windows: rmdir /s node_modules & del package-lock.json
   ```

2. **Install with legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Verify with expo doctor:**
   ```bash
   npx expo doctor
   ```

## 📝 What Changed

- React Navigation v6 → Compatible with Expo SDK 54
- React Navigation v7 → Requires Expo SDK 55+ (not released yet)

---

**Run this now:**
```bash
npm install --save @react-navigation/native@6.1.18 @react-navigation/native-stack@6.11.0 @react-navigation/bottom-tabs@6.6.1
npx expo install react-native-screens
```
