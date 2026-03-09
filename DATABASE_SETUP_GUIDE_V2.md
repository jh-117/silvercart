# SilverCart - Database Setup Guide v2 (FIXED)

**Date:** January 31, 2026  
**Version:** 2.0 - Using Supabase Built-in Auth  
**Tables:** 12 tables  
**Time to Complete:** 10-15 minutes

---

## 🔄 What Changed in v2?

### ❌ Removed:
- Separate `admins` table with custom auth

### ✅ Added:
- **`user_roles` table** - Stores roles (customer, admin, support, manager)
- **Uses Supabase `auth.users`** - One authentication system for everyone
- **Helper functions** - `is_admin()`, `has_role()` for role checking

### 💡 Why This is Better:

1. **Single source of truth** - One auth system (Supabase Auth)
2. **Built-in security** - Supabase handles password hashing, JWT, etc.
3. **Easy admin creation** - Create admin users through Supabase UI
4. **Simpler code** - No need to manage separate admin auth
5. **Better scalability** - Add roles without new tables

---

## 📋 What This Creates

### Database Tables (12 Total)

1. **users** - Customer profiles (extends `auth.users`)
2. **user_roles** - User roles (customer/admin/support/manager)
3. **app_settings** - User preferences
4. **products** - Product catalog
5. **cart_items** - Shopping cart
6. **orders** - Customer orders
7. **order_items** - Order line items
8. **order_status_history** - Audit trail
9. **notifications** - SMS notifications
10. **support_messages** - Support tickets
11. **support_replies** - Ticket replies
12. **admin_activity_log** - Admin actions log

### Plus:
- **Helper functions** - `is_admin()`, `has_role()`
- **RLS Policies** - Secure data access
- **Indexes** - Fast queries
- **Triggers** - Auto-update timestamps

---

## 🚀 Step-by-Step Setup

### Step 1: Run the Migration

1. Go to https://app.supabase.com
2. Select your **SilverCart project**
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open `database_migration_v2.sql`
6. **Copy ALL the code**
7. **Paste** into Supabase SQL Editor
8. Click **Run** (or Ctrl+Enter)

**Expected result:**
```
Success. No rows returned
```

---

### Step 2: Verify Tables Created

Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected output:** 12 table names

---

### Step 3: Create Admin User

Now we'll create an admin account using Supabase Auth:

#### Option A: Through Supabase UI (Recommended)

1. In Supabase, click **Authentication** (left sidebar)
2. Click **Users** tab
3. Click **Add User** → **Create new user**
4. Fill in:
   - **Email:** `admin@silvercart.com`
   - **Password:** `Admin123!`
   - **Auto Confirm User:** ✅ (check this box!)
5. Click **Create User**
6. **Copy the User ID** (you'll need it next)

#### Now Assign Admin Role:

Go back to **SQL Editor** and run:

```sql
-- Replace 'paste-user-id-here' with the actual UUID you copied
INSERT INTO user_roles (user_id, role)
VALUES ('paste-user-id-here', 'admin');

-- Also create the user profile
INSERT INTO users (id, name, address, auth_method)
VALUES ('paste-user-id-here', 'System Admin', 'Admin Office', 'email');
```

**Verify it worked:**

```sql
SELECT 
  au.id,
  au.email,
  u.name,
  ur.role
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'admin@silvercart.com';
```

**Expected output:** One row showing email, name, and 'admin' role

---

### Step 4: Create Test Customer User (Optional)

For testing your app:

1. **Authentication** → **Users** → **Add User**
2. Email: `test@customer.com`
3. Password: `Test123!`
4. Auto Confirm: ✅
5. **Copy User ID**

Then run:

```sql
-- Replace with actual user ID
INSERT INTO user_roles (user_id, role)
VALUES ('paste-user-id-here', 'customer');

INSERT INTO users (id, name, address, phone_number, auth_method)
VALUES (
  'paste-user-id-here',
  'Test Customer',
  '123 Test Street, Kuala Lumpur',
  '+60123456789',
  'email'
);

-- Also create default app settings
INSERT INTO app_settings (user_id)
VALUES ('paste-user-id-here');
```

---

## 📦 Add Sample Products

```sql
-- Pharmacy Products
INSERT INTO products (name, category, description, price, image_url, stock_status, search_keywords)
VALUES
('Paracetamol 500mg', 'pharmacy', '24 tablets for pain relief and fever', 5.90, 
 'https://via.placeholder.com/800x800.png?text=Paracetamol', 'in_stock', 
 ARRAY['paracetamol', 'panadol', 'pain relief', 'fever', 'headache']),
 
('Ibuprofen 400mg', 'pharmacy', '20 tablets for inflammation and pain', 8.50,
 'https://via.placeholder.com/800x800.png?text=Ibuprofen', 'in_stock',
 ARRAY['ibuprofen', 'pain', 'anti-inflammatory']),
 
('Multivitamin', 'pharmacy', '30 tablets daily supplement', 18.90,
 'https://via.placeholder.com/800x800.png?text=Multivitamin', 'in_stock',
 ARRAY['vitamin', 'supplement', 'health']),
 
('Blood Pressure Monitor', 'pharmacy', 'Digital automatic BP monitor', 89.00,
 'https://via.placeholder.com/800x800.png?text=BP+Monitor', 'in_stock',
 ARRAY['blood pressure', 'monitor', 'diabetes', 'health check']),
 
('First Aid Kit', 'pharmacy', 'Complete first aid essentials', 45.00,
 'https://via.placeholder.com/800x800.png?text=First+Aid', 'in_stock',
 ARRAY['first aid', 'bandage', 'emergency']);

-- Grocery Products
INSERT INTO products (name, category, description, price, image_url, stock_status, search_keywords)
VALUES
('White Rice 5kg', 'grocery', 'Premium white rice - Cap Bunga Raya', 18.50,
 'https://via.placeholder.com/800x800.png?text=Rice+5kg', 'in_stock',
 ARRAY['rice', 'beras', 'staple', 'grain']),
 
('Cooking Oil 1L', 'grocery', 'Pure cooking oil - Saji brand', 7.20,
 'https://via.placeholder.com/800x800.png?text=Cooking+Oil', 'in_stock',
 ARRAY['oil', 'minyak', 'cooking']),
 
('Sardines in Tomato Sauce', 'grocery', '425g canned sardines', 4.50,
 'https://via.placeholder.com/800x800.png?text=Sardines', 'in_stock',
 ARRAY['sardines', 'fish', 'canned', 'protein']),
 
('3-in-1 Coffee', 'grocery', '20 sachets instant coffee', 8.50,
 'https://via.placeholder.com/800x800.png?text=Coffee', 'in_stock',
 ARRAY['coffee', 'kopi', 'drink', 'beverage']),
 
('Laundry Detergent 2kg', 'grocery', 'Powder detergent for washing', 14.50,
 'https://via.placeholder.com/800x800.png?text=Detergent', 'in_stock',
 ARRAY['detergent', 'soap', 'laundry', 'cleaning']);

-- Verify products were added
SELECT COUNT(*) as product_count FROM products;
-- Expected: 10
```

---

## 🧪 Test Your Database

### Test 1: Check Admin Role

```sql
-- This should return TRUE
SELECT is_admin('paste-admin-user-id-here');
```

### Test 2: Add Item to Cart

```sql
-- Get IDs first
SELECT id FROM auth.users WHERE email = 'test@customer.com';
SELECT id FROM products LIMIT 1;

-- Add to cart (replace UUIDs)
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES ('customer-user-id', 'product-id', 2);
```

### Test 3: View Cart with Products

```sql
SELECT 
  ci.quantity,
  p.name,
  p.price,
  (ci.quantity * p.price) as subtotal
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = 'customer-user-id';
```

---

## 🔐 Understanding the New Auth System

### How It Works

```
Supabase Auth (auth.users)
         |
         ├─> users (app profile: name, address, etc.)
         └─> user_roles (role: customer/admin/support)
```

### User Types

1. **Customer** (Default)
   - Can shop, view own orders, manage own cart
   - Role: `customer`

2. **Admin**
   - Full access to products, orders, support
   - Role: `admin`

3. **Support** (Future)
   - Access to support messages only
   - Role: `support`

4. **Manager** (Future)
   - Same as admin but limited permissions
   - Role: `manager`

### Checking Roles in Your App

```typescript
// Check if current user is admin
const { data } = await supabase
  .rpc('is_admin', { user_id: currentUserId });

// Check specific role
const { data } = await supabase
  .rpc('has_role', { 
    user_id: currentUserId,
    role_name: 'admin'
  });
```

---

## ⚠️ Troubleshooting

### Error: "new row violates row-level security policy"

**Cause:** User doesn't have permission  
**Fix:** Make sure user has correct role:

```sql
-- Check user's roles
SELECT * FROM user_roles WHERE user_id = 'user-id-here';

-- If missing, add role
INSERT INTO user_roles (user_id, role)
VALUES ('user-id-here', 'customer');
```

### Error: "foreign key violation"

**Cause:** Referenced user doesn't exist in `auth.users`  
**Fix:** Create user in Supabase Auth first, then add to `users` table

### Can't login as admin

**Fix:** 
1. Verify user exists in Supabase Auth
2. Check user has admin role in `user_roles`
3. Check user profile exists in `users` table

```sql
-- Verify admin setup
SELECT 
  au.email,
  u.name,
  ur.role
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'admin@silvercart.com';
```

---

## ✅ Verification Checklist

- [ ] All 12 tables created
- [ ] Admin user created in Supabase Auth
- [ ] Admin role assigned in `user_roles`
- [ ] Admin profile created in `users`
- [ ] Test customer user created (optional)
- [ ] Sample products inserted
- [ ] Helper functions (`is_admin`, `has_role`) work
- [ ] RLS policies enabled
- [ ] Can add items to cart
- [ ] Can create orders

---

## 🔜 Next Steps

After database is ready:

1. **Generate TypeScript types** from your Supabase schema
2. **Create auth service** - Login/signup functions
3. **Build auth screens** - Welcome, login, signup
4. **Create product service** - Fetch products from database
5. **Build home screen** - Display products from real data

---

## 📘 Migration from v1 to v2

If you already ran v1, here's how to migrate:

```sql
-- Drop old admins table
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create new tables
CREATE TABLE user_roles (...);  -- Copy from migration
CREATE TABLE admin_activity_log (...);  -- Copy from migration

-- Migrate existing admin (if you created one manually)
-- 1. Create user in Supabase Auth UI
-- 2. Add role
INSERT INTO user_roles (user_id, role)
VALUES ('new-auth-user-id', 'admin');
```

---

**Database Setup Guide Version:** 2.0  
**Last Updated:** January 31, 2026  
**Fixes:** Table order, Supabase Auth integration
