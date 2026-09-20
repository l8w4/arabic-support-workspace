# Arabic Support Centre Workspace — Claude Code briefing

Read this first, then `PLAN_V2.md` for the full reasoning behind the original
decisions. **Keep this file updated in the same push as every change** (built
features, new tables/migrations, decisions) — it is the project's memory.

## What this is

A private workspace for Enas, who runs Arabic-language support for students
with disabilities at Alpha Cambridge School's centre ("We Care Support
Centre"). Her work currently lives in scattered Word documents and papers.
This app is one place for it: student records, uploaded files (worksheets,
intervention plans, weekly prep, consent forms), searchable and taggable.

**Primary user:** Enas (role `teacher`). **Also:** up to 3–4 supervisors/
coordinators (مشرفين / منسقين) who view and comment, plus an admin (the
developer). **Not building:** parent portal, multi-school support, commercial
features. Keep additions simple — this is a small trusted team, not a product.

## Stack

Next.js **15.5.25** (App Router, TypeScript) + Supabase (Postgres, Auth,
Storage) + Tailwind CSS, deployed on Vercel (auto-deploys on push to `main`).
`@supabase/ssr` for auth (not the deprecated `auth-helpers` packages).

**Dependency safety:** pin versions deliberately and check for CVEs before
installing/upgrading. History: the first Next.js pick had a critical RCE
(CVE-2025-66478); we then sat on 14.2.35, but the 14.x line never received
backports for two later critical unauthenticated RCEs (GHSA-p293-qw3h-jr36,
GHSA-2xp9-vwfh-vxw4, fixed from 15.5.24), so we upgraded to 15.5.25 (chosen
over 16.x to keep breaking changes small). `npm audit` still reports a
moderate/high `postcss` issue nested inside Next's own build tooling; it only
clears by moving to Next 16 and is build-time only — revisit when a 15.x patch
fixes it.

**Local setup quirk:** `~/.npm` has root-owned cache folders, so `npm install`
fails with EACCES. Use `npm install --cache ./.npm-cache` (`.npm-cache` is
gitignored).

## What's built

- **Auth:** Supabase Auth, roles `admin` / `teacher` / `viewer` enforced by
  Postgres RLS (`supabase/migrations/0001_init.sql`).
- **Students** `/students` is class-first: the landing view is a grid of active
  class cards (name, academic year, student count) plus a **"not assigned to a
  class"** card (highlighted when non-empty) and an **all students** card;
  picking one shows its students with search, sort (name A–Z with Arabic
  collation, grade, diagnostic level, class, recently added; blanks last) and
  "Add student". The selection lives in the URL (`?class=<id>|unassigned|all`,
  via `history.replaceState`); "back to classes" returns to the picker. A
  student counts as unassigned when they are in no *active* class (archived
  classes don't count). New students start unassigned — enrol them from the
  Classes roster. Cards show photo, Arabic + English name and (in all/unassigned
  views) class tags. Profile has tabs: info / homework / marks / files. Photo
  upload from the profile (`students.photo_path`, private bucket, signed URLs).
  **Health status** (`الحالة الصحية`) is optional free text shown only on the
  profile info tab and the report — never on list cards, and the list query
  selects explicit columns so it is not sent to the list page.
- **Homework** (`homework_entries`): four-point qualitative status
  (`completed` مكتمل / `partial` جزئي / `needs_support` يحتاج مساعدة /
  `not_done` لم يُنجز) — deliberately not a numeric grade — plus note and an
  optional attached file (a `documents` row, `worksheet` or `photo`, linked by
  `document_id`). Two entry points: the **Homework sidebar page** `/homework`
  (under Attendance) — pick a class, enter title + date, set a status per
  student (blank = skipped, "mark all completed" shortcut), one Save inserts a
  row per marked student; below it a table of recent entries (latest 200,
  filtered to the class, delete per row) — and the **Homework tab on each
  student's profile** (add one entry, with a file if wanted, plus that
  student's history). The class page has no file attach. Entries are editable
  (title, date, status, note — pencil icon, inline form, `components/
  HomeworkEditForm.tsx`) and deletable from both places. Deleting an entry
  does not delete its attached file: the `documents` row and the storage
  object stay (still visible in Files).
- **Marks** (`grade_entries`): assessments stored as score out of a max
  (default 100, so different scales work) with date and note; shown as
  "score / max" and percent. Numeric on purpose (Enas asked for marks), unlike
  homework/plan progress; `score <= max_score` is enforced by the database.
  Same two entry points: the **Marks sidebar page** `/marks` (pick class,
  assessment name, "out of" and date, type a mark per student, blank = skipped,
  one Save; recent-entries table with delete) and the **Marks tab on the
  student profile** (that student's entries, average percent, add/delete).
  Entries are editable (title, mark, "out of", date, note — pencil icon, inline
  form, `components/MarkEditForm.tsx`) from both places.
- **Printable report** `/students/[id]/report`: student info, attendance
  summary (counts, rate = (present + late) / saved days, list of non-present
  days), homework record, marks record (with average), uploaded-files list
  (name/type/date). Plain page +
  `@media print` CSS (sidebar hidden via `print:hidden`); "Print → Save as PDF"
  from the browser handles Arabic. Opened from "طباعة التقرير" on the profile.
- **Files:** upload to private storage, tag by type, filter, signed download
  links (1 hour).
- **Classes** `/classes`: add, edit name/academic year inline, delete (with
  confirm), archive/activate, and roster management (tick students in a class;
  removing sets `left_on`, re-adding resets it). Deleting a class also deletes
  its attendance and prep rows and unlinks its documents (those FKs have no
  cascade); the roster cascades.
- **Intervention plans** `/plans` (+ `/new`, `/[id]`): list with student/term/
  status filters, overdue-review flag, four-point progress scale
  (`great`/`noticeable`/`slight`/`none`), editable plan info, plan document
  upload, review history (each review appends a `plan_reviews` row and updates
  the plan's current rating / next review date).
- **Weekly prep** `/prep`: per class and week range, unit + lesson title,
  file upload, filter by class, search by unit/lesson.
- **Attendance** `/attendance`: pick class + date, everyone defaults to
  present, five statuses (`present` حاضر, `absent` غائب, `excused` مستأذن,
  `truant` هارب, `late` متأخر), one Save for the whole class/date (upsert on
  class+student+date), saving indicator, "mark all present", live tally.
  **CSV export** `/api/attendance/export?class_id=&from=&to=`: every day in the
  period (all dates when empty), untouched days = everyone present with no
  notes, Fridays/Saturdays skipped unless something was saved, future dates
  never generated, UTF-8 BOM so Arabic opens correctly in Excel.
- **Branding:** We Care Support Centre logo (`public/logo.jpg`, also
  `app/icon.jpg` as the tab icon) on the login page and sidebar.
- **Home dashboard**, Arabic/English toggle throughout (`lib/i18n`).

## What's stubbed

- **Comments** — `comments` table and RLS exist (any signed-in role can
  insert). No UI yet; this is how supervisors participate without edit rights.

## Database migrations

Run by hand in Supabase → SQL Editor (there is no CLI link). **Run a
migration before deploying code that needs it.**

- `0001_init.sql` — base schema, RLS, `documents` bucket.
- `0002_health_status.sql` — `students.health_status text`.
- `0003_homework_entries.sql` — `homework_entries` + RLS (view: any signed-in
  user; write: `can_edit()`).
- `0004_grade_entries.sql` — `grade_entries` + RLS (same pattern).

## Key decisions (don't re-litigate without a reason)

- One centre, no school-scoping. Teachers see and edit **all** students.
- No user-management UI: create accounts in the Supabase dashboard, then
  insert a `profiles` row via SQL. Logins are made-up `name@workspace.local`
  addresses, so no self-service password reset (admin resets manually).
- `teacher` and `admin` have identical permissions (`can_edit()`); `admin` is
  just the developer's label. Enas is `teacher`.
- The seeded demo data (students/class/plans/prep/attendance) is labelled
  "مثال:" / "Example:" so it is obviously not real.
- **Hosting/cost:** currently $0 (Vercel Hobby + Supabase Free). Free Supabase
  auto-pauses after 7 idle days (data kept, needs a manual resume) and has **no
  backups** — export manually. Do **not** move the database to Cloudflare D1:
  it is SQLite, so the Postgres RLS the whole security model rests on would
  have to be rebuilt. Cheaper options that keep RLS: self-hosted Postgres or
  Supabase Pro later. Final platform is still undecided (pending Enas's
  feedback); accounts are still personal, not the centre's.
- Design: calm/neutral (slate + one blue accent). Status colors
  (`.status-*` in `app/globals.css`) are the only saturated colors — reused for
  attendance, plan progress and homework status; text labels always accompany
  color.
- Progress and homework use qualitative scales, not numbers, on purpose.
- "Upload + a few searchable fields" beats rebuilding her Word tables as forms.

## Conventions

- Server Components fetch data and pass to a co-located `*Client.tsx` for
  interactivity and i18n (see `app/(app)/students/`).
- **Next 15 async APIs:** `cookies()`, `params` and `searchParams` are
  Promises — `await` them. `createClient()` in `lib/supabase/server.ts` is
  async: `const supabase = await createClient()`.
- Mutations: Server Actions (`actions.ts`) for text data — return
  `{ success }` when the UI needs to show saved/error state; direct
  client-side Supabase calls for anything involving a file upload, then
  `router.refresh()`. All files go in the private `documents` bucket.
- **Destructive/update actions must verify a row was affected.** Supabase
  returns no error when RLS filters a row out, so `delete()`/`update()` that
  matter chain `.select("id")` and report success only if rows came back (see
  `homework/actions.ts`, `marks/actions.ts`, `deleteClass`). Deletes are hard
  deletes (no soft-delete/trash).
- Client state derived from props must be re-synced with `useEffect` (client
  navigation does not remount) — see `AttendanceClient.tsx`.
- All strings go in `lib/i18n/strings.ts` (`ar` and `en`), read via `useLang()`.
- RLS pattern: any signed-in user can `select`; only `admin`/`teacher` write
  (`can_edit()`), except `comments` (any signed-in role can insert).
- Workflow: verify with `npx tsc --noEmit` and `npm run build`, commit, push
  to `main` (Vercel deploys), then tell the user what to test on the live
  site. Update this file in the same push.

## Change log

- 2026-09-20 (late night): homework and marks entries can be edited (sidebar
  tables and profile tabs); deletes now verify a row was really removed
  instead of trusting "no error".
- 2026-09-20 (night): Homework and Marks added as their own sidebar pages
  under Attendance (class-wide recording + recent entries); the profile tabs
  stay. Shared helpers moved to `lib/homework.ts` and `lib/grades.ts`.
- 2026-09-20 (evening): class-first Students page with a "not assigned to a
  class" bucket; marks tab + marks in the report (migration 0004).
- 2026-09-20 (later): Arabic app name is now "مركز دعم للغة العربية" (login,
  sidebar, tab title). Student create/edit now show the real database error
  instead of silently reloading a blank form — this is how a missing migration
  (0002 not yet run, so `health_status` did not exist) showed up as "creating a
  student does nothing". Lesson: migrations must be run in Supabase before the
  code that uses them is deployed; a REST probe with the anon key
  (`/rest/v1/<table>?select=<col>&limit=1`) tells you whether a column/table
  exists.
- 2026-09-20: health status field, homework tab, printable student report
  (migrations 0002, 0003); class edit/delete; student sorting; logo.
- 2026-09-19: attendance export fixed (default-present days, from/to period);
  student photo upload + full name on list.
- 2026-09-18: Next.js 14.2.35 → 15.5.25 (CVE fix); plans, classes, weekly prep,
  attendance (+ CSV export, save feedback, state re-sync bug fix); test account
  removed, Enas's `teacher` account and demo data created.
