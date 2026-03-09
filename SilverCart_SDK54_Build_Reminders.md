# SilverCart — SDK 54 Build Reminders

## ⚠️ SafeAreaView Required (edgeToEdgeEnabled)

Because `edgeToEdgeEnabled: true` is set in `app.json`, these screens **must** wrap their content in `SafeAreaView` from `react-native-safe-area-context`. Without it, content will render behind the Android status bar.

---

### Screens That Need SafeAreaView

| Screen | Route | Why It Matters |
|--------|-------|----------------|
| **B1** | `/home` | Main landing screen — first thing users see. Large voice search button and category cards must not be clipped. |
| **B2** | `/cart` | Sticky bottom checkout button and cart summary must stay visible and not overlap status bar. |
| **B3** | `/orders` | Order list is scrollable — top items will hide behind status bar without SafeArea. |
| **B4** | `/profile` | Profile header with user name and trust badge must be fully visible. |
| **D1** | `/category/:categoryId` | Product grid — top row of cards will be clipped. |
| **D2** | `/search?q=[query]` | Search results header ("Results for...") will hide. |
| **E1** | `/product/:productId` | Large product image at top of screen — will render behind status bar. |
| **G1** | `/checkout/step1` | Progress indicator (● ○ ○) at top must be visible. |
| **G2** | `/checkout/step2` | Progress indicator (● ● ○) at top must be visible. |
| **G3** | `/checkout/step3` | Progress indicator (● ● ●) at top must be visible. |
| **G4** | `/checkout/confirmation` | Success animation and order number — critical screen, must look perfect. |
| **H1** | `/order/:orderId` | Order detail header and status banner must not be clipped. |
| **C1** | `/voice-search` | Voice search title and mic button layout depends on full screen space. |

---

### Copy-Paste Template

Use this at the top of **every screen** listed above:

```javascript
import { SafeAreaView } from 'react-native-safe-area-context';

export default function YourScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Screen content here */}
    </SafeAreaView>
  );
}
```

> 💡 Use `backgroundColor: '#FFFFFF'` for most screens.  
> Use `backgroundColor: '#FFF9E6'` (soft cream) if the screen uses the alternate background from the design system.

---

### One-Time Setup (Do This Now)

Make sure this is already installed before building any screen:

```bash
npx expo install react-native-safe-area-context
```

And wrap your **root app** (in `App.js` or `app/layout`) with the provider — do this once:

```javascript
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Your navigation / app tree here */}
    </SafeAreaProvider>
  );
}
```

---

### Why This Matters for SilverCart Specifically

The target users are **60+ year olds** with vision challenges. Content hiding behind the status bar is especially confusing for this group — they won't instinctively know to scroll up or realise something is missing. Every screen must be fully visible on first load, no exceptions.

---

*Created: February 3, 2026*  
*Reason: SDK 54 upgrade set `edgeToEdgeEnabled: true` in app.json*  
*Review when: Starting Phase 3 (Core Features, Weeks 5–8)*
