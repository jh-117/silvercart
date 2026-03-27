# Product Requirements Document (PRD) v2.0
## SilverCart - Voice-Enabled E-Commerce for Malaysian Elderly

**Version:** 3.0 (UPDATED)  
**Date:** March 22, 2026  
**Previous Version:** 2.0 (February 7, 2026)  
**Project Type:** Final Year Project (Individual)  
**Due Date:** May 8, 2026  
**Status:** Phase 4 (Polish & Testing) - Week 10 of 16

---

## 📋 CHANGELOG v2.0 (February 7, 2026)

### What's New:
- ✅ **SDK 54 Upgrade:** Expo SDK 54 with New Architecture (Fabric + Bridgeless)
- ✅ **Complete Design System:** DESIGN_SYSTEM.md with exact colors, typography, spacing
- ✅ **Database Schema Finalized:** 12 tables with Supabase Auth integration
- ✅ **Project Structure Documented:** Full `/src` folder organization
- ✅ **Architecture Conflicts Resolved:** 7 SDK 54 migration conflicts documented
- ✅ **SafeAreaView Requirements:** Documented for 12 critical screens

### Breaking Changes:
- `TouchableOpacity` → `Pressable` (mandatory)
- `Animated` API → `react-native-reanimated` (mandatory)
- `edgeToEdgeEnabled: true` requires SafeAreaView on all screens
- Admin authentication now uses Supabase Auth (not separate table)

---

## 1. Executive Summary

### 1.1 Project Overview
SilverCart is a voice-enabled mobile e-commerce application designed specifically for elderly Malaysians (60+). Operating as a **single-store direct-to-consumer platform** (similar to Guardian Pharmacy or Tesco Grocery apps), SilverCart sells pharmacy items and groceries directly to customers. The app addresses accessibility challenges faced by elderly users when using conventional e-commerce platforms by providing voice-controlled shopping, large UI elements, high contrast design, and simplified navigation.

**Business Model:** Direct retail store with online presence (NOT a marketplace like Shopee/Lazada)

**Current Status:** Phase 4 (Polish & Testing) - Database configured, design system locked, core features built, Admin Panel built, Map integration completed.

### 1.2 Problem Statement
Current e-commerce platforms (Shopee, Lazada, Grab) are not optimized for elderly users who face:
- **Vision impairment**: Small text, low contrast, cluttered interfaces
- **Motor difficulties**: Arthritis makes precise tapping difficult (hence 60x60dp minimum touch targets)
- **Digital literacy gaps**: Complex navigation and checkout processes
- **Hearing challenges**: No alternative input methods

Additionally, existing pharmacy/grocery apps (Guardian, Watsons) lack voice assistance and elderly-optimized interfaces.

### 1.3 Solution
A React Native mobile application (Expo SDK 54 with New Architecture) operating as a **single-store retail platform** with:
- Voice-controlled product search and ordering (Google Gemini API)
- Large, high-contrast UI optimized for low vision (18pt minimum body text, WCAG AAA)
- Simplified 3-step checkout process
- AI-powered conversational assistance (free tier APIs)
- Focus on essential daily needs: pharmacy items and groceries
- Responsive web-based admin panel (PWA)

**Key Differentiator:** Unlike marketplaces (Shopee/Lazada) or existing pharmacy apps, SilverCart combines direct retail convenience with voice AI and elderly-specific UX design.

### 1.4 Success Criteria (Academic Evaluation)
- ✅ Functional voice input demonstration with 70%+ accuracy
- ✅ Complete user journey from voice search to order confirmation
- ✅ AI integration showing conversational understanding (Gemini API)
- ✅ Accessibility features implementation (WCAG AAA compliance)
- ✅ Live deployment accessible via mobile device (APK build)
- ✅ User testing with 5+ elderly users (60+) with documented results
- ✅ Admin panel with order management and support features (responsive PWA)
- ✅ Trusted contact notification system functional
- ✅ Order cancellation within 5-minute window
- ✅ Complete 46-screen application (37 mobile + 9 admin)

---

## 2. Target Users

### 2.1 Primary Persona: Mak Salmah
- **Age:** 68 years old
- **Location:** Urban area (Kuala Lumpur/Petaling Jaya)
- **Tech Literacy:** Uses WhatsApp daily, Facebook occasionally
- **Physical Conditions:** Reading glasses needed, mild arthritis in hands
- **Shopping Needs:** Monthly medication refills, weekly groceries
- **Pain Points:** 
  - Finds Shopee text too small (hence 18pt minimum in SilverCart)
  - Accidentally taps wrong items (hence 60x60dp touch targets)
  - Forgets medication names, knows them by "blood pressure medicine" (voice search helps)
  - Prefers not to go out in hot weather (home delivery)

### 2.2 Secondary Persona: Uncle Wong
- **Age:** 72 years old
- **Location:** Urban area (Penang)
- **Tech Literacy:** Can use smartphone basics, prefers voice messages
- **Physical Conditions:** Poor eyesight, trembling hands
- **Shopping Needs:** Groceries, household items
- **Pain Points:**
  - Typing is difficult (voice input solves this)
  - Forgets where items are in apps (simplified navigation)
  - Needs repeated purchases of same items (reorder feature)

### 2.3 Out of Scope (Future Versions)
- Rural elderly without internet access
- Users under 60
- Non-English speakers (Phase 2: BM, Mandarin, Tamil)

---

## 3. Product Features

### 3.1 MVP Features (Must Have)

#### 3.1.0 Trust & Safety Features
**Priority:** P0 (Critical - builds user confidence)

**Security & Verification:**
- Email verification (mandatory before purchase)
- Biometric authentication (Face ID/Touch ID/Fingerprint) - SDK 54 native support
- Multi-step order confirmation with checkbox: "✓ I confirm this order"
- Order confirmation SMS immediately after purchase
- Scam prevention education screen (shown on first login)
- Clear "Official Communication" policy displayed

**Payment Safety:**
- Cash on Delivery (COD) as default and recommended option
- Transparent pricing with clear breakdown (no hidden fees)
- Price lock guarantee (price frozen when added to cart)
- Maximum order limit: RM500 (prevents fraud)

**Support & Trust Indicators:**
- Large "🆘 HELP" button on every screen
- Official hotline: 1-300-XX-XXXX (prominently displayed)
- "✓ Licensed Pharmacy" badge
- "🛡️ 100% Authentic Products" guarantee
- Simple privacy policy in large, clear text

**Order Protection:**
- 5-minute cancellation grace period after order placed
- Email receipt with itemized list
- **SMS notification to Trusted Contact** (family member oversight)
- **Order status history tracking** (audit trail)
- "Report Problem" button on every order
- 100% money-back guarantee clearly stated

**Admin Features:**
- Order management dashboard with filters and search
- Order status update system with automatic notifications
- Customer support inbox (split-pane on desktop, full-screen on mobile)
- Admin activity logging and audit trail
- Dashboard with metrics, stats, and quick actions
- Progressive Web App (installable on mobile, works offline)
- Responsive design (desktop + tablet + mobile)

**Educational Safety:**
- Safety tutorial on first use:
  - "We'll never ask for your password"
  - "Never share OTP codes"
  - "Verify driver identity"
- Rotating safety tips on home screen

#### 3.1.1 Voice Shopping
**Priority:** P0 (Critical)

**User Stories:**
- As an elderly user, I want to search for products by speaking so I don't need to type
- As an elderly user, I want to add items to cart with voice commands
- As an elderly user, I want voice confirmation of my actions

**Functional Requirements:**
- Voice input button prominently displayed on all screens (floating action button)
- Speech-to-text conversion using Web Speech API or Expo Speech
- Natural language understanding via Google Gemini API (free tier)
- Support for conversational commands:
  - "I need paracetamol"
  - "Add rice to cart"
  - "Show me my orders"
  - "What's in my cart?"
- Text-based feedback in large font (voice output skipped in MVP)

**Technical Specifications:**
- React Native Voice library for speech recognition (SDK 54 compatible version)
- Google Gemini API for intent recognition
- Minimum confidence threshold: 70%
- Fallback to manual search if voice fails
- **NEW:** Must use Reanimated 2 for mic button pulse animation (not old Animated API)
- **NEW:** Must use useCallback for event listeners (Fabric memory model)

#### 3.1.2 Product Catalog
**Priority:** P0 (Critical)

**Categories:**

**Pharmacy (15-20 products)**
- Pain Relief: Paracetamol, Ibuprofen, pain relief patches
- Vitamins: Multivitamins, Vitamin D, Calcium
- Chronic Condition: Blood pressure medication, diabetes supplies
- First Aid: Bandages, antiseptic, thermometer

**Groceries (15-20 products)**
- Staples: Rice (5kg, 10kg), cooking oil, sugar, salt
- Canned Goods: Sardines, baked beans, soup
- Beverages: Coffee, tea, Milo, health drinks
- Household: Detergent, dish soap, tissue paper

**Product Information Required:**
- Product name (English)
- Large product image (min 800x800px)
- Price in MYR (displayed in success green #2D6A4F)
- Short description (1-2 sentences, large font 18pt)
- Stock status (In Stock/Out of Stock)
- Common alternative names (for voice search)

#### 3.1.3 Elderly-Optimized UI
**Priority:** P0 (Critical)

**Design Requirements:**
- **Font Size:** Minimum 18pt for body text, 24pt+ for headings (locked in DESIGN_SYSTEM.md)
- **Contrast Ratio:** WCAG AAA compliant (7:1 minimum)
- **Touch Targets:** Minimum 60x60dp (larger than standard 48x48dp)
- **Color Scheme:** 
  - Primary: Teal green (#007A6A) - calm, trustworthy, accessible
  - Secondary: Dark green (#2D6A4F) for success states
  - Background: Eggshell (#F9F8F2) - **NEVER pure white #FFFFFF**
  - Text Primary: Off-black (#1A1A1A) - **NEVER pure black #000000**
  - Text Secondary: Medium gray (#658086)
  - Error: Red (#D90429)
- **Spacing:** Generous padding (minimum 16dp between elements)
- **Navigation:** 
  - Bottom tab navigation with large icons (32dp) + text labels (12pt)
  - Maximum 4 tabs
  - No hidden menus
- **Buttons:**
  - All buttons MUST be pill-shaped (borderRadius: 30 for height 60)
  - Use **Pressable** instead of TouchableOpacity (SDK 54 requirement)
  - Include hitSlop: 8 for easier tapping
- **SafeAreaView:**
  - **CRITICAL:** All main screens must wrap in SafeAreaView (edgeToEdgeEnabled: true)
  - See SilverCart_SDK54_Build_Reminders.md for list of affected screens

**Screen Requirements:**
1. **Home Screen:** Voice search floating button, category cards (large)
2. **Product Listing:** Grid view (2 columns), large product images
3. **Product Detail:** Single column, large image, clear price (30pt bold), quantity selector (60x60dp buttons)
4. **Cart:** List view, quantity adjustment (large +/- buttons), clear total
5. **Checkout:** 3-step process (Address → Payment → Confirm), progress indicator
6. **Order History:** List view with order status, reorder button

#### 3.1.4 Shopping Cart & Checkout
**Priority:** P0 (Critical)

**Cart Features:**
- Add/remove items
- Quantity adjustment (large +/- buttons 60x60dp, no manual input)
- Clear price breakdown (subtotal, delivery, total)
- Voice command: "What's in my cart?"

**Checkout Flow:**
1. **Delivery Address**
   - Pre-filled from profile
   - Large "Edit Address" button (60dp height)
   - Voice: "Confirm my address"
   
2. **Payment Method** (Mock for MVP)
   - Cash on Delivery (default and recommended with shield icon 🛡️)
   - Online Banking (simulated)
   - E-Wallet (simulated)
   - No actual payment processing in MVP
   
3. **Order Confirmation**
   - Order summary
   - Estimated delivery date
   - Order number (large, readable 32pt bold)
   - SMS notification (simulated - shown on screen)

#### 3.1.5 User Account
**Priority:** P0 (Critical)

**Authentication Methods:**

**Primary: Email + Password with Biometric**
- Email and password registration/login
- Biometric authentication (Face ID/Touch ID/Fingerprint) after first login
- "Remember Me" option for convenience
- Password recovery via email
- **NEW:** Uses Supabase Auth (built-in session management)

**Secondary: Phone Number + OTP**
- Alternative for users without email
- SMS-based OTP verification (6-digit code)
- Fallback option
- **NEW:** Also uses Supabase Auth (same system)

**Features:**
- Profile information:
  - Name
  - Email (primary) or Phone number (secondary)
  - Delivery address
  - **Trusted Contact (Recommended)** - Family member who gets order notifications
    - Name of contact
    - Phone number
    - Relationship (Son/Daughter/Spouse/Sibling/Friend)
    - SMS notification preference toggle
  - Emergency contact (optional, for app emergencies)
- Order history
- Biometric toggle (enable/disable in settings)
- Logout

**Biometric Flow:**
1. First login: Email + Password
2. Prompt: "Enable Face ID/Fingerprint for faster login?"
3. If enabled: Future logins use biometric only
4. Fallback: Always allow password login if biometric fails

**Trusted Contact System:**
- **Purpose:** Family member oversight for safety and peace of mind
- **Notifications sent to Trusted Contact:**
  - Order placed (with items, total, delivery address)
  - Order delivered
  - Account security changes (password reset, new address added)
  - Large purchases (>RM200)
- **Privacy:** Trusted Contact CANNOT:
  - Access the account
  - See payment details
  - Make purchases
  - Change settings
- **Control:** User can enable/disable notifications anytime
- **Display:** Profile shows "👨‍👩‍👧 Protected by: [Contact Name]" badge

#### 3.1.6 Admin Panel (Web - Responsive PWA)
**Priority:** P0 (Critical)

**Purpose:** Store inventory and operations management system accessible on desktop, tablet, and mobile devices

**Justification:** As a direct retail store (like Guardian or Tesco apps), SilverCart needs an admin system to manage product inventory, pricing, orders, and customer support. The admin panel must be responsive to allow store managers to manage operations from any device.

**Responsive Design:**
- **Desktop (1366px+):** Full layout with sidebar, tables, split-pane support inbox
- **Tablet (768-1024px):** Adapted layout with collapsible sidebar, simplified tables
- **Mobile (< 768px):** Card-based layouts, bottom navigation, full-screen modals
- **Progressive Web App (PWA):** Installable on mobile devices, works offline, push notifications

**Features:**

**Product Management:**
- Login with admin credentials via Supabase Auth
  - **NEW:** Admin role stored in `user_roles` table
  - **NEW:** Helper function `is_admin(user_id)` checks role
- Product CRUD operations:
  - Add new product to store inventory
  - Edit product (name, price, description, image URL, stock status)
  - Toggle stock status (In Stock/Out of Stock)
  - Delete discontinued products
- Responsive views:
  - Desktop: Data table with inline editing
  - Mobile: Card grid with modal forms

**Order Management:**
- View all customer orders with filters:
  - Search by Order ID or customer name
  - Filter by status (Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled)
  - Date range picker
  - Export to CSV
- Order detail view with:
  - Customer information (name, phone, address)
  - Order items list
  - Price breakdown
  - Payment information
  - Status timeline (order_status_history table)
- Update order status with automatic notifications
- Internal notes for each order
- Responsive views:
  - Desktop: Full table with 7 columns
  - Mobile: Card list with swipe actions

**Customer Support:**
- Split-pane inbox (desktop) / full-screen chat (mobile)
- View all support conversations
- Real-time messaging with customers (Supabase realtime)
- Mark conversations as resolved
- Quick response templates
- Link support messages to specific orders
- Filter by status (Open, In Progress, Resolved)

**Dashboard Overview:**
- Quick stats (orders today, revenue, pending orders, active customers)
- Recent orders list (last 10)
- Alerts and notifications (low stock, unread messages, delayed orders)
- Admin activity feed (admin_activity_log table)
- Quick action buttons
- Responsive grid layout adapts to screen size

**Progressive Web App (PWA) Features:**
- Install on mobile home screen (works like native app)
- Offline capability (cached data)
- Push notifications for new orders and support messages
- Standalone mode (no browser UI when installed)
- Fast loading with service worker caching

**Access Control:**
- Admin users created via Supabase Auth UI
- Role assignment via `user_roles` table
- Example admin: admin@silvercart.com / Admin123!
- **NEW:** RLS policies check `is_admin()` function for data access
- Future: Role-based access (store manager, inventory clerk, support staff)

### 3.2 Phase 2/3 Features (Post-MVP / Newly Added in March)
- ✅ Voice AI calling Trusted Contacts directly (dialer integration)
- ✅ Biometric onboarding lock (SecureStore enforcement)
- ✅ Quick Reorder cart logic (from Order History)
- ✅ Dynamic Global Mic visibility logic
- ✅ Local push notifications for order/trust contact updates
- ✅ Map Location autocomplete (WebView + Leaflet + Geoapify)
- ✅ Admin Panel (Dashboard, Orders, Customer Support)
- ✅ Voice output (text-to-speech)
- Medication reminders
- Favorite/frequently ordered items
- Product recommendations
- Multi-language support (Bahasa Malaysia, Mandarin)
- Caregiver dashboard (view-only access for family)
- Real payment integration (Stripe/Razorpay)
- Actual delivery partner integration (Lalamove API)
- Real-time order tracking with GPS
- Multi-admin role management

---

## 4. Technical Architecture

### 4.1 Technology Stack

**Frontend (Mobile App):**
- **Framework:** React Native with Expo SDK 54 **NEW**
- **Language:** JavaScript/TypeScript
- **UI Library:** React Native Paper (Material Design)
- **Navigation:** React Navigation v6
- **State Management:** React Context API (Strictly Context)
- **Voice Recognition:** expo-speech (SDK 54 compatible version) **NEW**
- **Animations:** react-native-reanimated v2 (NOT Animated API) **NEW**
- **Gesture Handling:** react-native-gesture-handler (mandatory) **NEW**
- **Safe Area:** react-native-safe-area-context (mandatory) **NEW**

**Frontend (Admin Panel):**
- **Framework:** React (Vite or Next.js)
- **Language:** JavaScript/TypeScript
- **UI Library:** Material-UI (MUI) / Tailwind CSS
- **Responsive:** Desktop (1366px+), Tablet (768-1024px), Mobile (375px+)
- **PWA:** Service Workers, installable, offline-capable
- **Charts:** Recharts / Chart.js

**Backend:**
- **BaaS:** Supabase (Free Tier)
  - PostgreSQL database (12 tables) **UPDATED**
  - Authentication (Email + Phone OTP) **UPDATED**
  - Row Level Security (RLS) with helper functions **NEW**
  - Storage (for product images)
  - Real-time subscriptions

**AI/ML:**
- **Voice-to-Text:** Web Speech API (free, browser-based) OR Expo Speech
- **NLU (Natural Language Understanding):** Google Gemini API (free tier: 60 requests/minute)
  - Model: `gemini-1.5-flash`
  - Alternative: Groq API (free, fast inference)
  - Fallback: Pattern matching with keywords

**Deployment:**
- **Mobile App:** Expo Go (development), EAS Build (production APK)
- **Admin Panel:** Vercel / Netlify (free tier)
- **Database & Auth:** Supabase Cloud (free tier)

### 4.2 Database Schema (UPDATED)

**Total Tables:** 12 (up from 4 in v1.0)

**Core Tables:**
1. **users** - Customer profiles (extends Supabase `auth.users`)
2. **user_roles** - User roles (customer/admin/support/manager) **NEW**
3. **app_settings** - User preferences and accessibility settings **NEW**
4. **products** - Product catalog (pharmacy and grocery items)
5. **cart_items** - Shopping cart (persistent across sessions)
6. **orders** - Customer orders with delivery and payment info
7. **order_items** - Line items for each order
8. **order_status_history** - Audit trail for order status changes **NEW**
9. **notifications** - SMS notifications to customers and trusted contacts **NEW**
10. **support_messages** - Customer support tickets **NEW**
11. **support_replies** - Replies to support tickets **NEW**
12. **admin_activity_log** - Audit log for admin actions **NEW**

**Key Changes from v1.0:**
- ❌ Removed separate `admins` table
- ✅ Added `user_roles` table (stores roles for all users)
- ✅ All auth now uses Supabase Auth (single source of truth)
- ✅ Added helper functions: `is_admin()`, `has_role()`
- ✅ Complete RLS policies for all tables

**Example Table: users (extended from auth.users)**
```sql
users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  phone_number VARCHAR(20) UNIQUE,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  auth_method VARCHAR(20) DEFAULT 'email',
  
  -- Trusted Contact (Family Member)
  trusted_contact_name VARCHAR(100),
  trusted_contact_phone VARCHAR(20),
  trusted_contact_relationship VARCHAR(50),
  trusted_contact_enabled BOOLEAN DEFAULT TRUE,
  trusted_contact_notify_orders BOOLEAN DEFAULT TRUE,
  trusted_contact_notify_security BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**Full Schema:** See `database_migration_v2.sql` and `DATABASE_SETUP_GUIDE_V2.md`

### 4.3 Voice AI Flow

**User Journey:**
1. User taps microphone button (floating action button, 80x80dp)
2. App starts recording (must destroy Voice listeners first in SDK 54) **NEW**
3. User speaks: "I need paracetamol"
4. Speech-to-text converts to text
5. Text sent to Gemini API with prompt:
   ```
   You are a helpful shopping assistant for elderly users.
   User said: "I need paracetamol"
   Available products: [product list]
   
   Determine:
   - Intent: search, add_to_cart, view_cart, checkout
   - Product: product name or null
   - Response: friendly confirmation message
   
   Return JSON only.
   ```
6. Parse JSON response
7. Execute action (search products, add to cart, etc.)
8. Show confirmation in large text (20pt+)
9. (Optional Phase 2: Speak confirmation with TTS)

**Voice Commands Supported:**
- Search: "I need [product]", "Show me [category]", "Find [product]"
- Add to cart: "Add [product]", "I want [product]"
- Cart: "What's in my cart?", "Show my cart"
- Remove: "Remove [product]", "Delete [product]"
- Checkout: "Check out", "Place order", "Buy now"

**SDK 54 Voice Implementation Requirements:** **NEW**
- Use `useCallback` for all event handlers
- Always call `Voice.destroy()` before initializing listeners
- Cleanup in `useEffect` return function
- Use Reanimated 2 for mic button pulse animation
- See `SilverCart_SDK54_Architecture_Conflicts.md` for details

### 4.4 API Integration

**Gemini API (Free Tier)**
- 60 requests per minute
- 1,500 requests per day
- Rate limiting handled client-side
- Error handling with fallback to keyword matching

**Supabase API**
- Real-time product updates
- Secure RLS policies with helper functions **NEW**
- File storage for product images

---

## 5. User Experience (UX)

### 5.1 User Flow: Voice Shopping Journey

**Scenario: Mak Salmah needs paracetamol**

1. **App Launch**
   - See large "Tap to Speak" floating button (80x80dp, bottom right)
   - See category cards (Pharmacy, Groceries)

2. **Voice Search**
   - Tap microphone → "I need paracetamol"
   - See: "Searching for paracetamol..." (with loading animation using Reanimated 2) **NEW**
   - Results show: Paracetamol 500mg, Panadol, generic brands

3. **Product Selection**
   - Tap product card → Large image, price (30pt bold, green), description
   - Large "Add to Cart" button (60dp height, pill-shaped) **NEW**
   - Confirmation: "Added to cart" (toast notification)

4. **Checkout**
   - Tap cart icon (badge shows quantity)
   - See cart items with large +/- buttons (60x60dp)
   - Tap "Checkout" (60dp height, pill-shaped, green) **NEW**
   - Step 1: Confirm address (pre-filled)
   - Step 2: Select "Cash on Delivery" (recommended with shield icon)
   - Step 3: Review order → "Place Order"

5. **Confirmation**
   - Order number displayed (large 32pt bold) **NEW**
   - "Your order will arrive in 1-2 days"
   - SMS notification shown (simulated)
   - Trusted contact notified (if enabled)

**Total Steps:** 8-10 taps (vs 15+ in standard e-commerce apps)

### 5.2 Accessibility Features

**Visual:**
- High contrast mode (default - WCAG AAA)
- Large fonts (18pt minimum, up to 30pt for prices)
- Clear visual hierarchy
- Icons + text labels (never icons alone)
- **NEW:** Background always eggshell (#F9F8F2), never white
- **NEW:** Text always off-black (#1A1A1A), never pure black

**Motor:**
- Large touch targets (60x60dp minimum) **NEW**
- No gestures required (no swipe, pinch-to-zoom)
- Debounced buttons (prevent accidental double-tap)
- **NEW:** All buttons use Pressable with hitSlop: 8

**Cognitive:**
- Simple navigation (max 4 tabs)
- Clear labels ("Cart" not shopping bag icon only)
- Confirmation messages for all actions
- Minimal steps to complete tasks

**Technical (SDK 54):** **NEW**
- SafeAreaView on all main screens (12 screens require this)
- Edge-to-edge display support
- Smooth animations using Reanimated 2

---

## 6. Development Roadmap

### 6.1 Timeline (16 weeks: Jan 16 - May 8, 2026)

**Phase 1: Planning & Design (Weeks 1-2) - Jan 16-29**
- [x] Requirements gathering
- [x] Database schema design (12 tables) **DONE**
- [x] Design system creation (DESIGN_SYSTEM.md) **DONE**
- [ ] UI/UX mockups (Figma)
- [ ] User research (interview 5 elderly users)

**Phase 2: Setup & Foundation (Weeks 3-4) - Jan 30 - Feb 12** ⬅️ **CURRENT PHASE**
- [x] Supabase project setup **DONE**
- [x] Database migration (12 tables) **DONE**
- [x] SDK 54 migration complete **DONE**
- [x] Project structure documented **DONE**
- [ ] React Native + Expo initialization **IN PROGRESS**
- [ ] Basic navigation structure
- [ ] Authentication flow (email + phone OTP)

**Phase 3: Core Features (Weeks 5-8) - Feb 13 - Mar 12**
- [ ] Product catalog UI
- [ ] Shopping cart functionality (persistent)
- [ ] Checkout flow (3 steps with mock payments)
- [ ] Order history
- [ ] Admin panel: Product management (CRUD)
- [ ] Admin panel: Login authentication (Supabase Auth)

**Phase 4: Voice AI Integration (Weeks 9-11) - Mar 13 - Apr 2**
- [ ] Voice input implementation (SDK 54 compatible)
- [ ] Gemini API integration
- [ ] Intent recognition & parsing
- [ ] Voice command testing (Malaysian English)
- [ ] Error handling & fallbacks (keyword matching)

**Phase 5: Advanced Features (Weeks 12-13) - Apr 3 - Apr 16**
- [ ] Trusted Contact system (setup + notifications)
- [ ] Order cancellation (5-minute window)
- [ ] Admin: Order management dashboard
- [ ] Admin: Order status updates
- [ ] Admin: Support inbox (chat interface)
- [ ] App settings (language, accessibility)
- [ ] Biometric authentication

**Phase 6: UI Polish & Safety (Weeks 14-15) - Apr 17 - Apr 30**
- [ ] Accessibility improvements (WCAG AAA)
- [ ] Visual design refinement
- [ ] Loading states & animations (Reanimated 2)
- [ ] Error messages
- [ ] Safety education tutorial
- [ ] Scam prevention warnings
- [ ] User acceptance testing (5+ elderly users)
- [ ] Bug fixes

**Phase 7: Documentation & Demo Prep (Week 16) - May 1 - May 8**
- [ ] Final report writing
- [ ] Demo video recording
- [ ] Presentation slides
- [ ] Demo script practice
- [ ] Backup plan preparation

### 6.2 Milestones

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| Design Complete | Jan 29 | Figma mockups, DB schema (12 tables), DESIGN_SYSTEM.md ✅ |
| Basic App Running | Feb 12 | Login + product listing + cart |
| Core Shopping Flow | Mar 12 | Browse → Cart → Checkout → Admin CRUD |
| Voice Working | Apr 2 | Voice search functional with Gemini AI |
| Advanced Features | Apr 16 | Orders, Support, Settings, Cancellation |
| Beta Ready | Apr 30 | Feature-complete (46 screens), tested |
| **Demo Ready** | **May 8** | **Live app + admin panel + presentation** |

---

## 7. Demo Strategy

### 7.1 Demo Scenario (5 minutes)

**Setup:**
- Elderly user persona (video or live volunteer)
- Projector showing mobile screen (mirroring) + admin panel (second screen)
- Pre-loaded test account

**Demo Flow:**

**[0:00-0:30] Problem Introduction**
- Show existing apps (Shopee) - "Too complex for elderly"
- Statistics: Malaysia aging population

**[0:30-2:00] Mobile App - Voice Shopping Demo**
1. "I need paracetamol" → Shows results
2. Select product → Add to cart (voice)
3. "I also need rice" → Add to cart
4. "What's in my cart?" → Shows cart
5. Complete checkout (3 steps)
6. Order confirmation with SMS to user + trusted contact

**[2:00-3:00] Admin Panel Demo**
1. Switch to admin screen
2. Show new order appeared in dashboard
3. Update order status to "preparing"
4. Show order detail view with timeline
5. Demonstrate support inbox (simulate customer message)

**[3:00-4:00] Safety & Trust Features**
- Show trusted contact notification (SMS)
- Demonstrate 5-minute cancellation window
- Show app settings (accessibility features)
- Display safety education screens

**[4:00-5:00] Technical Deep Dive**
- System architecture diagram
- Database schema (12 tables)
- Gemini API integration
- Supabase backend
- 46 screens showcase
- **NEW:** SDK 54 New Architecture benefits (Fabric + Bridgeless)

**[5:00+] Q&A**

### 7.2 Backup Plan

**If Voice Fails During Demo:**
- Pre-recorded video of voice working
- Explain: "In production with better internet..."
- Fall back to tap-based navigation

**If API Fails:**
- Mock responses cached locally
- Explain rate limiting

**If Internet Fails:**
- Full demo video pre-recorded
- Offline mode (cached products)

### 7.3 User Testing Plan

**Participants:** 5 elderly users (60+)

**Test Tasks:**
1. "Find and buy paracetamol using voice"
2. "Add rice and cooking oil to cart"
3. "Check your order history"
4. "Reorder your last purchase"

**Metrics to Collect:**
- Task completion rate
- Time to complete
- Number of errors
- User satisfaction (1-5 scale)
- Voice recognition accuracy
- Quotes for report

---

## 8. Technical Constraints & Risks

### 8.1 Constraints

**Budget:** RM0 / $0 USD
- Must use free tiers only
- Gemini API: 60 requests/min free tier
- Supabase: 500MB database, 1GB storage, 2GB bandwidth/month
- Expo: Free builds (limited to 15 builds/month)

**Time:** 16 weeks (part-time, academic workload)

**Skills:** Individual project, vibe coding approach
- Limited backend experience → Use BaaS
- AI-assisted development → Clear documentation needed

**SDK 54 Constraints:** **NEW**
- Must use Pressable (not TouchableOpacity)
- Must use Reanimated 2 (not Animated API)
- Must wrap screens in SafeAreaView (12 screens)
- Must clean up Voice listeners properly
- See `SilverCart_SDK54_Architecture_Conflicts.md` for full list

### 8.2 Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Voice recognition accuracy low | High | High | Fallback to manual search, test with Malaysian English dataset |
| Gemini API rate limit hit | Medium | Medium | Implement caching, local fallback for common queries |
| Supabase free tier limits | Low | Medium | Monitor usage, optimize queries |
| User testing recruitment | Medium | High | Start early, use family/community contacts |
| Scope creep | High | High | Stick to MVP, document Phase 2 features |
| Demo day technical failure | Medium | High | Pre-record backup video, offline mode, practice 10+ times |
| **SDK 54 migration issues** | **Medium** | **High** | **Follow architecture conflicts guide, test early** **NEW** |

### 8.3 Free Tier Limits

**Gemini API Free Tier:**
- 60 requests per minute
- 1500 requests per day
- Sufficient for: ~30 demo users x 10 searches each = 300 requests/day

**Supabase Free Tier:**
- 500MB database (enough for 1000+ products)
- 1GB file storage (100+ product images)
- 2GB bandwidth/month (careful with image sizes)

**Expo EAS Build:**
- 15 builds/month (plan builds carefully)

---

## 9. Success Metrics

### 9.1 Academic Evaluation Criteria

**Technical Complexity (30%)**
- ✅ AI integration (Gemini API)
- ✅ Mobile app development (React Native)
- ✅ Backend integration (Supabase)
- ✅ Voice recognition implementation
- ✅ Real-time updates
- ✅ **NEW:** SDK 54 New Architecture adoption

**Functionality (25%)**
- ✅ Complete user flow works
- ✅ Voice commands functional
- ✅ Accessibility features implemented
- ✅ Admin panel works

**Innovation (20%)**
- ✅ Addresses real problem (elderly accessibility)
- ✅ Novel approach (voice + elderly-optimized UI)
- ✅ User research conducted

**Documentation (15%)**
- ✅ Clear PRD (this document)
- ✅ Technical documentation
- ✅ User testing results
- ✅ Final report

**Presentation (10%)**
- ✅ Live demo works
- ✅ Clear explanation
- ✅ Professional delivery

### 9.2 User Testing Metrics

**Target:**
- Task completion rate: >80%
- User satisfaction: >4.0/5.0
- Voice recognition accuracy: >70%
- Time to complete purchase: <3 minutes

---

## 10. Future Enhancements (Post-FYP)

### 10.1 Phase 2 Features
- Voice output (text-to-speech)
- Multi-language: Bahasa Malaysia, Mandarin, Tamil
- Medication reminders with push notifications
- Caregiver dashboard (family monitoring)
- Health tracking integration
- Favorite items / Quick reorder

### 10.2 Commercialization Potential
**Path to Market:**

**Phase 1: Single Store Model (Current)**
- Operate as SilverCart direct store
- Partner with local suppliers for inventory
- Self-managed delivery or partner with Lalamove/GrabExpress

**Phase 2: Franchise Model**
- License SilverCart platform to individual pharmacies
- Each pharmacy manages their own inventory
- Branded as "[Pharmacy Name] powered by SilverCart"

**Phase 3: Regional Chain**
- Expand to multiple SilverCart-owned stores
- Centralized inventory management
- Multiple delivery hubs

**Phase 4: Hybrid Model**
- Allow selected verified pharmacies to join as sellers
- Maintain quality control and elderly-friendly standards
- Revenue: Transaction fees + subscription

**Partnership Opportunities:**
- Local pharmacies (Guardian, Watson's, Alpro)
- Government programs (MySejahtera integration, SOCSO benefits)
- Senior citizen associations
- Healthcare providers (medication delivery integration)

---

## 11. Appendix

### 11.1 Glossary
- **BaaS:** Backend-as-a-Service
- **NLU:** Natural Language Understanding
- **TTS:** Text-to-Speech
- **STT:** Speech-to-Text
- **OTP:** One-Time Password
- **RLS:** Row Level Security
- **APK:** Android Package Kit
- **PWA:** Progressive Web App **NEW**
- **Fabric:** React Native's New Architecture renderer **NEW**
- **JSI:** JavaScript Interface (part of New Architecture) **NEW**

### 11.2 References
- React Native Documentation: https://reactnative.dev/
- Supabase Documentation: https://supabase.com/docs
- Google Gemini API: https://ai.google.dev/
- WCAG Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Malaysia Digital Economy Blueprint
- **NEW:** Expo SDK 54 Documentation: https://docs.expo.dev/

### 11.3 Related Documents **NEW**
- `DESIGN_SYSTEM.md` - Complete design specifications
- `PROJECT_STRUCTURE_AND_ARCHITECTURE.md` - Folder organization
- `SilverCart_SDK54_Migration_Log.md` - SDK upgrade notes
- `SilverCart_SDK54_Architecture_Conflicts.md` - Code patterns to follow
- `SilverCart_SDK54_Build_Reminders.md` - SafeAreaView requirements
- `DATABASE_SETUP_GUIDE_V2.md` - Database setup instructions
- `database_migration_v2.sql` - SQL migration script

### 11.4 Contact
- Supervisor: [Name]
- Email: [Email]
- Project Repository: [GitHub URL]

---

## 📊 SUMMARY OF CHANGES (v1.0 → v2.0)

### Technical Updates:
- ✅ Upgraded to Expo SDK 54 with New Architecture
- ✅ Database expanded from 4 tables to 12 tables
- ✅ Complete design system documented (DESIGN_SYSTEM.md)
- ✅ Project structure fully organized (/src with 10 subdirectories)
- ✅ Supabase Auth integration (single auth system)
- ✅ SDK 54 architecture conflicts documented (7 conflicts)
- ✅ SafeAreaView requirements mapped (12 screens)

### Design Updates:
- ✅ Exact color palette defined (#007A6A, #F9F8F2, etc.)
- ✅ Typography scale locked (18pt minimum)
- ✅ Touch targets increased to 60x60dp
- ✅ Pill-shaped buttons standardized (borderRadius: 30)
- ✅ Material Symbols icons specified

### Feature Updates:
- ✅ Admin panel now responsive PWA (desktop/tablet/mobile)
- ✅ Order status history with audit trail
- ✅ Customer support messaging system
- ✅ Admin activity logging
- ✅ Helper functions for role checking

### Documentation Updates:
- ✅ 6 new reference documents created
- ✅ Migration guides written
- ✅ Architecture conflicts documented
- ✅ Build reminders added

---

**Document Status:** Production v2.0  
**Last Updated:** February 7, 2026  
**Previous Version:** v1.0 (January 16, 2026)  
**Next Review:** Week 8 (Mid-project checkpoint)
