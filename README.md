# ColbyMajorGuide

**<https://colbymajorguide.com>**

Every Colby College program charted as one network: 101 programs, 397 requirement links,
86 of them crossing a division boundary, plus the all-College requirements every student
owes whichever major they pick.

**This is an unofficial student project.** It is not affiliated with, endorsed by, or
produced by Colby College, and it is not an authoritative source for degree requirements.
The Colby wordmark and Colby Blue are the College's trademarks, used here to identify the
subject of the guide, not to suggest the College made or approved it. The page carries an
"Unofficial" tag in the header and a full notice in the colophon. **Keep both.** The mule
in the colophon is an original drawing made for this page, not the College's athletics mark.

If this ever goes anywhere public-facing beyond a personal site, it is worth a note to
Colby Communications about the wordmark.

## What's here

| File | What it is |
| --- | --- |
| `index.html` | The page. All CSS is inlined so it works as a single file offline. |
| `data.js` | Every program: division, kind, department, four-year route, exclusion rules, links. |
| `map.js` | Chart layout (deterministic relaxation), rendering, and interaction. |
| `tokens.css` | The design tokens, exported so the system can travel to another project. |
| `colby-wordmark.png` | The Colby wordmark, keyed to transparency and normalised to #002169. |
| `flow.js` | The masthead's WebGL noise field. Falls back to a CSS gradient without WebGL. |
| `verify.mjs` | Data integrity check. `node verify.mjs`, exits non-zero on any problem. |
| `plan.js` | "Where you stand": matches your course list against the programs you have declared. |
| `seats.js` | Live seats: badges each course on a route with how full it is. Dark until `seats.data.js` exists. |
| `build-seats.mjs` | Validates a published seat feed and writes `seats.data.js`. Refuses to write a bad one. |
| `seats.sample.js` | Invented counts on real course codes, for previewing the layout. `?p=cs#seats=sample`. |
| `timetable.js` | "Build the week": section search, a Mon-Fri grid, clash detection, and the .ics and print exports. |
| `SEATS.md` | Where Colby's seat numbers live, what has to be asked for, and the feed contract. |
| `planner.js` | "Plan the four years": twelve term slots, level checks, and a link that carries a plan to another browser. |
| `fonts/` | Archivo and Azeret Mono, self-hosted. See `fonts/README.md` before touching them. |
| `CNAME` | The custom domain. GitHub Pages reads this; deleting it drops the site back to the github.io path. |
| `og.jpg` | The 1200×630 link-preview card. |

No build step, no dependencies, no server code. Open `index.html` and it runs.

## Checking the data

```bash
node verify.mjs
```

Confirms every link resolves to a real program, every required field is present, clusters
match their division, minors point at a parent that exists in the same division (or declare
`parent: null` if they are genuinely standalone), nothing is orphaned, and the
`<span class="code">` markup around course numbers is intact. **Run it after any edit to
`data.js`**. The whole worth of this chart is that its numbers are real.

## Sharing a program

The URL carries the selection: `?p=englit` opens straight to English. Selecting a program
updates the address bar, so any route can be sent to someone.

## "Courses I've taken"

The tray above the chart lets a student search the 375 course codes named across all the
routes and drag the ones they have finished into their list (clicking or pressing Enter does
the same, since HTML5 drag-and-drop does not work on touch or by keyboard). The list is kept
in `localStorage` on that device only, nothing is sent anywhere.

Programs then show progress: an arc on the node, a count in the index, a tick beside each
finished course in the route. The wording is deliberately **"courses named on this route"**
rather than "requirements": the routes name specific courses but also say things like "four
electives at the 200 level", which no code list can capture.

## Running it locally

Because the page loads `data.js` and `map.js` as separate scripts, some browsers block
them over `file://`. Serve the folder instead:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Putting it on the internet

It's a static site, so anything that serves files will host it. Three options, easiest first.

### Netlify Drop: fastest, no account setup

1. Go to <https://app.netlify.com/drop>
2. Drag the whole `ColbyMajorGuide` folder onto the page.
3. It's live in about ten seconds at a random subdomain. Rename it under
   Site configuration → Change site name.

### GitHub Pages: free, versioned, good if you'll keep editing

```bash
git init
git add .
git commit -m "Chart every Colby program and the all-College requirements"
git branch -M main
git remote add origin https://github.com/<your-username>/colby-major-guide.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save.**
Live at `https://<your-username>.github.io/colby-major-guide/` within a minute or two.

### Cloudflare Pages or Vercel: if you want a custom domain later

Connect the GitHub repo, leave the build command empty, set the output directory to `/`.
Both give you free HTTPS and a one-click custom domain.

### A custom domain

Buy one (Namecheap, Cloudflare Registrar, Porkbun), then point it at your host:

- **GitHub Pages**: add a `CNAME` file containing your domain, then set an `ALIAS`/`CNAME`
  DNS record to `<your-username>.github.io`.
- **Netlify / Cloudflare / Vercel**: add the domain in the dashboard and follow its DNS
  instructions.

## Where the data came from

The Colby College course catalogue, department and program requirements, read 27 August 2026,
plus `academic-program/academic-requirements` for the all-College rules. Course numbers,
credit counts and exclusion rules are quoted from those pages. Grouping requirements into
four-year stages is this chart's reading of them, not the registrar's.

Requirements change between catalogue years and several programs are mid-transition by class
year. Confirm anything you're about to register for against
[the catalogue](https://www.colby.edu/academics/course-catalogue/department-and-program-requirements/)
and your advisor.

## Editing it

- **Add or change a program**: edit the `PROGRAMS` array in `data.js`. Every entry needs
  `id`, `name`, `short`, `div`, `cluster`, `kind`, `dept`, `size`, `blurb`, `path`, `rules`,
  `links`. Minors also take a `parent`.
- **Links are evidence, not vibes.** Only connect two programs when they share a required
  course, form a joint degree, or one is a named substitution for the other.
- **Layout is deterministic**, with no `Math.random` anywhere, so the chart looks identical on
  every load. Change `CLUSTERS` in `data.js` to move a group; the relaxation does the rest.
- **Colours** live in `:root` in `index.html` (and mirrored in `tokens.css`). Colby Blue
  doubles as the selection signal, so the three division hues are deliberately kept off its
  hue angle.
- **The masthead flow** is a fragment shader in `flow.js`, deliberately confined to the
  title band. The chart below is hairlines and 101 labels and needs a still, light ground.
  A scrim over the canvas keeps white text at 8.8:1 whatever the field is doing. It renders
  a single frame under `prefers-reduced-motion`, caps at 30fps, drops to 0 when scrolled
  past or the tab is hidden, and renders at 55% of a DPR-capped buffer.
