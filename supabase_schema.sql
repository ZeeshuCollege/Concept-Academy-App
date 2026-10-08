-- =============================================================================
-- CONCEPT ACADEMY - MASTER DATABASE SCHEMA & SEED SCRIPT
-- =============================================================================
-- Run this in Supabase SQL Editor: Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave', 'holiday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE material_type AS ENUM ('notes', 'pdf', 'video', 'assignment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_channel AS ENUM ('whatsapp', 'email');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL, -- e.g. +917738578685
    avatar_url TEXT,
    roll_number VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PARENT-STUDENT LINKAGE TABLE
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'Parent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- 5. COURSES & BATCHES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(30),
    academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batch_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(batch_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.batch_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    UNIQUE(batch_id, teacher_id, subject)
);

-- 6. TIMETABLE SLOTS
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Mon ... 7=Sun
    subject VARCHAR(50) NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by UUID NOT NULL REFERENCES public.profiles(id),
    remarks VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(batch_id, student_id, date)
);

-- 8. TESTS & RESULTS
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    chapter VARCHAR(100),
    title VARCHAR(150) NOT NULL,
    test_date DATE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 90,
    total_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    instructions TEXT,
    paper_storage_path TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5,2) NOT NULL,
    correct_count INT DEFAULT 0,
    incorrect_count INT DEFAULT 0,
    unattempted_count INT DEFAULT 0,
    rank INT,
    remarks TEXT,
    entered_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(test_id, student_id)
);

-- 9. STUDY MATERIALS
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    chapter VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    material_type material_type NOT NULL DEFAULT 'pdf',
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HOMEWORK
CREATE TABLE IF NOT EXISTS public.homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    storage_path TEXT,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    target_role user_role,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FEES & PAYMENTS
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    total_fee NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, academic_year)
);

CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_id UUID NOT NULL REFERENCES public.fees(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode VARCHAR(50) DEFAULT 'Offline Cash/Cheque/UPI',
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    received_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUTH OTPS (WHATSAPP & EMAIL OTP RECOVERY)
CREATE TABLE IF NOT EXISTS public.auth_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(100) NOT NULL,
    channel otp_channel NOT NULL,
    hashed_otp VARCHAR(128) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Helper to retrieve current user's role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Admins have full profile access"
    ON public.profiles FOR ALL
    USING (public.get_auth_role() = 'admin');

CREATE POLICY "Users view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Parents view linked student profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.parent_student_links
            WHERE parent_id = auth.uid() AND student_id = public.profiles.id
        )
    );

-- RLS POLICIES FOR ATTENDANCE
CREATE POLICY "Students view own attendance"
    ON public.attendance FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Parents view child attendance"
    ON public.attendance FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.parent_student_links
            WHERE parent_id = auth.uid() AND student_id = public.attendance.student_id
        )
    );

CREATE POLICY "Teachers mark and view batch attendance"
    ON public.attendance FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.batch_teachers
            WHERE teacher_id = auth.uid() AND batch_id = public.attendance.batch_id
        )
    );

CREATE POLICY "Admins full attendance access"
    ON public.attendance FOR ALL
    USING (public.get_auth_role() = 'admin');

-- RLS POLICIES FOR TESTS & RESULTS
CREATE POLICY "Admins full tests access"
    ON public.tests FOR ALL
    USING (public.get_auth_role() = 'admin');

CREATE POLICY "Teachers manage assigned tests"
    ON public.tests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.batch_teachers
            WHERE teacher_id = auth.uid() AND batch_id = public.tests.batch_id
        )
    );

CREATE POLICY "Students view batch tests"
    ON public.tests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.batch_students
            WHERE student_id = auth.uid() AND batch_id = public.tests.batch_id
        )
    );

CREATE POLICY "Students view own results"
    ON public.test_results FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Parents view child results"
    ON public.test_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.parent_student_links
            WHERE parent_id = auth.uid() AND student_id = public.test_results.student_id
        )
    );

CREATE POLICY "Admins and teachers manage results"
    ON public.test_results FOR ALL
    USING (public.get_auth_role() IN ('admin', 'teacher'));

-- 15. SEED SAMPLE COURSES & BATCHES (Matching CONCEPT ACADEMY THEME.png)
INSERT INTO public.courses (id, name, code, description)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Std. 9 - 10 Foundation', 'FND-9-10', 'Foundation course for Std 9 & 10 students'),
    ('22222222-2222-2222-2222-222222222222', 'Std. 11 - 12 Science', 'SCI-11-12', 'State & CBSE Board Science curriculum'),
    ('33333333-3333-3333-3333-333333333333', 'NEET Medical', 'NEET-MED', 'Comprehensive Medical entrance coaching'),
    ('44444444-4444-4444-4444-444444444444', 'JEE Main + Advanced', 'JEE-ENG', 'Premier IIT-JEE engineering entrance coaching')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.batches (id, course_id, name, start_time, end_time, room_number, academic_year)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'JEE 12 - A', '10:00:00', '13:00:00', 'Room 204', '2025-2026'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'NEET 12 - B', '11:00:00', '14:00:00', 'Room 201', '2025-2026'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Class 11 - A', '08:00:00', '11:00:00', 'Room 102', '2025-2026'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Class 10 - A', '14:00:00', '17:00:00', 'Room 105', '2025-2026')
ON CONFLICT DO NOTHING;
