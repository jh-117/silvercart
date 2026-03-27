# SilverCart System & Functional Testing Report

This document outlines the manual system and functional testing performed to verify the recent bug fixes and feature implementations. Because the Expo React Native app heavily relies on UI interactions and native device integrations (like Camera, Voice, Dialer, Notifications), these verification steps ensure the implementations function correctly on a real device or emulator.

## Test Cases & Results

### 1. Feature: Quick Reorder Cart Logic
*   **Test Case**: Reorder an existing past order.
*   **Action**: Navigate to `Orders`, tap `Reorder` on a previous order.
*   **Expected Result**: The items from that order are added to the user's active cart. The app should navigate to the `Cart` tab and visually display the newly added items. It should bypass the database if the items are mock legacy products not strictly found in the live catalog.
*   **Status**: ✅ **Pass**

### 2. Feature: Biometrics Onboarding
*   **Test Case**: Enable device biometrics during app onboarding.
*   **Action**: Proceed through onboarding to the Biometrics screen and tap "Enable Biometrics". Fully close and relaunch the app.
*   **Expected Result**: The preference is securely stored to the device (`SecureStore`). Upon relaunching, the `RootNavigator` should enforce the biometric authentication lock screen before allowing access to the application.
*   **Status**: ✅ **Pass**

### 3. Feature: Help & Support UI Colors
*   **Test Case**: Verify Live Chat visual differentiation.
*   **Action**: Navigate to `Profile` -> `Help & Support`.
*   **Expected Result**: The "Live Chat" box should render with an Orange/Amber design theme (`#E65100`), easily distinguishing it from the green "Safety Guide" bounding box.
*   **Status**: ✅ **Pass**

### 4. Feature: Voice Command Layout (Scrolling)
*   **Test Case**: Prevent UI clipping on the global voice help menu.
*   **Action**: Open the global Voice Search modal. Tap on "What can I say?".
*   **Expected Result**: A full list of hints appears. It should be wrapped in a scrollable view (`ScrollView`) so that on smaller screens, it doesn't overlap the bottom navigation bar or clip off the screen unexpectedly.
*   **Status**: ✅ **Pass**

### 5. Feature: Dynamic Global Mic Icon
*   **Test Case**: Hide the floating mic on distracting screens.
*   **Action**: Navigate between `Home`, `Search`, `Orders`, and complete `Onboarding`.
*   **Expected Result**: The floating green microphone button should be universally visible *except* when viewing the `Home`, `Onboarding`, or `Tutorial` screens, where it should be completely unmounted.
*   **Status**: ✅ **Pass**

### 6. Feature: Native Support Links
*   **Test Case**: Trigger device communication apps from Help & Support.
*   **Action**: Navigate to `Profile` -> `Help & Support`. Tap "Call Us" and "Email Us".
*   **Expected Result**: Instead of a toast message, the app should use the React Native `Linking` API to open the device's default phone dialer (with the support number prefilled) and default email client.
*   **Status**: ✅ **Pass**

### 7. Feature: FAQ Expansion Render Glitch
*   **Test Case**: Clean UI rendering on Android when expanding FAQs.
*   **Action**: Navigate to `Profile` -> `Help & Support` -> `FAQ`. Expand any question.
*   **Expected Result**: The expanded question's container should turn a solid off-white (`#F8FDF9`). There should be no dark grey shadow stacking glitch (caused by transparent background overlap).
*   **Status**: ✅ **Pass**

### 8. Feature: Voice Assistant Contact Calling
*   **Test Case**: Allow the AI to dial a Trusted Contact.
*   **Action**: Open Voice Search. Speak: "Call my son".
*   **Expected Result**: The Gemini LLM parses the intent as `call_contact` with the `contactName` of "son". The app queries the Supabase `trusted_contacts` table. If "son" is found, the app automatically triggers the device dialer with their saved phone number.
*   **Status**: ✅ **Pass**

### 9. Feature: Local Push Notifications
*   **Test Case**: Grant Notification permissions from App Settings.
*   **Action**: Navigate to `Profile` -> `App Settings`. Toggle "Push Notifications" on.
*   **Expected Result**: The app requests native Notification permissions from the OS. Once granted, it schedules and displays a test local push notification ("Notifications Enabled! 🔔") after 2 seconds.
*   **Status**: ✅ **Pass**

### 10. Feature: Database Integrity (Catalog Matching)
*   **Test Case**: Verify mock category mismatch is resolved.
*   **Action**: Run backend SQL search: `SELECT COUNT(*) FROM products WHERE category = 'groceries'`. Then visually inspect the `Category` screen for the "grocery" tab.
*   **Expected Result**: The legacy 10 mock items incorrectly filed under "groceries" have been deleted. Search results and the catalog view now match 1-to-1 without orphaned test items appearing in search queries.
*   **Status**: ✅ **Pass**

---
*Testing completed and signed off following the latest deployment push.*
