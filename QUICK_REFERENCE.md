# SilverCart - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Navigate to your project folder
cd silvercart-mobile

# Install dependencies (if package.json exists)
npm install

# Start development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Run on specific platform
npx expo start --android
npx expo start --ios
```

---

## 📁 Project Structure

```
silvercart-mobile/
├── src/
│   ├── screens/       # 37 mobile screens
│   ├── components/    # Reusable UI
│   ├── navigation/    # Navigation config
│   ├── services/      # API & business logic
│   ├── contexts/      # React Context (state)
│   ├── hooks/         # Custom hooks
│   ├── types/         # TypeScript types
│   ├── utils/         # Helpers
│   ├── theme/         # Design system
│   └── assets/        # Images, icons
├── .env              # Your secrets (DON'T COMMIT)
├── .env.example      # Template (commit this)
├── App.tsx           # Root component
└── package.json      # Dependencies
```

---

## 🎨 Design System Quick Access

### Colors
```typescript
import { theme } from './src/theme';

theme.colors.primary       // #007A6A (Teal)
theme.colors.success       // #4CAF50 (Green)
theme.colors.error         // #C62828 (Red)
theme.colors.textPrimary   // #222222
```

### Typography
```typescript
theme.typography.fontSize.h1      // 32pt
theme.typography.fontSize.h2      // 28pt
theme.typography.fontSize.body    // 18pt
```

### Spacing
```typescript
theme.spacing.md                      // 16
theme.spacing.touchTarget.button      // 60 (min height)
theme.spacing.borderRadius.md         // 12
```

---

## 🔑 Environment Variables

**File: `.env`** (create this manually)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Getting Supabase credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy "Project URL" and "anon public" key

**Getting Gemini API key:**
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

---

## 🔧 Common Issues & Solutions

### "Module not found" error
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Supabase connection fails
1. Check `.env` file exists
2. Verify credentials are correct
3. Restart dev server: Ctrl+C then `npx expo start`

### Expo Go not connecting
1. Same Wi-Fi? (phone + computer)
2. Try tunnel: `npx expo start --tunnel`
3. Check firewall

### TypeScript errors
```bash
npx tsc --noEmit
```

---

## 📱 Testing on Device

### iOS (iPhone/iPad)
1. Install "Expo Go" from App Store
2. Open Camera app
3. Scan QR code from terminal
4. Opens in Expo Go

### Android
1. Install "Expo Go" from Play Store
2. Open Expo Go app
3. Scan QR code from terminal

---

## 🗄️ Supabase Quick Commands

### Test connection (run in App.tsx):
```typescript
import { supabase } from './src/services/supabase';

const testConnection = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('count');
  
  console.log(data ? '✅ Connected' : '❌ Failed');
};
```

---

## 📊 Screen Count Reference

**Total: 46 screens**

- **Mobile App: 37 screens**
  - Auth Flow: 12 screens (A1-A8)
  - Main App: 4 tabs (B1-B4)
  - Products: 3 screens (D1-D2, E1)
  - Checkout: 4 screens (G1-G4)
  - Profile: 9 screens (I2-I8)
  - Voice: 1 screen (C1)
  - Orders: 1 screen (H1)
  - Special: 3 screens (J1-J3)

- **Admin Panel: 9 screens** (web-based)
  - Login: 1 screen (AA1)
  - Products: 4 screens (AA2-AA5)
  - Orders: 2 screens (AA6-AA7)
  - Support: 1 screen (AA8)
  - Dashboard: 1 screen (AA9)

---

## ⏱️ Development Timeline

**Total: 16 weeks** (Jan 16 - May 8, 2026)

- Week 1-2: Planning ✅
- Week 3-4: Setup ← YOU ARE HERE
- Week 5-8: Core features (shopping flow)
- Week 9-11: Voice AI
- Week 12-13: Advanced features (admin, support)
- Week 14-15: Polish & testing
- Week 16: Demo prep

---

## 📚 Important Files to Review

1. `SETUP_GUIDE.md` - Detailed setup instructions
2. `SilverCart_AI_Build_Summary.md` - Complete project overview
3. `SilverCart_Complete_Screen_Inventory.md` - All 46 screens
4. `SilverCart_Database_ERD.mermaid` - Database structure

---

## 🎯 Next Steps After Setup

1. **Create database tables** (11 tables in Supabase)
2. **Build authentication screens** (A1-A8)
3. **Set up navigation** (Bottom tabs)
4. **Create product catalog** (D1, E1)
5. **Add voice search** (C1 + Gemini API)

---

## 💡 Pro Tips

- **Use Expo Go** for fast development (no builds needed)
- **Hot reload** saves time (Ctrl+S to refresh)
- **Check logs** in terminal for errors
- **Test on real device** (elderly users need real phone testing)
- **Commit often** to Git (but NOT .env file!)

---

## 📞 Help & Support

- Expo Docs: https://docs.expo.dev
- React Native: https://reactnative.dev
- Supabase: https://supabase.com/docs
- Gemini API: https://ai.google.dev/docs

---

**Quick Reference Version:** 1.0  
**Last Updated:** January 31, 2026  
**Print this card and keep it handy!**
