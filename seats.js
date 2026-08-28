/* ColbyMajorGuide: live seats.
 *
 * What a student actually wants to know standing in front of a route is not only
 * "does this course exist" but "can I still get into it". That number is real and
 * Colby holds it: Workday's Find Course Sections carries a capacity and an enrolled
 * count for every section, and the registrar's own course-authorisation page names
 * the two fields outright, #Reg and Max Reg. Colby runs no automated waiting list,
 * so a full section is a hard stop until an instructor issues an authorisation,
 * which is exactly why seeing 30/30 a week before your registration window is worth
 * more here than it would be at a school that queues you automatically.
 *
 * None of it is public. Every Workday academics path sits behind Colby SSO, and the
 * catalogue the rest of this site is built from carries descriptions, not counts.
 * Hyperschedule solves the same problem for the Claremont colleges and cannot help:
 * its schools are PO, HM, PZ, CM, SC and CG, its backend reads Harvey Mudd's Boomi
 * API and Pomona's, and both are a private arrangement with those schools. What
 * Hyperschedule does give is a data model worth copying rather than inventing, so
 * seatsTotal, seatsFilled and the O/C/R/U status below are its field names.
 *
 * So this file is the whole client half of the feature, written against a contract
 * Colby can satisfy without doing anything clever: a static seats.json, refreshed on
 * whatever cadence they are willing to give. See SEATS.md for the contract and for
 * the request that has to be granted before real numbers exist.
 *
 * Until that file is present the feature stays dark. It does not guess, it does not
 * interpolate from last year, and it never renders a number Colby did not publish.
 * The worth of this whole site is that its numbers are real, and an invented seat
 * count is worse than no seat count, because a student would plan around it.
 */

(function () {
  'use strict';

  var API = window.CMG;
  if (!API) return;                       /* map.js failed; leave the feature inert */

  var readout = document.getElementById('readout');
  if (!readout) return;

  /* Hyperschedule's SectionStatus, kept verbatim so a future feed that speaks its
     vocabulary needs no translation layer. R is a section that closed and reopened,
     which matters to a student refreshing the page: it means seats do come back. */
  var STATUS = { O: 'open', C: 'closed', R: 'reopened', U: 'unknown' };

  var DATA = null;                        /* the parsed feed, or null while dark */
  var BY_CODE = Object.create(null);      /* "CS 151" -> rollup across its sections */
  var SECTIONS = [];                      /* the flat list, for the timetable */
  var LISTENERS = [];                     /* told once, when a feed lands */

  /* ---------------------------------------------------------------- loading */

  /* Only two sources are honoured: the default file, and the sample, which exists so
     the layout can be reviewed without pretending the sample is Colby's data. A
     free-form URL parameter is deliberately not accepted. This page is public, and a
     ?seats=https://... that anyone could hand to anyone else turns a course chart
     into a way to render a stranger's JSON inside colbymajorguide.com. */
  function sourceUrl() {
    /* The flag is read from the hash as well as the query, and the hash is the one
       that actually works: map.js rebuilds the query as bare ?p=<id> on every
       selection and carries only location.hash across, so ?seats=sample survives
       exactly until the first click. #seats=sample survives the whole session. */
    var want = null;
    try {
      want = new URLSearchParams(location.search).get('seats') ||
             new URLSearchParams(location.hash.replace(/^#/, '')).get('seats');
    } catch (e) { return 'seats.json'; }
    return want === 'sample' ? 'seats.sample.js' : 'seats.data.js';
  }

  function isSample() { return sourceUrl() === 'seats.sample.js'; }

  /* The feed arrives the way data.js does, as a script that assigns a global, and
     deliberately not as fetch(seats.json). Two reasons, both load-bearing. The page
     ships Content-Security-Policy connect-src 'none', and widening a policy that is
     otherwise default-src 'none' so that one file can be read is a poor trade. And
     the README promises the page runs from a file:// copy with no server, which no
     fetch of a sibling file can do. A same-origin script tag satisfies script-src
     'self' and works in both places. SEATS.md carries the JSON contract itself;
     seats.data.js is only that JSON with an assignment in front of it. */
  function load() {
    var s = document.createElement('script');
    s.src = sourceUrl();
    s.async = true;
    s.onload = function () { adopt(window.CMG_SEATS); };
    s.onerror = function () { /* no feed published yet. Stay dark. */ };
    document.head.appendChild(s);
  }

  /* Anything malformed is dropped rather than half-rendered. A section missing its
     counts is not a section with zero seats, and the difference is the whole point. */
  function adopt(j) {
    if (!j || !Array.isArray(j.sections)) return;

    var by = Object.create(null), flat = [], kept = 0;
    j.sections.forEach(function (s) {
      var code = normalise(s && s.code);
      if (!code) return;
      var total = num(s.seatsTotal), filled = num(s.seatsFilled);
      if (total === null || filled === null) return;

      var row = by[code] || (by[code] = { code: code, total: 0, filled: 0, sections: [] });
      row.total += total;
      row.filled += filled;
      var rec = {
        code: code,
        section: String(s.section || ''),
        title: String(s.title || ''),
        instructors: Array.isArray(s.instructors) ? s.instructors.map(String) : [],
        total: total,
        filled: filled,
        status: STATUS[s.status] ? s.status : 'U',
        schedule: parseSchedule(s.schedule),
        credits: num(s.credits)
      };
      row.sections.push(rec);
      flat.push(rec);
      kept++;
    });
    if (!kept) return;

    Object.keys(by).forEach(function (c) { by[c].state = rollup(by[c]); });

    BY_CODE = by;
    SECTIONS = flat;
    DATA = {
      term: String(j.term || ''),
      termName: String(j.termName || j.term || ''),
      fetchedAt: String(j.fetchedAt || ''),
      source: String(j.source || ''),
      sample: !!j.sample || isSample(),
      count: kept
    };

    decorate();
    watch();
    LISTENERS.forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  function num(v) { return typeof v === 'number' && isFinite(v) && v >= 0 ? v : null; }

  /* Meeting times, in Hyperschedule's shape: days as a string of D/M/T/W/R/F/S,
     times as 24-hour HH:MM. A section whose times do not parse keeps its seat
     counts and loses only its place on the grid, because a wrong hour on a
     timetable is the same class of harm as a wrong seat count. */
  var DAY_CHARS = 'UMTWRFS';
  function minutes(t) {
    var m = /^([0-2]?\d):([0-5]\d)$/.exec(String(t || '').trim());
    if (!m) return null;
    var h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
    if (h > 23) return null;
    return h * 60 + mi;
  }
  function parseSchedule(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [];
    raw.forEach(function (b) {
      if (!b) return;
      var start = minutes(b.startTime), end = minutes(b.endTime);
      if (start === null || end === null || end <= start) return;
      var days = String(b.days || '').toUpperCase().split('').filter(function (c, i, a) {
        return DAY_CHARS.indexOf(c) >= 0 && a.indexOf(c) === i;
      });
      if (!days.length) return;
      out.push({
        days: days, start: start, end: end,
        location: String(b.location || b.locations || '')
      });
    });
    return out;
  }

  /* data.js writes codes as "CS 151": two or three letters, one space, three digits.
     A feed is likelier to write CS151 or CS-151-A, so the join runs on a squeezed
     form rather than on whatever punctuation the registrar's export happens to use. */
  function normalise(raw) {
    if (typeof raw !== 'string') return '';
    var m = raw.toUpperCase().replace(/[^A-Z0-9]/g, ' ').trim().match(/^([A-Z]{2,3})\s*(\d{3}[A-Z]?)/);
    return m ? m[1] + ' ' + m[2] : '';
  }

  /* A course is open if any one of its sections is. Colby runs no waiting list, so
     "one section left with two seats" and "every section full" are different facts
     and the badge has to be able to say which. */
  function rollup(row) {
    var open = row.sections.some(function (s) { return s.status === 'O' || s.status === 'R'; });
    if (open) return 'open';
    var anyKnown = row.sections.some(function (s) { return s.status !== 'U'; });
    if (!anyKnown) return row.filled >= row.total ? 'full' : 'open';
    return 'full';
  }

  /* ------------------------------------------------------------- rendering */

  /* map.js rebuilds #readout wholesale on every selection and never announces it, so
     rather than reach into that function and collide with it, this watches the node.
     Additive by design: seats.js can be deleted and nothing else changes. */
  var observer = null;
  function watch() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function () { decorate(); });
    observer.observe(readout, { childList: true, subtree: false });
  }

  function selectedProgram() {
    var want = null;
    try { want = new URLSearchParams(location.search).get('p'); } catch (e) { return null; }
    return want && API.byId[want] ? API.byId[want] : null;
  }

  function decorate() {
    if (!DATA) return;
    var route = readout.querySelector('.route');
    if (!route || route.getAttribute('data-seats') === DATA.term + ':' + DATA.count) return;

    var p = selectedProgram();
    if (!p) return;

    /* The same walk map.js uses to mark finished courses: stageCodes(p)[stageIndex]
       is an array whose nth entry holds the resolved codes for the nth
       <span class="code"> in that stage. Reusing it means a bare "142" that inherits
       CH from the sentence before it lands on CH 142 here too, instead of missing. */
    var cmap = API.stageCodes(p);
    var hits = 0, full = 0, named = 0;

    Array.prototype.forEach.call(route.children, function (li, si) {
      var row = cmap[si] || [], k = 0;
      Array.prototype.forEach.call(li.querySelectorAll('.code'), function (span) {
        var codes = row[k++] || [];
        named++;
        var seat = null;
        for (var i = 0; i < codes.length; i++) {
          if (BY_CODE[codes[i]]) { seat = BY_CODE[codes[i]]; break; }
        }
        if (!seat) return;
        hits++;
        if (seat.state === 'full') full++;
        mark(span, seat);
      });
    });

    route.setAttribute('data-seats', DATA.term + ':' + DATA.count);
    strip(route, hits, full, named);
  }

  function mark(span, seat) {
    span.setAttribute('data-seat', seat.state);
    if (span.querySelector('.seat')) return;

    var b = document.createElement('span');
    b.className = 'seat';
    b.setAttribute('data-seat', seat.state);
    b.textContent = seat.filled + '/' + seat.total;
    /* the bar behind the digits: fullness read at a glance, before the numbers are */
    b.style.setProperty('--fill', (seat.total ? Math.min(100, Math.round(seat.filled / seat.total * 100)) : 0) + '%');

    var left = Math.max(0, seat.total - seat.filled);
    var parts = seat.sections.map(function (s) {
      return (s.section ? s.section + ': ' : '') + s.filled + ' of ' + s.total +
             ' (' + STATUS[s.status] + ')';
    });
    b.title = seat.code + ', ' + (seat.state === 'full'
      ? 'every section full'
      : left + (left === 1 ? ' seat' : ' seats') + ' left') +
      (parts.length > 1 ? '\n' + parts.join('\n') : '');

    /* The count decorates a code that already reads as a code, so it is announced
       once in words rather than as "30 slash 30" to a screen reader. */
    b.setAttribute('aria-label', seat.code + ', ' + seat.filled + ' of ' + seat.total +
      ' seats taken' + (seat.state === 'full' ? ', full' : ''));

    span.appendChild(b);
  }

  function strip(route, hits, full, named) {
    var old = readout.querySelector('.seats');
    if (old) old.parentNode.removeChild(old);

    var el = document.createElement('p');
    el.className = 'seats';
    el.setAttribute('data-sample', DATA.sample ? 'yes' : 'no');

    if (!hits) {
      el.innerHTML = 'No seat data for the ' + named + ' courses named on this route' +
        (DATA.termName ? ' in ' + esc(DATA.termName) : '') +
        '. A course only appears here in the terms it is actually offered.';
    } else {
      el.innerHTML = '<b>' + (DATA.sample ? 'Sample seats' : (esc(DATA.termName) || 'Live seats')) +
        '</b> &middot; ' + hits + ' of the ' + named + ' named courses ' +
        (hits === 1 ? 'is' : 'are') + ' running' +
        (full ? ', and <b>' + full + '</b> ' + (full === 1 ? 'is' : 'are') + ' full' : '') +
        '. ' + (DATA.fetchedAt ? 'Read ' + esc(ago(DATA.fetchedAt)) + '. ' : '') +
        (DATA.sample
          ? '<b>These numbers are invented</b> and exist only to show the layout.'
          : 'Colby runs no waiting list, so a full course needs an instructor authorisation.');
    }
    route.parentNode.insertBefore(el, route);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function ago(iso) {
    var t = Date.parse(iso);
    if (!isFinite(t)) return '';
    var mins = Math.round((Date.now() - t) / 60000);
    if (mins < 2) return 'just now';
    if (mins < 60) return mins + ' minutes ago';
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    var days = Math.round(hrs / 24);
    return days + (days === 1 ? ' day ago' : ' days ago');
  }

  /* ------------------------------------------------------------------- api */

  /* planner.js can hang a "this term is full" warning off the same feed without
     re-fetching it. Returns null while dark, which callers must handle. */
  API.seats = {
    ready: function () { return !!DATA; },
    meta: function () { return DATA ? JSON.parse(JSON.stringify(DATA)) : null; },
    of: function (code) {
      var row = BY_CODE[normalise(code)];
      return row ? JSON.parse(JSON.stringify(row)) : null;
    },
    /* the flat list, for anything that works in sections rather than courses */
    sections: function () { return JSON.parse(JSON.stringify(SECTIONS)); },
    /* the feed lands asynchronously, so callers subscribe rather than poll. Fires
       immediately if it has already arrived. */
    onData: function (fn) {
      if (typeof fn !== 'function') return;
      LISTENERS.push(fn);
      if (DATA) { try { fn(); } catch (e) {} }
    }
  };

  load();
})();
