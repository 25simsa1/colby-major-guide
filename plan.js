/* ColbyMajorGuide: where you stand.
 *
 * The chart answers "what routes exist". This answers "what is left on mine".
 * It reads the same taken-courses list the tray writes, matches it against the
 * routes of whatever you have declared, and shows the remainder split by whether
 * your class year can actually register for it yet.
 *
 * What it deliberately does not do: pretend to be a degree audit. Workday holds
 * the official one. Routes carry prose requirements ("four electives at the 200
 * level") that no list of course numbers can stand in for, so every count here is
 * of *named* courses and says so. */

(function () {
  'use strict';

  var API = window.CMG;
  if (!API) return;                       /* map.js failed; leave the section inert */

  var PROGRAMS = API.programs;
  var STORE = 'colbymajorguide.plan';

  /* ---------------------------------------------------------------- model */

  var YEARS = [
    { key: 'fy', label: 'First-year', ceiling: 199 },
    { key: 'so', label: 'Sophomore', ceiling: 299 },
    { key: 'jr', label: 'Junior',    ceiling: 399 },
    { key: 'sr', label: 'Senior',    ceiling: 999 }
  ];

  /* The all-College requirements, worded from the catalogue. None of these can be
     inferred from a course number, so they are yours to tick. */
  var REQS = [
    { key: 'A',    kind: 'check', label: 'A &middot; Arts',                  how: 'One course in the history, theory or practice of the creative arts' },
    { key: 'H',    kind: 'check', label: 'H &middot; Historical Studies',    how: 'One course on cultures and societies as they change through time' },
    { key: 'L',    kind: 'check', label: 'L &middot; Literature',            how: 'One course on literary works and the methods for analysing them' },
    { key: 'Q',    kind: 'check', label: 'Q &middot; Quantitative Reasoning',how: 'One course reasoning about formally defined abstract structures' },
    { key: 'N',    kind: 'count', need: 2, label: 'N &middot; Natural Sciences', how: 'Two courses' },
    { key: 'Nlab', kind: 'check', label: 'One of those N courses carried a lab', how: 'Lb, or OptLb taken with the laboratory' },
    { key: 'S',    kind: 'check', label: 'S &middot; Social Sciences',       how: 'One course of methodical inquiry into human behaviour and interaction' },
    { key: 'W1',   kind: 'check', label: 'W1 writing course',                how: 'During the first year. The only exemption is a transfer student who completed an equivalent before arriving' },
    { key: 'lang', kind: 'check', label: 'Foreign language',                 how: 'Three semesters of a single language, or placed out by exam, or the Salamanca or Dijon program' },
    { key: 'divU', kind: 'check', label: 'Diversity, United States (U)',     how: 'One course centrally concerned with prejudice, privilege, oppression, inequality and injustice as they concern the United States' },
    { key: 'divI', kind: 'check', label: 'Diversity, international (I)',     how: 'One more, in a context other than the United States' },
    { key: 'well', kind: 'count', need: 3, label: 'Wellness',                how: 'The eCheckup, the two-session sexual violence prevention training, and the First-Year Journey' },
    { key: 'jan',  kind: 'count', need: 3, label: 'January Programs',        how: 'Three if you are in residence seven semesters or more, two if six or fewer' },
    { key: 'cr',   kind: 'num',   need: 128, label: 'Credits earned',        how: '128 minimum, across at least seven full-time semesters. At most 16 may be satisfactory/unsatisfactory' }
  ];

  /* Mutually exclusive programs come from the excl field in data.js, not from the
     rule prose. The catalogue words the same restriction differently on different
     department pages ("One computing major only" on six of them, a spelled-out
     "Excludes majors in ..." on data science), so matching the sentence quietly
     missed members. verify.mjs keeps the field and the prose honest. */
  var EXCL_GROUPS = API.exclGroups || {};

  var plan = { year: '', programs: [], reqs: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && typeof saved === 'object') {
      if (typeof saved.year === 'string') plan.year = saved.year;
      if (Array.isArray(saved.programs)) {
        plan.programs = saved.programs.filter(function (id) { return !!API.byId[id]; });
      }
      if (saved.reqs && typeof saved.reqs === 'object') plan.reqs = saved.reqs;
    }
  } catch (e) { /* private mode, or nothing stored */ }

  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(plan)); } catch (e) {}
  }

  /* ------------------------------------------------------------- helpers */

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function plural(n, one, many) { return n === 1 ? one : (many || one + 's'); }

  /* Program names in data.js are authored HTML ("Music&ndash;Interdisciplinary
     Computation"), so they go into innerHTML as-is and get decoded to real text for
     attributes, aria-labels and search. Escaping them a second time printed the
     entity. The input is our own data file, never anything a visitor supplies. */
  var decoder = document.createElement('div');
  function plain(html) { decoder.innerHTML = String(html); return decoder.textContent || ''; }
  function stripTags(s) { return String(s).replace(/<[^>]+>/g, ''); }

  function yearOf(key) {
    for (var i = 0; i < YEARS.length; i++) if (YEARS[i].key === key) return YEARS[i];
    return null;
  }
  function levelOf(code) {
    var m = /(\d{3})/.exec(code);
    return m ? parseInt(m[1], 10) : 0;
  }
  /* An instructor may admit you to a level normally closed to your class, so this is
     "normally open", never "forbidden". */
  function openNow(code, yr) { return !yr || levelOf(code) <= yr.ceiling; }

  /* Named courses on a route, in route order, deduplicated. */
  function routeCourses(p) {
    var rows = API.stageCodes(p), out = [], seen = {};
    rows.forEach(function (row, i) {
      row.forEach(function (codes) {
        if (!codes) return;
        codes.forEach(function (c) {
          if (seen[c]) return;
          seen[c] = true;
          out.push({ code: c, stage: i });
        });
      });
    });
    return out;
  }

  /* --------------------------------------------------------- setup: year */

  var yearWrap = el('plan-year');
  YEARS.forEach(function (y) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'yr';
    b.textContent = y.label;
    b.dataset.year = y.key;
    b.setAttribute('aria-pressed', plan.year === y.key ? 'true' : 'false');
    b.addEventListener('click', function () {
      plan.year = (plan.year === y.key) ? '' : y.key;
      persist();
      render();
    });
    yearWrap.appendChild(b);
  });

  /* ----------------------------------------------------- setup: programs */

  var pFind = el('plan-find');
  var pResults = el('plan-results');
  var pChosen = el('plan-chosen');

  var KIND_WORD = { major: 'major', conc: 'concentration', joint: 'joint degree', minor: 'minor' };

  function programChip(p, chosen) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip-pgm';
    b.dataset.kind = p.kind;
    b.innerHTML = p.name + ' <small>' + esc(KIND_WORD[p.kind] || p.kind) + '</small>';
    if (chosen) {
      b.setAttribute('aria-label', 'Remove ' + plain(p.name));
      b.addEventListener('click', function () { drop(p.id); });
    } else if (plan.programs.indexOf(p.id) >= 0) {
      b.dataset.in = 'yes';
      b.disabled = true;
    } else {
      b.setAttribute('aria-label', 'Add ' + plain(p.name));
      b.addEventListener('click', function () { pick(p.id); });
    }
    li.appendChild(b);
    return li;
  }

  function pick(id) {
    if (plan.programs.indexOf(id) < 0) { plan.programs.push(id); persist(); render(); }
  }
  function drop(id) {
    var i = plan.programs.indexOf(id);
    if (i >= 0) { plan.programs.splice(i, 1); persist(); render(); }
  }

  function renderResults() {
    var q = pFind.value.trim().toLowerCase();
    pResults.innerHTML = '';
    if (!q) return;
    /* Rank by how directly the query names the program. Departments are searchable
       because "Mathematics and Statistics" is how some students think of it, but a
       department substring must never outrank a program whose own name matches:
       typing "Astronomy" wants the astronomy minor, not the physics major that
       happens to sit in Physics and Astronomy. */
    var hits = PROGRAMS.map(function (p, i) {
      var name = plain(p.name).toLowerCase(), short = plain(p.short).toLowerCase();
      var dept = String(p.dept || '').toLowerCase();
      var rank = -1;
      if (name.indexOf(q) === 0) rank = 0;
      else if (short.indexOf(q) === 0) rank = 1;
      else if (name.indexOf(q) >= 0) rank = 2;
      else if (short.indexOf(q) >= 0) rank = 3;
      else if (dept.indexOf(q) >= 0) rank = 4;
      return { p: p, rank: rank, i: i };
    }).filter(function (h) { return h.rank >= 0; })
      .sort(function (a, b) { return a.rank - b.rank || a.i - b.i; })
      .slice(0, 10)
      .map(function (h) { return h.p; });
    if (!hits.length) {
      var li = document.createElement('li');
      li.className = 'chips__empty';
      li.textContent = 'No program matches "' + q + '".';
      pResults.appendChild(li);
      return;
    }
    hits.forEach(function (p) { pResults.appendChild(programChip(p, false)); });
  }

  pFind.addEventListener('input', renderResults);
  pFind.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter') return;
    ev.preventDefault();
    var first = pResults.querySelector('.chip-pgm:not([disabled])');
    if (first) { first.click(); pFind.value = ''; renderResults(); }
  });

  /* ------------------------------------------------------ the audit body */

  function conflicts() {
    var out = [];
    Object.keys(EXCL_GROUPS).forEach(function (g) {
      var hit = plan.programs.filter(function (id) {
        var pr = API.byId[id];
        return pr && (pr.excl || []).indexOf(g) >= 0;
      });
      if (hit.length > 1) {
        var names = hit.map(function (id) { return plain(API.byId[id].name); });
        var last = names.pop();
        out.push(names.join(', ') + ' and ' + last + ' cannot both be held: ' + EXCL_GROUPS[g] + '.');
      }
    });
    var majors = plan.programs.filter(function (id) {
      var k = API.byId[id].kind;
      return k === 'major' || k === 'joint';
    });
    if (plan.programs.length && !majors.length) {
      out.push('Nothing here is a major. Exactly one is required to graduate, and it must be declared before you pick junior-year courses.');
    }
    return out;
  }

  function programCard(id) {
    var p = API.byId[id];
    var yr = yearOf(plan.year);
    var courses = routeCourses(p);
    var done = courses.filter(function (c) { return API.isTaken(c.code); });
    var left = courses.filter(function (c) { return !API.isTaken(c.code); });
    var reachable = left.filter(function (c) { return openNow(c.code, yr); });
    var pct = courses.length ? Math.round(done.length / courses.length * 100) : 0;

    var h = '';
    h += '<article class="pcard" data-div="' + esc(p.div) + '">';
    h += '<header class="pcard__head">';
    h += '<button type="button" class="pcard__name" data-focus="' + esc(p.id) + '">' + p.name + '</button>';
    h += '<span class="pcard__kind">' + esc(KIND_WORD[p.kind] || p.kind) + '</span>';
    h += '<button type="button" class="pcard__drop" data-drop="' + esc(p.id) + '" aria-label="Remove ' + esc(plain(p.name)) + '">Remove</button>';
    h += '</header>';

    if (!courses.length) {
      h += '<p class="pcard__none">This route names no specific course numbers, so there is nothing here to tick off. Open it on the chart for the requirements in full.</p>';
    } else {
      h += '<div class="bar"><span style="width:' + pct + '%"></span></div>';
      h += '<p class="pcard__tally"><b>' + done.length + ' of ' + courses.length + '</b> named ' +
           plural(courses.length, 'course') + ' done';
      if (left.length) {
        h += ', <b>' + left.length + '</b> left';
        if (yr) {
          h += reachable.length === left.length
            ? ', all normally open to you as a ' + yr.label.toLowerCase()
            : ', ' + reachable.length + ' of them normally open to you as a ' + yr.label.toLowerCase();
        }
      }
      h += '.</p>';

      h += '<ol class="stages">';
      API.stageCodes(p).forEach(function (row, i) {
        var codes = [], seen = {};
        row.forEach(function (cs) {
          if (!cs) return;
          cs.forEach(function (c) { if (!seen[c]) { seen[c] = true; codes.push(c); } });
        });
        if (!codes.length) return;
        h += '<li class="stage"><span class="stage__when">' + esc(p.path[i].when) + '</span>';
        h += '<span class="stage__codes">';
        codes.forEach(function (c) {
          var t = API.isTaken(c);
          var shut = !t && yr && !openNow(c, yr);
          h += '<button type="button" class="tick" data-code="' + esc(c) + '"' +
               (t ? ' data-done="yes"' : '') + (shut ? ' data-shut="yes"' : '') +
               ' aria-pressed="' + (t ? 'true' : 'false') + '"' +
               ' title="' + (t ? 'Taken. Click to remove.' : 'Click to mark as taken.') +
               (shut ? ' Normally opens above your class year.' : '') + '">' + esc(c) + '</button>';
        });
        h += '</span></li>';
      });
      h += '</ol>';
    }

    if ((p.rules || []).length) {
      h += '<details class="pcard__rules"><summary>' + p.rules.length + ' ' +
           plural(p.rules.length, 'rule') + ' no course list can check</summary><ul>';
      p.rules.forEach(function (r) { h += '<li>' + r + '</li>'; });
      h += '</ul></details>';
    }
    h += '</article>';
    return h;
  }

  /* ------------------------------------------------- all-College section */

  function reqValue(r) {
    var v = plan.reqs[r.key];
    if (r.kind === 'check') return v ? 1 : 0;
    return typeof v === 'number' && isFinite(v) ? v : 0;
  }
  function reqNeed(r) { return r.kind === 'check' ? 1 : r.need; }
  function reqMet(r) { return reqValue(r) >= reqNeed(r); }

  function renderReqs() {
    var host = el('plan-reqs');
    var h = '';
    REQS.forEach(function (r) {
      var met = reqMet(r), v = reqValue(r);
      h += '<li class="req"' + (met ? ' data-met="yes"' : '') + '>';
      if (r.kind === 'check') {
        h += '<button type="button" class="req__box" data-req="' + r.key + '" role="checkbox" aria-checked="' +
             (met ? 'true' : 'false') + '"><span class="req__label">' + r.label + '</span></button>';
      } else if (r.kind === 'count') {
        h += '<span class="req__label">' + r.label + '</span>';
        h += '<span class="step">' +
             '<button type="button" data-step="' + r.key + '" data-by="-1" aria-label="One fewer">&minus;</button>' +
             '<b>' + v + ' / ' + r.need + '</b>' +
             '<button type="button" data-step="' + r.key + '" data-by="1" aria-label="One more">+</button></span>';
      } else {
        h += '<span class="req__label">' + r.label + '</span>';
        h += '<span class="step"><input type="number" min="0" max="200" step="1" value="' + v +
             '" data-num="' + r.key + '" aria-label="' + stripTags(r.label) + '"><b>/ ' + r.need + '</b></span>';
      }
      h += '<span class="req__how">' + r.how + '</span></li>';
    });
    host.innerHTML = h;
  }

  /* ------------------------------------------------------------- render */

  /* Ticking a course rebuilds the panel, which throws focus to the body and leaves
     a keyboard user at the top of the page. Remember what was focused and put it
     back. Number inputs are excluded: their change event fires on blur, so
     restoring focus there would undo the Tab that caused it. */
  function focusKey() {
    var a = document.activeElement;
    if (!a || !a.dataset || !document.getElementById('plan').contains(a)) return null;
    var d = a.dataset;
    if (d.code) return '[data-code="' + d.code + '"]';
    if (d.req) return '[data-req="' + d.req + '"]';
    if (d.step) return '[data-step="' + d.step + '"][data-by="' + d.by + '"]';
    if (d.drop) return '[data-drop="' + d.drop + '"]';
    return null;
  }
  function restoreFocus(key) {
    if (!key) return;
    var n = document.querySelector('#plan ' + key);
    if (n && typeof n.focus === 'function') n.focus();
  }

  function render() {
    var keep = focusKey();
    Array.prototype.forEach.call(yearWrap.querySelectorAll('.yr'), function (b) {
      b.setAttribute('aria-pressed', b.dataset.year === plan.year ? 'true' : 'false');
    });

    pChosen.innerHTML = '';
    if (!plan.programs.length) {
      var li = document.createElement('li');
      li.className = 'chips__empty';
      li.textContent = 'Nothing declared yet.';
      pChosen.appendChild(li);
    } else {
      plan.programs.forEach(function (id) { pChosen.appendChild(programChip(API.byId[id], true)); });
    }
    renderResults();

    var out = el('plan-out');
    if (!plan.programs.length) {
      out.innerHTML = '<p class="plan__idle">Search above for the major, concentration or minor you are doing. ' +
        'Add as many as you are actually carrying and each one gets its own panel, ' +
        'checked against the courses in your list.</p>';
    } else {
      var totalDone = 0, totalAll = 0;
      plan.programs.forEach(function (id) {
        var cs = routeCourses(API.byId[id]);
        totalAll += cs.length;
        cs.forEach(function (c) { if (API.isTaken(c.code)) totalDone++; });
      });

      var h = '';
      var bad = conflicts();
      if (bad.length) {
        h += '<ul class="warns">';
        bad.forEach(function (w) { h += '<li>' + esc(w) + '</li>'; });
        h += '</ul>';
      }
      if (plan.programs.length > 1 && totalAll) {
        h += '<p class="plan__total">Across everything you have declared: <b>' + totalDone +
             ' of ' + totalAll + '</b> named courses done. Programs that share a course only ' +
             'count it once each, so the total runs ahead of the real number of classes.</p>';
      }
      h += '<p class="plan__legend">Every course number below is a button: click one to mark it done, ' +
           'click it again to undo. ' + (yearOf(plan.year)
             ? 'A dashed outline means the course sits at a level that normally opens above your year.'
             : 'Pick a class year above and the ones you cannot register for yet get marked.') + '</p>';
      plan.programs.forEach(function (id) { h += programCard(id); });
      out.innerHTML = h;
    }

    renderReqs();
    var metCount = REQS.filter(reqMet).length;
    el('plan-reqs-tally').innerHTML = '<b>' + metCount + ' of ' + REQS.length + '</b> settled';
    restoreFocus(keep);
  }

  /* -------------------------------------------------------------- events */

  el('plan-out').addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var t = ev.target.closest('[data-code],[data-focus],[data-drop]');
    if (!t) return;
    if (t.dataset.code) {
      API.isTaken(t.dataset.code) ? API.remove(t.dataset.code) : API.add(t.dataset.code);
    } else if (t.dataset.focus) {
      API.focus(t.dataset.focus);
      var chart = document.querySelector('.chart');
      if (chart) chart.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (t.dataset.drop) {
      drop(t.dataset.drop);
    }
  });

  el('plan-reqs').addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var t = ev.target.closest('[data-req],[data-step]');
    if (!t) return;
    if (t.dataset.req) {
      plan.reqs[t.dataset.req] = !plan.reqs[t.dataset.req];
    } else {
      var k = t.dataset.step, by = parseInt(t.dataset.by, 10);
      var r = REQS.filter(function (x) { return x.key === k; })[0];
      var v = (typeof plan.reqs[k] === 'number' ? plan.reqs[k] : 0) + by;
      plan.reqs[k] = Math.max(0, Math.min(r.need, v));
    }
    persist();
    render();
  });

  el('plan-reqs').addEventListener('change', function (ev) {
    var t = ev.target.closest('[data-num]');
    if (!t) return;
    var n = parseInt(t.value, 10);
    plan.reqs[t.dataset.num] = isFinite(n) && n > 0 ? Math.min(n, 200) : 0;
    persist();
    render();
  });

  el('plan-clear').addEventListener('click', function () {
    plan = { year: '', programs: [], reqs: {} };
    persist();
    render();
  });

  /* the tray and the chart write the same taken-courses list, so redraw on their changes */
  API.onChange(render);

  render();
})();
