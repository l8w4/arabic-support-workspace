# Arabic Support Centre — Enas's Workspace

**Version 2 of the plan.** Replaces the earlier school-system plan.
**Planned by:** Opus · **To be built by:** Sonnet, in Claude Code

---

## 0. What this actually is

Enas runs Arabic language support for students with disabilities at Alpha
Cambridge School. Her work currently lives in Word documents, printed papers,
and folders scattered across devices and desks.

**The problem being solved is not "the school needs a management system."**
It is: *one place where all of Enas's work lives, organised, searchable, and
visible to a few supervisors who can comment on it.*

**Users:** Enas (full access) plus up to three or four supervisors and
coordinators who view and comment. One of them is already named in her
paperwork — أستاذ/ أحمد فتحي, listed as المنسق on her intervention plan.

**Not building:** parent portal, commercial multi-school features, student
self-access, complex role hierarchies, user management screens for four people.

---

## 1. Two things her documents corrected

I read the two Word files she uses. Both changed the design.

### The progress scale is not 1–9

The earlier plan carried a 1–9 achievement scale from the original
specification document. **Her actual intervention plan uses a four-point
qualitative scale:**

| Arabic | Meaning |
|---|---|
| تحسن كبير | Great improvement |
| تحسن ملحوظ | Noticeable improvement |
| تحسن طفيف | Slight improvement |
| لم يتحسن | No improvement |

This is what gets built. The 1–9 scale is dropped entirely — it was never
hers.

### تحضير is weekly and per class, not daily and per student

The file is titled **خطة التحضير الأسبوعية**, covers a date range
(3–7 September), and applies to a grade group (الأول والثاني) — not to an
individual student, and not to a single day.

So the earlier design ("تحضير يومي as a solo tab") was based on a wrong
assumption. It becomes a **weekly preparation library**, filed by class and
week.

---

## 2. The central design decision

She wants to **upload** her Word documents, not retype them into web forms.
That is the right instinct — her templates are detailed, school-approved, and
she is fast in Word.

But if the system only stores files, it is Google Drive with extra steps. The
value is not storage. It is **finding things and seeing patterns.**

**So: upload the Word file as the source of truth, and capture a handful of
fields alongside it so it becomes findable.**

For an intervention plan, the fields captured are:
- Which student
- Term and date range (e.g. سبتمبر 2026 → يناير 2027)
- General objectives (short text — she can paste the الهدف العام line)
- Current progress rating (the four-point scale above)
- Review date

For a weekly preparation:
- Which class / grade
- Week (date from → date to)
- Unit (الوحدة) and lesson title (عنوان الدرس)

That is roughly five fields per upload — perhaps thirty seconds of typing —
and in exchange she gets: every plan for a given student in one click, every
preparation for this term, which students haven't improved, and which plans are
due for review.

**Explicitly not doing:** recreating her plan tables as web forms. The
الأهداف الفرعية / الإجراءات / التقويم table stays inside the Word document
where she already writes it.

> **Worth knowing for later:** once the metadata is in place, the system could
> eventually *generate* her Word templates pre-filled — she fills a form, it
> produces the document in her exact school format. That is a genuinely useful
> future feature and a natural second version. Not now.

---

## 3. Stack

**Next.js + Supabase, deployed on Vercel.** Unchanged from the previous plan,
and it fits this smaller scope even better:

- Supabase gives the database, logins, and — importantly here — **private file
  storage**, which is the core of this product.
- Vercel and GitHub already work for you.
- TypeScript, because it catches mistakes before they run.

Ignore the NestJS / SQL Server details in the original specification. That was
written for a commercial product; this is a working tool for one person.

---

## 4. Database model

Nine tables. The previous plan had eighteen.

**`profiles`** — the handful of people who log in
`id`, `full_name_ar`, `full_name_en`, `title` (free text — مشرف, منسق,
معلمة), `role`, `is_active`

Roles are just three: `admin` (you), `teacher` (Enas — full edit),
`viewer` (supervisors — read and comment only).
The distinction between مشرف and منسق is a *label*, not a permission level, so
it lives in `title` rather than multiplying roles.

**`students`**
`id`, `name_ar`, `name_en`, `student_code`, `grade`, `diagnostic_level`,
`photo_path`, `guardian_name`, `guardian_phone`, `second_contact`,
`general_notes`, `status` (active / archived), audit fields

Guardian details sit directly on the student rather than in a separate table —
she needs a contact, not a family tree.

**`classes`** — the groups she teaches
`id`, `name_ar` (e.g. الصف الأول والثاني), `academic_year`, `is_active`

**`class_students`** — who is in which class
`class_id`, `student_id`, `joined_on`, `left_on`

**`attendance`**
`id`, `class_id`, `student_id`, `attend_date`, `status`, `note`,
`marked_by`, `marked_at`

Statuses: `present` حاضر · `absent` غائب · `excused` مستأذن ·
`truant` هارب · `late` متأخر

**`plans`** — الخطة العلاجية الفردية
`id`, `student_id`, `term`, `starts_on`, `ends_on`, `general_objectives`,
`coordinator_name`, `progress_rating`, `review_on`, `status`,
`document_path`, `final_report`, audit fields

**`plan_reviews`** — progress over time, so ratings are a history not an
overwrite
`id`, `plan_id`, `reviewed_on`, `progress_rating`, `notes`, `reviewed_by`

**`preps`** — خطة التحضير الأسبوعية
`id`, `class_id`, `week_start`, `week_end`, `unit`, `lesson_title`,
`document_path`, audit fields

**`documents`** — everything else: worksheets, consent forms, photos of work,
reports
`id`, `title`, `doc_type`, `student_id` (optional), `class_id` (optional),
`file_path`, `file_name`, `mime_type`, `size_bytes`, `notes`,
`uploaded_by`, `uploaded_at`

**`comments`** — how supervisors participate
`id`, `entity_type` (student / plan / prep / document), `entity_id`,
`body`, `author_id`, `created_at`

**`activity_log`** — a simple record of who did what, when
`id`, `actor_id`, `action`, `entity_type`, `entity_id`, `occurred_at`

All timestamps stored UTC, displayed Qatar time (UTC+3). Every upload and save
records who and when — this covers the earlier requirement for exact dates on
everything.

---

## 5. A simplification worth naming

The previous plan argued attendance had to be tied to scheduled *sessions*,
built on terms, timetable slots and generated session records. That was correct
for a multi-teacher centre with a complex timetable.

**For Enas it is over-engineering.** She picks a class and a date and marks
that day. Because *she* chooses the date, only real days get marked — which was
the entire problem session-linking was meant to solve. Three tables disappear
and nothing of value is lost.

If a full timetable is ever genuinely needed, it can be added later without
disturbing the attendance records.

---

## 6. Permissions

| | Enas (teacher) | Supervisors (viewer) | You (admin) |
|---|---|---|---|
| View everything | Yes | Yes | Yes |
| Add / edit students | Yes | No | Yes |
| Upload documents | Yes | No | Yes |
| Mark attendance | Yes | No | Yes |
| Create / edit plans | Yes | No | Yes |
| Record plan reviews | Yes | No | Yes |
| Comment | Yes | **Yes** | Yes |
| Delete anything | Yes (archives) | No | Yes |
| Manage accounts | No | No | Yes |

Accounts are created by you directly — there is no user management screen. For
four people, a screen to manage four people is more work than the work it saves.

---

## 7. Pages

```
/login

/                     Home — this week at a glance, recent uploads,
                      plans due for review, unread comments

/students             List with search and photos
/students/[id]          معلومات الطالب   info, photo, contact
                        الخطة العلاجية   plans + review history
                        الحضور           attendance record
                        الملفات          documents for this student
                        الملاحظات        notes and supervisor comments

/plans                All plans · filter by term, student, rating
                      Flags plans past their review date

/prep                 Weekly preparation library
                      Filter by class and term

/attendance           Pick class + date → mark → save
/attendance/history   By student, by class, by date range
                      Who is absent / هارب most often

/files                Everything uploaded, searchable, filterable

/reports              Excel exports: attendance summary,
                      progress summary, per-student file

/settings             Classes, academic year, her own password
```

---

## 8. Design

Calm, institutional, and boring in the good way. No school brand colours.

- One neutral base (slate/navy), white surfaces, a single accent for actions.
- Colour is reserved for status — attendance states and progress ratings are
  the only saturated things on screen.
- Arabic-first, RTL, with the English toggle kept. IBM Plex Sans Arabic or
  Noto Sans Arabic.
- Tables over cards where she is scanning many students at once.
- Accessible by default: 4.5:1 contrast minimum, real labels, keyboard
  navigable, status never shown by colour alone.

---

## 9. Build order

Ordered by where her pain actually is. Her problem is scattered files, so
documents come early — before attendance, despite attendance being requested
first.

| Phase | What | She can test |
|---|---|---|
| **0** | Supabase project, Claude Code on the repo | — |
| **1** | Login, roles, shell, Arabic/English, design system | Log in and look around |
| **2** | Students: records, photos, contacts | Add her real students |
| **3** | **Upload engine** — files, storage, tagging, search | Upload a stack of her documents |
| **4** | الخطة العلاجية — plans, the four-point scale, review history, overdue flags | Upload a real plan, record progress |
| **5** | التحضير الأسبوعي — weekly library by class and week | Upload her preparations |
| **6** | Attendance — class + date, five statuses, history view | Mark a real week |
| **7** | Comments + supervisor accounts | Ahmed comments on a plan |
| **8** | Excel exports, polish, backups | Produce a term summary |

**Realistic timeline:** two to three weeks of focused evening sessions for
phases 1–6, which is already a usable tool. Phases 7–8 follow after she has
lived with it for a week or two.

**Recommended checkpoint:** after phase 4, stop and show her. Plans are the
heart of her work — if the shape is wrong, better to find out there than at
phase 8.

---

## 10. Risks, honestly

**The data is sensitive.** Named children, disabilities, intervention plans.
Nothing exotic is required — the protections come free with Supabase (hashed
passwords, database-level access rules, private file storage). The one way to
break it is making a storage bucket public to fix a photo loading quickly.
Don't do that.

**Backups matter more here than in most projects.** If this becomes where her
year's work lives, losing the database means losing her year's work. The free
Supabase tier has no meaningful backups and pauses after a week of inactivity.
Budget roughly USD 25/month before she puts real work in. This is the single
most important spend in the project.

**Accounts are yours, not the school's.** Fine for now. But her working records
would depend on your personal login. Worth revisiting once she relies on it.

**Storage adds up.** Word documents are small; photos and videos of student
work are not. The free tier's ~1 GB goes quickly.

**You are the only maintainer.** If she comes to depend on this, that is a real
dependency on one person's availability. Worth being honest with her about what
support looks like.

**Arabic PDF export is difficult.** Excel exports first. Arabic PDF is a
separate piece of work with its own testing, and is not needed for v1.

---

## 11. Still open

1. **Her student list.** Does she have one in Excel? A bulk import in phase 2
   saves hours of typing.

2. **Classes.** What groups does she actually teach this year? The prep
   document shows الأول والثاني together — is that the real structure?

3. **How many past documents?** If she has two years of files to upload, phase
   3 should include a bulk-upload tool rather than one file at a time.

4. **Wifi where she marks attendance.** If it's unreliable, attendance needs
   offline handling — real extra work, decided before phase 6.
