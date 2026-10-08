-- =============================================================================
-- CONCEPT ACADEMY: USER & ROLE MANAGEMENT IN SUPABASE
-- Run this script in your Supabase Project -> SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USER ROLE ENUM (student, teacher, parent, admin)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
-- Storing all user details with their explicit role
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    roll_number VARCHAR(50),
    course VARCHAR(100),
    batches TEXT,
    subjects TEXT,
    linked_child_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If the table already existed, ensure columns are added safely
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course VARCHAR(100);
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batches TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subjects TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linked_child_name VARCHAR(100);
    ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR PROFILES
-- Drop existing policies to allow clean re-runs
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow update profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete profile" ON public.profiles;

-- Allow reading profiles
CREATE POLICY "Public profiles read"
    ON public.profiles FOR SELECT
    USING (true);

-- Allow inserting profiles (from app client, admin client, or trigger)
CREATE POLICY "Allow insert profile"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Allow updating profiles
CREATE POLICY "Allow update profile"
    ON public.profiles FOR UPDATE
    USING (true);

-- Allow deleting profiles
CREATE POLICY "Allow delete profile"
    ON public.profiles FOR DELETE
    USING (true);

-- 5. AUTOMATIC TRIGGER: AUTH.USERS -> PUBLIC.PROFILES
-- When an admin adds a user in auth.users, this automatically saves/syncs them in public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role public.user_role;
    raw_role text;
BEGIN
    raw_role := lower(COALESCE(new.raw_user_meta_data->>'role', 'student'));

    IF raw_role IN ('teacher', 'faculty') THEN
        assigned_role := 'teacher'::public.user_role;
    ELSIF raw_role = 'parent' THEN
        assigned_role := 'parent'::public.user_role;
    ELSIF raw_role = 'admin' THEN
        assigned_role := 'admin'::public.user_role;
    ELSE
        assigned_role := 'student'::public.user_role;
    END IF;

    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        email,
        phone,
        roll_number,
        course,
        batches,
        subjects,
        linked_child_name,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new.id,
        assigned_role,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        NULLIF(new.raw_user_meta_data->>'phone', ''),
        NULLIF(new.raw_user_meta_data->>'rollNumber', ''),
        NULLIF(new.raw_user_meta_data->>'course', ''),
        NULLIF(new.raw_user_meta_data->>'batches', ''),
        NULLIF(new.raw_user_meta_data->>'subjects', ''),
        NULLIF(new.raw_user_meta_data->>'linkedChildName', ''),
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        roll_number = COALESCE(EXCLUDED.roll_number, public.profiles.roll_number),
        course = COALESCE(EXCLUDED.course, public.profiles.course),
        batches = COALESCE(EXCLUDED.batches, public.profiles.batches),
        subjects = COALESCE(EXCLUDED.subjects, public.profiles.subjects),
        linked_child_name = COALESCE(EXCLUDED.linked_child_name, public.profiles.linked_child_name),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 6. SEED / UPSERT PRIMARY ADMIN USER
-- Email: pinjari.work@gmail.com
-- Password: Zeeshan$2006
-- =============================================================================
DO $$
DECLARE
    admin_uid UUID := gen_random_uuid();
    admin_email TEXT := 'pinjari.work@gmail.com';
    admin_pass TEXT := 'Zeeshan$2006';
BEGIN
    -- 1. Create or update in auth.users with encrypted password
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_uid,
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_pass, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Zeeshan (Admin)","name":"Zeeshan (Admin)","role":"admin"}'::jsonb,
            NOW(),
            NOW(),
            '',
            ''
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = crypt(admin_pass, gen_salt('bf')),
            raw_user_meta_data = raw_user_meta_data || '{"full_name":"Zeeshan (Admin)","role":"admin"}'::jsonb,
            updated_at = NOW()
        WHERE email = admin_email;
    END IF;

    -- 2. Ensure profile exists in public.profiles with role = 'admin'
    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        email,
        is_active,
        created_at,
        updated_at
    )
    SELECT
        id,
        'admin'::public.user_role,
        'Zeeshan (Admin)',
        admin_email,
        TRUE,
        NOW(),
        NOW()
    FROM auth.users
    WHERE email = admin_email
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        full_name = 'Zeeshan (Admin)',
        email = EXCLUDED.email,
        updated_at = NOW();
END $$;

