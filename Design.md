# Concept Academy - Design System & UI Specification

| **Document Version** | 2.0.0 |
| **Visual Source** | `CONCEPT ACADEMY THEME.png` (24 Master Screen Comps) |
| **Target Platforms** | Mobile (iOS & Android) & Web (Desktop Admin & Responsive Teacher Portal) |
| **Design Language** | Clean Educational Minimalism, Elevated Cards, Purposeful Accents |

---

## 1. Brand Identity & Visual Foundations

The visual identity of **Concept Academy** combines academic prestige with clean modern technology. The design prioritizes legibility, scannability for fast classroom roll-calls, and reassuring clarity for parents reviewing student progress.

- **Brand Mark**: A modern geometric upward delta/triangle crafted from three layered gradient ribbons symbolizing continuous growth, academic excellence, and aspiration.
- **Tagline**: *"Better Learning, Bigger Dreams"*
- **Design Metaphor**: **Elevated Paper Sheets (Clean Surfaces)** floating over a calm slate canvas (`#F8FAFC`), enriched by vibrant academic accent colors (Royal Blue, Emerald, Cyan, Violet, and Amber).

---

## 2. Color Palette & Token Architecture

```
┌─────────────────┬───────────┬────────────────┬────────────────────────────────────────┐
│ Token Name      │ Hex Code  │ Tailwind Class │ Usage / Semantic Role                  │
├─────────────────┼───────────┼────────────────┼────────────────────────────────────────┤
│ **Brand 900**   │ `#0F172A` │ `slate-900`    │ Admin Sidebar, Primary Headings        │
│ **Brand 800**   │ `#1E3A8A` │ `blue-900`     │ Primary CTAs, Header Cards, Main Brand │
│ **Brand 600**   │ `#2563EB` │ `blue-600`     │ Interactive Links, Focused States      │
│ **Accent 500**  │ `#0EA5E9` │ `sky-500`      │ Timetable Ongoing Badges, Chart Gradients│
│ **Accent 400**  │ `#38BDF8` │ `sky-400`      │ Logo Highlight, Active Tab Borders     │
│ **Surface Soft**│ `#EFF6FF` │ `blue-50`      │ Quick Action Backgrounds, Highlight Row│
├─────────────────┼───────────┼────────────────┼────────────────────────────────────────┤
│ **Canvas**      │ `#F8FAFC` │ `slate-50`     │ Universal App Background Screen Fill   │
│ **Card Surface**│ `#FFFFFF` │ `white`        │ Elevated Cards, Modals, Bottom Sheets  │
│ **Border Line** │ `#E2E8F0` │ `slate-200`    │ Dividers, Input Borders, Card Outlines │
│ **Text Primary**│ `#0F172A` │ `slate-900`    │ Headings, Student Names, Key Metrics   │
│ **Text Muted**  │ `#64748B` │ `slate-500`    │ Subtitles, Timestamps, Class Rooms     │
│ **Text Faint**  │ `#94A3B8` │ `slate-400`    │ Placeholders, Disabled States, Icons   │
├─────────────────┼───────────┼────────────────┼────────────────────────────────────────┤
│ **Success**     │ `#10B981` │ `emerald-500`  │ Present Status, High Marks (≥80%)      │
│ **Success Tint**│ `#ECFDF5` │ `emerald-50`   │ Present Badge Fill, Positive Trend     │
│ **Warning**     │ `#F59E0B` │ `amber-500`    │ Upcoming Tests, Chemistry, Pending Due │
│ **Warning Tint**│ `#FFFBEB` │ `amber-50`     │ Warning Badge Fill, Due Alert Fill     │
│ **Danger**      │ `#EF4444` │ `rose-500`     │ Absent Status, Overdue Fees, Low Marks │
│ **Danger Tint** │ `#FEF2F2` │ `rose-50`      │ Absent Badge Fill, Alert Callouts      │
│ **Info/Subject**│ `#8B5CF6` │ `violet-500`   │ Biology, Mathematics, PTM Event Pills  │
│ **Info Tint**   │ `#F5F3FF` │ `violet-50`    │ Subject Tag Background                 │
└─────────────────┴───────────┴────────────────┴────────────────────────────────────────┘
```

---

## 3. Typography Hierarchy

The typography employs **Outfit** (primary heading and display) paired with **Inter** / **Plus Jakarta Sans** (clean, tabular body and numeric data):

```css
/* Typography Scale */
--font-display: 'Outfit', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

.text-display {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  letter-spacing: -0.02em;
}

.text-h1 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: -0.01em;
}

.text-h2 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
}

.text-body-lg {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}

.text-body-md {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.text-caption {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.text-metric-huge {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  line-height: 38px;
}
```

---

## 4. Spacing, Elevation & Corner Radii

- **Grid Base Unit**: `4px`
- **Standard Spacing**: `8px`, `12px`, `16px`, `20px`, `24px`, `32px`
- **Border Radii**:
  - `rounded-sm`: `6px` (Badges, Status Dots)
  - `rounded-md`: `10px` (Input Fields, Dropdowns)
  - `rounded-lg`: `14px` (Buttons, Secondary Cards)
  - `rounded-xl`: `18px` (Main Highlight Cards, Today's Class Card)
  - `rounded-2xl`: `24px` (Modals, Bottom Navigation Bar, Sheets)
  - `rounded-full`: `9999px` (Pills, Avatar Circles, Segmented Controls)
- **Box Shadows**:
  - `shadow-card`: `0px 4px 20px -2px rgba(15, 23, 42, 0.05)`
  - `shadow-float`: `0px 10px 30px -4px rgba(15, 23, 42, 0.08)`
  - `shadow-elevated`: `0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)`

---

## 5. UI Component Library Specifications

### 5.1 Buttons & Action Controls
1. **Primary Button**:
   - Background: Solid Royal Blue `#1E3A8A`
   - Text: White `#FFFFFF`, Font-weight 600, 15px
   - Height: `48px` to `52px`, Radius `14px`
   - Hover / Active: Scale `0.98`, Background `#172554`
2. **Secondary / Social Button (Google OAuth)**:
   - Background: Pure White `#FFFFFF`
   - Border: `1px solid #E2E8F0`
   - Icon: Official Google multicolored "G" icon left-aligned
   - Text: `#0F172A`, Font-weight 500, 14px
3. **Pill Action (Take Attendance, Upload Material)**:
   - Soft background tint (`#EFF6FF`), Icon with label underneath, border-radius `16px`.

### 5.2 Segmented Controls & Navigation
1. **Role Selector (Login Screen)**:
   - Container: Background `#F1F5F9`, Radius `9999px`, Padding `4px`
   - 4 Segments: `Student | Teacher | Parent | Admin`
   - Active Segment: Solid `#1E3A8A`, Text White, Smooth animated pill slide transition.
2. **Bottom Navigation Bar (Mobile Apps)**:
   - Height: `68px` + Safe Area Bottom padding
   - Background: Pure White `#FFFFFF`, Top border `1px solid #E2E8F0`
   - 5 Tabs:
     - Student: `Home`, `Classes`, `Tests`, `Materials`, `More`
     - Teacher: `Dashboard`, `Batches`, `Attendance`, `Performance`, `More`
     - Parent: `Home`, `Child`, `Performance`, `Fees`, `More`
   - Active Tab: Colored icon (`#1E3A8A`), blue dot indicator underneath.

### 5.3 Progress Gauges & Data Visualization
1. **Radial Attendance & Score Donut Ring**:
   - Size: `120px` $\times$ `120px` (Mobile), `160px` $\times$ `160px` (Desktop)
   - Track: `#F1F5F9`, Stroke Width `10px`
   - Progress Arc: Emerald Gradient (`#10B981` to `#059669`) for $\ge 75\%$; Amber (`#F59E0B`) for $60-74\%$; Red (`#EF4444`) for $<60\%$.
   - Center Metric: Large bold text (e.g., `89%`) with label below (`Overall Attendance`).
2. **Subject Horizontal Progress Bars**:
   - Height: `8px`, Track `#E2E8F0`, Radius `9999px`
   - Animated fill matching subject color code.

### 5.4 Form Inputs & Security Controls
1. **Text Input / Email / Mobile**:
   - Height: `50px`, Radius `12px`, Border `1px solid #E2E8F0`
   - Focused State: Border `2px solid #1E3A8A`, Ring `4px rgba(30, 58, 138, 0.1)`
2. **6-Digit OTP Cells**:
   - 6 individual square input boxes (`48px` $\times$ `54px`)
   - Centered large 20px numeric font
   - Auto-advance focus to next cell upon keypress, auto-paste support.

---

## 6. Screen-by-Screen Visual Architecture (All 24 Screens)

Synthesized directly from `CONCEPT ACADEMY THEME.png`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ROW 1: STUDENT MOBILE APPLICATION                         │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ 1. Splash Screen  │ 2. Login Screen   │ 3. Student Home   │ 4. Timetable Screen        │
│ • Large logo delta│ • Role segmented  │ • Greeting & Avatar│• Mon-Sun Day pills        │
│ • Motto & Blue CTA│ • Email/Mobile    │ • Today's class card│• Timeline schedule cards  │
│                   │ • Password + Google│ • Quick action grid│• Ongoing status chip      │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│ 5. Attendance View│ 6. Study Material │ 7. Tests System   │ 8. Student Profile         │
│ • 89% radial ring │ • Filter pills    │ • Upcoming/Done   │ • Avatar & Roll Number     │
│ • Subject bars    │ • Chapter cards   │ • Test cards      │ • Password & Notifications │
│ • Full report CTA │ • File size & type│ • In-app paper view│• Logout action            │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ROW 2: TEACHER APPLICATION                                │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ 9. Teacher Home   │ 10. My Batches    │ 11. Roll Call     │ 12. Create Test            │
│ • Today's schedule│ • Batch card list │ • Batch/Subject   │ • Test name & Subject      │
│ • 4 Action buttons│ • Student counts  │ • Student toggles │ • Date & Duration          │
│ • Attendance CTA  │ • Active badges   │ • Mark All Present│ • Upload question paper    │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│ 13. Upload Mat.   │ 14. Performance   │ 15. Announcements │ 16. Teacher Profile        │
│ • Select batch/ch.│ • Batch average % │ • Broadcast cards │ • Assigned batches         │
│ • Dropzone upload │ • Top performer   │ • Push trigger    │ • Security settings        │
│ • Size validation │ • Lowest performer│ • Filter by batch │ • Institute contact        │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ROW 3: PARENT APPLICATION                                 │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ 17. Parent Home   │ 18. Child Profile │ 19. Attendance Cal│ 20. Progress Analytics     │
│ • Child summary   │ • Multi-child menu│ • Monthly grid    │ • 78% Overall progress     │
│ • 3 Metric pills  │ • Direct shortcuts│ • Color dot matrix│ • +6% vs last test badge   │
│ • Test alert      │ • Academic details│ • Present/Absent  │ • Subject breakdown        │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│ 21. Upcoming Tests│ 22. Fee Status    │ 23. PTM Scheduler │ 24. Parent Profile         │
│ • Date & syllabus │ • ₹75k Total Fee  │ • Meeting date/room│• Linked children          │
│ • Test instructions│• ₹45k Paid (60%) │ • Teacher agenda  │ • WhatsApp notifications   │
│ • Result link     │ • Next Due Date   │ • Past meetings   │ • Logout                   │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ROW 4: ADMIN MOBILE APPLICATION                           │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ 25. Main Dashboard│ 26. Students Desk │ 27. Faculty Desk  │ 28. Courses & Batches      │
│ • Mobile KPI cards│ • Searchable list │ • Faculty cards   │ • 4 Stream cards           │
│ • 4 KPI stat cards│ • Add Student FAB │ • Subject badges  │ • Foundation, NEET, JEE    │
│ • 2 Touch Charts  │ • Parent linkage  │ • Workload stats  │ • Batch enrollment stats   │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│ 29. Report Center │ 30. Settings Desk │                   │                            │
│ • Attendance rept │ • Institute info  │                   │                            │
│ • Fee collection  │ • WhatsApp secrets│                   │                            │
│ • 1-Tap Export    │ • Supabase backup │                   │                            │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
```

---

## 7. Protected PDF Viewer UI Specifications

The In-App Document Viewer is designed to render test papers and study notes securely:

```
┌────────────────────────────────────────────────────────┐
│  ← Physics Test 01: Mechanics                 [Close]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│   CONCEPT ACADEMY - JEE ADVANCED MOCK                  │
│                                                        │
│   Time: 90 Minutes                    Max Marks: 100   │
│                                                        │
│      [ Watermark Overlay Diagonally Across Viewport: ] │
│      [ "Rohan Sharma • Roll #104 • 16-Apr-2025"      ] │
│                                                        │
│   Q1. A particle of mass m is projected from ground... │
│       (A) v²/2g         (B) 2v²/g                      │
│       (C) v²/g          (D) None of these              │
│                                                        │
│   Q2. Two blocks of masses 2kg and 4kg are tied...     │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Page 1 of 4       [ Zoom - / + ]        Fit to Screen │
│  (Download / Save / Print Disabled by Policy)          │
└────────────────────────────────────────────────────────┘
```

- **Forensic Watermarking**: Semi-transparent (opacity `0.12`), 45-degree angle repeating text string containing user's Name, Roll Number, and View Timestamp.
- **Chrome / Viewport Isolation**: Native app viewport with system screenshot disabling enabled (`FLAG_SECURE` / iOS native prevent-screen-record observer).
