# Google Play Closed Testing Track Plan (12 Testers / 14 Days)
**Application Name:** Concept Academy  
**Package ID:** `com.conceptacademy.learning`  
**Target Release Candidate:** Version 1.0 (versionCode: 1)  
**Mandatory Requirement:** Google Play policy for personal developer accounts created after November 13, 2023 requires at least **12 testers continuously opted-in for at least 14 days** prior to applying for production track access.

---

## 1. Tester Recruitment Plan

### Target Demographics
To satisfy Google Play's quality evaluation, testers must represent real prospective users across Android device form factors:
- **Students (6 testers):** Secondary and senior secondary students enrolled in Classes 9–12, NEET, or JEE.
- **Parents (3 testers):** Guardians testing attendance notices, fee records, and report cards.
- **Faculty / Teachers (2 testers):** Educators testing batch schedules, attendance submission, and study material uploads.
- **Institute Administrator (1 tester):** Centre director verifying user provisioning and broadcast alerts.

### Opt-In Logistics
1. Collect Google account emails (`@gmail.com` or Google Workspace) from the 12+ designated testers.
2. In Google Play Console -> **Release -> Testing -> Closed testing**, create an email list named `ConceptAcademy-Core-Testers`.
3. Provide testers with the Play Store closed testing opt-in URL:
   - Web link: `https://play.google.com/apps/testing/com.conceptacademy.learning`
   - Android Play Store link generated in Console.
4. Verify all 12 testers tap **"Become a tester"** and download the app directly from Google Play.
5. Monitor the Play Console dashboard to ensure the opt-in counter remains at >= 12 active testers continuously without lapses.

---

## 2. Structured Test Scenarios

| Scenario # | Module | Action / Test Case | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TS-01** | **Authentication** | Sign in with demo student (`student.demo@conceptacademy.local`), parent, and admin accounts. | Instant authentication without crash; routes to respective dashboard. |
| **TS-02** | **Attendance Record** | Student checks calendar month attendance breakdown. | Shows present/absent days, percentage calculation accurately. |
| **TS-03** | **Fee Tracking** | Admin inspects student fee status, filters by batch (`12th Science`), triggers alert. | Fee progress bar correctly displays paid vs remaining balance; green tick shows when fully paid. |
| **TS-04** | **Offline Resilience** | Put device into Airplane mode; navigate cached timetable and study materials. | App displays clear offline banner; no blank screens or unhandled exceptions. |
| **TS-05** | **Study Material PDF** | Tap test paper / study material link. | Launches in-app preview or system browser without crashing. |
| **TS-06** | **Privacy & Account Deletion** | In Student Profile, tap "Delete Account & Data" and review confirmation flow. | Dialog displays complete warning; deletion clears local auth tokens and cached records. |
| **TS-07** | **Push Notifications** | Admin sends class broadcast announcement. | System notification tray displays alert with vibrate/sound. |

---

## 3. Feedback Collection Process

Testers must submit feedback through either:
1. **Google Play Store Private Feedback:** Testers open the app page on Google Play and leave feedback directly (visible only to the developer).
2. **Dedicated Feedback Form:** Google Form distributed to testers: `https://forms.gle/concept-academy-testing`
3. **Weekly Institute Check-in:** Brief 5-minute review with student/parent cohort at coaching centre premises.

---

## 4. Bug Tracking Schema

All reported anomalies must be logged with the following fields:
- **Bug ID:** (e.g. `BUG-001`)
- **Device Model & OS Version:** (e.g. `Samsung Galaxy A54, Android 14 / API 34`)
- **App Version & Build:** `1.0 (1)`
- **Severity:** `Critical (Crash)` | `Major (Feature broken)` | `Minor (Layout/Text issue)`
- **Steps to Reproduce:** Numbered list of actions
- **Observed Behavior:** What actually happened
- **Expected Behavior:** What should have happened
- **Resolution & Status:** `Open` | `Investigating` | `Resolved` | `Verified`

---

## 5. Production Access Application Checklist
After 14 consecutive days of active testing with at least 12 participants:
- [ ] Verify 14 continuous days elapsed in Play Console analytics.
- [ ] Answer Play Console questions about tester recruitment and engagement.
- [ ] Detail what feedback was gathered and how issues were addressed.
- [ ] Submit application for Production access.
