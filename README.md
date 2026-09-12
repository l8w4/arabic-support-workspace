# Arabic Support Centre — Workspace (v1)

A Next.js + Supabase app for Enas to keep her student records, intervention
plans, and weekly preparation files organised in one place.

## What's built in this version

- Real login (Supabase Auth), three roles: admin / teacher / viewer
- Students: add, edit, list, search, individual profile page
- Files: upload any document (worksheets, consent forms, plans, prep,
  photos, reports), tag it by type, optionally link it to a student,
  see everything in one searchable/filterable list, download via
  private time-limited links
- Home page with quick counts and recent uploads
- Arabic/English toggle throughout

## What's stubbed (arrives in the next phase)

- خطط العلاج (Intervention Plans) — for now, upload plan documents from
  the Files page and link them to the student; the dedicated page with
  the four-point progress scale and review history is next.
- التحضير الأسبوعي (Weekly Prep) — same idea, upload from Files for now.
- الحضور (Attendance) — not yet built.

## One-time setup

### 1. Create a Supabase project
Go to supabase.com, sign up (free), create a new project. Wait a minute
or two for it to finish provisioning.

### 2. Run the database schema
In your Supabase project: SQL Editor → New query → paste the entire
contents of `supabase/migrations/0001_init.sql` → Run.
This creates every table, the access rules, and a private storage
bucket called `documents`.

### 3. Get your two connection values
Project Settings → API. You need:
- Project URL
- anon / public key
(Never use the `service_role` key in this app — it bypasses all the
access rules on purpose, and this app doesn't need it.)

### 4. Create logins for each person
Authentication → Users → Add user, for each person (Enas, you, any
others). Since there are no real work emails, use a made-up address
like `enas@workspace.local` — it never needs to receive real mail,
it's just an identifier.

After creating each user, copy their User UID (shown in the users
list), then in the SQL Editor run one insert per person:

```sql
insert into profiles (id, full_name_ar, full_name_en, role, title)
values ('paste-the-uid-here', 'إيناس', 'Enas', 'teacher', 'معلمة دعم');
```

Roles are `admin`, `teacher`, or `viewer`.

### 5. Run it locally to test
```
npm install
cp .env.local.example .env.local
```
Edit `.env.local` and paste in your Project URL and anon key. Then:
```
npm run dev
```
Open the localhost URL it prints, log in with one of the accounts you
created, and try adding a student and uploading a file.

### 6. Deploy
Push this to a new GitHub repo (it's a different framework from the
old prototype, so a fresh repo is cleaner than reusing the old one),
import it into Vercel, and — this is the one new step compared to
before — add the same two values from `.env.local` under Vercel's
Project Settings → Environment Variables before deploying.
