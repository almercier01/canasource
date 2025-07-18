-- Refactor users table to remove redundancies and improve efficiency

-- Step 1: Remove the redundant email column (email is already in auth.users)
ALTER TABLE public.users DROP COLUMN IF EXISTS email;

-- Step 2: Remove the redundant full_name column (can be computed from first_name + last_name)
ALTER TABLE public.users DROP COLUMN IF EXISTS full_name;

-- Step 3: Add useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_province ON public.users(province);
CREATE INDEX IF NOT EXISTS idx_users_city ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);

-- Step 4: Create a view that includes computed full_name and email from auth.users
CREATE OR REPLACE VIEW users_with_details AS
SELECT 
  u.*,
  COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.last_name, 'User') as full_name,
  au.email
FROM public.users u
JOIN auth.users au ON u.id = au.id;

-- Grant permissions on the view
GRANT SELECT ON users_with_details TO authenticated;

-- Step 5: Update any functions or triggers that might reference the removed columns
-- (This would need to be done based on actual usage in your codebase)
