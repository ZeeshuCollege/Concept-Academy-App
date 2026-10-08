# Concept Academy - Project Memory & Decision Log

| **Memory File Version** | 1.0.0 |
| **Last Updated** | Current Session |
| **System Classification** | Closed Educational Management System |
| **Infrastructure Policy** | **100% Free Subscriptions Only (Zero-Cost Operation)** |

---

## 1. Project Context & Mission

**Concept Academy** is a physical offline educational institute offering intensive coaching for:
- Standards 9 and 10 (Foundation)
- Standards 11 and 12 (Higher Secondary Science)
- NEET (National Eligibility cum Entrance Test for Medical)
- JEE Main & JEE Advanced (Premier Engineering Entrance)

### Core Mandate
1. **Private Ecosystem**: The platform is restricted to enrolled students, active faculty, verified parents, and institute administrators. No public self-registration.
2. **Zero Operating Cost**: The entire system is engineered to run permanently on free tiers of enterprise-grade cloud providers (Supabase, Meta Cloud API, Cloudflare, Google Cloud, Firebase).
3. **High Fidelity to Theme**: The user interface strictly implements the 24 screen comps documented in `CONCEPT ACADEMY THEME.png`.

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Supabase as Unified Zero-Cost Backend
- **Context**: The institute requires a secure, relational database, authentication engine, file storage, and serverless compute without paying monthly database hosting fees.
- **Decision**: Adopt Supabase Free Tier.
- **Consequences**:
  - 500 MB PostgreSQL database is sufficient for ~25 MB/year of attendance and marks data for 600+ users.
  - 1 GB Supabase Storage bucket stores compressed PDF test papers and notes.
  - 50,000 Monthly Active Users (MAU) limit far exceeds the institute's ~625 users.
  - 500,000 Edge Function invocations handle WhatsApp OTP dispatches and admin tasks.
- **Status**: **Approved & Implemented in Architecture.md**.

---

### ADR-002: Meta WhatsApp Cloud API for Authentication OTPs
- **Context**: SMS gateways (Twilio, AWS SNS, Fast2SMS) charge per message or require paid subscription plans. Parents and students in India predominantly use WhatsApp.
- **Decision**: Integrate the official Meta WhatsApp Cloud API via Meta for Developers App.
- **Consequences**:
  - Meta provides **1,000 free service/utility conversations per calendar month**.
  - Rate limiting (max 3 OTP requests/hour per user) ensures the institute consumes $< 100$ conversations/month, remaining 100% free.
  - High message deliverability with official WhatsApp verified template.
- **Status**: **Approved & Implemented in Architecture.md**.

---

### ADR-003: Dual-Option Password Recovery (WhatsApp OTP vs Email)
- **Context**: Students or parents who forget passwords may have immediate access to either their WhatsApp phone or their registered email.
- **Decision**: Provide user with an explicit selection on the Forgot Password screen:
  1. *WhatsApp OTP* (Meta Dev App) $\rightarrow$ 6-digit code delivered to WhatsApp.
  2. *Email Reset* (Supabase Auth) $\rightarrow$ Password reset link / OTP delivered to email.
- **Consequences**:
  - Redundant, resilient recovery paths.
  - Zero cost on both paths.
  - Seamless UX matching modern Indian consumer apps.
- **Status**: **Approved & Implemented in Architecture.md**.

---

### ADR-004: Closed Ecosystem with Whitelist Gatekeeper
- **Context**: Open registration could lead to spam, unauthorized access to proprietary Concept Academy test papers, and breach of student privacy.
- **Decision**: All accounts must be pre-provisioned in `public.profiles` by the Admin.
  - Manual login checks pre-existing email/password.
  - Google OAuth initiates a trigger checking if the Google email exists in `public.profiles`. If not pre-registered, session is aborted immediately.
- **Status**: **Approved & Implemented in Architecture.md**.

---

### ADR-005: DRM-Light In-App Document Protection
- **Context**: Concept Academy faculty create proprietary question papers and study material that must not be freely downloaded or leaked.
- **Decision**:
  - No direct download buttons or export links in the client apps.
  - Private Supabase Storage with 15-minute temporary signed URLs.
  - In-app rendering via native canvas / `pdf.js` with dynamic repeating watermarks (Student Name, Roll Number, Timestamp).
  - Screen capture mitigation enabled (`FLAG_SECURE`).
- **Status**: **Approved & Implemented in Architecture.md & PRD.md**.

---

### ADR-006: Automated Keep-Alive for Supabase Free Tier
- **Context**: Supabase pauses free-tier projects if they receive no API traffic for 7 consecutive days (e.g., during summer vacation).
- **Decision**: A scheduled GitHub Actions workflow runs every Sunday at midnight (`cron: '0 0 * * 0'`) sending a lightweight authenticated query to Supabase Edge Function `keep-alive`, keeping the database permanently active.
- **Status**: **Approved**.

---

### ADR-007: 100% Mobile-Only Architecture (No Web Dashboard)
- **Context**: The institute operates offline on smartphones and tablets. Students, parents, teachers, and admins all require portable, handheld access.
- **Decision**: All four dashboards (**Student, Teacher, Parent, Admin**) are engineered strictly as mobile applications. There is no web dashboard.
- **Consequences**:
  - Unifies UI/UX across all four user roles.
  - Ensures 1-to-1 match with the 24 mobile screen comps in `CONCEPT ACADEMY THEME.png`.
- **Status**: **Approved & Implemented**.

---

### ADR-008: Flutter (Dart) as Premier Cross-Platform Mobile Engine
- **Context**: Need a single language and framework that runs natively on both **Android and iOS** with zero difficulty, high performance, and DRM-light document protection.
- **Decision**: Standardize on **Flutter (Dart)**.
- **Consequences**:
  - Compiles to native ARM machine code for iOS and Android.
  - 100% identical pixel rendering on iPhone and Android via Impeller engine.
  - Native support for `FLAG_SECURE` to block screenshots/recording of question papers.
  - Official `supabase_flutter` integration.
- **Status**: **Approved & Implemented**.

---

## 3. Configuration & Secret Blueprint

```
# Supabase Secrets (Configured in Supabase Dashboard)
SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (Server/Edge Functions only)

# Meta for Developers (WhatsApp Cloud API)
META_APP_ID=xxxxxxxxxxxxxxx
META_PHONE_NUMBER_ID=xxxxxxxxxxxxxxx
META_WABA_ID=xxxxxxxxxxxxxxx
META_SYSTEM_USER_ACCESS_TOKEN=EAAG... (Non-expiring System User Token)
META_OTP_TEMPLATE_NAME=concept_academy_auth_otp

# Google Cloud Console (OAuth 2.0 Free Tier)
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx

# Firebase Cloud Messaging
FCM_SERVER_KEY=AAAAxxxxxxxx:APA91b...
```

---

## 4. Current State & Active Focus

- **Current Milestone**: Documentation & Blueprint Phase (100% Complete).
- **Artifacts Established**:
  - [PRD.md](file:///d:/ASPIRE%20APP/PRD.md): Product Requirements v2.0
  - [Architecture.md](file:///d:/ASPIRE%20APP/Architecture.md): System Architecture, DDL & Free-Tier Blueprint
  - [Design.md](file:///d:/ASPIRE%20APP/Design.md): Design System Tokens & 24-Screen UI Inventory
  - [Memory.md](file:///d:/ASPIRE%20APP/Memory.md): Architectural Decisions & Project State
  - [Rules.md](file:///d:/ASPIRE%20APP/Rules.md): Security, Zero-Cost & Code Standards
  - [Phases.md](file:///d:/ASPIRE%20APP/Phases.md): Implementation Milestones & Sprint Plan
