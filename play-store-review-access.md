# Google Play Store Review Access & Credentials
**Application Name:** Concept Academy  
**Package ID:** `com.conceptacademy.learning`  
**Target Audience:** Students (Grades 9–12 / NEET / JEE), Parents, Faculty, Administrators  
**Review Type:** Google Play Policy & App Review  

---

## 1. Overview
The Concept Academy app is an offline coaching institute management and student companion app. Access to core academic and attendance dashboards requires authentication.

To facilitate Google Play App Review, pre-configured demo credentials with mock data are baked into the application. These accounts **do not require SMS/WhatsApp verification**, have **no expiry**, and provide instant access to all core user roles without requiring manual backend approval.

---

## 2. Reviewer Test Credentials

| Role | Email / Username | Password | Purpose & Accessible Screens |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin.demo@conceptacademy.local` | `ConceptAcademyDemo@2026` | Full administrative control: Manage Students, Mark Attendance, Fee Records, Send Broadcasts & Alerts, Review Timetables. |
| **Student** | `student.demo@conceptacademy.local` | `ConceptAcademyDemo@2026` | Enrolled student view: Student Dashboard, Attendance history, Fee breakdown (e.g. 11k/20k paid), Study Materials, Timetable, Test Results, Account Deletion & Privacy Policy. |
| **Parent** | `parent.demo@conceptacademy.local` | `ConceptAcademyDemo@2026` | Parent portal: Child academic progress (Rohan Sharma), real-time attendance alerts, fee ledger, institute notices. |
| **Teacher / Faculty** | `teacher.demo@conceptacademy.local` | `ConceptAcademyDemo@2026` | Faculty portal: Class batches, Physics curriculum, mark daily student attendance, upload homework. |

---

## 3. Step-by-Step Login Instructions

1. **Launch App:** Open the Concept Academy app on your Android testing device or emulator.
2. **Access Login Modal:**
   - On the welcome landing screen, tap **"Student Login"**, **"Teacher Login"**, or **"Admin"** from the navigation bar / menu.
   - Alternatively, tap the **"Sign In"** button on the top right.
3. **Enter Credentials:**
   - Enter one of the reviewer email addresses above (e.g., `admin.demo@conceptacademy.local` or `student.demo@conceptacademy.local`).
   - Enter the Password: `ConceptAcademyDemo@2026` (or `AspireDemo@2026`).
4. **Authenticate:**
   - Tap **"Sign In"**.
   - The app will authenticate instantaneously and redirect to the role-specific dashboard.

---

## 4. Alternative OTP-Based Testing (WhatsApp/Phone)
The app also offers a phone/WhatsApp OTP flow for parents and students:
- **Test Phone Number:** `+91 9999999999` (or any valid 10-digit number)
- **Universal Test Passcode:** `786786`
- **Fallback Verification:** If the network is restricted or the phone number is not registered on WhatsApp sandbox, the app displays the generated 6-digit verification code directly in the prompt UI so the reviewer is never blocked.

---

## 5. Key Feature Navigation Guide for Reviewers

### A. Student Profile, Data Safety & Account Deletion
- **Navigation:** Log in as `student.demo@conceptacademy.local` -> Tap **Profile** icon in bottom navigation bar.
- **Account Deletion:** Tap **"Delete Account & Data"** -> Read warning -> Confirm deletion. The app clears local cache and informs the backend.
- **Web Account Deletion URL:** `https://conceptacademy.com/delete-account.html` (or self-hosted `delete-account.html`).
- **Privacy Policy:** Tap **"Privacy Policy"** in the profile screen to review in-app compliance documentation.

### B. Student Fee Tracking (Offline Physical Services)
- **Navigation:** Log in as `admin.demo@conceptacademy.local` -> Tap **Quick Actions -> Fees** or the **Fees** card.
- **Features:** Search students by name, filter by batch (`12th Science`, `NEET`, `JEE`), view progress bar (`11k/20k`), click **"Send Alert"**, **"Edit"** or **"Full Paid"** (green checkmark indicator).
- *Note:* All fee records are for physical, offline classroom tuition and are not digital goods subject to Google Play In-App Billing.

---

## 6. Reviewer Support Contact
If any issue arises during verification, contact the administrative team:
- **Email:** `conceptacademy@outlook.com`
- **Support Phone:** `+91 7738578685`
