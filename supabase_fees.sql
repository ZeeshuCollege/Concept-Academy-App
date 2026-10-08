-- =============================================================================
-- CONCEPT ACADEMY: STUDENT FEES TABLE FOR SUPABASE
-- Run this script in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. Create student_fees table
CREATE TABLE IF NOT EXISTS public.student_fees (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll VARCHAR(50),
    course VARCHAR(100),
    total_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    paid_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_fully_paid BOOLEAN DEFAULT FALSE,
    last_payment_date VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing policies if re-running
DROP POLICY IF EXISTS "Allow select student_fees" ON public.student_fees;
DROP POLICY IF EXISTS "Allow insert student_fees" ON public.student_fees;
DROP POLICY IF EXISTS "Allow update student_fees" ON public.student_fees;
DROP POLICY IF EXISTS "Allow delete student_fees" ON public.student_fees;

-- 4. Open policies for full frontend CRUD access (matching profiles table)
CREATE POLICY "Allow select student_fees"
    ON public.student_fees FOR SELECT
    USING (true);

CREATE POLICY "Allow insert student_fees"
    ON public.student_fees FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update student_fees"
    ON public.student_fees FOR UPDATE
    USING (true);

CREATE POLICY "Allow delete student_fees"
    ON public.student_fees FOR DELETE
    USING (true);

-- 5. Seed initial fee records
INSERT INTO public.student_fees (id, name, roll, course, total_fee, paid_fee, is_fully_paid, last_payment_date, remarks)
VALUES 
    ('s-101', 'Rohan Sharma', '101', '12th Science', 20000, 11000, FALSE, '15 Sep 2026', '1st Installment Cleared'),
    ('s-102', 'Aarav Patel', '102', 'JEE (Mains + Adv)', 75000, 45000, FALSE, '10 Sep 2026', 'Partially Paid'),
    ('s-103', 'Ananya Iyer', '103', 'NEET', 120000, 120000, TRUE, '01 Sep 2026', 'One-time Full Advance'),
    ('s-104', 'Sneha Kulkarni', '104', '12th Science', 25000, 18000, FALSE, '22 Aug 2026', 'Balance due next week'),
    ('s-105', 'Vikram Joshi', '105', '11th Science', 20000, 20000, TRUE, '28 Aug 2026', 'Full Tuition Paid'),
    ('s-106', 'Ishita Deshmukh', '106', 'MHT-CET', 15000, 8000, FALSE, '05 Sep 2026', '2nd installment pending'),
    ('s-107', 'Aditya Verma', '107', 'JEE (Mains + Adv)', 200000, 150000, FALSE, '12 Sep 2026', 'Scholarship Adjusted'),
    ('s-108', 'Tanvi Nair', '108', 'NEET', 120000, 80000, FALSE, '18 Sep 2026', '3rd Installment Pending'),
    ('s-109', 'Aryan Gupta', '109', '9th Standard', 15000, 15000, TRUE, '03 Sep 2026', 'Full Fees Cleared'),
    ('s-110', 'Diya Sharma', '110', '10th Standard', 18000, 12000, FALSE, '14 Sep 2026', 'Remaining 6k due')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    roll = EXCLUDED.roll,
    course = EXCLUDED.course,
    total_fee = EXCLUDED.total_fee,
    paid_fee = EXCLUDED.paid_fee,
    is_fully_paid = EXCLUDED.is_fully_paid,
    last_payment_date = EXCLUDED.last_payment_date,
    remarks = EXCLUDED.remarks,
    updated_at = NOW();
