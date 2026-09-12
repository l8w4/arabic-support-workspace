# Arabic Support Centre Workspace — Claude Code briefing

Read this first, then `PLAN_V2.md` for the full reasoning behind every decision below.

## What this is

A private workspace for Enas, who runs Arabic-language support for students
with disabilities at Alpha Cambridge School's centre ("We Care Support
Centre"). Her work currently lives in scattered Word documents and papers.
This app is one place for it: student records, uploaded files (worksheets,
intervention plans, weekly prep, consent forms), searchable and taggable.

**Primary user:** Enas. **Also:** up to 3–4 supervisors/coordinators
(مشرفين / منسقين) who view and comment, plus an admin (the developer).
**Not building:** parent portal, multi-school support, commercial features.
Keep additions simple — this is a small trusted team, not a product.

## Stack

Next.js 14 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage) +
Tailwind CSS, deployed on Vercel. `@supabase/ssr` for auth (not the
deprecated `auth-helpers` packages).

**Important:** pin dependency versions deliberately and check for known
CVEs before installing — during the initial build, the first-chosen Next.js
version turned out to have a disclosed critical RCE (CVE-2025-66478).
Verify current patched versions before adding or upgrading Next.js.

## What's built (v1)

- Auth: real login via Supabase Auth, three roles (`admin`, `teacher`,
  `viewer`) enforced via Postgres RLS policies (see `supabase/migrations/0001_init.sql`)
- Students: CRUD, search, individual profile page with an info tab and a
  files tab
- Documents: upload to private Supabase Storage, tag by type
  (`worksheet`/`consent`/`report`/`photo`/`plan`/`prep`/`other`), optionally
  link to a student, list view with filtering, private time-limited download
  links (signed URLs, 1 hour)
- Home dashboard: student/file counts, recent uploads
- Arabic/English toggle throughout (`lib/i18n`)

## What's stubbed (real next steps, in this order)

1. **خطة العلاجية (Intervention Plans)** — `plans` and `plan_reviews` tables
   already exist in the schema. Progress scale is **four-point qualitative**
   (`great` / `noticeable` / `slight` / `none` — تحسن كبير / تحسن ملحوظ /
   تحسن طفيف / لم يتحسن), taken directly from Enas's real template. **Not**
   a 1–9 numeric scale — that was in the original spec document but isn't
   what she actually uses. Build the dedicated `/plans` page: list, filter by
   student/term, flag plans past `review_on`, record a `plan_reviews` entry
   over time rather than overwriting the rating.

2. **التحضير الأسبوعي (Weekly Prep)** — `preps` table exists. It's
   **weekly and per class**, not daily and not per-student — confirmed from
   her actual template (`خطة التحضير الأسبوعية`, a date range like
   3–7 September, applied to a grade group). Build `/prep`: a library
   filtered by class and week.

3. **Attendance** — `attendance` table exists. Simplified from the original
   plan: no session/timetable layer, just class + date + status per student.
   Five statuses: `present` حاضر, `absent` غائب, `excused` مستأذن,
   `truant` هارب, `late` متأخر. Build `/attendance`: pick class + date,
   mark everyone, one submit action (not per-click auto-save).

4. **Comments** — `comments` table exists, RLS already allows `viewer` role
   to insert. No UI yet. This is how supervisors participate without edit
   rights.

## Key decisions already made (don't re-litigate without a reason)

- One centre, no school-scoping on students.
- Teachers can see and edit **all** students, not just their own.
- No user-management UI — accounts are created directly in the Supabase
  dashboard, then a `profiles` row is inserted via SQL. Deliberate, given a
  ~4-person team.
- No real work emails — logins use made-up addresses
  (`name@workspace.local`) as identifiers only. Consequence: no
  self-service password reset; the admin resets manually.
- Accounts (Supabase + Vercel) are currently personal, not the centre's.
  Flagged to migrate before this holds real student data long-term.
- Design: calm/neutral (slate + one blue accent), no school branding colors.
  Status colors (attendance, progress ratings) are the only saturated colors
  on screen — see `.status-*` classes in `app/globals.css`.
- "Upload + a few searchable fields" beats both "pure file dump" and
  "rebuild her Word tables as web forms." Her documents stay in Word; the
  app adds findability on top.

## Conventions

- Server Components fetch data; pass to a co-located `*Client.tsx` component
  for interactivity and i18n (see `app/(app)/students/` for the pattern).
- Mutations: Server Actions for text data (`actions.ts` files); direct
  client-side Supabase calls for file uploads (simpler than streaming
  `File` objects through Server Actions), followed by `router.refresh()`.
- All strings go in `lib/i18n/strings.ts` (`ar/en`), read via `useLang()`.
- RLS pattern: any signed-in user can `select`; only `admin`/`teacher` can
  write (via the `can_edit()` SQL function), except `comments`, where any
  signed-in role can insert.
