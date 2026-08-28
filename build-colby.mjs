/* Turn a Colby course-search dump into seats.data.js.
 *
 *   node build-colby.mjs colby-fall2026.txt
 *
 * The input is the text of Colby's own course search, pasted or saved as-is. Each
 * section is four lines:
 *
 *   AA 120B-A - Critical Inquiries in Medical Ethics
 *   Waitlist   |   Fall 2026   |   Jay Sibara   |   4 Credits   |   16/16 Seats Filled   |   ...
 *   Section Details
 *   WF | 2:30 PM - 3:45 PM
 *
 * Everything is taken literally. Anything that does not parse is dropped and
 * counted rather than guessed at, because a wrong seat count or a wrong hour is
 * worse than an absent one: a student would plan around it.
 *
 * This is a SNAPSHOT, not a feed. It is true as of the day it was captured and
 * goes stale the moment anyone adds or drops. The page prints its date and says
 * so. SEATS.md still describes the standing feed worth asking the registrar for.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node build-colby.mjs <dump.txt> [captured-YYYY-MM-DD]'); process.exit(1); }
const captured = process.argv[3] || '';

const raw = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const lines = raw.split('\n').map((l) => l.trim());

/* "AA 120B-A - Critical Inquiries in Medical Ethics" */
const HEAD = /^([A-Z]{2,4}(?: [A-Z])? ?\d{3}[A-Z]?(?: L| D)?)-([A-Za-z0-9]+)\s+-\s+(.+)$/;
/* the pipe-separated facts line, recognised by its seat count */
const FACTS = /\d+\/-?\d+\s+Seats Filled/;
/* "WF | 2:30 PM - 3:45 PM"  or  "M | 7:00 PM - 9:00 PM | 09/09/2026 - 12/21/2026" */
const MEET = /^([MTWRFSU]{1,7})\s*\|\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*\|\s*(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4}))?$/i;

function to24(t) {
  const m = /^(\d{1,2}):(\d{2})\s*([AP])M$/i.exec(t.trim());
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mi = parseInt(m[2], 10);
  const pm = m[3].toUpperCase() === 'P';
  if (h === 12) h = 0;
  if (pm) h += 12;
  return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
}

const STATUS = { open: 'O', waitlist: 'C', closed: 'C', full: 'C' };

const sections = [];
const dropped = { noFacts: [], noSeats: [], badHead: 0 };
let termName = '', firstDate = '', lastDate = '';

for (let i = 0; i < lines.length; i++) {
  const h = HEAD.exec(lines[i]);
  if (!h) continue;
  const code = h[1].replace(/\s+/g, ' ').trim();
  const section = h[2];
  const title = h[3].trim();

  /* the facts line is the next non-empty line that carries a seat count */
  let facts = null;
  for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
    if (FACTS.test(lines[j])) { facts = lines[j]; break; }
    if (HEAD.test(lines[j])) break;
  }
  if (!facts) { dropped.noFacts.push(code + '-' + section); continue; }

  const parts = facts.split('|').map((p) => p.trim());
  const status = STATUS[(parts[0] || '').toLowerCase()] || 'U';
  const rawStatus = parts[0] || '';

  const seat = /(\d+)\/(-?\d+)\s+Seats Filled/.exec(facts);
  if (!seat) { dropped.noSeats.push(code + '-' + section); continue; }
  const filled = parseInt(seat[1], 10);
  const total = parseInt(seat[2], 10);
  if (!isFinite(filled) || !isFinite(total) || total < 0) { dropped.noSeats.push(code + '-' + section); continue; }

  const term = parts.find((p) => /^(Fall|Spring|Jan|Summer|Winter)\s+\d{4}$/.test(p)) || '';
  if (term && !termName) termName = term;

  /* "4 Credits", "1 - 2 Credits", "0 Credits". A range keeps its lower bound and
     is flagged, because a plan should not silently claim the top of a range. */
  const cr = /(\d+)(?:\s*-\s*(\d+))?\s+Credits/.exec(facts);
  const credits = cr ? parseInt(cr[1], 10) : null;
  const creditsMax = cr && cr[2] ? parseInt(cr[2], 10) : null;

  /* an instructor sits between the term and the credits, and is often absent */
  const ti = parts.indexOf(term);
  const maybeInstr = ti >= 0 ? parts[ti + 1] : '';
  const instructors = maybeInstr && !/Credits/.test(maybeInstr) ? [maybeInstr] : [];

  /* "AA 120B-A/ WG 120B-A" lists every code this same class answers to */
  const xl = parts.find((p) => /\//.test(p) && /[A-Z]{2,4} ?\d{3}/.test(p));
  const crossList = xl
    ? xl.split('/').map((c) => c.trim().replace(/\s+-\s+.*$/, '')).filter(Boolean)
    : [];

  const dept = parts[parts.length - 1] || '';

  /* meeting blocks: the lines after "Section Details" until the next header */
  const schedule = [];
  let collapsed = false;
  for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
    if (HEAD.test(lines[j])) break;
    if (/^,\s*\+\d+ more/.test(lines[j])) { collapsed = true; continue; }
    const m = MEET.exec(lines[j]);
    if (!m) continue;
    const start = to24(m[2]), end = to24(m[3]);
    if (!start || !end || end <= start) continue;
    schedule.push({ days: m[1].toUpperCase(), startTime: start, endTime: end, location: '' });
    if (m[4]) { if (!firstDate) firstDate = m[4]; lastDate = m[5]; }
  }

  sections.push({
    code, section, title, instructors,
    seatsTotal: total, seatsFilled: filled,
    status, rawStatus,
    ...(credits !== null ? { credits } : {}),
    ...(creditsMax !== null ? { creditsMax } : {}),
    ...(schedule.length ? { schedule } : {}),
    ...(collapsed ? { partialSchedule: true } : {}),
    ...(crossList.length > 1 ? { crossList } : {}),
    ...(dept ? { dept } : {}),
  });
}

const iso = (d) => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d || ''); return m ? `${m[3]}-${m[1]}-${m[2]}` : ''; };
const termCode = (() => {
  const m = /^(Fall|Spring|Jan|Summer|Winter)\s+(\d{4})$/.exec(termName || '');
  if (!m) return '';
  return ({ Fall: 'FA', Spring: 'SP', Jan: 'JA', Summer: 'SU', Winter: 'WI' })[m[1]] + m[2];
})();

const feed = {
  term: termCode,
  termName,
  ...(iso(firstDate) ? { termStart: iso(firstDate) } : {}),
  ...(iso(lastDate) ? { termEnd: iso(lastDate) } : {}),
  fetchedAt: captured ? captured + 'T00:00:00.000Z' : '',
  source: 'Colby course search, captured by hand' + (captured ? ' on ' + captured : '') +
          '. A snapshot, not a live feed: it was true when it was taken and goes stale as students add and drop.',
  snapshot: true,
  sections,
};

writeFileSync('seats.data.js',
  '/* Generated by build-colby.mjs. Do not edit by hand.\n' +
  ' * A dated snapshot of Colby\'s own course search, not a live feed.\n' +
  ' */\nwindow.CMG_SEATS = ' + JSON.stringify(feed, null, 1) + ';\n');

const withTimes = sections.filter((s) => s.schedule).length;
const partial = sections.filter((s) => s.partialSchedule).length;
const xlisted = sections.filter((s) => s.crossList).length;
const codes = new Set(sections.map((s) => s.code));

console.log(`term        ${termName || '(unknown)'} ${termCode ? '(' + termCode + ')' : ''}`);
console.log(`dates       ${iso(firstDate) || '?'} to ${iso(lastDate) || '?'}`);
console.log(`sections    ${sections.length}  across ${codes.size} distinct course codes`);
console.log(`with times  ${withTimes}${partial ? `  (${partial} had extra blocks collapsed in the dump)` : ''}`);
console.log(`crosslisted ${xlisted}`);
if (dropped.noFacts.length) console.log(`dropped     ${dropped.noFacts.length} with no facts line: ${dropped.noFacts.slice(0, 5).join(', ')}`);
if (dropped.noSeats.length) console.log(`dropped     ${dropped.noSeats.length} with no seat count: ${dropped.noSeats.slice(0, 5).join(', ')}`);
console.log('\nwrote seats.data.js');
