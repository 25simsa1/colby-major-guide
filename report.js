/* ColbyMajorGuide: the printable report.
 *
 * Everything else on this page is something you click. A printed page is something
 * you carry into an advising meeting and read again the night before registration
 * opens, so almost nothing that earns its place on screen earns it on paper. The
 * tray, the chart and the twelve empty boxes are all interface. What survives the
 * walk across campus is: what you have decided, what is left, what could go wrong,
 * and what to do next.
 *
 * So this is not a screenshot of the sections above. It is a different document
 * built from the same stores, written for two readers. An advisor who does not know
 * your history and has twenty minutes, and you at eleven at night with a
 * registration window opening in the morning.
 *
 * Four things it says that the screen cannot:
 *
 *   1. The rules no course list can check, promoted out of a disclosure toggle into
 *      a section of their own. "One computing major only" and "honours needs a 3.6
 *      across CS 200 and above" are the items an automated audit misses and a
 *      student forgets, which makes them the whole reason to print anything.
 *   2. Courses named on a route and sitting in no term at all. Looking at twelve
 *      boxes you cannot see an absence; a list makes it obvious. It says "named",
 *      not "required", because a route offers alternatives and nothing here can
 *      tell "CS 251 or 252" apart from two separate obligations.
 *   3. The next term as a worksheet, with room to write backups, because Colby runs
 *      no waiting list and a full course means writing to the instructor.
 *   4. What you are near: programs you have not declared whose named courses you
 *      have already been taking. That is this site's original claim aimed at one
 *      person rather than at the chart.
 *
 * It does not recommend courses. It has no idea what you are interested in, what
 * else you are carrying that term, or which professors you want, and data.js holds
 * no distribution-area tag per course, so it cannot even tell you which course would
 * settle your outstanding H. Everything here is arithmetic over what you entered.
 *
 * Printing goes through the browser rather than a PDF library. index.html ships
 * default-src 'none' with script-src 'self', so nothing loads from a CDN, and
 * self-hosting a PDF builder would cost the README its "no build step, no
 * dependencies". Print to PDF also gives selectable text and real pagination.
 */

(function () {
  'use strict';

  var API = window.CMG, PLAN = window.CMGPlan, PLANNER = window.CMGPlanner;
  if (!API || !PLAN || !PLANNER) return;

  var KIND = { major: 'major', conc: 'concentration', joint: 'joint degree', minor: 'minor' };
  var DAY_ORDER = 'MTWRFSU';
  var DAY_NAME = { M: 'Mon', T: 'Tue', W: 'Wed', R: 'Thu', F: 'Fri', S: 'Sat', U: 'Sun' };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  var decoder = document.createElement('div');
  function plain(html) { decoder.innerHTML = String(html); return decoder.textContent || ''; }
  function plural(n, one, many) { return n === 1 ? one : (many || one + 's'); }
  function levelOf(code) { var m = /(\d{3})/.exec(code); return m ? parseInt(m[1], 10) : 0; }

  /* planner.js's rule, repeated rather than imported so the report keeps working if
     the planner is ever split out. A course numbered 200 opens to sophomores, 300 to
     juniors, 400 to seniors, and an instructor may always admit you earlier. */
  function openInYear(code, year) {
    var lv = levelOf(code);
    if (lv >= 400) return year >= 4;
    if (lv >= 300) return year >= 3;
    if (lv >= 200) return year >= 2;
    return true;
  }

  function clock(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var ap = h >= 12 ? 'pm' : 'am';
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + (m ? ':' + (m < 10 ? '0' : '') + m : '') + ap;
  }

  function today() {
    var MONTH = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
    var d = new Date();
    return d.getDate() + ' ' + MONTH[d.getMonth()] + ' ' + d.getFullYear();
  }

  function seatOf(code) {
    if (!API.seats || !API.seats.ready()) return null;
    return API.seats.of(code);
  }

  /* ------------------------------------------------------------------ model */

  function gather() {
    var declared = PLAN.declared();
    var yearIdx = PLAN.yearIndex();
    var myYear = yearIdx >= 0 ? yearIdx + 1 : null;
    var termList = PLANNER.terms();

    var placed = Object.create(null);
    PLANNER.planned().forEach(function (c) { placed[c] = true; });

    var programs = declared.map(function (id) {
      var p = API.byId[id];
      var done = [], left = [];
      PLAN.routeCourses(id).forEach(function (r) {
        var row = {
          code: r.code,
          stage: r.stage + 1,
          placed: !!placed[r.code],
          open: myYear === null ? true : openInYear(r.code, myYear)
        };
        (API.isTaken(r.code) ? done : left).push(row);
      });
      return {
        id: id,
        name: plain(p.name),
        kind: KIND[p.kind] || p.kind,
        dept: plain(p.dept),
        size: plain(p.size || ''),
        rules: (p.rules || []).slice(),
        total: done.length + left.length,
        done: done,
        left: left
      };
    });

    /* The one thing a grid of twelve boxes cannot show you: what is on your route,
       not yet done, and not written into any term. An absence has no cell to sit in. */
    var unplaced = [], seenUnplaced = Object.create(null);
    programs.forEach(function (pg) {
      pg.left.forEach(function (row) {
        if (row.placed || seenUnplaced[row.code]) return;
        seenUnplaced[row.code] = true;
        unplaced.push({ code: row.code, stage: row.stage, program: pg.name, open: row.open });
      });
    });
    unplaced.sort(function (a, b) { return a.stage - b.stage || (a.code < b.code ? -1 : 1); });

    /* Courses written into a year below the one they normally open in. Never an
       error, because an instructor can admit you early; always worth a conversation. */
    var early = [];
    termList.forEach(function (t) {
      t.courses.forEach(function (code) {
        var note = PLANNER.notesFor(code, t.key);
        if (note && note.warn) early.push({ code: code, term: t.long, warn: note.warn });
      });
    });

    var reqs = PLAN.requirements();

    return {
      generated: today(),
      year: PLAN.yearLabel(),
      myYear: myYear,
      programs: programs,
      conflicts: PLAN.conflicts(),
      reqs: reqs,
      settled: reqs.filter(function (r) { return r.met; }),
      outstanding: reqs.filter(function (r) { return !r.met; }),
      terms: termList,
      janCount: PLANNER.janCount(),
      unplaced: unplaced,
      early: early,
      empty: termList.filter(function (t) { return !t.courses.length; }),
      next: nextTerm(termList, myYear),
      near: near(declared, placed),
      seats: API.seats && API.seats.ready() ? API.seats.meta() : null
    };
  }

  /* The first term at or after the year you say you are in that has anything in it,
     falling back to the first non-empty term at all, so a student who has not set a
     class year still gets a worksheet rather than an empty section. */
  function nextTerm(termList, myYear) {
    var i, start = myYear || 1;
    for (i = 0; i < termList.length; i++) {
      if (termList[i].year >= start && termList[i].courses.length) return termList[i];
    }
    for (i = 0; i < termList.length; i++) {
      if (termList[i].courses.length) return termList[i];
    }
    return null;
  }

  /* Programs not declared, ranked by how much of their route is already behind you,
     counting both finished courses and ones written into the plan. Stating a fact and
     letting the student draw the conclusion is the only honest form this can take:
     the data knows nothing about what anyone wants to study.

     Programs that clash with something already declared are dropped rather than
     listed with a caveat. Colby's exclusion groups are real, and offering a route a
     student cannot legally walk is worse than saying nothing at all. */
  function near(declared, placed) {
    var groups = Object.create(null);
    declared.forEach(function (id) {
      (API.byId[id].excl || []).forEach(function (g) { groups[g] = true; });
    });

    var out = [];
    API.programs.forEach(function (p) {
      if (declared.indexOf(p.id) >= 0) return;
      if ((p.excl || []).some(function (g) { return groups[g]; })) return;

      /* A minor tethered to a major you already hold is not a second thing to do.
         data.js carries that as parent, not as an exclusion group: min-cs has
         parent 'cs' and no excl, so the group check above never sees it. */
      if (p.parent && declared.indexOf(p.parent) >= 0) return;

      var codes = API.coursesOf(p.id);
      if (!codes.length) return;
      var hit = codes.filter(function (c) { return API.isTaken(c) || placed[c]; });

      /* Two shared courses out of twenty-four is a coincidence, not a near miss.
         Both bars have to clear or the list fills with programs nobody is close to. */
      if (hit.length < 2 || hit.length / codes.length < 0.2) return;

      out.push({
        name: plain(p.name),
        kind: KIND[p.kind] || p.kind,
        hit: hit.length,
        total: codes.length,
        share: hit.length / codes.length,
        codes: hit.slice(0, 6)
      });
    });

    out.sort(function (a, b) { return b.share - a.share || b.hit - a.hit; });
    return out.slice(0, 6);
  }

  /* -------------------------------------------------------------- rendering */

  function codeSpan(code, mods) {
    return '<span class="rp-code"' + (mods || '') + '>' + esc(code) + '</span>';
  }

  function head(m) {
    var who = m.programs.length
      ? m.programs.map(function (p) { return esc(p.name) + ' <i>' + esc(p.kind) + '</i>'; }).join(', ')
      : 'nothing declared yet';
    return '<header class="rp-head">' +
      '<p class="rp-kicker">ColbyMajorGuide</p>' +
      '<h1>Where you stand, and the four years</h1>' +
      '<p class="rp-meta">' + (m.year ? esc(m.year) + ' &middot; ' : '') + who +
      ' &middot; ' + esc(m.generated) + '</p>' +
      '<p class="rp-warn"><b>Unofficial.</b> Workday holds the official degree audit and ' +
      'this is not it. Every count here is of courses named on a route, so a requirement ' +
      'worded as prose is not in these numbers. Check anything that matters with your ' +
      'advisor.</p></header>';
  }

  function standing(m) {
    var h = '<section class="rp-sec"><h2>1 &middot; Where you stand</h2>';

    if (!m.programs.length) {
      h += '<p class="rp-empty">No programs declared, so there is nothing to measure ' +
           'against. Declare a major or minor in "Where you stand" and print again.</p>';
    }

    m.programs.forEach(function (p) {
      var blocked = p.left.filter(function (r) { return !r.open; }).length;
      h += '<div class="rp-prog">';
      h += '<h3>' + esc(p.name) + ' <i>' + esc(p.kind) + '</i></h3>';
      h += '<p class="rp-count"><b>' + p.done.length + ' of ' + p.total + '</b> named ' +
           plural(p.total, 'course') + ' done, <b>' + p.left.length + '</b> left' +
           (blocked ? ', ' + blocked + ' of them above your year' : '') + '.';
      if (p.size) h += ' <span class="rp-dim">' + esc(p.size) + '.</span>';
      h += '</p>';

      if (p.left.length) {
        var byStage = {};
        p.left.forEach(function (r) { (byStage[r.stage] || (byStage[r.stage] = [])).push(r); });
        h += '<dl class="rp-stages">';
        Object.keys(byStage).sort().forEach(function (k) {
          h += '<dt>Year ' + esc(k) + '</dt><dd>' + byStage[k].map(function (r) {
            return codeSpan(r.code, r.open ? '' : ' data-shut="yes"') +
                   (r.placed ? '' : '<sup class="rp-star">*</sup>');
          }).join(' ') + '</dd>';
        });
        h += '</dl>';
        h += '<p class="rp-key"><sup>*</sup> not written into any term yet. A dotted code ' +
             'sits at a level that normally opens above your year.</p>';
      } else if (p.total) {
        h += '<p class="rp-good">Every named course on this route is done. What is left is ' +
             'in the rules below, not in the course list.</p>';
      }
      h += '</div>';
    });

    if (m.conflicts.length) {
      h += '<div class="rp-alarm"><h3>Cannot stand as declared</h3><ul>';
      m.conflicts.forEach(function (c) { h += '<li>' + esc(plain(c)) + '</li>'; });
      h += '</ul></div>';
    }

    h += '<h3 class="rp-sub">The all-College requirements</h3>';
    h += '<p class="rp-count"><b>' + m.settled.length + ' of ' + m.reqs.length + '</b> ' +
         'settled by your own ticking. A course number does not say which area it carries, ' +
         'so these are not derived from your course list and nothing here can check them ' +
         'for you.</p>';

    if (m.outstanding.length) {
      h += '<table class="rp-reqs"><thead><tr><th>Outstanding</th><th>What settles it</th>' +
           '</tr></thead><tbody>';
      m.outstanding.forEach(function (r) {
        var short = r.kind === 'check' ? '' : ' (' + r.value + ' of ' + r.need + ')';
        h += '<tr><td><b>' + esc(r.label) + '</b>' + esc(short) + '</td><td>' +
             esc(r.how) + '</td></tr>';
      });
      h += '</tbody></table>';
    } else {
      h += '<p class="rp-good">All fourteen ticked.</p>';
    }

    if (m.settled.length) {
      h += '<p class="rp-dim"><b>Settled:</b> ' +
           m.settled.map(function (r) { return esc(r.label); }).join('; ') + '.</p>';
    }
    return h + '</section>';
  }

  /* The section that justifies printing at all. These are the requirements written as
     prose, which is exactly why no list of course numbers can confirm them. */
  function advisor(m) {
    if (!m.programs.some(function (p) { return p.rules.length; })) return '';

    var h = '<section class="rp-sec rp-sec--ask"><h2>2 &middot; Ask your advisor about these</h2>';
    h += '<p class="rp-lede">Every line below is a rule this site cannot check, because it ' +
         'is a condition rather than a course. They are the ones students find out about ' +
         'late. Take this page to the meeting.</p>';
    m.programs.forEach(function (p) {
      if (!p.rules.length) return;
      h += '<div class="rp-prog"><h3>' + esc(p.name) + '</h3><ul class="rp-rules">';
      p.rules.forEach(function (r) { h += '<li>' + esc(plain(r)) + '</li>'; });
      h += '</ul></div>';
    });
    return h + '</section>';
  }

  function grid(m) {
    var h = '<section class="rp-sec"><h2>3 &middot; The four years</h2>';

    var byYear = {};
    m.terms.forEach(function (t) { (byYear[t.year] || (byYear[t.year] = [])).push(t); });

    h += '<table class="rp-grid"><thead><tr><th></th><th>Fall</th><th>January</th>' +
         '<th>Spring</th></tr></thead><tbody>';
    Object.keys(byYear).sort().forEach(function (y) {
      h += '<tr><th scope="row">Year ' + esc(y) + '</th>';
      byYear[y].forEach(function (t) {
        h += '<td>' + (t.courses.length
          ? t.courses.map(function (c) { return codeSpan(c); }).join(' ')
          : '<span class="rp-dim">&mdash;</span>') + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table><div class="rp-audit">';

    h += '<p><b>JanPlans placed: ' + m.janCount + '.</b> Three are required if you are in ' +
         'residence seven semesters or more, two if six or fewer.</p>';

    if (m.unplaced.length) {
      h += '<div class="rp-alarm"><h3>Named on your route, in no term</h3><p>These ' +
           m.unplaced.length + ' ' + plural(m.unplaced.length, 'course') + ' ' +
           plural(m.unplaced.length, 'is', 'are') + ' named on a route you have declared, ' +
           plural(m.unplaced.length, 'is', 'are') + ' not done, and ' +
           plural(m.unplaced.length, 'appears', 'appear') + ' in none of the twelve terms. ' +
           '<b>Not all of them are courses you must take.</b> A route offers alternatives, ' +
           'as in "CS 251 or 252" and "one of 375, 376 or 378", and a list of course ' +
           'numbers cannot tell an alternative from a requirement. Read this as the set ' +
           'to check, not the set to register for.</p><ul>';
      m.unplaced.forEach(function (u) {
        h += '<li>' + codeSpan(u.code) + ' <span class="rp-dim">route year ' + u.stage +
             ', ' + esc(u.program) + '</span></li>';
      });
      h += '</ul></div>';
    } else if (m.programs.length) {
      h += '<p class="rp-good">Every course still owed on a declared route has a term.</p>';
    }

    if (m.early.length) {
      h += '<h3 class="rp-sub">Placed below the level they normally open</h3>' +
           '<ul class="rp-flat">';
      m.early.forEach(function (e) {
        h += '<li>' + codeSpan(e.code) + ' in ' + esc(e.term) + ' <span class="rp-dim">' +
             esc(e.warn) + '</span></li>';
      });
      h += '</ul><p class="rp-key">Not errors. An instructor may admit you to a level ' +
           'normally closed to your class, which is a conversation to have early.</p>';
    }

    if (m.empty.length && m.empty.length < m.terms.length) {
      h += '<p class="rp-dim"><b>' + m.empty.length + ' empty ' +
           plural(m.empty.length, 'term') + ':</b> ' +
           m.empty.map(function (t) { return esc(t.long); }).join(', ') + '.</p>';
    }
    return h + '</div></section>';
  }

  /* The registration worksheet. Deliberately the only part with blank space on it. */
  function worksheet(m) {
    var t = m.next;
    if (!t) return '';

    var h = '<section class="rp-sec rp-sec--next"><h2>4 &middot; ' + esc(t.long) + '</h2>';
    h += '<p class="rp-lede">What to type in when your window opens.' +
         (m.seats
           ? ' Seat counts are for ' + esc(m.seats.termName || m.seats.term) +
             (m.seats.sample
               ? ' and are <b>invented sample data</b>.'
               : ', read ' + esc(m.seats.fetchedAt || '') + '. They go stale within hours ' +
                 'of this page being printed.')
           : '') + '</p>';

    h += '<table class="rp-next"><thead><tr><th>Course</th><th>Meets</th><th>Seats</th>' +
         '<th>Got it</th></tr></thead><tbody>';

    t.courses.forEach(function (code) {
      var seat = seatOf(code);
      var meets = '<span class="rp-dim">&mdash;</span>';
      var seats = '<span class="rp-dim">&mdash;</span>';

      if (seat) {
        var blocks = [];
        seat.sections.forEach(function (s) {
          (s.schedule || []).forEach(function (b) {
            var days = b.days.slice().sort(function (a, c) {
              return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(c);
            }).map(function (d) { return DAY_NAME[d] || d; }).join(' ');
            blocks.push(days + ' ' + clock(b.start) + '&ndash;' + clock(b.end) +
              (b.location ? ' <span class="rp-dim">' + esc(b.location) + '</span>' : ''));
          });
        });
        if (blocks.length) meets = blocks.join('<br>');
        seats = seat.filled + '/' + seat.total + (seat.state === 'full' ? ' <b>full</b>' : '');
      }

      h += '<tr><td>' + codeSpan(code) + '</td><td>' + meets + '</td><td>' + seats +
           '</td><td class="rp-box"></td></tr>';
    });

    /* Colby runs no automated waiting list, so a full course means writing to the
       instructor and having something else ready. Three ruled lines for that. */
    for (var i = 0; i < 3; i++) h += '<tr class="rp-blank"><td colspan="4"></td></tr>';

    h += '</tbody></table>';
    h += '<p class="rp-key">The blank rows are for backups. Colby runs no automated ' +
         'waiting list: if a course is full the way in is a course authorisation from the ' +
         'instructor, so it is worth deciding now what you would take instead.</p>';
    return h + '</section>';
  }

  function nearby(m) {
    if (!m.near.length) return '';
    var h = '<section class="rp-sec"><h2>5 &middot; What you are near</h2>';
    h += '<p class="rp-lede">Programs you have not declared, ranked by how much of each one ' +
         'you have already done or planned. This is arithmetic, not advice: it knows nothing ' +
         'about what you want to study. Programs barred by an exclusion group, and minors ' +
         'inside a major you already hold, are left out. Some combinations are barred only ' +
         'by the prose rules in section 2, which this cannot read, so check there before ' +
         'acting on any of it.</p><ul class="rp-near">';
    m.near.forEach(function (n) {
      h += '<li><b>' + esc(n.name) + '</b> <i>' + esc(n.kind) + '</i> &middot; ' + n.hit +
           ' of ' + n.total + ' named courses already behind you<br><span class="rp-dim">' +
           n.codes.map(function (c) { return esc(c); }).join(', ') +
           (n.hit > n.codes.length ? ' and ' + (n.hit - n.codes.length) + ' more' : '') +
           '</span></li>';
    });
    return h + '</ul></section>';
  }

  function foot() {
    return '<footer class="rp-foot">Generated by colbymajorguide.com, an unofficial student ' +
      'project not affiliated with or endorsed by Colby College. Nothing here is an ' +
      'authoritative statement of degree requirements.</footer>';
  }

  /* ------------------------------------------------------------- printing */

  function build() {
    var node = document.getElementById('report');
    if (!node) {
      node = document.createElement('div');
      node.id = 'report';
      node.className = 'report';
      node.setAttribute('aria-hidden', 'true');
      document.body.appendChild(node);
    }
    var m = gather();
    node.innerHTML = head(m) + standing(m) + advisor(m) + grid(m) + worksheet(m) +
                     nearby(m) + foot();
    return node;
  }

  var listening = false;
  function clear() { document.documentElement.removeAttribute('data-print'); }

  function save() {
    build();
    /* The flag switches the print sheet from "print the page" to "print the report".
       Cleared on afterprint, and on a timer as well: Safari has historically not fired
       afterprint at all, and a page left stuck in report mode looks broken. */
    document.documentElement.setAttribute('data-print', 'report');
    if (!listening) {
      listening = true;
      window.addEventListener('afterprint', clear);
    }
    window.setTimeout(function () { window.print(); }, 0);
    window.setTimeout(clear, 20000);
  }

  /* ---------------------------------------------------------------- wiring */

  function button(label, cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls + ' rp-btn';
    b.textContent = label;
    b.addEventListener('click', save);
    return b;
  }

  /* Injected rather than written into index.html so the whole feature is one file that
     can be deleted without leaving a dead control behind. */
  function mount() {
    var bar = document.querySelector('.planner__bar');
    if (bar && !bar.querySelector('.rp-btn')) {
      bar.appendChild(button('Save as PDF', 'planner__btn planner__btn--quiet'));
    }
    var clearBtn = document.getElementById('plan-clear');
    if (clearBtn && clearBtn.parentNode && !clearBtn.parentNode.querySelector('.rp-btn')) {
      clearBtn.parentNode.insertBefore(button('Save as PDF', 'setup__clear'), clearBtn);
    }
  }

  mount();
})();
