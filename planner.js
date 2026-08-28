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
  /* program names in data.js are authored HTML ("Music&ndash;IC"), so they are
     decoded before going into plain-text reasons */
  var decoder = document.createElement('div');
  function plain(html) { decoder.innerHTML = String(html); return decoder.textContent || ''; }

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

  /* A course you have already finished is not a problem with the plan, so it must
     not look like one. Only the level clash is a warning; the rest is news. */
  function notesFor(code, term) {
    var warn = null, done = API.isTaken(code);
    if (!openInYear(code, term.year)) {
      var lv = levelOf(code);
      warn = lv >= 400 ? 'seniors only' : lv >= 300 ? 'opens to juniors' : 'opens to sophomores';
    }
    return { warn: warn, done: done, label: warn || (done ? 'already done' : null) };
  }

  function janCount() {
    return TERMS.filter(function (t) { return t.jan; })
                .reduce(function (a, t) { return a + terms[t.key].length; }, 0);
  }

  /* ------------------------------------------------------------- drawing */

  function courseChip(code, key) {
    var term = TERMS.filter(function (t) { return t.key === key; })[0];
    var n = notesFor(code, term);
    var owners = (ALL[code] || []).length;
    return '<li><button type="button" class="pchip" data-code="' + esc(code) + '" data-term="' + esc(key) + '"' +
      (n.warn ? ' data-warn="yes"' : '') + (n.done ? ' data-done="yes"' : '') +
      ' title="' + esc(code + ' is named by ' + owners + ' program' + (owners === 1 ? '' : 's') +
        (n.warn ? '. ' + n.warn : '') + (n.done ? '. You have already done it' : '') +
        '. Click to remove.') + '">' +
      esc(code) + (n.label ? '<i>' + esc(n.label) + '</i>' : '') + '</button></li>';
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


  /* ------------------------------------------------------- what to take next

     Ranked, and each row carries the reason it is there. A recommendation a
     student cannot check is worth less than none: the whole claim of this site is
     that its numbers are real, and an unexplained ordering is just an opinion in a
     confident font.

     Four signals, all from the catalogue:
       the year the route puts the course in, which departments wrote themselves;
       how many of your declared programs name the same course;
       the level against your class year;
       and whether you have already done it or already placed it.

     No prerequisite graph. Three route stages in the entire catalogue use the word
     prerequisite, so building a dependency tree would mean inventing most of it. */

  function stageYearOf(pid, code) {
    var p = API.byId[pid];
    if (!p) return null;
    var rows = API.stageCodes(p), found = null;
    rows.forEach(function (row, i) {
      if (found !== null) return;
      row.forEach(function (codes) {
        if (found === null && codes && codes.indexOf(code) >= 0) found = i + 1;
      });
    });
    return found;
  }

  function recommend() {
    var declared = PLAN.declared();
    if (!declared.length) return { need: 'declare' };

    var placed = Object.create(null);
    allPlanned().forEach(function (c) { placed[c] = true; });

    var yrIdx = PLAN.yearIndex();                 /* 0..3, or -1 if unset */
    var myYear = yrIdx >= 0 ? yrIdx + 1 : null;

    var cand = Object.create(null);
    declared.forEach(function (pid) {
      API.coursesOf(pid).forEach(function (code) {
        if (API.isTaken(code) || placed[code]) return;
        var row = cand[code] || (cand[code] = { code: code, programs: [], stage: null });
        row.programs.push(pid);
        var y = stageYearOf(pid, code);
        if (y !== null && (row.stage === null || y < row.stage)) row.stage = y;
      });
    });

    var list = Object.keys(cand).map(function (c) { return cand[c]; });
    list.forEach(function (r) {
      r.level = levelOf(r.code);
      r.openNow = myYear === null || openInYear(r.code, myYear);
      r.overdue = myYear !== null && r.stage !== null && r.stage < myYear && r.openNow;
      r.due = myYear !== null && r.stage === myYear;
    });

    /* overdue first, then what the route says is due now, then courses that pay for
       themselves twice, then earliest stage, then the code so it is deterministic */
    list.sort(function (a, b) {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      if (a.openNow !== b.openNow) return a.openNow ? -1 : 1;
      if (a.due !== b.due) return a.due ? -1 : 1;
      if (a.programs.length !== b.programs.length) return b.programs.length - a.programs.length;
      var as = a.stage === null ? 9 : a.stage, bs = b.stage === null ? 9 : b.stage;
      if (as !== bs) return as - bs;
      return a.code < b.code ? -1 : 1;
    });

    return { list: list.slice(0, 10), total: list.length, year: myYear };
  }

  function sentence(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

  function reasonsFor(r, myYear) {
    var out = [];
    if (r.programs.length > 1) {
      out.push('counts toward ' + r.programs.map(function (id) {
        return plain(API.byId[id].short || API.byId[id].name);
      }).join(' and '));
    } else if (r.programs.length === 1) {
      out.push('on the ' + plain(API.byId[r.programs[0]].short || API.byId[r.programs[0]].name) + ' route');
    }
    if (r.stage !== null) {
      out.push(r.overdue ? 'placed in year ' + r.stage + ', and you are past that'
                         : 'placed in year ' + r.stage);
    }
    if (!r.openNow) {
      out.push(r.level >= 400 ? 'seniors only' : r.level >= 300 ? 'opens to juniors' : 'opens to sophomores');
    }
    return out;
  }

  function drawRecs() {
    var host = el('rec-out');
    var res = recommend();
    if (res.need === 'declare') {
      host.innerHTML = '<p class="rec__hint">Declare a major or a minor above first. ' +
        'Recommendations come out of the routes you are actually on, so with nothing declared ' +
        'there is nothing to reason from.</p>';
      return;
    }
    if (!res.list.length) {
      host.innerHTML = '<p class="rec__hint">Every course your declared programs name by number is ' +
        'either done or already placed. What is left on those routes is the prose kind, ' +
        'like &ldquo;four electives at the 200 level&rdquo;, which no list of numbers can pick for you.</p>';
      return;
    }

    var opts = TERMS.map(function (t) {
      return '<option value="' + t.key + '"' + (t.key === suggestedTerm() ? ' selected' : '') + '>' +
             esc(t.long) + '</option>';
    }).join('');

    var h = '<div class="rec__bar"><span>Add to</span><select id="rec-term">' + opts + '</select>' +
            '<span class="rec__n">' + res.total + ' course' + (res.total === 1 ? '' : 's') +
            ' left on your routes</span></div>';
    h += '<ol class="rec__list">';
    res.list.forEach(function (r) {
      var reasons = reasonsFor(r, res.year);
      h += '<li class="rec' + (r.overdue ? ' rec--late' : '') + (!r.openNow ? ' rec--shut' : '') + '">' +
        '<button type="button" class="rec__add" data-rec="' + esc(r.code) + '">' + esc(r.code) + '</button>' +
        '<span class="rec__why">' + esc(sentence(reasons.join('; '))) + '.</span>' +
        '</li>';
    });
    h += '</ol>';
    h += '<p class="rec__caveat">Ranked by what your own routes say, nothing cleverer. ' +
      'It cannot see what is actually offered next term, when anything meets, or any prerequisite ' +
      'the catalogue did not write down, and it has never met you. <b>Take it to your advisor, not instead of them.</b></p>';
    host.innerHTML = h;
  }

  /* the first term at or after your year with room in it, so the default is sensible */
  function suggestedTerm() {
    var yrIdx = PLAN.yearIndex(), from = yrIdx >= 0 ? yrIdx + 1 : 1;
    for (var i = 0; i < TERMS.length; i++) {
      var t = TERMS[i];
      if (t.year < from || t.jan) continue;
      if (terms[t.key].length < 4) return t.key;
    }
    return 'y' + from + 'f';
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
      var n = notesFor(c, term);
      h += '<li><button type="button" class="pick" data-pick="' + esc(c) + '"' +
        (wanted[c] ? ' data-wanted="yes"' : '') + '>' + esc(c) +
        (wanted[c] ? '<i>on your route</i>' : '') +
        (where ? '<em>in ' + esc(where.label.toLowerCase()) + ' of year ' + where.year + '</em>' : '') +
        (n.label && !where ? '<em>' + esc(n.label) + '</em>' : '') +
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

  el('rec-go').addEventListener('click', function () {
    el('rec-out').hidden = false;
    drawRecs();
  });

  el('rec-out').addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var b = ev.target.closest('[data-rec]');
    if (!b) return;
    var sel = el('rec-term');
    add(b.dataset.rec, sel ? sel.value : suggestedTerm());
    drawRecs();
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

  function refresh() {
    draw();
    if (!el('rec-out').hidden) drawRecs();
  }
  /* report.js builds the printable document from these. Everything here is a copy:
     the planner reassigns terms wholesale when a shared link is opened, so handing out
     the live object would leave the report holding a grid that has already moved. */
  window.CMGPlanner = {
    terms: function () {
      return TERMS.map(function (t) {
        return {
          key: t.key, year: t.year, label: t.label, long: t.long,
          jan: !!t.jan, courses: terms[t.key].slice()
        };
      });
    },
    janCount: janCount,
    planned: allPlanned,
    notesFor: function (code, key) {
      var t = TERMS.filter(function (x) { return x.key === key; })[0];
      return t ? notesFor(code, t) : null;
    },
    recommend: recommend,
    reasonsFor: reasonsFor
  };

  PLAN.onChange(refresh);
  API.onChange(refresh);
  draw();
})();
