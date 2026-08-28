/* ColbyMajorGuide: the week.
 *
 * The Hyperschedule half of this site. Pick sections, see them laid on a Monday to
 * Friday grid, watch the clashes appear, and take the result somewhere that will
 * still have it tomorrow.
 *
 * It reads the same feed seats.js reads, so it is dark for the same reason and
 * lights up on the same day: Colby publishes no section times, and inventing them
 * would be worse than showing nothing, because a student would plan around a wrong
 * hour. See SEATS.md for the contract and the request. Preview the layout with
 * #seats=sample, which is invented data and says so on screen.
 *
 * Because there is no account, the schedule has to leave the site to be worth
 * anything. Two ways out, both working offline and neither needing a server: an
 * .ics that Google Calendar, Apple Calendar and Outlook all import, and a print
 * layout that a browser turns into a PDF.
 */

(function () {
  'use strict';

  var API = window.CMG;
  if (!API || !API.seats) return;

  var STORE = 'colbymajorguide.schedule';
  var DAYS = [
    { c: 'M', name: 'Monday', short: 'Mon', ics: 'MO' },
    { c: 'T', name: 'Tuesday', short: 'Tue', ics: 'TU' },
    { c: 'W', name: 'Wednesday', short: 'Wed', ics: 'WE' },
    { c: 'R', name: 'Thursday', short: 'Thu', ics: 'TH' },
    { c: 'F', name: 'Friday', short: 'Fri', ics: 'FR' }
  ];
  var GRID_FROM = 8 * 60, GRID_TO = 18 * 60;      /* widened if a section falls outside */

  var chosen = [];                                 /* "CODE|SECTION", in pick order */
  var sections = [], byKey = Object.create(null), meta = null;

  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || '[]');
    if (Array.isArray(saved)) chosen = saved.filter(function (k) { return typeof k === 'string'; });
  } catch (e) {}
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(chosen)); } catch (e) {} }

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
  }
  function keyOf(s) { return s.code + '|' + s.section; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(m) {
    var h = Math.floor(m / 60), mi = m % 60, ap = h >= 12 ? 'pm' : 'am';
    var hh = h % 12; if (!hh) hh = 12;
    return hh + (mi ? ':' + pad(mi) : '') + ap;
  }

  /* ------------------------------------------------- titles from the catalogue

     The feed carries a title field, but a registrar export may well leave it empty,
     and the catalogue prose in data.js already names most courses: the text that
     follows a course number in a route is its title. Real text, not invented. */
  var TITLES = Object.create(null);
  (function harvestTitles() {
    var SPAN = /<span class="code">([^<]+)<\/span>\s*([^<.,;]{0,60})/g;
    API.programs.forEach(function (p) {
      (p.path || []).forEach(function (stage) {
        var m;
        SPAN.lastIndex = 0;
        while ((m = SPAN.exec(stage.what)) !== null) {
          var code = m[1].replace(/&nbsp;/g, ' ').trim();
          var after = (m[2] || '').replace(/&[a-z]+;/g, ' ').trim();
          if (!/^[A-Z]{2,3} \d{3}[A-Z]?$/.test(code)) continue;
          /* a title starts with a capital and is not the next sentence's connective */
          if (!/^[A-Z]/.test(after)) continue;
          if (/^(or|and|at|in|the|Add|Take|One|Two|Any|Either|Both|Plus)\b/.test(after)) continue;
          /* the prose runs on past the title, so a harvested one often ends mid-phrase.
             Drop a dangling connective rather than print "Microeconomics and". */
          after = after.replace(/\s+(and|or|the|of|in|to|for|with|a|an|at|on|plus)$/i, '').trim();
          if (after.length < 4) continue;
          if (!TITLES[code] || after.length > TITLES[code].length) TITLES[code] = after;
        }
      });
    });
  })();
  function titleOf(s) { return s.title || TITLES[s.code] || ''; }

  /* a stable colour per course, so the same class is the same colour every load */
  function hueOf(code) {
    var h = 2166136261;
    for (var i = 0; i < code.length; i++) { h ^= code.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h % 360;
  }

  /* ------------------------------------------------------------- conflicts */

  function blocksOf(s) { return s.schedule || []; }
  function clash(a, b) {
    var out = [];
    blocksOf(a).forEach(function (x) {
      blocksOf(b).forEach(function (y) {
        var shared = x.days.filter(function (d) { return y.days.indexOf(d) >= 0; });
        if (shared.length && x.start < y.end && y.start < x.end) out = out.concat(shared);
      });
    });
    return out;
  }
  function conflicts() {
    var picked = chosen.map(function (k) { return byKey[k]; }).filter(Boolean);
    var out = [];
    for (var i = 0; i < picked.length; i++) {
      for (var j = i + 1; j < picked.length; j++) {
        var d = clash(picked[i], picked[j]);
        if (d.length) out.push({ a: picked[i], b: picked[j], days: d });
      }
    }
    return out;
  }
  function isConflicted(key) {
    return conflicts().some(function (c) { return keyOf(c.a) === key || keyOf(c.b) === key; });
  }

  /* ------------------------------------------------------------ the search */

  function statusWord(s) {
    if (s.status === 'C') return 'closed';
    if (s.status === 'R') return 'reopened';
    if (s.status === 'U') return 'unknown';
    return s.filled >= s.total ? 'closed' : 'open';
  }

  function drawSearch() {
    var q = el('tt-find').value.trim().toUpperCase();
    var host = el('tt-results');
    var hits = sections.filter(function (s) {
      if (!q) return true;
      return s.code.indexOf(q) >= 0 || titleOf(s).toUpperCase().indexOf(q) >= 0;
    });
    var total = hits.length;
    hits = hits.slice(0, 80);

    var h = '';
    if (!total) h = '<li class="tt-none">Nothing matches that.</li>';
    hits.forEach(function (s) {
      var k = keyOf(s), on = chosen.indexOf(k) >= 0, st = statusWord(s);
      var sched = blocksOf(s).map(function (b) {
        return b.days.join('') + ' ' + clock(b.start) + '&ndash;' + clock(b.end);
      }).join(', ');
      h += '<li><button type="button" class="tt-row" data-key="' + esc(k) + '"' +
        (on ? ' data-on="yes"' : '') + ' style="--hue:' + hueOf(s.code) + '">' +
        '<span class="tt-row__code">' + esc(s.code) + (s.section ? ' ' + esc(s.section) : '') + '</span>' +
        '<span class="tt-row__title">' + esc(titleOf(s)) + '</span>' +
        '<span class="tt-row__when">' + sched + '</span>' +
        '<span class="tt-row__st" data-st="' + st + '">' + st + '</span>' +
        '<span class="tt-row__seats">' + s.filled + '/' + s.total + '</span>' +
        '<span class="tt-row__pm">' + (on ? '&times;' : '+') + '</span>' +
        '</button></li>';
    });
    host.innerHTML = h;
    el('tt-count').textContent = total > hits.length
      ? hits.length + ' of ' + total + ' sections' : total + ' section' + (total === 1 ? '' : 's');
  }

  /* -------------------------------------------------------------- the week */

  function bounds() {
    var lo = GRID_FROM, hi = GRID_TO;
    chosen.forEach(function (k) {
      var s = byKey[k]; if (!s) return;
      blocksOf(s).forEach(function (b) {
        lo = Math.min(lo, Math.floor(b.start / 60) * 60);
        hi = Math.max(hi, Math.ceil(b.end / 60) * 60);
      });
    });
    return { lo: lo, hi: hi };
  }

  function drawWeek() {
    var host = el('tt-week');
    var b = bounds(), span = b.hi - b.lo;
    var picked = chosen.map(function (k) { return byKey[k]; }).filter(Boolean);

    var h = '<div class="tt-grid" style="--rows:' + (span / 60) + '">';
    h += '<div class="tt-hours">';
    for (var m = b.lo; m < b.hi; m += 60) h += '<span>' + clock(m) + '</span>';
    h += '</div>';

    DAYS.forEach(function (d) {
      h += '<div class="tt-day"><h4>' + d.short + '</h4><div class="tt-col">';
      /* every block on this day, so overlaps can be laid side by side */
      var here = [];
      picked.forEach(function (s) {
        blocksOf(s).forEach(function (blk) {
          if (blk.days.indexOf(d.c) >= 0) here.push({ s: s, b: blk });
        });
      });
      here.sort(function (x, y) { return x.b.start - y.b.start; });
      here.forEach(function (item, i) {
        var overlaps = here.filter(function (o) { return o.b.start < item.b.end && item.b.start < o.b.end; });
        var lane = overlaps.indexOf(item), lanes = overlaps.length;
        var top = (item.b.start - b.lo) / span * 100;
        var hgt = (item.b.end - item.b.start) / span * 100;
        var w = 100 / lanes, left = lane * w;
        h += '<article class="tt-blk" style="--hue:' + hueOf(item.s.code) +
             ';top:' + top.toFixed(3) + '%;height:' + hgt.toFixed(3) + '%;left:' + left.toFixed(2) +
             '%;width:' + (w - 1).toFixed(2) + '%"' + (lanes > 1 ? ' data-clash="yes"' : '') + '>' +
             '<b>' + esc(item.s.code) + (item.s.section ? ' ' + esc(item.s.section) : '') + '</b>' +
             '<span>' + esc(titleOf(item.s)) + '</span>' +
             '<em>' + clock(item.b.start) + '&ndash;' + clock(item.b.end) +
             (item.b.location ? ' &middot; ' + esc(item.b.location) : '') + '</em>' +
             '</article>';
      });
      h += '</div></div>';
    });
    h += '</div>';
    host.innerHTML = h;
  }

  /* ------------------------------------------------------------ the basket */

  function drawBasket() {
    var picked = chosen.map(function (k) { return byKey[k]; }).filter(Boolean);
    var credits = picked.reduce(function (a, s) { return a + (s.credits || 0); }, 0);
    var cl = conflicts();

    var h = '<p class="tt-credits"><b>' + (credits || '\u2014') + '</b> credit' +
            (credits === 1 ? '' : 's') + ' selected &middot; <b>' + picked.length + '</b> section' +
            (picked.length === 1 ? '' : 's') + '</p>';

    if (cl.length) {
      h += '<ul class="tt-clashes">';
      cl.forEach(function (c) {
        var names = c.days.map(function (d) {
          return (DAYS.filter(function (x) { return x.c === d; })[0] || { short: d }).short;
        }).join(', ');
        h += '<li>' + esc(c.a.code) + ' and ' + esc(c.b.code) + ' overlap on ' + esc(names) + '.</li>';
      });
      h += '</ul>';
    }

    h += '<ul class="tt-basket">';
    if (!picked.length) h += '<li class="tt-none">Nothing chosen yet.</li>';
    picked.forEach(function (s) {
      var k = keyOf(s), st = statusWord(s);
      h += '<li><span class="tt-pick" style="--hue:' + hueOf(s.code) + '"' +
        (isConflicted(k) ? ' data-clash="yes"' : '') + '>' +
        '<b>' + esc(s.code) + (s.section ? ' ' + esc(s.section) : '') + '</b>' +
        '<span>' + esc(titleOf(s)) + '</span>' +
        '<em data-st="' + st + '">' + st + '</em>' +
        '<i>' + s.filled + '/' + s.total + '</i>' +
        '<button type="button" class="tt-drop" data-drop="' + esc(k) + '" aria-label="Remove ' + esc(s.code) + '">&times;</button>' +
        '</span></li>';
    });
    h += '</ul>';
    el('tt-basket').innerHTML = h;
  }

  /* ------------------------------------------------------------- taking it away

     An account would let a schedule follow you. There isn't one, so it has to
     leave instead: a calendar file every major calendar imports, and a print
     layout the browser turns into a PDF. */

  /* Two forms, and the difference matters. DTSTAMP is a real instant and must be
     UTC. A class time is not an instant, it is a wall clock: a 9am Monday stays 9am
     across the November clock change, and anchoring it to UTC would quietly move
     every class an hour halfway through the term. So events are written as floating
     local time, with no Z and no timezone, which every calendar reads in its own
     zone and which repeats correctly across a transition. */
  function icsUtc(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
           'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
  }
  function icsFloating(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
           'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }
  function fold(line) {
    /* RFC 5545 wants lines under 75 octets, continued with a leading space */
    var out = [], s = line;
    while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); }
    out.push(s);
    return out.join('\r\n');
  }
  function icsEscape(t) {
    return String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
                    .replace(/\n/g, '\\n');
  }

  function buildIcs(from, to) {
    var picked = chosen.map(function (k) { return byKey[k]; }).filter(Boolean);
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0',
             'PRODID:-//ColbyMajorGuide//Timetable//EN', 'CALSCALE:GREGORIAN',
             'X-WR-CALNAME:' + icsEscape('Colby ' + (meta && meta.termName ? meta.termName : 'schedule'))];
    var until = new Date(to + 'T23:59:59');

    picked.forEach(function (s, si) {
      blocksOf(s).forEach(function (b, bi) {
        /* first occurrence: the earliest listed day on or after the start date */
        var start = new Date(from + 'T00:00:00');
        var wanted = b.days.map(function (c) { return 'UMTWRFS'.indexOf(c); });
        for (var guard = 0; guard < 14; guard++) {
          if (wanted.indexOf(start.getDay()) >= 0) break;
          start.setDate(start.getDate() + 1);
        }
        var s1 = new Date(start); s1.setHours(Math.floor(b.start / 60), b.start % 60, 0, 0);
        var e1 = new Date(start); e1.setHours(Math.floor(b.end / 60), b.end % 60, 0, 0);
        var byday = b.days.map(function (c) {
          return (DAYS.filter(function (d) { return d.c === c; })[0] || {}).ics || null;
        }).filter(Boolean).join(',');

        L.push('BEGIN:VEVENT');
        L.push('UID:' + icsEscape(s.code.replace(/\s/g, '') + '-' + s.section + '-' + si + bi) + '@colbymajorguide.com');
        L.push('DTSTAMP:' + icsUtc(new Date()));
        L.push('DTSTART:' + icsFloating(s1));
        L.push('DTEND:' + icsFloating(e1));
        if (byday) L.push('RRULE:FREQ=WEEKLY;BYDAY=' + byday + ';UNTIL=' + icsFloating(until));
        L.push(fold('SUMMARY:' + icsEscape(s.code + (s.section ? ' ' + s.section : '') +
              (titleOf(s) ? ' ' + titleOf(s) : ''))));
        if (b.location) L.push(fold('LOCATION:' + icsEscape(b.location)));
        L.push(fold('DESCRIPTION:' + icsEscape(
          'Planned in ColbyMajorGuide, which is unofficial. Register in Workday; nothing here holds a seat.' +
          (meta && meta.sample ? ' THESE TIMES ARE SAMPLE DATA AND NOT REAL.' : ''))));
        L.push('END:VEVENT');
      });
    });
    L.push('END:VCALENDAR');
    return L.join('\r\n') + '\r\n';
  }

  function download(name, text, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function exportIcs() {
    var from = el('tt-from').value, to = el('tt-to').value;
    var note = el('tt-export-note');
    if (!chosen.length) { note.textContent = 'Choose some sections first.'; return; }
    if (!from || !to) {
      note.textContent = 'Set the term dates first, so the events know when to stop repeating.';
      return;
    }
    if (to < from) { note.textContent = 'The end date is before the start date.'; return; }
    download('colby-' + (meta && meta.term ? meta.term.toLowerCase() : 'schedule') + '.ics',
             buildIcs(from, to), 'text/calendar;charset=utf-8');
    note.textContent = meta && meta.sample
      ? 'Downloaded. These are sample times, so do not import them into a real calendar.'
      : 'Downloaded. Import it into Google Calendar, Apple Calendar or Outlook.';
  }

  /* -------------------------------------------------------------- assembly */

  function draw() {
    drawSearch();
    drawWeek();
    drawBasket();
  }

  function adopt() {
    sections = API.seats.sections().filter(function (s) { return s.schedule && s.schedule.length; });
    meta = API.seats.meta();
    byKey = Object.create(null);
    sections.forEach(function (s) { byKey[keyOf(s)] = s; });
    chosen = chosen.filter(function (k) { return byKey[k]; });

    if (!sections.length) return;                  /* a feed with no times: stay dark */

    el('timetable').hidden = false;
    var head = el('tt-term');
    var when = '';
    if (meta && meta.snapshot && meta.fetchedAt) {
      when = ' <b class="tt-snap">a snapshot from ' + esc(meta.fetchedAt.slice(0, 10)) + ', not live</b>';
    }
    head.innerHTML = (meta && meta.termName ? esc(meta.termName) : 'This term') +
      ' &middot; ' + sections.length + ' sections with times' +
      (meta && meta.sample ? ' <b class="tt-sample">sample data, not Colby&rsquo;s</b>' : when);

    if (meta && meta.termStart && !el('tt-from').value) el('tt-from').value = meta.termStart;
    if (meta && meta.termEnd && !el('tt-to').value) el('tt-to').value = meta.termEnd;
    draw();
  }

  el('tt-results').addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var b = ev.target.closest('[data-key]');
    if (!b) return;
    var k = b.dataset.key, i = chosen.indexOf(k);
    if (i >= 0) chosen.splice(i, 1); else chosen.push(k);
    persist(); draw();
  });

  el('tt-basket').addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var b = ev.target.closest('[data-drop]');
    if (!b) return;
    var i = chosen.indexOf(b.dataset.drop);
    if (i >= 0) { chosen.splice(i, 1); persist(); draw(); }
  });

  el('tt-find').addEventListener('input', drawSearch);
  el('tt-clear').addEventListener('click', function () { chosen = []; persist(); draw(); });
  el('tt-ics').addEventListener('click', exportIcs);
  el('tt-print').addEventListener('click', function () { window.print(); });

  Array.prototype.forEach.call(document.querySelectorAll('.tt-tab'), function (t) {
    t.addEventListener('click', function () {
      var want = t.dataset.pane;
      Array.prototype.forEach.call(document.querySelectorAll('.tt-tab'), function (x) {
        x.setAttribute('aria-selected', x.dataset.pane === want ? 'true' : 'false');
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-paneof]'), function (p) {
        p.hidden = p.dataset.paneof !== want;
      });
    });
  });

  API.seats.onData(adopt);
})();
