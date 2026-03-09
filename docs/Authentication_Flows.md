# SilverCart Authentication Flows

This document outlines the authentication flows for SilverCart users, covering Phone (OTP), Email & Password, and Password Reset processes.

## 1. Phone Flow (OTP)
The phone flow uses One-Time Passwords (OTPs) sent via SMS. This flow acts as both the **Sign Up** and **Sign In** process, depending on whether the user's phone number already exists in the database.

**Flow Steps:**
1. **User Input:** The user enters their phone number on the `PhoneRegisterScreen`.
2. **OTP Request:** The app calls `supabase.auth.signInWithOtp({ phone: '+60XXXXXXXXX' })`.
3. **Supabase Handling:**
   - **New Number (Sign Up):** Supabase creates a new user, fires the `handle_new_user` trigger (adding them to the `public.users` table), and sends an SMS OTP.
   - **Existing Number (Sign In):** Supabase simply sends an SMS OTP to the registered phone number.
4. **OTP Verification:** The user enters the 6-digit OTP received via SMS on the `OtpVerificationScreen`.
5. **App Authentication:** The app calls `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`.
6. **Completion:**
   - If successful, the app checks the user state. 
   - New users are likely routed to `ProfileSetup` to fill in their name and details.
   - Returning users are routed to the main app dashboard.

---

## 2. Email Flow
The email flow uses a traditional email and password combination. Because passwords are required to be set during registration, the **Sign Up** and **Sign In** flows are distinct.

### 2a. Email Sign Up (New User)
1. **User Input:** The user enters their Email and a strong Password on the `EmailRegisterScreen`.
2. **Registration Request:** The app calls `supabase.auth.signUp({ email, password })`.
3. **Supabase Handling:** Supabase creates the user account and fires the `handle_new_user` trigger to create the database profile.
4. **Verification Email:** Supabase sends an email containing a **6-digit OTP code**.
5. **OTP Verification:** The app automatically navigates to the `OtpVerificationScreen` where the user types in the 6-digit code from their email.
6. **App Authentication:** The app calls `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
7. **Completion:** Upon successful verification, the user is authenticated and taken to the `ProfileSetup` screen.

### 2b. Email Sign In (Returning User)
1. **User Input:** The user enters their Email and Password on the `LoginScreen`.
2. **Authentication Request:** The app calls `supabase.auth.signInWithPassword({ email, password })`.
3. **Supabase Handling:** Supabase verifies the credentials.
4. **Completion:** If the credentials are correct, the user is immediately authenticated and navigated to the main app dashboard.

---

## 3. Password Reset Flow
The password reset flow allows users who registered with an email to regain access to their accounts if they forget their password. This flow uses an OTP for mobile-friendly verification.

**Flow Steps:**
1. **User Request:** The user navigates to the `ForgotPasswordScreen`, enters their registered email address, and requests a reset.
2. **Reset Request:** The app calls `supabase.auth.resetPasswordForEmail(email)`.
3. **Supabase Handling:** Supabase sends an email to the user containing a **6-digit recovery OTP**.
4. **OTP Verification:** The app navigates to the `VerifyResetOtpScreen` where the user enters the 6-digit code they received.
5. **App Authentication:** The app calls `supabase.auth.verifyOtp({ email, token, type: 'recovery' })`.
6. **Set New Password:** After successful verification, the app navigates to the `SetPasswordScreen`.
7. **Password Update:** The user types their new password. The app securely updates the password in Supabase via `supabase.auth.updateUser({ password })`.
8. **Completion:** The user's password is now changed, and they are navigated to the main app dashboard, fully authenticated.
