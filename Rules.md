# Concept Academy - Operational & Development Rules

| **Document Version** | 1.0.0 |
| **Enforcement Scope** | All Developers, AI Agents & Contributors |
| **Core Directive** | **Zero Paid Accounts, Maximum Security, Strict Design Fidelity** |

---

## 1. Zero-Cost & Free-Tier Guardrails (Non-Negotiable)

1. **Zero Paid Services**:
   - Under no circumstances shall any developer or AI agent introduce a library, SDK, or service that requires a paid subscription, trial card, or recurring credit card charge.
   - All cloud services must permanently reside on their verified free tiers:
     - Supabase Free Tier (500 MB DB, 1 GB Storage, 50k MAU, 500k Edge Invocations)
     - Meta for Developers WhatsApp Cloud API (1,000 free conversations/month)
     - Google Cloud Identity (OAuth 2.0 Free Client)
     - Firebase Cloud Messaging (100% Free & Unlimited)
     - Cloudflare Pages / Vercel Free Hobby Tier
2. **WhatsApp Quota Conservation**:
   - The WhatsApp Cloud API is strictly reserved for **Account Activation OTPs** and **Password Reset OTPs**.
   - Do **NOT** send marketing messages, promotional broadcasts, or daily reminders via WhatsApp.
   - Daily attendance notices, timetable updates, and marks announcements **MUST** be routed through **Firebase Cloud Messaging (FCM)** push notifications, which are 100% free.
   - Edge function `send-whatsapp-otp` must strictly enforce rate limiting (max 3 OTP requests per phone number per hour).
3. **Storage & Bandwidth Optimization**:
   - Uploaded test papers and study PDFs must not exceed **10 MB per file**.
   - Client-side or edge compression must be applied to compress PDF files before storing them in Supabase Storage.
   - Old academic session files must be archived or cleaned annually to keep total storage well within the 1 GB free boundary.
4. **Database Query Efficiency**:
   - Every database query in client code must specify pagination (`range(start, end)` or `limit()`).
   - Never execute unindexed wildcard searches or unpaginated `SELECT *` queries on tables with high write volume like `attendance` or `test_results`.

---

## 2. Security & Privacy Rules

1. **Row Level Security (RLS) is Mandatory**:
   - Every table created in PostgreSQL **MUST** have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
   - Every table must have explicit policies defined for `student`, `teacher`, `parent`, and `admin`.
   - Never use `service_role` key in client code. Only `anon_key` is permitted on the client.
2. **Institute Pre-Registration Rule**:
   - Public registration endpoints are strictly prohibited.
   - Any user attempting to sign in (via email/password or Google OAuth) whose email or phone does not exist in `public.profiles` must have their session revoked immediately with an error message: *"Account not registered with Concept Academy. Please contact institute administration."*
3. **Secret & Key Isolation**:
   - Never hardcode secrets, tokens, or private keys into source code or Git repositories.
   - Secrets (`META_SYSTEM_USER_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `OTP_SECRET_SALT`) must be stored strictly in Supabase Vault / Edge Function Secrets.
   - `.env` files must be included in `.gitignore`.
4. **Intellectual Property Protection (DRM-Light)**:
   - Client applications must **NEVER** expose a direct "Download", "Save to Device", or "Open in External App" button for test papers.
   - Test papers must only be retrieved via short-lived signed URLs (15-minute expiry).
   - In-app PDF renderers must overlay a dynamic watermark showing the student's Name, Roll Number, and Timestamp.
   - Mobile apps must enable `FLAG_SECURE` on Android and screen recording observer notifications on iOS on test paper viewing screens.

---

## 3. UI/UX & Design Fidelity Rules

1. **Strict Alignment with `CONCEPT ACADEMY THEME.png`**:
   - Developers must respect the exact design language, layout hierarchy, and visual components established in `Design.md`.
   - Primary Brand Color: `#1E3A8A` (Deep Royal Navy).
   - Secondary Accent Color: `#0EA5E9` (Sky/Cyan).
   - Canvas Background: `#F8FAFC` (Slate 50).
   - Card Background: `#FFFFFF` (Pure White with subtle card shadow `0 4px 20px -2px rgba(15, 23, 42, 0.05)`).
2. **Typography**:
   - Primary font: `Outfit` for display headings; `Inter` or `Plus Jakarta Sans` for body copy and numbers.
   - No browser-default or OS-generic serif typography.
3. **Zero Placeholder Graphics**:
   - Do not display broken image boxes, generic "image here" placeholders, or lorem ipsum text in production screens.
   - Avatars must fall back to elegant monogram initials on soft tinted backgrounds (e.g., `#EFF6FF`).

---

## 4. Code Standards & Architecture Guidelines

1. **Architecture Layering**:
   - **Presentation Layer**: UI Widgets, screens, components, and form validation.
   - **Domain / State Layer**: State management (Riverpod/Bloc for Flutter, TanStack Query/Zustand for React), business logic.
   - **Data Layer**: Supabase SDK clients, PostgREST queries, and DTO data models.
2. **Strict Typing**:
   - TypeScript must have `strict: true` in `tsconfig.json`. No usage of `any`.
   - Dart/Flutter must have sound null-safety enabled with all linter rules active (`flutter_lints`).
3. **Error Handling & User Feedback**:
   - Every network call must have a `try/catch` block with user-friendly error banners (toast/snackbar).
   - Provide visual loading skeletons while data is being fetched.
   - Empty states (e.g., "No tests scheduled this week") must display dedicated illustration/icons with helpful instructional copy.

---

## 5. Git & Deployment Conventions

1. **Commit Messages**: Follow Conventional Commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation updates
   - `style:` for UI/styling changes
   - `refactor:` for code refactoring
   - `perf:` for performance optimizations
   - `chore:` for build scripts and dependencies
2. **Automated CI/CD**:
   - Pull requests must pass automated linting and type checks via GitHub Actions.
   - Production builds for Web Admin deploy automatically to Cloudflare Pages / Vercel on merges to `main`.
