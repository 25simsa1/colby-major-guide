/* ColbyMajorGuide: the four-year planner.
 *
 * Hyperschedule schedules a term: which section, at what hour, with how many
 * seats left. None of that is reachable here. Colby publishes no course schedule
 * (the registrar path is a 403 and the catalogue carries no meeting times), and
 * Hyperschedule's own repo says the Claremont endpoints are a private arrangement
 * with the school. So this schedules the other axis, the one the catalogue does
 * support: which course in which term, across twelve terms.
 *
 * Everything lives in this browser. There is no account, and the Colby sign-in
 * that Hyperschedule offers needs a server to complete the handshake and a
 * registration with Colby's identity provider, neither of which a static site
 * has. What sign-in really buys is carrying your plan to another device, and
 * that is done here with a link instead.
 */

(function () {
  'use strict';

  var API = window.CMG, PLAN = window.CMGPlan;
  if (!API || !PLAN) return;

  var STORE = 'colbymajorguide.terms';

  /* Colby's year is three terms. JanPlan is not padding: it is a graduation
     requirement in its own right and a slot students genuinely plan around. */
  var TERMS = [];
  [1, 2, 3, 4].forEach(function (y) {
    TERMS.push({ key: 'y' + y + 'f', year: y, label: 'Fall', long: 'Year ' + y + ' fall' });
    TERMS.push({ key: 'y' + y + 'j', year: y, label: 'Jan',  long: 'Year ' + y + ' JanPlan', jan: true });
    TERMS.push({ key: 'y' + y + 's', year: y, label: 'Spring', long: 'Year ' + y + ' spring' });
  });

  /* A course numbered 200 opens to sophomores, 300 to juniors, 400 is seniors only.
     An instructor may admit you earlier, so these produce notes and never blocks. */
  function levelOf(code) { var m = /(\d{3})/.exec(code); return m ? parseInt(m[1], 10) : 0; }
  function openInYear(code, year) {
    var lv = levelOf(code);
    if (lv >= 400) return year >= 4;
    if (lv >= 300) return year >= 3;
    if (lv >= 200) return year >= 2;
    return true;
  }

  var terms = {};
  TERMS.forEach(function (t) { terms[t.key] = []; });

  function load(raw) {
    if (!raw || typeof raw !== 'object') return false;
    var got = false;
    TERMS.forEach(function (t) {
      var v = raw[t.key];
      if (!Array.isArray(v)) return;
      terms[t.key] = v.filter(function (c) {
        return typeof c === 'string' && API.coursesOf && ALL[c];
      });
      if (terms[t.key].length) got = true;
    });
    return got;
  }

  /* every course named anywhere on a route, which is the set a plan may contain */
  var ALL = Object.create(null);
  API.programs.forEach(function (p) {
    API.coursesOf(p.id).forEach(function (c) {
      (ALL[c] || (ALL[c] = [])).push(p.id);
    });
  });
  var ALL_CODES = Object.keys(ALL).sort();

  try { load(JSON.parse(localStorage.getItem(STORE) || 'null')); } catch (e) {}

  /* a plan handed over in a link wins over whatever this browser had */
  (function fromHash() {
    var h = location.hash || '';
    var m = /[#&]plan=([A-Za-z0-9+/=_-]+)/.exec(h);
    if (!m) return;
    try {
      var json = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/'))));
      if (load(JSON.parse(json))) persist();
    } catch (e) { /* a mangled link is not worth an error */ }
  })();

  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(terms)); } catch (e) {}
  }

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function placedIn(code) {
    for (var i = 0; i < TERMS.length; i++) {
      if (terms[TERMS[i].key].indexOf(code) >= 0) return TERMS[i];
    }
    return null;
  }
  function allPlanned() {
    var out = [];
    TERMS.forEach(function (t) { out = out.concat(terms[t.key]); });
    return out;
  }

  function add(code, key) {
    if (!ALL[code]) return;
    var was = placedIn(code);
    if (was) terms[was.key].splice(terms[was.key].indexOf(code), 1);   /* a move, not a copy */
    terms[key].push(code);
    terms[key].sort();
    persist();
    draw();
  }
  function remove(code, key) {
    var i = terms[key].indexOf(code);
    if (i >= 0) { terms[key].splice(i, 1); persist(); draw(); }
  }

  /* ------------------------------------------------------------ warnings */

  function notesFor(code, term) {
    var out = [];
    if (!openInYear(code, term.year)) {
      var lv = levelOf(code);
      out.push(lv >= 400 ? 'seniors only' : lv >= 300 ? 'opens to juniors' : 'opens to sophomores');
    }
    if (API.isTaken(code)) out.push('already done');
    return out;
  }

  function janCount() {
    return TERMS.filter(function (t) { return t.jan; })
                .reduce(function (a, t) { return a + terms[t.key].length; }, 0);
  }

  /* ------------------------------------------------------------- drawing */

  function courseChip(code, key) {
    var term = TERMS.filter(function (t) { return t.key === key; })[0];
    var notes = notesFor(code, term);
    var owners = (ALL[code] || []).length;
    return '<li><button type="button" class="pchip" data-code="' + esc(code) + '" data-term="' + esc(key) + '"' +
      (notes.length ? ' data-warn="yes"' : '') +
      ' title="' + esc(code + ' is named by ' + owners + ' program' + (owners === 1 ? '' : 's') +
        (notes.length ? '. ' + notes.join(', ') : '') + '. Click to remove.') + '">' +
      esc(code) + (notes.length ? '<i>' + esc(notes[0]) + '</i>' : '') + '</button></li>';
  }

  function draw() {
    var host = el('planner-grid');
    var h = '';
    var byYear = {};
    TERMS.forEach(function (t) { (byYear[t.year] || (byYear[t.year] = [])).push(t); });

    Object.keys(byYear).forEach(function (y) {
      h += '<section class="pyear"><h4>Year ' + y + '</h4><div class="pterms">';
      byYear[y].forEach(function (t) {
        var list = terms[t.key];
        h += '<div class="pterm' + (t.jan ? ' pterm--jan' : '') + '" data-term="' + t.key + '">';
        h += '<header><span class="pterm__name">' + t.label + '</span>' +
             '<span class="pterm__n">' + (list.length || '') + '</span></header>';
        h += '<ul class="pchips">';
        list.forEach(function (c) { h += courseChip(c, t.key); });
        h += '</ul>';
        h += '<button type="button" class="pterm__add" data-add="' + t.key + '">Add</button>';
        h += '</div>';
      });
      h += '</div></section>';
    });
    host.innerHTML = h;

    /* the running total, and how the plan lands against what is declared */
    var planned = allPlanned();
    var taken = ALL_CODES.filter(function (c) { return API.isTaken(c); });
    var covered = {};
    planned.concat(taken).forEach(function (c) { covered[c] = true; });

    var lines = [];
    PLAN.declared().forEach(function (id) {
      var p = API.byId[id]; if (!p) return;
      var need = API.coursesOf(id);
      if (!need.length) return;
      var done = need.filter(function (c) { return covered[c]; }).length;
      lines.push('<li><b>' + (done === need.length ? 'all ' : done + ' of ') + need.length + '</b> ' +
                 'named ' + (need.length === 1 ? 'course' : 'courses') + ' for ' + p.name +
                 (done === need.length ? '' : ', <span>' + (need.length - done) + ' unplaced</span>') + '</li>');
    });

    var sum = el('planner-sum');
    var jan = janCount();
    var bits = [];
    bits.push('<b>' + planned.length + '</b> ' + (planned.length === 1 ? 'course' : 'courses') + ' placed');
    if (jan) bits.push('<b>' + jan + '</b> in JanPlan' + (jan > 3 ? ', which is more than the three you can count' : ''));
    sum.innerHTML = '<p class="planner__tally">' + bits.join(' &middot; ') + '.</p>' +
      (lines.length ? '<ul class="planner__cover">' + lines.join('') + '</ul>'
                    : '<p class="planner__hint">Declare a major above and this will tell you how much of it the plan covers.</p>');
  }

  /* ------------------------------------------------------- the add dialog */

  var picking = null;

  function openPicker(key) {
    picking = key;
    var t = TERMS.filter(function (x) { return x.key === key; })[0];
    el('pick-where').textContent = t.long;
    el('pick-find').value = '';
    drawPicks();
    el('picker').hidden = false;
    el('pick-find').focus();
  }
  function closePicker() { picking = null; el('picker').hidden = true; }

  function drawPicks() {
    var q = el('pick-find').value.trim().toUpperCase().replace(/\s+/g, ' ');
    var term = TERMS.filter(function (x) { return x.key === picking; })[0];
    var hits = ALL_CODES.filter(function (c) { return !q || c.indexOf(q) >= 0; });
    /* what your declared programs actually need, first */
    var wanted = {};
    PLAN.declared().forEach(function (id) {
      API.coursesOf(id).forEach(function (c) { wanted[c] = true; });
    });
    hits.sort(function (a, b) {
      var wa = wanted[a] ? 0 : 1, wb = wanted[b] ? 0 : 1;
      if (wa !== wb) return wa - wb;
      return a < b ? -1 : a > b ? 1 : 0;
    });
    hits = hits.slice(0, 60);

    var h = '';
    if (!hits.length) h = '<li class="pick__none">No course code matches that.</li>';
    hits.forEach(function (c) {
      var where = placedIn(c);
      var notes = notesFor(c, term);
      h += '<li><button type="button" class="pick" data-pick="' + esc(c) + '"' +
        (wanted[c] ? ' data-wanted="yes"' : '') + '>' + esc(c) +
        (wanted[c] ? '<i>on your route</i>' : '') +
        (where ? '<em>in ' + esc(where.label.toLowerCase()) + ' of year ' + where.year + '</em>' : '') +
        (notes.length && !where ? '<em>' + esc(notes[0]) + '</em>' : '') +
        '</button></li>';
    });
    el('pick-list').innerHTML = h;
  }

  /* ---------------------------------------------------------- portability */

  function encode() {
    var lean = {};
    TERMS.forEach(function (t) { if (terms[t.key].length) lean[t.key] = terms[t.key]; });
    var json = JSON.stringify(lean);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_');
  }

  function shareLink() {
    var base = location.origin + location.pathname;
    return base + '#plan=' + encode();
  }

  /* ------------------------------------------------------------- events */

  el('planner-grid').addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var t = ev.target.closest('[data-code],[data-add]');
    if (!t) return;
    if (t.dataset.add) openPicker(t.dataset.add);
    else remove(t.dataset.code, t.dataset.term);
  });

  el('pick-list').addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var b = ev.target.closest('[data-pick]');
    if (!b || !picking) return;
    add(b.dataset.pick, picking);
    drawPicks();
    el('pick-find').focus();
  });

  el('pick-find').addEventListener('input', drawPicks);
  el('pick-find').addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { closePicker(); return; }
    if (ev.key !== 'Enter') return;
    ev.preventDefault();
    var first = el('pick-list').querySelector('[data-pick]');
    if (first) first.click();
  });
  el('pick-close').addEventListener('click', closePicker);
  el('picker').addEventListener('click', function (ev) {
    if (ev.target === el('picker')) closePicker();
  });

  el('planner-clear').addEventListener('click', function () {
    TERMS.forEach(function (t) { terms[t.key] = []; });
    persist();
    draw();
  });

  el('planner-share').addEventListener('click', function () {
    var link = shareLink();
    var out = el('planner-share-out');
    out.hidden = false;
    out.value = link;
    out.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    if (!ok && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(function () {
        el('planner-share-note').textContent = 'Link copied. It carries the whole plan.';
      }, function () {
        el('planner-share-note').textContent = 'Select the box and copy it yourself.';
      });
      return;
    }
    el('planner-share-note').textContent = ok
      ? 'Link copied. It carries the whole plan.'
      : 'Select the box and copy it yourself.';
  });

  PLAN.onChange(draw);
  API.onChange(draw);
  draw();
})();
