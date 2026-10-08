-- =============================================================================
-- CONCEPT ACADEMY - TURSO (libSQL / SQLite) DATABASE SCHEMA & SEED SCRIPT
-- =============================================================================
-- How to apply this schema to Turso:
-- 1. Install Turso CLI: curl -sSfL https://get.tur.so/install.sh | bash
-- 2. Authenticate: turso auth login
-- 3. Create database: turso db create concept-academy
-- 4. Execute this file: turso db shell concept-academy < turso_schema.sql
-- 5. Get database credentials:
--    - URL: turso db show concept-academy --url
--    - Token: turso db tokens create concept-academy
-- =============================================================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'parent', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    avatar_url TEXT,
    roll_number TEXT UNIQUE,
    course TEXT,
    batches TEXT,       -- JSON array: ["12th Science", "JEE Main"]
    subjects TEXT,      -- JSON array: ["Physics", "Mathematics"]
    linked_child_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. PARENT-STUDENT LINKAGES
CREATE TABLE IF NOT EXISTS parent_student_links (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT DEFAULT 'Parent',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(parent_id, student_id)
);

-- 3. COURSES & STREAMS
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    duration_months INTEGER DEFAULT 12,
    total_fee REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. BATCHES
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    room_number TEXT,
    max_capacity INTEGER DEFAULT 40,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. STUDENT FEES TABLE
CREATE TABLE IF NOT EXISTS student_fees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    roll TEXT,
    course TEXT,
    total_fee REAL NOT NULL DEFAULT 0,
    paid_fee REAL NOT NULL DEFAULT 0,
    is_fully_paid INTEGER DEFAULT 0,
    last_payment_date TEXT,
    remarks TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 6. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    batch_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    time TEXT,
    teacher_name TEXT,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    roll TEXT,
    status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Leave')),
    locked INTEGER DEFAULT 1,
    updated_by TEXT DEFAULT 'teacher',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(batch_id, student_id, date)
);

-- 7. TIMETABLES TABLE
CREATE TABLE IF NOT EXISTS timetables (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK(day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    subject TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room_number TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 8. TESTS TABLE
CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    course TEXT NOT NULL,
    batch TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    duration_min INTEGER DEFAULT 90,
    max_marks INTEGER DEFAULT 100,
    paper_url TEXT,
    status TEXT DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Completed')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- 9. TEST RESULTS & MARKS TABLE
CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    marks_obtained REAL NOT NULL DEFAULT 0,
    max_marks REAL NOT NULL DEFAULT 100,
    percentage REAL,
    rank INTEGER,
    remarks TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(test_id, student_id)
);

-- 10. STUDY MATERIALS TABLE (Stores Oracle Storage URLs)
CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    course TEXT NOT NULL,
    batch TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    title TEXT NOT NULL,
    material_type TEXT NOT NULL CHECK(material_type IN ('PDF', 'Notes', 'Video', 'Assignment')),
    file_url TEXT NOT NULL, -- Direct Oracle Object Storage URL / PAR URL
    file_size_bytes INTEGER,
    uploaded_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 11. BROADCAST NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_courses TEXT DEFAULT '["All Courses"]',
    created_by TEXT DEFAULT 'Admin',
    created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================================================
-- SEED INITIAL DATA
-- =============================================================================

-- Seed Sample Courses
INSERT OR IGNORE INTO courses (id, name, code, description, total_fee) VALUES
('c-01', 'Std. 9 - 10 Foundation', 'FND-9-10', 'Foundation course for Std 9 & 10 students', 15000),
('c-02', 'Std. 11 - 12 Science', 'SCI-11-12', 'State & CBSE Board Science curriculum', 20000),
('c-03', 'NEET Medical', 'NEET-MED', 'Comprehensive Medical entrance coaching', 35000),
('c-04', 'JEE Main + Advanced', 'JEE-ENG', 'Premier IIT-JEE engineering entrance coaching', 40000);

-- Seed Sample Student Fee Records
INSERT OR IGNORE INTO student_fees (id, name, roll, course, total_fee, paid_fee, is_fully_paid, last_payment_date, remarks) VALUES
('s-101', 'Rohan Sharma', '101', '12th Science', 20000, 11000, 0, '15 Sep 2026', '1st Installment Cleared'),
('s-102', 'Ananya Patel', '102', 'NEET', 35000, 35000, 1, '02 Oct 2026', 'Full Fees Paid in Advance'),
('s-103', 'Aarav Mehta', '103', 'JEE', 40000, 40000, 1, '10 Aug 2026', 'Lump Sum Settlement Done'),
('s-104', 'Sanya Gupta', '104', '11th Science', 20000, 8000, 0, '12 Sep 2026', 'Partially Paid (Pending 12k)');
