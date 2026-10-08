# Concept Academy - Product Requirement Document (PRD)

| **Document Version** | 2.0.0 |
| **Document Status** | Approved Specification |
| **Target Release** | Concept Academy Digital Ecosystem v1.0 |
| **Ecosystem Type** | Closed Private Educational Platform |
| **Cost Constraint** | **100% Free Subscriptions Only (Zero-Cost Infrastructure)** |

---

## 1. Executive Summary & Institute Vision

**Concept Academy** is a premier offline coaching institute delivering competitive and academic curriculum for:
- **Secondary School**: Standard 9 and Standard 10
- **Higher Secondary Science**: Standard 11 and Standard 12
- **National Competitive Exams**: NEET (Medical), JEE Main, and JEE Advanced (Engineering)

The **Concept Academy Digital Platform** is a **strictly closed, private ecosystem** engineered specifically for the students, faculty, parents, and administrative management of Concept Academy.

> [!IMPORTANT]
> **Core Product Principle**:
> This platform is **NOT** an open public ed-tech marketplace or MOOC. There is **NO public self-registration**. All user accounts are provisioned, authorized, and governed directly by Concept Academy institute management. The platform digitizes and optimizes offline classroom operations, real-time academic monitoring, and multi-stakeholder communication.

---

## 2. Infrastructure & Zero-Cost Mandate

The entire system is architected to operate **permanently on 100% Free Tiers**, requiring **zero paid accounts or recurring subscriptions**:

| Component | Free-Tier Service Provider | Free Quota & Operational Limits | Strategy for Staying Within Free Quota |
| :--- | :--- | :--- | :--- |
| **Backend & Database** | **Supabase Free Tier** | 500 MB Postgres database, 2 projects, 50,000 MAU | Clean normalized schema, regular log vacuums, optimized relational indexing. |
| **Authentication** | **Supabase Auth (GoTrue)** | 50,000 Monthly Active Users (MAU) | Built-in email/password and OAuth without third-party auth costs. |
| **Storage (Materials & Papers)** | **Supabase Storage** | 1 GB Free S3-compatible Object Storage | PDF compression before upload (max 10MB per file), client-side cache, CDN caching. |
| **Serverless Functions** | **Supabase Edge Functions** | 500,000 monthly invocations | Lightweight Deno runtime used strictly for OTP dispatch and secure admin workflows. |
| **WhatsApp OTP & Alerts** | **Meta for Developers (WhatsApp Cloud API)** | **1,000 free service conversations / month** | WhatsApp OTPs strictly used for account verification and password resets. Routine notifications routed via free FCM. |
| **Push Notifications** | **Firebase Cloud Messaging (FCM)** | **100% Free & Unlimited** | Push alerts for timetable changes, marks, attendance, announcements, and fee reminders. |
| **Third-Party Identity** | **Google Cloud Identity (OAuth 2.0)** | Free Tier Client ID | Standard Google sign-in consent screen with zero billing requirement. |
| **Web Admin Hosting** | **Cloudflare Pages / Vercel Hobby** | Unlimited static bandwidth, Free SSL, Global CDN | Automated GitHub Actions deployment of the compiled React/Vite Admin bundle. |
| **Mobile Distribution** | **Local Build / GitHub Releases / Firebase App Distribution** | 100% Free | Local Gradle/APK release generation, distributed via direct download or free app testing channels. |

---

## 3. Targeted User Personas & Ecosystem Synergy

The platform bridges four synchronized stakeholders:
```
           ┌──────────────────────────────────────────────┐
           │          Concept Academy Admin App           │
           │     (Mobile App: Complete Institute Governance)│
           └──────────────────────┬───────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Teacher Portal  │    │  Student Portal  │    │  Parent Portal   │
│   (Mobile App:   │    │   (Mobile App:   │    │   (Mobile App:   │
│  Classroom Ops)  │    │  Learning Desk)  │    │ Monitoring & Fee)│
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

> [!IMPORTANT]
> **100% Mobile-Only Architecture Mandate**:
> All four dashboards (**Student, Teacher, Parent, and Admin**) are built exclusively as **native mobile applications for Android & iOS**. There is **NO web dashboard**. Every workflow—from daily student timetable viewing to institute-wide administrator enrollment and fee auditing—is engineered directly for mobile screens matching the exact mobile comps in `CONCEPT ACADEMY THEME.png`.
>
> **Core Technology Selection**:
> Built using **Flutter (Dart)**, the premier cross-platform engine ensuring 100% identical pixel-perfect UI, 120fps hardware acceleration, native DRM-light protection (`FLAG_SECURE`), and single-codebase parity across both **Android and iOS**.

### 3.1 Personas
1. **Student**: Enrolled in Std. 9–12, NEET, or JEE batches. Needs daily schedule clarity, test visibility, secure access to study materials, results analytics, and assignment tracking.
2. **Teacher**: Subject specialists conducting offline lectures. Needs one-tap attendance marking, test scheduling, marks entry, study material distribution, and batch performance insights.
3. **Parent / Guardian**: Monitors student attendance, test progress, overall percentage, fee payment statuses, and attends Parent-Teacher Meetings (PTMs).
4. **Admin**: Institute directors and administrative staff. Controls enrollment, faculty assignment, course/batch structures, attendance audits, fee records, and institute-wide reporting.

---

## 4. Role-Based Access Control (RBAC) & Permissions Matrix

| Feature / Resource | Student | Teacher | Parent | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Personalized Home Dashboard** | View Own | View Assigned | View Linked Child | View Institute KPI |
| **Timetable & Daily Schedule** | View Own | View Assigned | View Linked Child | Manage All |
| **Mark Attendance** | None | Mark/Edit Assigned | None | Override/Audit All |
| **View Attendance** | View Own | View Assigned | View Linked Child | View All |
| **Study Material Upload** | None | Upload Assigned | None | Upload All |
| **Study Material View** | View Own (In-App) | View Assigned | None | View All |
| **Create Tests & Upload Papers**| None | Create Assigned | None | Create All |
| **In-App Test Paper View** | View (Protected) | View Assigned | View (Summary) | View All |
| **Enter Test Marks / Results** | None | Enter Assigned | None | Enter All |
| **View Results & Analytics** | View Own | View Assigned | View Linked Child | View All |
| **Homework & Assignments** | Submit/View Own | Create/Review Assigned| View Status | View All |
| **Announcements** | View Targeted | Send Batch-Level | View Targeted | Broadcast All |
| **Fee Records & Dues** | None | None | View Linked Child | Full Management |
| **User & Batch Enrollment** | None | None | None | Full Management |
| **Export Reports (CSV/Excel/PDF)**| None | None | None | Full Export |

---

## 5. Comprehensive Authentication & Identity Architecture

### 5.1 Account Provisioning (Closed Institute Model)
- **Zero Self-Registration**: No public registration form exists.
- **Admin Enrollment**: Admins pre-populate user profiles with:
  - Full Name, Role (`student`, `teacher`, `parent`, `admin`)
  - Registered Email Address
  - Registered WhatsApp Mobile Number (E.164 format, e.g., `+919876543210`)
  - Assigned Course, Batch, or Linked Student ID (for parents).
- **Initial Activation**: Users receive an onboarding notification via WhatsApp and Email containing temporary credentials or an activation link.

### 5.2 Login Modalities

#### A. Manual Email & Password Login (Supabase Auth)
- Built-in Supabase `signInWithPassword({ email, password })`.
- Passwords salted and hashed via Argon2/Bcrypt on Supabase servers.
- Password complexity: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 numeric digit, and 1 special character.
- "Remember Me" securely caches the refreshed session token in hardware-backed secure storage (`FlutterSecureStorage` / `Expo SecureStore` / `HttpOnly` cookie).

#### B. Google OAuth (Supabase Auth)
- Direct Google Sign-In button integrated via Supabase Google Provider.
- **Whitelist Gatekeeper**: When a user signs in with Google, an Edge Function / Trigger validates whether the returned Google email address exists in the pre-registered `profiles` table.
  - If registered $\rightarrow$ Auth session granted, user redirected to their role-specific dashboard.
  - If not registered $\rightarrow$ Session terminated immediately with error: *"This Google account is not registered with Concept Academy. Please contact institute administration."*

#### C. Role Selector on Login Screen
- Pill selector for `[Student | Teacher | Parent | Admin]` ensures the UI tailors the login experience, validates role compatibility, and redirects to the proper root navigation stack.

---

## 6. Password Recovery & Two-Way Verification Flow

Users who forget their password have the autonomy to select between **two secure, zero-cost recovery channels**:

```
                       [ Forgot Password Screen ]
                                   │
              Enter Registered Email or Mobile Number
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       [ Option 1: WhatsApp OTP ]     [ Option 2: Supabase Email ]
       (Meta for Developers App)          (Supabase Auth Engine)
                    │                             │
          Sends 6-digit secure OTP      Sends Password Reset Link
          via WhatsApp Cloud API           or 6-digit Email OTP
                    │                             │
          Verify OTP (60s timer)        Click Link / Enter Code
                    │                             │
                    └──────────────┬──────────────┘
                                   ▼
                       [ Set New Password Screen ]
                       (Min 8 chars, strong rules)
                                   │
                       Password Updated Successfully
                                   │
                       Auto-Redirect to Login
```

### 6.1 Option 1: WhatsApp OTP (Meta Developer App)
1. **Trigger**: User selects *"Verify via WhatsApp"*.
2. **Generation**: Supabase Edge Function `send-whatsapp-otp` creates a cryptographically random 6-digit OTP, hashes it using SHA-256 with a salt, and stores it in the `auth_otps` table with a 5-minute time-to-live (`expires_at = now() + interval '5 minutes'`).
3. **Dispatch**: Edge Function executes an HTTP POST to Meta Graph API v19.0+:
   ```http
   POST https://graph.facebook.com/v19.0/{phone-number-id}/messages
   Authorization: Bearer {META_SYSTEM_USER_ACCESS_TOKEN}
   Content-Type: application/json

   {
     "messaging_product": "whatsapp",
     "to": "919876543210",
     "type": "template",
     "template": {
       "name": "concept_academy_auth_otp",
       "language": { "code": "en" },
       "components": [
         {
           "type": "body",
           "parameters": [{ "type": "text", "text": "482910" }]
         },
         {
           "type": "button",
           "sub_type": "url",
           "index": "0",
           "parameters": [{ "type": "text", "text": "482910" }]
         }
       ]
     }
   }
   ```
4. **Verification**: User inputs the 6-digit code into a responsive 6-cell input screen with a 60-second resend cooldown timer.
5. **Validation**: Edge Function `verify-whatsapp-otp` verifies the hash, ensures `used = false`, and issues a temporary recovery token allowing the user to update their password.
6. **Cost Control**: Strictly utilizes Meta's 1,000 free utility/service conversations per month. Rate-limited to max 3 OTP requests per phone number per hour.

### 6.2 Option 2: Email Password Reset (Supabase Auth)
1. **Trigger**: User selects *"Verify via Email"*.
2. **Dispatch**: Supabase client executes `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'com.conceptacademy.learning://reset-password' })`.
3. **Execution**: User receives an email with an action link or numeric OTP.
4. **Validation**: Deep link or OTP handler opens the secure password reset screen.
5. **Update**: User sets a new password via `supabase.auth.updateUser({ password: newPassword })`.

---

## 7. Detailed Functional Modules (Mapped to Visual Theme)

### 7.1 Student Portal (Mobile App)
Based on `CONCEPT ACADEMY THEME.png` Row 1:
1. **Splash & Welcome Screen**:
   - High-impact Concept Academy gradient ribbon logo with tagline *"Better Learning, Bigger Dreams"*.
   - Primary action: *"Get Started"* leading to unified login.
2. **Student Home Dashboard**:
   - Header: Personalized greeting (*"Good Morning, Rohan Sharma"*), current batch badge (*"Std. 12 • Science • JEE"*), profile avatar.
   - **Today's Class Card**: Highlight card for current/next lecture (Subject, Time e.g. *"10:00 AM - 11:00 AM"*, Room e.g. *"Room 204"*), *"View Schedule"* CTA.
   - **Quick Action Grid**: 4 squircle shortcuts $\rightarrow$ Attendance, Tests, Materials, More.
   - **Upcoming Tests Section**: Horizontal cards showing Test Name, Subject, Date, Duration (e.g., *"Chemistry Test • 16 Apr 2025 • 90 min"*).
3. **Timetable & Daily Schedule**:
   - Interactive horizontal day selector (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`).
   - Detailed timeline cards with status indicators (`Ongoing`, `Upcoming`, `Completed`), subject, timing, classroom, and faculty name.
4. **Attendance Tracking**:
   - Circular radial progress gauge displaying overall percentage (e.g., `89% Overall Attendance`).
   - Subject-wise breakdown bars (Physics 92%, Mathematics 86%, Chemistry 78%, Biology 88%).
   - Detailed attendance history and leave status.
5. **Study Material Repository**:
   - Instant search bar and material type filter pills (`All`, `Notes`, `PDF`, `Video`).
   - Structured hierarchy: `Course → Batch → Subject → Chapter → Material`.
   - Chapter cards: Mechanics, Organic Chemistry, Trigonometry, Cell Structure with file count and size.
6. **Test System & In-App Viewer**:
   - Segmented tabs: `Upcoming` vs `Completed`.
   - Test cards display Test Code, Subject, Date, Max Marks, and Duration.
   - **Protected In-App Test Paper Viewer**:
     - Embedded native PDF viewer.
     - **No download button, no print button, no external export**.
     - Watermarked with student's Name and Roll Number across the viewport to deter screen capture.
   - Test Results: Detailed mark sheets, percentage, correct/incorrect/unattempted split, class percentile, and subject-wise rank.
7. **Profile & Settings**:
   - Personal details, enrolled courses, Change Password, Notification preferences, Help & Support, and Log Out.

---

### 7.2 Teacher Portal (Mobile/Tablet/Web)
Based on `CONCEPT ACADEMY THEME.png` Row 2:
1. **Teacher Dashboard**:
   - Greeting (*"Good Morning, Ms. Priya Shah • Physics Teacher"*).
   - Today's Classes timeline with room numbers and batch tags.
   - **Quick Action Bar**:
     - *Take Attendance*
     - *Create Test*
     - *Upload Material*
     - *Assign Homework*
2. **My Batches**:
   - Active batch cards: `JEE 12 - A` (35 Students), `NEET 12 - B` (29 Students), `Class 11 - A` (32 Students), `Class 10 - A` (30 Students).
   - Batch status badge (`Active`), quick shortcuts to batch student list, tests, and attendance history.
3. **Attendance Marker**:
   - Batch & Subject selector with date picker.
   - Toggle view: `Students` list vs `Summary`.
   - Student roll with status pills (`Present`, `Absent`, `Leave`).
   - One-tap *"Mark All Present"* button for rapid morning roll calls.
4. **Create Test & Upload Test Paper**:
   - Form fields: Test Name, Batch multiselect, Subject dropdown, Chapter/Topic, Scheduled Date, Duration (e.g., `1 hr 30 min`), Maximum Marks.
   - Test Paper upload dropzone (PDF format, auto-compressed).
5. **Upload Study Material**:
   - Select Batch, Subject, Chapter.
   - File attachment picker (PDF, DOC, PPT, Images - max 10MB per file).
   - Title and optional reference description.
6. **Student Performance Analytics**:
   - Batch selector with tabs: `Overview`, `Subject-wise`, `Tests`.
   - Circular gauge for Batch Average Score (e.g. `78%`).
   - Highlight cards for *Top Performer* (e.g., Aarav Mehta • 92%) and *Lowest Performer* (e.g., Riya Sharma • 45%) for early academic intervention.
7. **Announcements**:
   - Batch-specific notices (test rescheduling, syllabus completion, holiday updates) broadcasted via push notification.

---

### 7.3 Parent Portal (Mobile App)
Based on `CONCEPT ACADEMY THEME.png` Row 3:
1. **Parent Home Dashboard**:
   - Personalized greeting (*"Hello, Amit Sharma"*).
   - **Linked Child Card**: Child avatar, name (*"Rohan Sharma"*), class (*"Std. 12 • Science"*).
   - At-a-glance KPI pills: Attendance (`92%`), Tests (`86%`), Performance (`78%`).
   - Immediate alert for upcoming tests or absent marks.
2. **Child Profile & Navigation Hub**:
   - Single-tap access to Child Profile, Attendance Calendar, Performance Trends, Test Results, Homework, and Fee Details.
   - Multi-child switcher for parents with more than one student enrolled at Concept Academy.
3. **Attendance Calendar (Dot Matrix)**:
   - Monthly and Weekly toggle.
   - Visual calendar grid with colored dot indicators:
     - 🟢 Green: Present
     - 🔴 Red: Absent
     - 🟡 Orange: Leave
     - ⚪ Gray: Institute Holiday
4. **Performance Analytics**:
   - Overall Progress radial score (e.g., `78%`, `+6% vs last test`).
   - Subject breakdown bars: Physics (82%), Chemistry (76%), Mathematics (78%).
   - Historical test score trends and progress reports.
5. **Fee Management & Due Date Tracking**:
   - Summary card: Total Fees (`₹75,000`), Total Paid (`₹45,000`), Outstanding Pending (`₹30,000`).
   - Progress bar illustrating paid vs total percentage (e.g., `60% Paid`).
   - Next Due Date highlight card (`25 Apr 2025`) with fee receipt download.
6. **Parent-Teacher Meeting (PTM) Desk**:
   - Upcoming PTM card: Date, time slot, Room number, assigned faculty, and agenda details.
   - History of past meetings and teacher remarks.

---

### 7.4 Admin Mobile App
Based on `CONCEPT ACADEMY THEME.png` Row 4 (Screens 25 to 30):
1. **Executive KPI Dashboard (Mobile Screen 25)**:
   - Header with Concept Academy branding, Admin greeting, and active notifications.
   - Top Metrics KPI Cards (Swipeable/Grid):
     - **Total Students**: `248` (Active enrollments)
     - **Present Today**: `218` (Live daily attendance)
     - **Total Teachers**: `18` (Faculty count)
     - **Pending Fees**: `₹1,25,000` (Outstanding balance)
   - Visual Analytics:
     - **Attendance Overview Chart**: Touch-interactive curve chart showing weekly attendance percentages.
     - **Fee Collection Chart**: Monthly grouped bar chart tracking collection targets vs realizations.
     - **Upcoming Classes Widget**: Live classroom tracker (Room 204, Room 201, Room 102).
2. **Student & Parent Governance (Mobile Screen 26)**:
   - Searchable, filterable student mobile directory.
   - Add/Edit Student modal: Name, roll number, course, batch assignment, parent mobile & email linkage.
   - Account status toggles (`Active`, `Inactive`, `Alumni`).
3. **Teacher & Faculty Governance (Mobile Screen 27)**:
   - Mobile directory of teachers with assigned subjects and batches.
   - Add Teacher modal with email provisioning and role assignments.
4. **Course & Batch Architecture (Mobile Screen 28)**:
   - Course stream cards: Std. 9–10 Foundation, Std. 11–12 Science, NEET Medical, JEE Main + Advanced Engineering.
   - Batch scheduling, classroom allocation, student capacity management.
5. **Academic Audits & Results**:
   - Master schedule, uploaded test papers, and institute-wide results publisher.
6. **Fee Management System**:
   - Fee structure builder by course and batch, installment tracking, and receipt generator.
7. **Reports & Mobile Data Export (Mobile Screen 29)**:
   - Modules: Attendance Report, Performance Report, Fee Report, Enrollment Report.
   - **Quick Export in 1-tap**: CSV, Excel, and printable PDF formats shared via native mobile share sheet.
8. **Settings & Security (Mobile Screen 30)**:
   - Institute profile, app settings, notification thresholds, user permission audits, and Supabase backup configurations.

---

## 8. In-App Document Security & DRM-Light Architecture

To protect Concept Academy's intellectual property (proprietary question papers, copyrighted study materials):
1. **Direct Download Prohibition**: The mobile and web clients do not provide a "Download File" or "Save to Disk" option.
2. **Short-Lived Signed URLs**: Supabase Storage buckets for `test-papers` and `study-materials` are private. Files are accessed via temporary signed URLs with a 15-minute expiration time.
3. **Sandboxed Viewport Rendering**:
   - Android/iOS: Rendered using native memory-buffered PDF libraries (`pdfx` or `flutter_pdfview` / native canvas).
   - Web: Rendered via Mozilla `pdf.js` inside a sandboxed iframe with toolbar buttons (`#download`, `#print`, `#openFile`) disabled and hidden via CSS/JS parameters (`#toolbar=0`).
4. **Dynamic Forensic Watermarking**: The student's Full Name, Roll Number, and Timestamp are dynamically rendered as a semi-transparent repeating diagonal overlay across the document canvas.
5. **Screen Capture Flag**: On mobile devices, `FLAG_SECURE` (Android) and screen recording prevention (iOS) are enabled on the test paper viewing route.

---

## 9. Non-Functional & Operational Requirements

### 9.1 Performance & Latency
- **Initial Dashboard Render**: Under 1.5 seconds on standard 4G mobile connections.
- **Attendance Submission**: Instant optimistic UI update with asynchronous database synchronization in under 800ms.
- **Offline Resilience**: Offline caching of daily timetable, latest attendance summary, and downloaded study materials for offline viewing inside the secure app sandbox.

### 9.2 Security & Data Privacy
- **Row Level Security (RLS)** enabled on 100% of PostgreSQL tables.
- No student or parent can view another student's test results, attendance, or fees.
- Teachers can only view and mutate records for their assigned batches.
- Zero public REST API endpoints; all requests require a valid Supabase JWT bearer token.

### 9.3 Availability & Free-Tier Continuity
- Supabase free projects pause after 7 days of inactivity; an automated weekly health-check ping via GitHub Actions keeps the free project permanently warm.
- Meta WhatsApp Cloud API credentials maintained through a persistent Meta System User with a non-expiring access token.

---

## 10. Summary of Additions & Enhancements in PRD v2.0

1. **Google OAuth via Supabase**: Seamless 1-tap sign-in restricted to pre-registered institute emails.
2. **Manual Email Login via Supabase**: Secure email/password authentication with hardware-backed session persistence.
3. **WhatsApp OTP via Meta Dev App**: Direct integration with WhatsApp Cloud API using pre-approved authentication templates for instant 6-digit OTP delivery.
4. **Dual Password Reset Architecture**: Autonomous recovery enabling users to select either WhatsApp OTP or Supabase Email Reset.
5. **100% Free-Tier Guarantee**: Strict zero-cost operational blueprint leveraging Supabase, Meta Cloud API (1,000 free monthly conversations), Google Cloud Identity, Cloudflare Pages, and Firebase Cloud Messaging.
6. **Complete Visual Design Alignment**: 1-to-1 functional specification for all 24 UI screens featured in `CONCEPT ACADEMY THEME.png`.
