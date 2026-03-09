-- Migration V3: Trusted Contacts
-- Extracts trusted contact information out of the users table and into a dedicated table
-- to support up to 2 trusted contacts per user.

-- Create trusted_contacts table
CREATE TABLE IF NOT EXISTS trusted_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT NOT NULL,
    notify_new_orders BOOLEAN DEFAULT true,
    notify_delivery BOOLEAN DEFAULT true,
    notify_security BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own trusted contacts"
    ON trusted_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted contacts"
    ON trusted_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted contacts"
    ON trusted_contacts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted contacts"
    ON trusted_contacts FOR DELETE
    USING (auth.uid() = user_id);

-- Optional: If you want to drop the columns from the users table after verifying the new table:
-- ALTER TABLE users
-- DROP COLUMN IF EXISTS trusted_contact_name,
-- DROP COLUMN IF EXISTS trusted_contact_phone,
-- DROP COLUMN IF EXISTS trusted_contact_relationship,
-- DROP COLUMN IF EXISTS trusted_contact_notify_orders,
-- DROP COLUMN IF EXISTS trusted_contact_notify_security;
