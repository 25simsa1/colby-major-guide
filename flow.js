/* ColbyMajorGuide — masthead flow.
 *
 * A domain-warped fractal-noise field in Colby Blue, rendered on the GPU. It reads
 * like ink moving through water without simulating any actual fluid, which keeps it
 * to one small fragment shader instead of a physics solver.
 *
 * It runs behind the title block only. Everything below it is white paper, because
 * the chart is fine hairlines and 101 labels and needs a still, light ground.
 *
 * Bails out to a static CSS gradient when WebGL is unavailable, renders a single
 * frame under prefers-reduced-motion, and stops the loop when scrolled out of view.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('flow');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false,
                                        powerPreference: 'low-power' }) ||
           canvas.getContext('experimental-webgl');
  if (!gl) { canvas.classList.add('is-fallback'); return; }

  var VERT = [
    'attribute vec2 a;',
    'void main(){ gl_Position = vec4(a, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2 u_res;',
    'uniform float u_t;',

    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }',

    'float noise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
    '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
    '}',

    'float fbm(vec2 p){',
    '  float v = 0.0, a = 0.5;',
    '  for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / u_res;',
    '  vec2 p = vec2(uv.x * (u_res.x / u_res.y), uv.y) * 2.6;',
    '  float t = u_t * 0.055;',

    /* two rounds of domain warping: the field drags itself around, which is what
       makes the result curl and sheet like ink rather than churn like static */
    '  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t * 0.9),',
    '                fbm(p + vec2(5.2, 1.3) - t * 0.7));',
    '  vec2 r = vec2(fbm(p + 3.4 * q + vec2(1.7, 9.2) + t * 1.15),',
    '                fbm(p + 3.4 * q + vec2(8.3, 2.8) - t * 0.85));',
    '  float f = fbm(p + 3.6 * r);',

    /* three-stop ramp: near-black navy ground, Colby Blue body, a cooler blue on
       the crests. Kept off pure white so text over it stays readable. */
    '  vec3 deep   = vec3(0.020, 0.043, 0.098);',
    '  vec3 colby  = vec3(0.000, 0.129, 0.412);',
    '  vec3 crest  = vec3(0.235, 0.529, 0.937);',

    '  float body = smoothstep(0.24, 0.72, f);',
    '  vec3 col = mix(deep, colby, body);',

    /* highlights ride the warp magnitude, so they sit on the folds */
    '  float edge = smoothstep(0.42, 0.98, length(r) * 1.25);',
    '  col = mix(col, crest, edge * 0.85);',

    /* fade the whole field toward the ground at the bottom so the band meets the
       white page below it without a hard seam */
    '  col *= smoothstep(-0.35, 0.30, uv.y);',

    /* a little grain kills the banding that smooth gradients show on wide screens */
    '  col += (hash(gl_FragCoord.xy) - 0.5) * 0.014;',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('flow: shader failed', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.classList.add('is-fallback'); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.classList.add('is-fallback'); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uT = gl.getUniformLocation(prog, 'u_t');

  /* the field is low-frequency, so it survives being rendered well under device
     resolution — which is most of the performance story on a retina laptop */
  var SCALE = 0.55, MAX_DPR = 1.5;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * SCALE;
    var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  function draw(t) {
    gl.uniform1f(uT, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visible = true, running = false, raf = 0;
  var start = 0, last = 0;
  var FRAME = 1000 / 30;             /* 30fps is plenty for something this slow */

  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    last = now;
    if (!start) start = now;
    draw((now - start) / 1000);
  }

  function play() {
    if (running || reduce.matches || !visible) return;
    running = true; last = 0;
    raf = requestAnimationFrame(loop);
  }
  function pause() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function still() { resize(); draw(12.0); }   /* one composed frame, no motion */

  resize();
  still();

  if (!reduce.matches) play();
  reduce.addEventListener('change', function () {
    if (reduce.matches) { pause(); still(); } else play();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) play(); else pause();
    }, { threshold: 0 }).observe(canvas);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause(); else play();
  });

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (!running) still(); }, 150);
  });
})();
