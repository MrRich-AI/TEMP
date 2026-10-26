/* =========================================================
   PAINT WIPE — TEMP repo transition between slides of DIFFERENT builds
   ---------------------------------------------------------
   1. Brush strokes in the OUTGOING build's colour sweep left → right
      and cover the old slide.
   2. onCover() runs (swap to the incoming slide; may return a Promise).
   3. Strokes in the INCOMING build's colour sweep right → left,
      the incoming build's label is painted in the middle (optional).
   4. An "eraser" brush sweeps left → right and reveals the new slide.

   Usage:
     <script src="../../_shared/paint-wipe/paint-wipe.js"></script>
     PaintWipe.run({
       from:  '#10243e',             // outgoing build colour
       to:    '#3a1f80',             // incoming build colour
       label: 'In-Class Activities', // optional, painted mid-transition
       sub:   'Speaking circle',     // optional second line
       onCover: function(){ showSlide(n); }
     }).then(function(){ ... });

   PaintWipe.busy is true while it runs. Keys and clicks are blocked
   for the ~1.3 s it takes. prefers-reduced-motion → a quick colour fade.
   No images, no libraries: everything is drawn on one canvas.
   ========================================================= */
(function(){
  'use strict';

  var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var N = 6;                      // strokes per pass
  var T_COVER = 340, T_PAINT = 320, T_ERASE = 360, STAGGER = 35;
  var LABEL_HOLD = 380, FADE = 140;

  var PW = { busy:false, run:run };

  /* ---------- helpers ---------- */
  function rnd(seed){ var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function rgb(hex){ hex = String(hex || '#333').replace('#','');
    if (hex.length === 3) hex = hex.replace(/./g, '$&$&');
    var n = parseInt(hex, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function tone(c, f){ return 'rgb(' + c.map(function(v){
    return Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f); }).join(',') + ')'; }
  function lum(c){ return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(t){ return t < 0 ? 0 : t > 1 ? 1 : t; }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  /* ---------- one painted stroke (body + ragged tip), pre-rendered ---------- */
  function makeStroke(color, len, S, sc, seed){
    var r = rnd(seed), c = rgb(color);
    var H = Math.round(S * 1.7), T = Math.round(S * 0.75);
    var top = S * 0.2, bot = S * 1.5;                 // solid core: 1.3 × band height
    function cv(w){ var k = document.createElement('canvas');
      k.width = Math.ceil(w * sc); k.height = Math.ceil(H * sc);
      var x = k.getContext('2d'); x.scale(sc, sc); return [k, x]; }

    // body
    var b = cv(len), bc = b[0], g = b[1], step = 26, x, i;
    g.beginPath(); g.moveTo(0, top);
    for (x = 0; x <= len + step; x += step) g.lineTo(x, top + (r() - .5) * S * .16 + Math.sin(x / 140) * S * .03);
    for (x = len + step; x >= 0; x -= step) g.lineTo(x, bot + (r() - .5) * S * .16 + Math.cos(x / 170) * S * .03);
    g.closePath();
    var own = tone(c, (r() - .5) * .14);              // each stroke a slightly different shade
    var grad = g.createLinearGradient(0, top, 0, bot); // paint thickness: lit top, shaded bottom
    grad.addColorStop(0, tone(c, .1)); grad.addColorStop(.35, own); grad.addColorStop(1, tone(c, -.12));
    g.fillStyle = grad; g.fill();
    g.save(); g.clip();
    for (i = 0; i < 55; i++){                        // bristle streaks
      var y = top + r() * (bot - top), x0 = r() * len, x1 = x0 + len * (.08 + r() * .35);
      g.strokeStyle = tone(c, (r() < .5 ? -1 : 1) * (.05 + r() * .12));
      g.globalAlpha = .12 + r() * .3; g.lineWidth = 1.5 + r() * 6;
      g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + (r() - .5) * 10, x1, y); g.stroke();
    }
    g.restore(); g.globalAlpha = 1;
    for (i = 0; i < 70; i++){                         // dry-brush edges
      var up = r() < .5, ey = up ? top - r() * S * .14 : bot + r() * S * .14;
      var ex = r() * len, el = 30 + r() * 220;
      g.strokeStyle = color; g.globalAlpha = .35 + r() * .5; g.lineWidth = 1 + r() * 2.5;
      g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + el, ey + (r() - .5) * 4); g.stroke();
    }
    g.globalAlpha = 1;

    // tip: bristle "fingers" ending at different lengths
    var t = cv(T), tc = t[0], h = t[1];
    for (y = top - S * .06; y < bot + S * .06; y += 3.2){
      var inCore = y > top + 6 && y < bot - 6;
      var end = inCore ? T * (.35 + r() * .6) : T * (.05 + r() * .3);
      h.strokeStyle = r() < .25 ? tone(c, (r() - .5) * .3) : color;
      h.globalAlpha = inCore ? .85 + r() * .15 : .3 + r() * .4;
      h.lineWidth = 3 + r() * 3; h.lineCap = 'round';
      h.beginPath(); h.moveTo(-2, y); h.lineTo(end, y + (r() - .5) * 3); h.stroke();
    }
    h.globalAlpha = 1; h.fillStyle = color;           // solid root so body + tip join cleanly
    h.fillRect(0, top + S * .04, T * .3, bot - top - S * .08);

    // splatter dots near the edges
    var dots = [];
    for (i = 0; i < 9; i++) dots.push({ x: r(), y: r() < .5 ? top - S * (.1 + r() * .25) : bot + S * (.1 + r() * .25), rad: 2 + r() * 7 });

    return { body: bc, tip: tc, H: H, T: T, dots: dots, tilt: (r() - .5) * .018 };
  }

  /* ---------- a pass = N strokes in one colour, one direction ---------- */
  function makePass(color, W, Hs, sc, seed){
    var S = Hs / N, strokes = [];
    for (var i = 0; i < N; i++){
      var st = makeStroke(color, W + S * 2, S, sc, seed + i * 977);
      st.y = i * S - S * .35; st.S = S; strokes.push(st);
    }
    return { color: color, strokes: strokes };
  }

  function drawStroke(ctx, st, p, W, Hs, rtl){
    if (p <= 0) return;
    var T = st.T, span = W + T * 2, front = -T + p * span, w = Math.max(1, front + T);
    ctx.save();
    ctx.translate(W / 2, Hs / 2); ctx.rotate(st.tilt); ctx.translate(-W / 2, -Hs / 2);
    if (rtl){ ctx.translate(W, 0); ctx.scale(-1, 1); }
    var sw = st.body.width / (W + st.S * 2);          // source px per logical px
    ctx.drawImage(st.body, 0, 0, Math.min(st.body.width, w * sw), st.body.height,
                  -T, st.y, Math.min(W + st.S * 2, w), st.H);
    ctx.drawImage(st.tip, front, st.y, T, st.H);
    for (var i = 0; i < st.dots.length; i++){
      var d = st.dots[i], dx = d.x * W;
      if (dx < front - 20){ ctx.beginPath(); ctx.arc(dx, st.y + d.y, d.rad, 0, 6.283); ctx.fill(); }
    }
    ctx.restore();
  }

  function passProgress(now, start, dur){
    var out = [];
    for (var i = 0; i < N; i++) out.push(easeInOut(clamp((now - start - i * STAGGER) / dur)));
    return out;
  }

  /* ---------- overlay ---------- */
  function makeOverlay(){
    var cvs = document.createElement('canvas');
    cvs.setAttribute('aria-hidden', 'true');
    cvs.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;' +
      'pointer-events:auto;cursor:progress;transition:opacity ' + FADE + 'ms ease';
    document.body.appendChild(cvs);
    return cvs;
  }

  // block keys/clicks while running (capture phase, before the deck's own handlers)
  function blocker(e){ if (PW.busy){ e.preventDefault(); e.stopImmediatePropagation(); } }
  ['keydown', 'keyup', 'keypress'].forEach(function(t){ window.addEventListener(t, blocker, true); });

  /* ---------- reduced motion: plain colour fade ---------- */
  function runReduced(o){
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;opacity:0;transition:opacity 180ms ease;background:' + o.to;
    document.body.appendChild(d);
    return wait(20).then(function(){ d.style.opacity = 1; return wait(200); })
      .then(function(){ return o.onCover && o.onCover(); })
      .then(function(){ d.style.opacity = 0; return wait(200); })
      .then(function(){ d.remove(); });
  }

  /* ---------- main ---------- */
  function run(opts){
    var o = opts || {};
    if (PW.busy) return Promise.resolve(false);
    PW.busy = true;
    if (REDUCED) return runReduced(o).then(done, done);

    var W = window.innerWidth, Hs = window.innerHeight;
    var sc = Math.min(window.devicePixelRatio || 1, 1.25);
    var cvs = makeOverlay(), ctx = cvs.getContext('2d');
    cvs.width = Math.round(W * sc); cvs.height = Math.round(Hs * sc);
    ctx.setTransform(sc, 0, 0, sc, 0, 0);

    var seed = (Date.now() % 100000) + 7;
    var A = makePass(o.from || '#222', W, Hs, sc, seed);
    var B = makePass(o.to || '#444', W, Hs, sc, seed + 31337);
    var E = makePass('#000', W, Hs, sc, seed + 777);   // eraser shape (colour unused)
    var toC = rgb(o.to || '#444'), ink = lum(toC) > .6 ? '#14161f' : '#ffffff';
    var fontF = o.font || '"Source Serif 4", Georgia, serif';

    var tA = 0, durA = T_COVER + STAGGER * (N - 1);
    var tB, durB = T_PAINT + STAGGER * (N - 1), tL, tE, durE = T_ERASE + STAGGER * (N - 1);
    var t0 = performance.now(), phase = 'A', coverDone = false;

    function label(now){
      if (!o.label || tL == null) return;
      var k = easeOut(clamp((now - tL) / 260));
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var big = Math.round(Math.min(W / 14, Hs / 7.5));
      ctx.font = '700 ' + big + 'px ' + fontF;
      ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 18;
      ctx.fillText(o.label, W / 2, Hs / 2 - (o.sub ? big * .35 : 0) + (1 - k) * 24);
      if (o.sub){ ctx.font = '600 ' + Math.round(big * .42) + 'px ' + fontF; ctx.globalAlpha = k * .85;
        ctx.fillText(o.sub, W / 2, Hs / 2 + big * .6 + (1 - k) * 24); }
      ctx.restore();
    }

    function frame(now){
      var t = now - t0;
      ctx.clearRect(0, 0, W, Hs);

      var pA = passProgress(t, tA, T_COVER), i;
      ctx.fillStyle = A.color;
      for (i = 0; i < N; i++) drawStroke(ctx, A.strokes[i], pA[i], W, Hs, false);
      if (tB != null){
        var pB = passProgress(t, tB, T_PAINT);
        ctx.fillStyle = B.color;
        for (i = 0; i < N; i++) drawStroke(ctx, B.strokes[i], pB[i], W, Hs, true);
      }
      label(t);
      if (tE != null){
        var pE = passProgress(t, tE, T_ERASE);
        ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
        for (i = 0; i < N; i++) drawStroke(ctx, E.strokes[i], pE[i], W, Hs, false);
        ctx.restore();
      }

      if (phase === 'A' && t >= durA){
        phase = 'swap';
        Promise.resolve().then(function(){ return o.onCover && o.onCover(); })
          .catch(function(e){ console.error('PaintWipe onCover:', e); })
          .then(function(){ tB = performance.now() - t0; phase = 'B'; });
      } else if (phase === 'B' && t >= tB + durB){
        if (o.label){ tL = t; phase = 'L'; } else { tE = t; phase = 'E'; }
      } else if (phase === 'L' && t >= tL + LABEL_HOLD){
        tE = t; phase = 'E';
      } else if (phase === 'E' && t >= tE + durE){
        phase = 'end';
        cvs.style.opacity = 0;
        return wait(FADE).then(function(){ cvs.remove(); resolveRun(true); });
      }
      requestAnimationFrame(frame);
    }

    var resolveRun;
    var p = new Promise(function(res){ resolveRun = res; });
    requestAnimationFrame(frame);
    return p.then(done, done);
  }

  function done(v){ PW.busy = false; return v === undefined ? true : v; }

  window.PaintWipe = PW;
})();
