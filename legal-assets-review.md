# Legal & IP Asset Audit: Concept Academy
**Application Name:** Concept Academy  
**Package ID:** `com.conceptacademy.learning`  
**Audit Date:** September 28, 2026  
**Auditor:** Senior Release Engineer & Play Compliance Specialist  

---

## 1. Executive Summary
This audit inspects all branding assets, logos, fonts, icons, study material documents, and media incorporated into the Concept Academy Android project to assess copyright, licensing, and intellectual property risks prior to Google Play Store submission.

---

## 2. Asset Review Ledger

| Asset | File Location / Reference | Source & Ownership | IP / Licensing Risk | Action Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Institute Logo** | `public/logo.png`, `android/app/src/main/res/drawable*` | Original branding created for Concept Academy. | Low risk. Proprietary mark of the coaching institute. | Ensure trademark clearance if expanding nationally. | **PASS** |
| **App Icons (Adaptive & Legacy)** | `android/app/src/main/res/mipmap-*` | Derived from official Concept Academy emblem. | Low risk. | Built into standard Android mipmap buckets (`hdpi`, `mdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`). | **PASS** |
| **UI Iconography** | `lucide-react` (via npm package) | Lucide Project (community fork of Feather Icons). | None. Licensed under permissive **ISC License** (compatible with commercial mobile distribution). | Retain standard package license in node dependencies. | **PASS** |
| **System Typography** | System font stack (sans-serif, Inter fallback) | System default / Android Roboto. | None. Open source (Apache 2.0). | No proprietary fonts embedded that require desktop/app redistribution licenses. | **PASS** |
| **Default User Avatars** | `src/lib/mockData.js` (`DEFAULT_GREY_AVATAR`) | Inline SVG vector generated in code. | None. Pure mathematical SVG path created for the app. | No external photo or model likeness risk. | **PASS** |
| **Sample Test Papers & PDF Links** | `src/lib/mockData.js`, `AdminTestsModal.jsx`, `AdminStudyMaterialsModal.jsx` | Google Drive preview links (`1fRm5DBtyZYxEYMpTtQ2ujCBvME4zz749/preview`). | Low-to-Medium risk if live papers contain third-party textbook scans. | Institute administration must ensure uploaded question papers and solutions are authored by Concept Academy faculty or in public domain (e.g. official past board/JEE questions). | **NEEDS OWNER VERIFICATION** |
| **Sample Video Demonstration** | `src/lib/mockData.js` (line 226 embed link) | YouTube standard embed placeholder (`dQw4w9WgXcQ`). | Low for review, High for commercial production. | Replace mock educational video link with Concept Academy's unlisted or public YouTube lectures before final student onboarding. | **NEEDS OWNER VERIFICATION** |
| **WhatsApp Trademark & Branding** | `whatsappService.js`, WhatsApp badges in UI | Meta Platforms, Inc. WhatsApp Brand Resources. | Low risk provided standard messaging guidelines are respected. | App uses standard WhatsApp green badge and Meta Graph API to dispatch OTP. Does not claim endorsement by Meta. | **PASS** |

---

## 3. Required Legal Declarations in Play Console
1. **Third-Party Content:** Confirm in the Play Console Content Rating questionnaire that the app does not distribute copyrighted commercial publications without authorization.
2. **Coaching Materials:** Educational syllabi (CBSE, Maharashtra State Board, NTA NEET/JEE) are standardized academic frameworks and can be taught and referenced freely.
