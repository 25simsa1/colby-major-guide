/* ColbyMajorGuide — chart layout, rendering and interaction.
 * Layout is deterministic: no Math.random anywhere, so the chart is identical on
 * every load and the composition can be judged rather than re-rolled. */

(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var VW = 1600, VH = 1000;
  var PAD_X = 46, PAD_Y = 56;
  var Y_SPREAD = 1.10;
  var FS = 19;                 /* label size in viewBox units */
  var CHAR_W = FS * 0.46;      /* Archivo at wdth 84 */
  var GOLDEN = 2.399963229728653;

  var svg = document.getElementById('chart');
  var readout = document.getElementById('readout');
  var find = document.getElementById('find');
  var resetBtn = document.getElementById('reset');
  var terrBtns = Array.prototype.slice.call(document.querySelectorAll('.terr-btn[data-div]'));

  var byId = {};
  PROGRAMS.forEach(function (p) { byId[p.id] = p; });

  var bandById = {};
  BANDS.forEach(function (b) { bandById[b.div] = b; });

  function plainText(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  }

  /* ---------- links: symmetric, de-duplicated, unknown ids dropped ---------- */
  var links = [];
  var seenKey = {};
  PROGRAMS.forEach(function (p) {
    (p.links || []).forEach(function (t) {
      if (!byId[t] || t === p.id) return;
      var key = p.id < t ? p.id + '|' + t : t + '|' + p.id;
      if (seenKey[key]) return;
      seenKey[key] = true;
      var tether = byId[p.id].parent === t || byId[t].parent === p.id;
      links.push({ a: p.id, b: t, cross: byId[p.id].div !== byId[t].div, tether: tether });
    });
  });

  /* ---------- nodes ---------- */
  var nodes = PROGRAMS.map(function (p, i) {
    var c = CLUSTERS[p.cluster];
    var ring = 44 + (i % 3) * 27;
    var ay = (0.5 + (c.y - 0.5) * Y_SPREAD) * VH;
    return {
      id: p.id, div: p.div, kind: p.kind, prog: p,
      cx: c.x * VW + Math.cos(i * GOLDEN) * ring,
      cy: ay + Math.sin(i * GOLDEN) * ring,
      ax: c.x * VW, ay: ay,
      deg: 0, r: 10
    };
  });
  var nodeById = {};
  nodes.forEach(function (n) { nodeById[n.id] = n; });
  links.forEach(function (e) { nodeById[e.a].deg++; nodeById[e.b].deg++; });

  /* radius carries the degree: a hub has to look like a hub */
  var KIND_SCALE = { major: 1, conc: 0.86, joint: 0.9, minor: 0.8 };
  nodes.forEach(function (n) {
    n.r = (7 + Math.sqrt(n.deg) * 2.4) * (KIND_SCALE[n.kind] || 1);
  });

  /* ---------- deterministic relaxation ---------- */
  function relax(iterations) {
    var i, j, k, n, m, e, dx, dy, d, push;
    for (k = 0; k < iterations; k++) {
      var alpha = 1 - k / iterations;

      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          n = nodes[i]; m = nodes[j];
          dx = m.cx - n.cx; dy = m.cy - n.cy;
          d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          var tight = (n.kind === 'minor' || m.kind === 'minor') ? 0.68 : 1;
          var minD = ((n.div === m.div ? 116 : 84) + (n.r + m.r) * 0.55) * tight;
          if (d < minD) {
            push = ((minD - d) / d) * 0.5 * alpha;
            n.cx -= dx * push; n.cy -= dy * push;
            m.cx += dx * push; m.cy += dy * push;
          }
        }
      }

      for (i = 0; i < links.length; i++) {
        e = links[i];
        n = nodeById[e.a]; m = nodeById[e.b];
        dx = m.cx - n.cx; dy = m.cy - n.cy;
        d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        var rest, strength;
        if (e.tether) { rest = n.r + m.r + 46; strength = 0.075; }   /* hold the satellite close */
        else if (e.cross) { rest = 310; strength = 0.006; }
        else { rest = 172; strength = 0.020; }
        push = ((d - rest) / d) * strength * alpha;
        n.cx += dx * push; n.cy += dy * push;
        m.cx -= dx * push; m.cy -= dy * push;
      }

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.cx += (n.ax - n.cx) * 0.020 * alpha;
        n.cy += (n.ay - n.cy) * 0.020 * alpha;

        var band = bandById[n.div];
        var lo = band.x0 * VW + PAD_X, hi = band.x1 * VW - PAD_X;
        if (n.cx < lo) n.cx += (lo - n.cx) * 0.55;
        if (n.cx > hi) n.cx -= (n.cx - hi) * 0.55;
        if (n.cy < PAD_Y) n.cy += (PAD_Y - n.cy) * 0.55;
        if (n.cy > VH - PAD_Y) n.cy -= (n.cy - (VH - PAD_Y)) * 0.55;
      }
    }
  }
  relax(540);

  /* ---------- territories: a smoothed hull around each division's cloud ---------- */
  function hullOf(pts) {
    var s = pts.slice().sort(function (a, b) { return a.x - b.x || a.y - b.y; });
    function cross(o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
    var lower = [], upper = [], i;
    for (i = 0; i < s.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], s[i]) <= 0) lower.pop();
      lower.push(s[i]);
    }
    for (i = s.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], s[i]) <= 0) upper.pop();
      upper.push(s[i]);
    }
    lower.pop(); upper.pop();
    return lower.concat(upper);          /* counter-clockwise */
  }

  /* offset each hull vertex outward along the bisector of its two edge normals */
  function expand(h, dist) {
    var n = h.length;
    return h.map(function (p, i) {
      var prev = h[(i - 1 + n) % n], next = h[(i + 1) % n];
      function normal(a, b) {
        var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        return { x: dy / len, y: -dx / len };
      }
      var n1 = normal(prev, p), n2 = normal(p, next);
      var bx = n1.x + n2.x, by = n1.y + n2.y;
      var len = Math.hypot(bx, by) || 1;
      return { x: p.x + (bx / len) * dist, y: p.y + (by / len) * dist };
    });
  }

  function smoothClosedPath(pts) {
    var n = pts.length;
    function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
    var start = mid(pts[n - 1], pts[0]);
    var d = 'M' + start.x.toFixed(1) + ' ' + start.y.toFixed(1);
    for (var i = 0; i < n; i++) {
      var cur = pts[i], m = mid(cur, pts[(i + 1) % n]);
      d += ' Q' + cur.x.toFixed(1) + ' ' + cur.y.toFixed(1) + ' ' + m.x.toFixed(1) + ' ' + m.y.toFixed(1);
    }
    return d + ' Z';
  }

  /* Territories stay inside their own lane and inside the plate frame, so the three
     divisions read as adjacent regions rather than overlapping blobs. */
  var FRAME_M = 10;
  var territories = BANDS.map(function (b) {
    var pts = nodes.filter(function (n) { return n.div === b.div; })
                   .map(function (n) { return { x: n.cx, y: n.cy }; });
    var laneLo = b.x0 * VW - 14, laneHi = b.x1 * VW + 14;
    var h = expand(hullOf(pts), 48).map(function (q) {
      return {
        x: Math.min(Math.max(q.x, Math.max(laneLo, FRAME_M + 7)), Math.min(laneHi, VW - FRAME_M - 7)),
        y: Math.min(Math.max(q.y, FRAME_M + 7), VH - FRAME_M - 7)
      };
    });
    /* the name sits just above its region, clear of the node cloud inside it */
    var minX = Math.min.apply(null, h.map(function (q) { return q.x; }));
    var minY = Math.min.apply(null, h.map(function (q) { return q.y; }));
    return {
      div: b.div, label: b.label, d: smoothClosedPath(h),
      lx: Math.max(minX, b.x0 * VW), ly: Math.max(minY - 18, FRAME_M + 36)
    };
  });

  /* ---------- label placement: eight slots per node, hubs choose first ---------- */
  nodes.forEach(function (n) {
    var band = bandById[n.div];
    var mid = (band.x0 + band.x1) / 2 * VW;
    n.side = n.cx > mid ? -1 : 1;
    n.text = plainText(n.prog.short);
    n.tw = n.text.length * CHAR_W;
  });

  function rectOf(n, cand) {
    var x = n.cx + cand.dx, y = n.cy + cand.dy, x0;
    if (cand.anchor === 'start') x0 = x;
    else if (cand.anchor === 'end') x0 = x - n.tw;
    else x0 = x - n.tw / 2;
    return { x0: x0, y0: y - FS * 0.82, x1: x0 + n.tw, y1: y + FS * 0.26 };
  }
  function overlap(a, b) {
    var w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    var h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    return w > 0 && h > 0 ? w * h : 0;
  }

  var discBoxes = nodes.map(function (n) {
    return { x0: n.cx - n.r - 3, y0: n.cy - n.r - 3, x1: n.cx + n.r + 3, y1: n.cy + n.r + 3 };
  });

  var placed = [];
  var byDegree = nodes.slice().sort(function (a, b) { return b.deg - a.deg; });
  byDegree.forEach(function (n, rank) {
    n.rank = rank;
    var g = n.r + 8;
    var slots = [
      { dx: g, dy: FS * 0.3, anchor: 'start' },
      { dx: -g, dy: FS * 0.3, anchor: 'end' },
      { dx: 0, dy: -(n.r + 9), anchor: 'middle' },
      { dx: 0, dy: n.r + FS + 3, anchor: 'middle' },
      { dx: g * 0.8, dy: -(n.r + 7), anchor: 'start' },
      { dx: -g * 0.8, dy: -(n.r + 7), anchor: 'end' },
      { dx: g * 0.8, dy: n.r + FS + 1, anchor: 'start' },
      { dx: -g * 0.8, dy: n.r + FS + 1, anchor: 'end' }
    ];
    if (n.side < 0) slots = [slots[1], slots[0], slots[2], slots[3], slots[5], slots[4], slots[7], slots[6]];

    var best = null, bestScore = Infinity;
    slots.forEach(function (cand, ci) {
      var r = rectOf(n, cand), score = ci * 60;
      for (var i = 0; i < placed.length; i++) score += overlap(r, placed[i]) * 3;
      for (var j = 0; j < discBoxes.length; j++) score += overlap(r, discBoxes[j]) * 5;
      if (r.x0 < 6) score += (6 - r.x0) * 40;
      if (r.x1 > VW - 6) score += (r.x1 - (VW - 6)) * 40;
      if (r.y0 < 6) score += (6 - r.y0) * 40;
      if (r.y1 > VH - 6) score += (r.y1 - (VH - 6)) * 40;
      if (score < bestScore) { bestScore = score; best = { cand: cand, rect: r }; }
    });
    n.lx = n.cx + best.cand.dx;
    n.ly = n.cy + best.cand.dy;
    n.anchor = best.cand.anchor;
    placed.push(best.rect);
  });

  /* ---------- render ---------- */
  svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  function el(name, attrs) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    return e;
  }

  var root = el('g');
  svg.appendChild(root);
  var gPlate = el('g'), gTerr = el('g'), gLinks = el('g'), gDots = el('g');
  root.appendChild(gPlate); root.appendChild(gTerr); root.appendChild(gLinks); root.appendChild(gDots);

  /* graticule + plate border with tick marks */
  var M = FRAME_M, G = 100;
  for (var gx = M + G; gx < VW - M; gx += G) {
    gPlate.appendChild(el('line', { 'class': 'graticule', x1: gx, y1: M, x2: gx, y2: VH - M }));
  }
  for (var gy = M + G; gy < VH - M; gy += G) {
    gPlate.appendChild(el('line', { 'class': 'graticule', x1: M, y1: gy, x2: VW - M, y2: gy }));
  }
  gPlate.appendChild(el('rect', { 'class': 'frame', x: M, y: M, width: VW - M * 2, height: VH - M * 2 }));
  for (var tx = M; tx <= VW - M; tx += 50) {
    var long = (tx - M) % G === 0 ? 9 : 5;
    gPlate.appendChild(el('line', { 'class': 'frame-tick', x1: tx, y1: M, x2: tx, y2: M + long }));
    gPlate.appendChild(el('line', { 'class': 'frame-tick', x1: tx, y1: VH - M, x2: tx, y2: VH - M - long }));
  }
  for (var ty = M; ty <= VH - M; ty += 50) {
    var longY = (ty - M) % G === 0 ? 9 : 5;
    gPlate.appendChild(el('line', { 'class': 'frame-tick', x1: M, y1: ty, x2: M + longY, y2: ty }));
    gPlate.appendChild(el('line', { 'class': 'frame-tick', x1: VW - M, y1: ty, x2: VW - M - longY, y2: ty }));
  }

  /* territories */
  var terrEls = {};
  territories.forEach(function (t) {
    var path = el('path', { 'class': 'territory', 'data-div': t.div, d: t.d });
    gTerr.appendChild(path);
    var name = el('text', { 'class': 'terr-name', 'data-div': t.div, x: t.lx, y: t.ly });
    name.textContent = t.label;
    gTerr.appendChild(name);
    terrEls[t.div] = [path, name];
  });

  /* links */
  links.forEach(function (e) {
    var n = nodeById[e.a], m = nodeById[e.b];
    var mx = (n.cx + m.cx) / 2, my = (n.cy + m.cy) / 2;
    var bow = (m.cy - n.cy) * 0.09;
    e.el = el('path', {
      'class': 'link' + (e.cross ? ' link--cross' : '') + (e.tether ? ' link--tether' : ''),
      'data-div': e.tether ? byId[e.a].div : undefined,
      d: 'M' + n.cx.toFixed(1) + ' ' + n.cy.toFixed(1) +
         ' Q' + (mx + bow).toFixed(1) + ' ' + my.toFixed(1) +
         ' ' + m.cx.toFixed(1) + ' ' + m.cy.toFixed(1)
    });
    gLinks.appendChild(e.el);
  });

  var neighbours = {};
  nodes.forEach(function (n) { neighbours[n.id] = {}; });
  links.forEach(function (e) { neighbours[e.a][e.b] = true; neighbours[e.b][e.a] = true; });

  var KIND_WORD = { major: 'Major', conc: 'Concentration', joint: 'Joint major', minor: 'Minor' };
  var KIND_PLURAL = { major: 'majors', conc: 'concentrations', joint: 'joint majors', minor: 'minors' };
  var DIV_WORD = { sci: 'Natural sciences', soc: 'Social sciences', hum: 'Humanities' };

  /* dots */
  nodes.forEach(function (n) {
    var g = el('g', {
      'class': 'dot', 'data-div': n.div, 'data-id': n.id, 'data-kind': n.kind,
      tabindex: '0', role: 'button',
      'aria-label': plainText(n.prog.name) + ', ' + KIND_WORD[n.kind] + ', ' + DIV_WORD[n.div] +
                    '. ' + n.deg + ' connected programs.'
    });
    g.style.setProperty('--d', n.rank);

    g.appendChild(el('circle', { 'class': 'dot__halo', cx: n.cx.toFixed(1), cy: n.cy.toFixed(1), r: (n.r + 7).toFixed(1) }));
    if (n.kind === 'conc' || n.kind === 'joint') {
      g.appendChild(el('circle', { 'class': 'dot__disc', cx: n.cx.toFixed(1), cy: n.cy.toFixed(1), r: (n.r + 3.6).toFixed(1), 'fill-opacity': '0', 'stroke-opacity': '0.75' }));
    }
    g.appendChild(el('circle', { 'class': 'dot__disc', cx: n.cx.toFixed(1), cy: n.cy.toFixed(1), r: n.r.toFixed(1) }));
    if (n.kind !== 'minor') {
      g.appendChild(el('circle', { 'class': 'dot__core', cx: n.cx.toFixed(1), cy: n.cy.toFixed(1), r: (n.r * 0.3).toFixed(1) }));
    }

    var label = el('text', { 'class': 'dot__name', x: n.lx.toFixed(1), y: n.ly.toFixed(1), 'text-anchor': n.anchor });
    label.textContent = n.text;
    g.appendChild(label);

    gDots.appendChild(g);
    n.el = g;
  });

  /* ---------- state ---------- */
  var selected = null, hovered = null, query = '';
  var live = { sci: true, soc: true, hum: true };
  var showMinors = true;
  var minorBtn = document.getElementById('toggle-minors');

  function matches(p) {
    if (!query) return true;
    var hay = (plainText(p.name) + ' ' + plainText(p.dept) + ' ' + plainText(p.blurb) + ' ' +
      p.path.map(function (s) { return plainText(s.what); }).join(' ') + ' ' +
      p.rules.map(plainText).join(' ')).toLowerCase();
    return hay.indexOf(query) !== -1;
  }
  function onChart(n) { return live[n.div] && (showMinors || n.kind !== 'minor'); }
  function visible(n) { return onChart(n) && matches(n.prog); }

  var painting = false;

  /* `raise` re-parents nodes to lift their labels above the field. That removes and
     re-inserts the element under the cursor, which makes the browser fire pointerout
     (relatedTarget null) and then pointerover again — an infinite repaint loop if it
     runs on hover. So it only ever runs for an explicit selection, where the hover
     handlers are already inert. The flag is a second line of defence. */
  function paint(raise) {
    if (painting) return;
    painting = true;
    var focus = selected || hovered;

    nodes.forEach(function (n) {
      var e = n.el;
      e.style.display = onChart(n) ? '' : 'none';
      e.classList.toggle('is-live', focus === n.id);
      e.classList.toggle('is-near', !!(focus && focus !== n.id && neighbours[focus][n.id]));
      e.classList.toggle('is-mute',
        (focus ? (focus !== n.id && !neighbours[focus][n.id]) : false) || (!!query && !visible(n)));
    });

    links.forEach(function (e) {
      var na = nodeById[e.a], nb = nodeById[e.b];
      e.el.style.display = (onChart(na) && onChart(nb)) ? '' : 'none';
      var lit = !!focus && (e.a === focus || e.b === focus);
      e.el.classList.toggle('is-live', lit);
      e.el.classList.toggle('is-mute', (!!focus && !lit) || (!!query && !(visible(na) && visible(nb))));
    });

    BANDS.forEach(function (b) {
      terrEls[b.div].forEach(function (e) { e.style.display = live[b.div] ? '' : 'none'; });
    });

    if (raise && selected) {
      Object.keys(neighbours[selected]).forEach(function (id) { gDots.appendChild(nodeById[id].el); });
      gDots.appendChild(nodeById[selected].el);
    }
    painting = false;
  }

  /* ---------- course codes ---------- */
  function codesIn(html) {
    var out = [], re = /<span class="code">([^<]+)<\/span>/g, m;
    while ((m = re.exec(html)) !== null) out.push(m[1].replace(/&nbsp;/g, ' '));
    return out;
  }
  /* prose writes "CH 141 and 142", so a bare number inherits the last prefix seen */
  function pathCodes(p) {
    if (p._codes) return p._codes;
    var out = [], last = '';
    p.path.forEach(function (stage, i) {
      codesIn(stage.what).forEach(function (c) {
        var m = c.match(/^([A-Z]{2,3})\s+(.+)$/);
        if (m) last = m[1]; else if (last) c = last + ' ' + c;
        out.push({ i: i, c: c });
      });
    });
    p._codes = out;
    return out;
  }
  function stageCodes(p, index) {
    var seen = {}, out = [];
    pathCodes(p).forEach(function (e) {
      if (e.i !== index || seen[e.c]) return;
      seen[e.c] = true; out.push(e.c);
    });
    return out;
  }
  function codeList(list) {
    if (!list.length) return null;
    return list.slice(0, 3).join('  ') + (list.length > 3 ? '  +' + (list.length - 3) : '');
  }

  /* ---------- readout ---------- */
  var IDLE = readout.innerHTML;

  function renderReadout(id) {
    var p = byId[id];
    if (!p) return;
    var jumps = (p.links || []).filter(function (t) { return byId[t]; });

    var h = '<article class="pgm">';
    h += '<p class="pgm__tag" data-div="' + p.div + '">' + DIV_WORD[p.div] + ' &middot; ' + KIND_WORD[p.kind] + '</p>';
    h += '<h2>' + p.name + '</h2>';
    h += '<p class="pgm__dept">' + p.dept + '<br>' + p.size + '</p>';
    h += '<p class="pgm__note">' + p.blurb + '</p>';

    h += '<h3>The route</h3><ol class="route">';
    p.path.forEach(function (s) {
      h += '<li><span class="route__year">' + s.when + '</span><span class="route__what">' + s.what + '</span></li>';
    });
    h += '</ol>';

    if (p.rules && p.rules.length) {
      h += '<h3>What can lock you out</h3><ul class="gates">';
      p.rules.forEach(function (r) { h += '<li>' + r + '</li>'; });
      h += '</ul>';
    }
    if (jumps.length) {
      h += '<h3>Shares requirements with ' + jumps.length + '</h3><div class="jump">';
      jumps.forEach(function (t) {
        h += '<button type="button" data-goto="' + t + '">' + byId[t].short + '</button>';
      });
      h += '</div>';
    }
    h += '</article>';

    readout.innerHTML = h;
    readout.scrollTop = 0;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function scrollToEl(el2) {
    el2.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  function select(id, revealOnNarrow) {
    selected = id;
    hovered = null;
    renderReadout(id);
    paint(true);
    if (revealOnNarrow && window.matchMedia('(max-width: 1180px)').matches) scrollToEl(readout);
  }
  function clearSelection() {
    selected = null;
    readout.innerHTML = IDLE;
    paint();
  }

  /* ---------- node interaction ---------- */
  gDots.addEventListener('pointerover', function (ev) {
    var g = ev.target.closest ? ev.target.closest('.dot') : null;
    if (!g || selected) return;
    var id = g.getAttribute('data-id');
    if (hovered === id) return;        /* guard: paint() reorders the DOM */
    hovered = id; paint();
  });
  gDots.addEventListener('pointerout', function (ev) {
    if (selected || hovered === null) return;
    var to = ev.relatedTarget;
    if (!to) return;                                   /* re-parent artefact, not a real exit */
    if (to.closest && to.closest('.dot')) return;      /* moved to another dot */
    hovered = null; paint();
  });
  /* leaving the chart entirely is the reliable signal that hover is over */
  svg.addEventListener('pointerleave', function () {
    if (selected || hovered === null) return;
    hovered = null; paint();
  });
  gDots.addEventListener('focusin', function (ev) {
    var g = ev.target.closest ? ev.target.closest('.dot') : null;
    if (!g || selected) return;
    var id = g.getAttribute('data-id');
    if (hovered === id) return;
    hovered = id; paint();
  });
  gDots.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var g = ev.target.closest ? ev.target.closest('.dot') : null;
    if (!g) return;
    ev.preventDefault();
    select(g.getAttribute('data-id'), false);
  });

  readout.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-goto]') : null;
    if (!b) return;
    var id = b.getAttribute('data-goto');
    if (!live[byId[id].div] || (byId[id].kind === 'minor' && !showMinors)) {
      live[byId[id].div] = true;
      if (byId[id].kind === 'minor') showMinors = true;
      syncButtons(); renderIndex();
    }
    select(id, false);
    if (nodeById[id].el) nodeById[id].el.focus({ preventScroll: true });
  });

  /* ---------- pan and zoom ---------- */
  var view = { k: 1, x: 0, y: 0 };
  var pointers = new Map();
  var dragged = false, pinch = null, downDot = null;

  function applyView() {
    root.setAttribute('transform',
      'translate(' + view.x.toFixed(2) + ' ' + view.y.toFixed(2) + ') scale(' + view.k.toFixed(4) + ')');
  }
  function toSvg(clientX, clientY) {
    var r = svg.getBoundingClientRect();
    var s = Math.min(r.width / VW, r.height / VH);
    return {
      x: (clientX - r.left - (r.width - VW * s) / 2) / s,
      y: (clientY - r.top - (r.height - VH * s) / 2) / s
    };
  }
  function zoomAbout(px, py, factor) {
    var k2 = Math.min(4, Math.max(0.55, view.k * factor));
    var ratio = k2 / view.k;
    view.x = px * (1 - ratio) + view.x * ratio;
    view.y = py * (1 - ratio) + view.y * ratio;
    view.k = k2;
    applyView();
  }

  svg.addEventListener('wheel', function (ev) {
    /* plain wheel scrolls the page; the chart is tall and hijacking it traps the reader.
       trackpad pinch arrives as wheel + ctrlKey, so that path zooms. */
    if (!ev.ctrlKey && !ev.metaKey) return;
    ev.preventDefault();
    var p = toSvg(ev.clientX, ev.clientY);
    zoomAbout(p.x, p.y, Math.exp(-ev.deltaY * 0.0026));
  }, { passive: false });

  svg.addEventListener('pointerdown', function (ev) {
    downDot = ev.target.closest ? ev.target.closest('.dot') : null;
    svg.setPointerCapture(ev.pointerId);
    pointers.set(ev.pointerId, toSvg(ev.clientX, ev.clientY));
    dragged = false;
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinch = { d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), k: view.k };
    }
    svg.classList.add('is-panning');
  });

  svg.addEventListener('pointermove', function (ev) {
    if (!pointers.has(ev.pointerId)) return;
    var prev = pointers.get(ev.pointerId);
    var now = toSvg(ev.clientX, ev.clientY);

    if (pointers.size === 2 && pinch) {
      pointers.set(ev.pointerId, now);
      var pts = Array.from(pointers.values());
      var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      var mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      if (pinch.d > 0) zoomAbout(mid.x, mid.y, (d / pinch.d) * (pinch.k / view.k));
      dragged = true;
      return;
    }
    var dx = (now.x - prev.x) * view.k, dy = (now.y - prev.y) * view.k;
    if (Math.abs(dx) + Math.abs(dy) > 1.5) dragged = true;
    view.x += dx; view.y += dy;
    applyView();
  });

  function endPointer(ev) {
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) svg.classList.remove('is-panning');
  }
  svg.addEventListener('pointerup', function (ev) {
    var wasDrag = dragged;
    var g = downDot;                    /* capture retargets pointerup to the svg */
    downDot = null;
    endPointer(ev);
    if (wasDrag) return;
    if (g) select(g.getAttribute('data-id'), true);
    else if (selected) clearSelection();
  });
  svg.addEventListener('pointercancel', endPointer);

  /* ---------- controls ---------- */
  function syncButtons() {
    terrBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', live[b.getAttribute('data-div')] ? 'true' : 'false');
    });
    if (minorBtn) minorBtn.setAttribute('aria-pressed', showMinors ? 'true' : 'false');
  }
  if (minorBtn) {
    minorBtn.addEventListener('click', function () {
      showMinors = !showMinors;
      syncButtons();
      if (selected && byId[selected].kind === 'minor' && !showMinors) clearSelection();
      paint();
      renderIndex();
    });
  }
  terrBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var d = b.getAttribute('data-div');
      live[d] = !live[d];
      if (!live.sci && !live.soc && !live.hum) live[d] = true;   /* never blank the chart */
      syncButtons();
      if (selected && !live[byId[selected].div]) clearSelection();
      paint();
      renderIndex();
    });
  });

  var findTimer = null;
  find.addEventListener('input', function () {
    clearTimeout(findTimer);
    findTimer = setTimeout(function () {
      query = find.value.trim().toLowerCase();
      paint();
      renderIndex();
    }, 110);
  });

  resetBtn.addEventListener('click', function () {
    view = { k: 1, x: 0, y: 0 };
    frameForViewport();
    selected = null; hovered = null; query = '';
    find.value = '';
    live = { sci: true, soc: true, hum: true };
    showMinors = true;
    syncButtons();
    readout.innerHTML = IDLE;
    paint();
    renderIndex();
  });

  /* ---------- index ---------- */
  function renderIndex() {
    var shown = 0;
    ['sci', 'soc', 'hum'].forEach(function (d) {
      var host = document.getElementById('rows-' + d);
      var count = document.getElementById('count-' + d);
      var group = document.getElementById('g-' + d);
      var list = PROGRAMS.filter(function (p) {
        return p.div === d && live[d] && (showMinors || p.kind !== 'minor') && matches(p);
      });
      shown += list.length;

      group.style.opacity = live[d] ? '' : '0.45';
      if (!list.length) {
        count.textContent = live[d] ? 'no matches' : 'hidden';
        host.innerHTML = '<p class="empty-note">' + (live[d]
          ? 'No program in this division matches that search.'
          : 'This division is switched off above the chart.') + '</p>';
        return;
      }

      var tally = {};
      list.forEach(function (p) { tally[p.kind] = (tally[p.kind] || 0) + 1; });
      count.textContent = list.length + (query ? ' matching' : '') + ' · ' +
        ['major', 'conc', 'joint', 'minor'].filter(function (k) { return tally[k]; })
          .map(function (k) { return tally[k] + ' ' + (tally[k] === 1 ? KIND_WORD[k].toLowerCase() : KIND_PLURAL[k]); })
          .join(', ');

      list.sort(function (a, b) {
        var ka = a.kind === 'minor' ? 1 : 0, kb = b.kind === 'minor' ? 1 : 0;
        return ka - kb || plainText(a.dept).localeCompare(plainText(b.dept)) ||
               plainText(a.name).localeCompare(plainText(b.name));
      });
      host.innerHTML = list.map(function (p) {
        var start = codeList(stageCodes(p, 0));
        var end = codeList(stageCodes(p, p.path.length - 1));
        return '<button class="entry" type="button" data-div="' + p.div + '" data-goto="' + p.id + '">' +
          '<span class="entry__key"></span>' +
          '<span class="entry__name">' + p.name + '<small>' + p.dept + '</small></span>' +
          '<span class="entry__cell"><em>Starts with</em>' + (start || 'no fixed gateway') + '</span>' +
          '<span class="entry__cell"><em>Ends with</em>' + (end || 'advisor-chosen capstone') + '</span>' +
          '<span class="entry__kind">' + KIND_WORD[p.kind] + '</span>' +
          '</button>';
      }).join('');
    });

    document.getElementById('index-spec').textContent =
      query ? shown + ' of ' + PROGRAMS.length + ' programs match “' + find.value.trim() + '”'
            : shown + ' of ' + PROGRAMS.length + ' programs shown · majors first, then minors';
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('.entry[data-goto]') : null;
    if (!b) return;
    select(b.getAttribute('data-goto'), false);
    scrollToEl(document.querySelector('.chart'));
  });

  /* ---------- readings ---------- */
  function countUp(el2, target) {
    if (reduceMotion.matches) { el2.textContent = target; return; }
    var start = performance.now(), dur = 900;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      el2.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  countUp(document.getElementById('n-programs'), PROGRAMS.length);
  countUp(document.getElementById('n-links'), links.length);
  countUp(document.getElementById('n-cross'), links.filter(function (e) { return e.cross; }).length);
  var nMinors = document.getElementById('n-minors');
  if (nMinors) countUp(nMinors, PROGRAMS.filter(function (p) { return p.kind === 'minor'; }).length);

  /* ---------- viewport framing ----------
   * On a narrow screen the fit-to-width scale drops 16-unit labels below legibility.
   * preserveAspectRatio="meet" always centres the viewBox, so the user-space point at
   * the centre of the visible area is (VW/2, VH/2) whatever the fit. */
  function frameForViewport() {
    var r = svg.getBoundingClientRect();
    if (!r.width) return;
    var fit = Math.min(r.width / VW, r.height / VH);
    var k = fit < 0.45 ? Math.min(4, Math.max(1, 0.46 / fit)) : 1;
    view.k = k;
    if (k > 1.05) {
      var focusX = (BANDS[0].x0 + BANDS[0].x1) / 2 * VW;   /* frame the first band */
      view.x = VW / 2 - k * focusX;
      view.y = VH / 2 - k * (VH / 2);
    } else {
      view.x = 0; view.y = 0;
    }
    applyView();
  }

  /* ---------- go ---------- */
  applyView();
  frameForViewport();
  syncButtons();
  paint();
  renderIndex();
})();
