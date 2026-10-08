# Google Play Console Submission Checklist: Concept Academy
**Application Name:** Concept Academy  
**Package ID:** `com.conceptacademy.learning`  
**Target SDK:** 36 (Android 16 Compliant)  
**Release Artifact:** `ConceptAcademy-release.aab` (17.6 MB)  

---

## 1. Overview & Separation of Responsibilities
This document provides an actionable step-by-step checklist for releasing Concept Academy on the Google Play Console. Items marked **[AUTOMATICALLY COMPLETED IN PROJECT]** have been engineered, configured, and tested in this codebase. Items marked **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]** must be executed by the account owner inside the Google Play Console web dashboard.

---

## 2. Policy Declarations & App Content Setup

### A. Privacy Policy
- **Status:** **[AUTOMATICALLY COMPLETED IN PROJECT]**  
  - Full privacy policy authored in [public/privacy-policy.html](file:///d:/ASPIRE%20APP/public/privacy-policy.html) detailing student data, Supabase storage, Meta OTP, security, and deletion policies.
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **Policy and programs -> App content -> Privacy policy**, enter the live public HTTPS URL where `privacy-policy.html` is hosted (e.g. `https://conceptacademy.com/privacy-policy.html` or Supabase storage public URL).

### B. App Access & Reviewer Credentials
- **Status:** **[AUTOMATICALLY COMPLETED IN PROJECT]**  
  - Pre-configured demo accounts baked into client: `admin.demo@conceptacademy.local`, `student.demo@conceptacademy.local`, `parent.demo@conceptacademy.local`, `teacher.demo@conceptacademy.local` with password `ConceptAcademyDemo@2026`. Detailed guide written to [play-store-review-access.md](file:///d:/ASPIRE%20APP/play-store-review-access.md).
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **App content -> App access**, select **"All or some functionality is restricted"**.
  - Add credential instructions:
    - User name: `student.demo@conceptacademy.local`
    - Password: `ConceptAcademyDemo@2026`
    - Instructions: "Select Student Login on welcome screen and sign in with demo credentials. Bypasses phone OTP."

### C. Ads Declaration
- **Status:** **[AUTOMATICALLY COMPLETED IN PROJECT]**  
  - Verified no ad SDKs (AdMob, Unity Ads, etc.) exist in dependencies or code.
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **App content -> Ads**, select **"No, my app does not contain ads"**.

### D. Target Audience and Content (COPPA & Families Policy)
- **Status:** **[AUTOMATICALLY COMPLETED IN PROJECT]**  
  - The app serves secondary, higher secondary coaching, and competitive exams (Class 9th, 10th, 11th, 12th, NEET, JEE). Target demographic is **13–17 (Teens)** and **18 and over (Adults/Parents/Teachers)**.
  - Stripped all child-incompatible permissions (`RECORD_AUDIO`, `READ_MEDIA_AUDIO`, `READ_MEDIA_VIDEO`).
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **App content -> Target audience and content**:
    - Target age groups: Check **13-15**, **16-17**, and **18 and over**.
    - Leave **Under 13 unchecked** (unless the institute plans to enroll primary school children, which triggers strict Designed for Families review).
    - Neutral age screen question: Answer "No".
    - Appeal to children: Select "No" (app UI is professional academic coaching).

### E. Content Rating (IARC)
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **App content -> Content ratings**:
    - Category: **Consumer / Utility / Educational**.
    - Violence / Offensive language / Controlled substances: Select **No** for all.
    - User interaction / Social: Select **Yes** (students can receive notices/alerts from teachers/admin).
    - Rating outcome: Typically results in **PEGI 3 / Everyone**.

### F. Data Safety Form
- **Status:** **[AUTOMATICALLY COMPLETED IN PROJECT]**  
  - Exact data ledger created in `PLAY_STORE_RELEASE_AUDIT.md`.
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **App content -> Data safety**:
    - Does your app collect or share any user data? Select **Yes**.
    - Is data encrypted in transit? Select **Yes** (HTTPS/TLS to Supabase and Meta).
    - Can users request their data to be deleted? Select **Yes**.
    - **Personal Info:** Name, Email address, Phone number (Collected, Not shared, App functionality / Account management, Optional / Admin provisioned).
    - **App info and performance:** Crash logs / Diagnostics (Collected for diagnostics if enabled).
    - **Photos and Videos:** Optional profile photo upload (Handled in-app, stored in Supabase).
    - No location data, financial info, audio files, or browser history is collected.

### G. Data Deletion & Account Deletion URL
- **Status:** **[AUTOMATICALLY COMPLETED IN PROJECT]**  
  - In-app deletion dialog implemented in `DeleteAccountModal.jsx` and accessible via `StudentProfile.jsx`.
  - External self-service deletion web page created in [public/delete-account.html](file:///d:/ASPIRE%20APP/public/delete-account.html).
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **App content -> Data safety -> Data deletion**:
    - Provide the live URL for account deletion: `https://conceptacademy.com/delete-account.html` (or hosted Supabase storage URL).
    - Confirm both account details and academic logs can be deleted or requested for deletion.

### H. Financial Features & Play Billing Declaration
- **Status:** **[AUTOMATICALLY COMPLETED IN PROJECT]**  
  - Verified app only tracks tuition fees for physical classroom coaching. No digital goods, virtual currency, or locked digital subscriptions are sold in-app.
- **Manual Step:** **[MANUAL ACTION REQUIRED IN PLAY CONSOLE]**  
  - In Play Console -> **App content -> Financial features**, declare that the app is an educational management tool and does not provide banking, loans, or in-app payment of digital content.

---

## 3. Store Listing Setup

### Store Metadata
- **App Name:** Concept Academy (<= 30 characters)
- **Short Description:** Official student companion & coaching management app for Concept Academy. (<= 80 characters)
- **Full Description:**
  > Welcome to the official Concept Academy mobile app — designed for students, parents, and faculty of Concept Academy.
  > 
  > Key Features:
  > • Daily Attendance Tracking: Monitor attendance records and monthly percentage.
  > • Coaching Batch Schedules: Timetables and classroom batch schedules for 9th, 10th, 11th, 12th, NEET & JEE.
  > • Test Results & Analytics: Access mock test scorecards, chapter assessments, and performance analytics.
  > • Homework & Study Materials: Reference lecture notes, question banks, and revision materials.
  > • Tuition Fee Transparency: Instant visibility into offline coaching fee records and payment milestones.
  > • Important Announcements: Real-time broadcast alerts and updates directly from institute faculty.
  > 
  > Stay connected with your academic journey at Concept Academy!
- **Category:** Education
- **Tags:** Education, Coaching, School Management, Study Tools

### Visual Assets Checklist
- [ ] **App Icon:** 512 x 512 PNG (32-bit with alpha, max 1MB) — Export from `public/logo.png`.
- [ ] **Feature Graphic:** 1024 x 500 JPG/PNG (No transparency, 15% edge padding for text/logos).
- [ ] **Phone Screenshots:** Minimum 2, recommended 4–8 (16:9 or 18:9 aspect ratio, minimum 1080px wide). Capture Student Dashboard, Attendance, Fee Tracker, and Study Material screens.

---

## 4. Release Creation & Artifact Upload

1. Navigate to **Release -> Production** (or **Closed testing** if on personal account).
2. Select **Create new release**.
3. Choose **Play App Signing** (let Google manage the app signing key).
4. Upload the production bundle:
   - File: `ConceptAcademy-release.aab`
   - Location: `d:\ASPIRE APP\ConceptAcademy-release.aab` (or `android/app/build/outputs/bundle/release/app-release.aab`)
5. Verify bundle details:
   - Package name: `com.conceptacademy.learning`
   - Version code: `1`
   - Version name: `1.0`
   - Target SDK: `36` (Android 16 compliant)
   - Min SDK: `24` (Android 7.0+)
6. Release notes:
   ```xml
   <en-US>
   Official initial release of Concept Academy student companion app. Features attendance tracking, batch schedules, test results, and offline coaching fee records.
   </en-US>
   ```
7. Review warnings (confirm 0 errors).
8. Save and proceed to rollout review.
