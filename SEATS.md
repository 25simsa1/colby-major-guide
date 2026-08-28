# Live seats

Which courses on a route are full, and how many people are in them.

The client half is finished and tested. The data half is not ours to finish: Colby has
the numbers and does not publish them. This file records what was found, what has to be
asked for, and the contract the page is already written against, so that the day a feed
exists the remaining work is one command.

## Status

| Piece | State |
| --- | --- |
| `seats.js` | Done. Reads a feed, rolls sections up per course, badges the route. |
| Badge and strip styling | Done, inlined in `index.html` under the live seats block. |
| `build-seats.mjs` | Done. Validates a feed and writes `seats.data.js`. |
| `seats.sample.js` | Done. Invented counts on real course codes, for previewing the layout. |
| `seats.data.js` | **Missing, and that is correct.** Nothing to generate it from yet. |

With no `seats.data.js` the feature is invisible. That is deliberate. It never guesses,
never carries last year's numbers forward, and never renders a count Colby did not
publish. The worth of this whole site is that its numbers are real, and a wrong seat
count is worse than no seat count, because a student would plan around it.

Preview the layout with the sample:

    ?p=cs#seats=sample

The flag lives in the hash and not the query string because `map.js` rebuilds the query
as bare `?p=<id>` on every selection and carries only `location.hash` across. A
`?seats=sample` survives exactly until the first click.

## Meeting times, added for the timetable

`timetable.js` draws the week, so the contract carries two optional fields beyond the
counts. A feed without them still works: seats.js badges routes exactly as before and
the timetable simply stays dark.

    "schedule": [ { "days": "MWF", "startTime": "09:00", "endTime": "09:50",
                    "location": "Lovejoy 100" } ],
    "credits": 4

`days` is a string of `M T W R F` (and `U`, `S` if a section ever meets at a weekend),
`startTime` and `endTime` are 24-hour `HH:MM`. A section whose times do not parse keeps
its seat counts and loses only its place on the grid: a wrong hour on a timetable is the
same class of harm as a wrong seat count.

Two more optional keys on the feed itself, `termStart` and `termEnd` as `YYYY-MM-DD`,
prefill the calendar export so a student does not have to look the dates up. Without
them the export asks for them rather than guessing.

Calendar events are written as floating local time, deliberately. A 9am Monday class
stays 9am across the November clock change; anchoring it to UTC would move every class
an hour halfway through the term.

## Where the numbers actually are

Colby registers students through **Workday Student**. The Jan Plan 2026 instructions
send students to Student Academics Dashboard, then Find Course Sections for
Registration, and that view carries a capacity and an enrolled count per section.

The registrar's own course authorisation page names the two fields in plain sight, and
is worth quoting because it settles the data model. Instructors are told to note
whether the course is full, "#Reg >= Max Reg".

    https://www.colby.edu/people/offices-directory/registrar/resources/course-authorization-instructions/

So `#Reg` is `seatsFilled` and `Max Reg` is `seatsTotal`. That page also establishes two
rules this feature has to respect.

**Colby runs no automated waiting list.** A full course is a hard stop until an
instructor issues an authorisation. This is exactly why the badge is worth more here
than at a school that queues you automatically: 30/30 in week one is information a
student can act on, by writing to the instructor rather than by waiting.

**Over-enrolment is legal.** An instructor who ticks "override Max Reg" seats a student
past the cap on purpose, so `31/30` is a real state Colby can be in, not a broken
export. `build-seats.mjs` accepts it and notes it rather than rejecting the feed.

Everything else was checked and ruled out.

- Every Workday academics path sits behind Colby SSO.
- `my.colby.edu/ICS/` is the legacy Jenzabar portal. Every academics path there returns
  the login shell. ITS keeps a "Decommissioned myColby Pages" list, and the course
  authorisation page still uses FA 2017 as its worked example, so read it as history
  that happens to document the field names correctly.
- The catalogue on `www.colby.edu` is WordPress behind an Inertia SPA. It carries course
  descriptions and requirement prose. No meeting times, no capacities.
- The registrar publishes the catalogue and final exam schedules. No schedule feed.
- `registrar.`, `courses.`, `schedule.`, `ssb.`, `banner.` and `selfservice.colby.edu`
  do not resolve.

## Hyperschedule cannot supply this

Hyperschedule is a course scheduler for the Claremont Colleges, and the reason it looks
like the answer is that it solves this exact problem well. It cannot be pointed at
Colby. Its `School` enum is `PO, HM, PZ, CM, SC, CG`, its backend reads Harvey Mudd's
Boomi API and Pomona's, and both are a private arrangement between that project and
those schools. There is no Colby in it and no public endpoint to borrow.

What it does supply is a data model that has survived years of production use, so the
field names below are Hyperschedule's, verbatim from its `shared/api/v4/course.ts`:
`seatsTotal`, `seatsFilled`, and a `status` of `O` open, `C` closed, `R` reopened and
`U` unknown. A feed that already speaks that vocabulary needs no translation layer.

One term had to be added. Hyperschedule's terms are `FA`, `SP` and `SU`. Colby has Jan
Plan, which is its own registration with its own capacity, and three of which are a
graduation requirement, so `JA` is a term here.

## What has to be asked for

Not an API key in the sense of signing up for one. Workday tenants do not issue those to
students, and no amount of client-side work gets around Colby SSO. What is needed is for
Colby to decide to publish, in one of three forms, easiest first.

1. **A scheduled export.** The registrar or ITS drops a CSV or JSON of course sections
   with enrolled and capacity counts at a fixed URL, refreshed nightly, or hourly during
   registration. No credentials to hold, nothing to secure on this end, and it is the
   smallest possible yes. **Ask for this one.**
2. **A Workday RaaS report.** A custom report exposed as a web service and read by an
   Integration System User scoped to course sections only. More work for ITS, and it
   puts a credential in play that would have to live in a GitHub Actions secret.
3. **Nothing, but permission to keep asking.** Worth knowing where the objection sits.

Scope the ask so that it is easy to grant: **aggregate counts only, no student-level
data.** Subject and number, section, title, capacity, enrolled, status. Nothing about
who is in the course. That keeps it clear of FERPA entirely and turns it into a
publishing decision rather than a privacy one.

Send to `registrar@colby.edu`, and copy ITS.

### Draft

> Subject: Request: a read-only feed of course section enrolment counts
>
> Dear Registrar's Office,
>
> I am a Colby undergraduate. I built and maintain ColbyMajorGuide
> (colbymajorguide.com), an unofficial student project that charts all 101 Colby
> programs and their requirements as one navigable map. It is clearly labelled
> unofficial and points students to Workday and to their advisors for anything
> authoritative.
>
> Students using it keep asking the same question the chart cannot answer: of the
> courses on this route, which ones are actually open next term. At the moment they
> have to check each one by hand in Workday.
>
> I am writing to ask whether Colby would be willing to publish a read-only feed of
> course section enrolment counts, so that the guide could show which courses are
> already full before a student builds a plan around one that is not available.
>
> The smallest version that would work:
>
> - Fields: subject and course number, section, title, capacity (Max Reg), enrolled
>   (#Reg), and whether the section is open or closed.
> - Aggregate counts only. No student-level information of any kind, so nothing in it
>   is an education record.
> - A CSV or JSON file at a fixed URL, refreshed nightly, or more often during
>   registration if that is not a burden.
>
> I am happy to work to whatever shape is easiest on your side, to add any disclaimer
> or attribution you would want, and to take the feature down if it ever causes a
> problem. If this is really a question for ITS rather than for your office, I would be
> grateful for a pointer to the right person.
>
> I would also be glad to come by and show you what the guide does.
>
> Thank you for your time,
>
> [name, class year, Colby email]

### Before sending

Check that the wordmark question is settled first. `README.md` notes it is worth a word
to Colby Communications about the Colby wordmark and Colby Blue if this goes anywhere
public-facing, and a request landing in one office tends to reach another. Better that
they meet the project once, coherently, than twice by accident.

Expect the answer to be about policy rather than engineering. Publishing live
registration pressure is a decision about what the College wants visible during
registration week, and the person reading the email may need to take it to someone else.
That is a reason to make the ask small and easy to say yes to, not a reason to skip it.

## The contract

A feed is a single JSON object. `build-seats.mjs` rejects anything that does not match
and writes nothing, so a bad feed cannot reach the site.

    {
      "term": "FA2026",
      "termName": "Fall 2026",
      "fetchedAt": "2026-08-28T13:00:00.000Z",
      "source": "Colby Registrar, nightly course section export",
      "sections": [
        {
          "code": "CS 151",
          "section": "A",
          "title": "Computational Thinking",
          "instructors": ["A. Lecturer"],
          "seatsTotal": 30,
          "seatsFilled": 30,
          "status": "C"
        }
      ]
    }

| Field | Rule |
| --- | --- |
| `term` | `FA`, `JA`, `SP` or `SU` followed by four digits. |
| `termName` | What a student sees, for example `Fall 2026`. |
| `fetchedAt` | ISO 8601. The page turns this into "read 20 minutes ago". |
| `source` | Free text, recorded in the generated file's header. |
| `sections[].code` | Any punctuation. `CS 151`, `CS151` and `CS-151-A` all resolve. |
| `sections[].section` | Section letter or number. Must be unique within a course. |
| `sections[].seatsTotal` | `Max Reg`. Non-negative integer. |
| `sections[].seatsFilled` | `#Reg`. Non-negative integer, may legitimately exceed the total. |
| `sections[].status` | `O`, `C`, `R` or `U`. Optional, defaults to `U`. |
| `sections[].title`, `sections[].instructors` | Optional. Shown in the badge tooltip. |

Courses are rolled up from their sections in the browser. A course counts as open if any
one of its sections is, because at Colby that is the difference between registering and
writing to an instructor.

## Publishing

    node build-seats.mjs seats.json    # validates, writes seats.data.js
    node verify.mjs                    # the existing data check, unrelated but cheap

Then commit `seats.data.js`. GitHub Pages serves it and the badges appear.

To refresh on a schedule, a GitHub Actions workflow that fetches the published feed,
runs `build-seats.mjs` and commits the result when it changes is the whole job. It is
not written yet because its one load-bearing line, the URL it fetches, does not exist.
Once Colby answers, that workflow is about fifteen lines.

## Rules for whoever touches this next

1. **Never commit a `seats.data.js` built from anything but a real Colby feed.** The
   sample exists so that nobody is tempted. If you generate one while testing, delete it
   before you commit.
2. **Never widen the Content Security Policy for this.** `index.html` ships
   `default-src 'none'` with `connect-src 'none'`, which is why the feed loads as a
   script assigning a global rather than as `fetch('seats.json')`. That also keeps the
   promise in `README.md` that the page runs from a `file://` copy with no server.
3. **If a feed goes stale, let it show.** The strip says how old the reading is. An old
   number that admits its age is honest. A fresh-looking old number is not.
