/* ColbyMajorGuide: data integrity check.
 *
 *   node verify.mjs
 *
 * The whole worth of this chart is that its edges and course numbers are real, so
 * nothing here should be able to rot quietly. Exits non-zero on any failure, which
 * makes it usable as a pre-commit or CI step.
 */
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const ctx = createContext({});
const src = readFileSync(new URL('./data.js', import.meta.url), 'utf8');
runInContext(src + ';globalThis.__X={PROGRAMS,CLUSTERS,BANDS};', ctx);
const { PROGRAMS, CLUSTERS, BANDS } = ctx.__X;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const REQUIRED = ['id', 'name', 'short', 'div', 'cluster', 'kind', 'dept',
                  'size', 'blurb', 'path', 'rules', 'links'];
const KINDS = new Set(['major', 'conc', 'joint', 'minor']);
const DIVS = new Set(BANDS.map((b) => b.div));

const byId = new Map();
for (const p of PROGRAMS) {
  if (!p || typeof p !== 'object') { fail('a PROGRAMS entry is not an object'); continue; }
  if (byId.has(p.id)) fail(`duplicate id: ${p.id}`);
  byId.set(p.id, p);
}

for (const p of PROGRAMS) {
  const at = `${p.id ?? '(no id)'}`;

  for (const f of REQUIRED) {
    if (p[f] === undefined || p[f] === null || p[f] === '') fail(`${at}: missing ${f}`);
  }
  if (!DIVS.has(p.div)) fail(`${at}: div "${p.div}" is not one of ${[...DIVS].join(', ')}`);
  if (!KINDS.has(p.kind)) fail(`${at}: kind "${p.kind}" is not one of ${[...KINDS].join(', ')}`);

  const cluster = CLUSTERS[p.cluster];
  if (!cluster) fail(`${at}: cluster "${p.cluster}" does not exist`);
  else if (cluster.div !== p.div) fail(`${at}: sits in ${p.div} but cluster "${p.cluster}" belongs to ${cluster.div}`);

  if (Array.isArray(p.path)) {
    if (p.path.length < 3) warn(`${at}: only ${p.path.length} route stages`);
    p.path.forEach((s, i) => {
      if (!s || !s.when || !s.what) fail(`${at}: route stage ${i} is missing when/what`);
    });
  } else fail(`${at}: path is not an array`);

  if (!Array.isArray(p.rules)) fail(`${at}: rules is not an array`);
  if (!Array.isArray(p.links)) { fail(`${at}: links is not an array`); continue; }

  const seen = new Set();
  for (const t of p.links) {
    if (t === p.id) fail(`${at}: links to itself`);
    if (seen.has(t)) fail(`${at}: links to ${t} twice`);
    seen.add(t);
    if (!byId.has(t)) fail(`${at}: links to "${t}", which is not a program`);
  }

  if (p.kind === 'minor' || p.parent !== undefined) {
    /* parent: null means "checked, genuinely standalone"; undefined means someone forgot */
    if (p.parent === undefined && p.kind === 'minor') fail(`${at}: minor has no parent field - set parent: null if it is genuinely standalone`);
    else if (p.parent === null) { /* standalone by declaration */ }
    else {
      const parent = byId.get(p.parent);
      if (!parent) fail(`${at}: parent "${p.parent}" is not a program`);
      else {
        if (parent.div !== p.div) fail(`${at}: parent ${p.parent} is in a different division`);
        if (!p.links.includes(p.parent)) fail(`${at}: does not link to its parent ${p.parent}`);
      }
    }
  }
}

/* every program has to be reachable, or it is invisible on the chart */
const degree = new Map([...byId.keys()].map((k) => [k, 0]));
for (const p of PROGRAMS) {
  for (const t of p.links) {
    if (!byId.has(t)) continue;
    degree.set(p.id, degree.get(p.id) + 1);
    degree.set(t, degree.get(t) + 1);
  }
}
for (const [id, d] of degree) if (d === 0) fail(`${id}: connects to nothing`);

/* course codes are the thing students act on, so the markup around them must be intact */
const codeRe = /<span class="code">([^<]*)<\/span>/g;
let codeCount = 0;
for (const p of PROGRAMS) {
  for (const s of p.path ?? []) {
    const opens = (s.what.match(/<span class="code">/g) ?? []).length;
    const closes = (s.what.match(/<\/span>/g) ?? []).length;
    if (opens !== closes) fail(`${p.id}: unbalanced <span class="code"> in "${s.when}"`);
    for (const m of s.what.matchAll(codeRe)) {
      codeCount++;
      if (!m[1].trim()) fail(`${p.id}: empty course code in "${s.when}"`);
    }
  }
}

const counts = PROGRAMS.reduce((a, p) => (a[p.kind] = (a[p.kind] ?? 0) + 1, a), {});
const edges = new Set();
for (const p of PROGRAMS) for (const t of p.links) if (byId.has(t)) edges.add([p.id, t].sort().join('|'));

console.log(`programs   ${PROGRAMS.length}  (${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')})`);
console.log(`links      ${edges.size}`);
console.log(`codes      ${codeCount} course references`);
console.log(`clusters   ${Object.keys(CLUSTERS).length} across ${BANDS.length} bands`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ~ ${w}`);
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}
console.log('\nok, data is consistent');
