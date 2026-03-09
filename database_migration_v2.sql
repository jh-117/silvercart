-- ============================================
-- SilverCart Database Migration Script (FIXED)
-- ============================================
-- Version: 1.1
-- Date: January 31, 2026
-- Tables: 12 tables (using Supabase Auth for admins)
-- Features: RLS policies, indexes, triggers
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: USERS (Extended from Supabase Auth)
-- ============================================
-- Note: Supabase auth.users table already has id, email
-- This table extends it with app-specific fields

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) UNIQUE,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  auth_method VARCHAR(20) DEFAULT 'email', -- 'email' or 'phone'
  
  -- Trusted Contact (Family Member for Safety)
  trusted_contact_name VARCHAR(100),
  trusted_contact_phone VARCHAR(20),
  trusted_contact_relationship VARCHAR(50), -- 'son', 'daughter', 'spouse', etc.
  trusted_contact_enabled BOOLEAN DEFAULT TRUE,
  trusted_contact_notify_orders BOOLEAN DEFAULT TRUE,
  trusted_contact_notify_security BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_phone ON users(phone_number);

-- ============================================
-- TABLE 2: USER_ROLES
-- ============================================
-- Store user roles (customer, admin, support, manager)
-- Uses Supabase auth.users for the actual user accounts

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'support', 'manager'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, role)
);

-- Index for role checks
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ============================================
-- TABLE 2.5: PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for profiles phone lookups
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- ============================================
-- TABLE 3: APP_SETTINGS
-- ============================================
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en', -- 'en' or 'ms'
  push_notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  sms_notifications_enabled BOOLEAN DEFAULT TRUE,
  text_size VARCHAR(20) DEFAULT 'medium', -- 'small', 'medium', 'large', 'xl'
  high_contrast_mode BOOLEAN DEFAULT FALSE,
  voice_feedback_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- TABLE 4: PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'pharmacy' or 'grocery'
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock_status VARCHAR(20) DEFAULT 'in_stock', -- 'in_stock' or 'out_of_stock'
  search_keywords TEXT[], -- Array for voice search matching
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast searches
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_stock_status ON products(stock_status);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_search_keywords ON products USING gin(search_keywords);

-- ============================================
-- TABLE 5: CART_ITEMS
-- ============================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, product_id) -- Prevent duplicate products in cart
);

-- Index for faster cart queries
CREATE INDEX idx_cart_user_id ON cart_items(user_id);

-- ============================================
-- TABLE 6: ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee DECIMAL(10,2) DEFAULT 5.00,
  delivery_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'cod', 'online_banking', 'e_wallet'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  cancelled_by VARCHAR(20), -- 'customer' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for order queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- TABLE 7: ORDER_ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10,2) NOT NULL CHECK (price_at_purchase >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for order items lookup
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- TABLE 8: ORDER_STATUS_HISTORY
-- ============================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by_type VARCHAR(20) NOT NULL, -- 'customer', 'admin', 'system'
  changed_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for history lookup
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- ============================================
-- TABLE 9: NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'order_placed', 'order_confirmed', 'order_delivered', 'security_alert'
  message TEXT NOT NULL,
  recipient_type VARCHAR(20) NOT NULL, -- 'customer' or 'trusted_contact'
  recipient_phone VARCHAR(20),
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_order_id ON notifications(order_id);
CREATE INDEX idx_notifications_sent ON notifications(sent);

-- ============================================
-- TABLE 10: SUPPORT_MESSAGES
-- ============================================
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high'
  is_read BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for support queries
CREATE INDEX idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX idx_support_messages_status ON support_messages(status);
CREATE INDEX idx_support_messages_assigned_to ON support_messages(assigned_to);

-- ============================================
-- TABLE 11: SUPPORT_REPLIES
-- ============================================
CREATE TABLE support_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  support_message_id UUID REFERENCES support_messages(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- 'customer' or 'admin'
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for replies lookup
CREATE INDEX idx_support_replies_message_id ON support_replies(support_message_id);
CREATE INDEX idx_support_replies_created_at ON support_replies(created_at ASC);

-- ============================================
-- TABLE 12: ADMIN_ACTIVITY_LOG
-- ============================================
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL, -- 'product_created', 'order_updated', 'support_resolved'
  entity_type VARCHAR(50), -- 'product', 'order', 'support_message'
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for activity log
CREATE INDEX idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- ============================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_messages_updated_at BEFORE UPDATE ON support_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = has_role.user_id
    AND role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_replies ENABLE ROW LEVEL SECURITY;

-- USERS: Can only view/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- USER_ROLES: Users can view their own roles, admins can manage all
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (is_admin(auth.uid()));

-- PROFILES: Users can manage their own profiles
CREATE POLICY "Users can view own profiles" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- APP_SETTINGS: Users can manage their own settings
CREATE POLICY "Users can manage own settings" ON app_settings
  FOR ALL USING (auth.uid() = user_id);

-- PRODUCTS: Public read, admin-only write
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin(auth.uid()));

-- CART_ITEMS: Users can only manage their own cart
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- ORDERS: Users can only view their own orders, admins can view all
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending orders" ON orders
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    status = 'pending' AND 
    created_at > NOW() - INTERVAL '5 minutes'
  );

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (is_admin(auth.uid()));

-- ORDER_ITEMS: Users can view items in their orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "System can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- NOTIFICATIONS: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- SUPPORT_MESSAGES: Users can manage their own tickets, admins can view all
CREATE POLICY "Users can manage own support messages" ON support_messages
  FOR ALL USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- SUPPORT_REPLIES: Users can view replies to their tickets
CREATE POLICY "Users can view own support replies" ON support_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_messages 
      WHERE support_messages.id = support_replies.support_message_id 
      AND (support_messages.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can create support replies" ON support_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_messages 
      WHERE support_messages.id = support_replies.support_message_id 
      AND support_messages.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- ADMIN_ACTIVITY_LOG: Admins can view all, only log their own actions
CREATE POLICY "Admins can view activity log" ON admin_activity_log
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert admin activity" ON admin_activity_log
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- SEED DATA: Create Admin User
-- ============================================

-- This will be done through Supabase Auth UI:
-- 1. Go to Authentication → Users
-- 2. Create user: admin@silvercart.com / Admin123!
-- 3. Copy the user_id
-- 4. Run this query with the actual user_id:

-- INSERT INTO user_roles (user_id, role)
-- VALUES ('paste-user-id-here', 'admin');

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Customer profiles (extends Supabase auth.users)';
COMMENT ON TABLE profiles IS 'Profiles for auth users matching the mobile app model';
COMMENT ON TABLE user_roles IS 'User roles (customer, admin, support, manager)';
COMMENT ON TABLE app_settings IS 'User preferences and accessibility settings';
COMMENT ON TABLE products IS 'Product catalog (pharmacy and grocery items)';
COMMENT ON TABLE cart_items IS 'Shopping cart items (persistent across sessions)';
COMMENT ON TABLE orders IS 'Customer orders with delivery and payment info';
COMMENT ON TABLE order_items IS 'Line items for each order';
COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';
COMMENT ON TABLE notifications IS 'SMS notifications to customers and trusted contacts';
COMMENT ON TABLE support_messages IS 'Customer support tickets';
COMMENT ON TABLE support_replies IS 'Replies to support tickets';
COMMENT ON TABLE admin_activity_log IS 'Audit log for admin actions';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count tables created
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- END OF MIGRATION
-- ============================================
