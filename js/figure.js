/* PRIME27 — moteur du mannequin.
 * Squelette articulé (cinématique inverse pour bras et jambes) résolu dans le plan du mouvement,
 * puis placé en 3D et vu de trois quarts (45°), habillé, avec visage, accessoires et décor animé.
 *
 * Repère d'une pose : x horizontal, y vers le haut, sol à y = 0, scène centrée sur x = 120.
 * Type 's' : mouvement de profil (le corps regarde vers +x) — type 'f' : mouvement de face.
 *
 * Pose : { h:[x,y] hanche, l: inclinaison du buste (deg, + = vers l'avant),
 *          d: tête (deg, + = menton rentré), a:[bras 0, bras 1],
 *          f:[[x,y,angle],[x,y,angle]] chevilles, ts:[1,1] raccourci des cuisses (type 'f') }
 * Bras : [a1,a2] = angles (épaule, coude) ; [x,y,0] = main relative à l'épaule ;
 *        [x,y,1] = main en coordonnées absolues ; [x,y,2] = main dans le repère du buste.
 */
(function (G) {
  'use strict';

  var TH = 37, SH = 36, TO = 43, UA = 25, FA = 23, NK = 7.5, HR = 9.5, SHW = 15.5, HPW = 8.5;
  var D = Math.PI / 180, TAU = Math.PI * 2;
  var VW = 240, VH = 214, GY = 25, CX = 120, PIT = 0.22;

  // ---------- poses
  function mix(a, b, u) {
    if (typeof a === 'number') return a + (b - a) * u;
    var r = new Array(a.length);
    for (var i = 0; i < a.length; i++) r[i] = mix(a[i], b[i], u);
    return r;
  }
  function armPair(a) { return typeof a[0] === 'number' ? [a.slice(), a.slice()] : [a[0].slice(), a[1].slice()]; }
  function foot(f) { return f.length < 3 ? [f[0], f[1], 0] : f; }
  function norm(p) {
    return { h: p.h, l: p.l || 0, d: p.d || 0, a: armPair(p.a || [0, 6]), f: [foot(p.f[0]), foot(p.f[1])], ts: p.ts || [1, 1], x: p.x || 0 };
  }
  function mixPose(A, B, u) {
    return { h: mix(A.h, B.h, u), l: mix(A.l, B.l, u), d: mix(A.d, B.d, u), a: mix(A.a, B.a, u), f: mix(A.f, B.f, u), ts: mix(A.ts, B.ts, u), x: mix(A.x, B.x, u) };
  }
  function ease(u, k) {
    if (k === 'l') return u;
    if (k === 'i') return u * u;
    if (k === 'o') return 1 - (1 - u) * (1 - u);
    return u * u * (3 - 2 * u);
  }
  function prep(ex) {
    if (ex.k && !ex._k) {
      ex._k = ex.k.map(norm);
      ex._T = 0;
      for (var i = 0; i < ex.t.length; i++) ex._T += ex.t[i];
    }
  }
  function period(ex) { prep(ex); return ex.fn ? (ex.per || 2) : ex._T; }
  function sample(ex, t) {
    if (ex.fn) return norm(ex.fn(t));
    prep(ex);
    var K = ex._k, T = ex.t, tt = ((t % ex._T) + ex._T) % ex._T;
    for (var i = 0; i < K.length; i++) {
      if (tt < T[i]) return mixPose(K[i], K[(i + 1) % K.length], ease(tt / T[i], ex.e ? ex.e.charAt(i) : (ex.lin ? 'l' : 's')));
      tt -= T[i];
    }
    return K[0];
  }
  function stillTime(ex) {
    if (ex.th != null) return ex.th;
    return ex.fn ? 0.35 : ex.t[0];
  }

  // ---------- cinématique (dans le plan du mouvement)
  function ik(ax, ay, bx, by, l1, l2, sg) {
    var dx = bx - ax, dy = by - ay, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.001) { dx = 0.001; dy = 0; d = 0.001; }
    var mx = l1 + l2 - 0.02, mn = Math.abs(l1 - l2) + 0.02;
    var dd = d < mn ? mn : (d > mx ? mx : d);
    var ux = dx / d, uy = dy / d;
    var a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
    var h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return [ax + ux * a - uy * h * sg, ay + uy * a + ux * h * sg, ax + ux * dd, ay + uy * dd];
  }
  function pick(a, bx, by, l1, l2, front, sg, cx, sideSign, flip) {
    if (!front) return ik(a[0], a[1], bx, by, l1, l2, flip ? -sideSign : sideSign);
    var r1 = ik(a[0], a[1], bx, by, l1, l2, 1), r2 = ik(a[0], a[1], bx, by, l1, l2, -1);
    var out = (r1[0] - cx) * sg >= (r2[0] - cx) * sg ? r1 : r2;
    return flip ? (out === r1 ? r2 : r1) : out;
  }
  function solve(p, front, ex) {
    var L = p.l * D, tx = Math.sin(L), ty = Math.cos(L), fx = ty, fy = -tx;
    var hx = p.h[0], hy = p.h[1], sx = hx + tx * TO, sy = hy + ty * TO;
    var HA = (p.l + p.d) * D, ux = Math.sin(HA), uy = Math.cos(HA);
    var J = {
      hip: [hx, hy, 0], sh: [sx, sy, 0], t: [tx, ty],
      head: [sx + ux * (NK + HR), sy + uy * (NK + HR), 0], hu: [ux, uy],
      S: [], E: [], W: [], H: [], K: [], A: [], fa: [], x: p.x
    };
    // demi-écart des mains en profondeur (type 's') : serré si les deux mains tiennent le même objet
    var hw = ex.hw, P = ex.p || [], k;
    if (hw == null) {
      hw = 14.5;
      for (k = 0; k < P.length; k++) {
        if (P[k][0] === 'kb' || P[k][0] === 'ball' || P[k][0] === 'db1') hw = 4.5;
        else if (P[k][0] === 'rower' || P[k][0] === 'bike') hw = 8.5;
        else if (P[k][0] === 'ski') hw = 11;
      }
    }
    for (var i = 0; i < 2; i++) {
      var sg = i === 0 ? 1 : -1, m = front ? sg : 0, fsg = front ? sg : 1;
      var S = [sx + fx * SHW * m, sy + fy * SHW * m, front ? 0 : sg * SHW];
      var Hp = [hx + fx * HPW * m, hy + fy * HPW * m, front ? 0 : sg * HPW];
      var a = p.a[i], E, W, r;
      if (a.length === 2) {
        var a1 = a[0] * D, a2 = (a[0] + a[1]) * D;
        E = [S[0] + fsg * Math.sin(a1) * UA, S[1] - Math.cos(a1) * UA];
        W = [E[0] + fsg * Math.sin(a2) * FA, E[1] - Math.cos(a2) * FA];
      } else {
        var wx, wy, md = Math.round(a[2]);
        if (md === 1) { wx = a[0]; wy = a[1]; }
        else if (md === 2) { wx = S[0] + a[0] * fsg * fx + a[1] * tx; wy = S[1] + a[0] * fsg * fy + a[1] * ty; }
        else { wx = S[0] + a[0] * fsg; wy = S[1] + a[1]; }
        r = pick(S, wx, wy, UA, FA, front, sg, sx, -1, ex.ef && ex.ef[i]);
        E = [r[0], r[1]]; W = [r[2], r[3]];
      }
      E[2] = front ? 2 : sg * Math.max(hw, 14); W[2] = front ? 4 : sg * hw;
      J.S[i] = S; J.E[i] = E; J.W[i] = W; J.H[i] = Hp;
      var ft = p.f[i];
      r = pick(Hp, ft[0], ft[1], TH * p.ts[i], SH, front, sg, hx, 1, ex.kf && ex.kf[i]);
      J.K[i] = [r[0], r[1], front ? (1 - p.ts[i]) * 22 : sg * 9.5];
      J.A[i] = [r[2], r[3], front ? 0 : sg * 10];
      J.fa[i] = ft[2] || 0;
    }
    return J;
  }

  // ---------- couleurs
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function shade(hex, k) { var c = rgb(hex); return 'rgb(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ')'; }
  function alpha(hex, a) { var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  // ---------- décor
  // polygone convexe arrondi (contour d'un trait épais), sert au buste et à ses motifs
  function roundPoly(ctx, pts, r) {
    var n = pts.length, area = 0, i;
    for (i = 0; i < n; i++) { var p = pts[i], q = pts[(i + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; }
    var sg = area >= 0 ? 1 : -1;
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n], c = pts[(i + 2) % n];
      var dx = b[0] - a[0], dy = b[1] - a[1], l1 = Math.sqrt(dx * dx + dy * dy) || 1;
      var ex = c[0] - b[0], ey = c[1] - b[1], l2 = Math.sqrt(ex * ex + ey * ey) || 1;
      var nx = sg * dy / l1, ny = -sg * dx / l1, mx = sg * ey / l2, my = -sg * ex / l2;
      if (i === 0) ctx.moveTo(a[0] + nx * r, a[1] + ny * r);
      ctx.lineTo(b[0] + nx * r, b[1] + ny * r);
      ctx.arc(b[0], b[1], r, Math.atan2(ny, nx), Math.atan2(my, mx), sg < 0);
    }
    ctx.closePath();
  }

  // fin de bloc : lueur rouge, flammes et braises au pied de la scène
  function drawHeat(ctx, w, h, bt, heat) {
    var t = bt < 0 ? 0 : bt, k, u = Math.max(1, w / 360);
    var g = ctx.createLinearGradient(0, h, 0, h * 0.2);
    g.addColorStop(0, 'rgba(255,80,10,' + (0.6 * heat).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,80,10,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(30,0,0,' + (0.32 * heat).toFixed(3) + ')'; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    var n = 9, fw = w / n;
    for (k = 0; k <= n; k++) {
      var x = k * fw, fh = h * heat * (0.17 + 0.09 * Math.sin(t * 7 + k * 1.7) + 0.05 * Math.sin(t * 13 + k)), sw = Math.sin(t * 5 + k) * fw * 0.25;
      var fg = ctx.createLinearGradient(0, h, 0, h - fh);
      fg.addColorStop(0, 'rgba(255,205,70,0.85)'); fg.addColorStop(0.45, 'rgba(255,100,20,0.6)'); fg.addColorStop(1, 'rgba(200,20,10,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(x - fw * 0.75, h);
      ctx.quadraticCurveTo(x - fw * 0.5, h - fh * 0.55, x + sw, h - fh);
      ctx.quadraticCurveTo(x + fw * 0.5, h - fh * 0.55, x + fw * 0.75, h); ctx.closePath(); ctx.fill();
    }
    for (k = 0; k < 24; k++) {
      var p = (t * (0.18 + (k % 5) * 0.05) + k * 0.137) % 1, ex2 = ((k * 0.383) % 1) * w + Math.sin(t * 2 + k) * w * 0.02;
      ctx.fillStyle = 'rgba(255,' + (140 + (k % 3) * 40) + ',40,' + (heat * (1 - p) * 0.9).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(ex2, h * (1 - p), (1 + (k % 3)) * u, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function backdrop(ctx, w, h, tint, bt, calm, heat) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1d4050'); g.addColorStop(0.62, '#13313d'); g.addColorStop(1, '#0b1c24');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    var pulse = bt < 0 ? 0.5 : 0.5 + 0.5 * Math.sin(bt * (calm ? 0.9 : 2.1));
    var rg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.6);
    rg.addColorStop(0, alpha(tint, 0.2 + 0.1 * pulse)); rg.addColorStop(1, alpha(tint, 0));
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    if (heat > 0) drawHeat(ctx, w, h, bt, heat);
    if (bt < 0) return;
    // faisceaux de lumière qui balayent lentement la scène
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (var k = 0; k < 2; k++) {
      var x0 = (((bt * (calm ? 0.025 : 0.05) + k * 0.55) % 1.5) - 0.25) * w, bw = w * (0.12 + k * 0.08), sk = h * 0.42;
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + bw, 0); ctx.lineTo(x0 + bw - sk, h); ctx.lineTo(x0 - sk, h); ctx.closePath(); ctx.fill();
    }
  }
  function floor(ctx, tint, bt, calm) {
    var R = 104, ry = R * PIT, k;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.ellipse(CX, 0, R, ry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = alpha(tint, 0.6); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(CX, 0, R, ry, 0, 0, TAU); ctx.stroke();
    if (bt < 0) return;
    // ondes qui partent du centre, au rythme de la phase
    for (k = 0; k < 2; k++) {
      var ph = (bt * (calm ? 0.22 : 0.55) + k * 0.5) % 1, r = 26 + 78 * ph;
      ctx.strokeStyle = alpha(tint, (1 - ph) * 0.55); ctx.lineWidth = 1.8 - ph;
      ctx.beginPath(); ctx.ellipse(CX, 0, r, r * PIT, 0, 0, TAU); ctx.stroke();
    }
    // graduations tournantes du plateau
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    for (k = 0; k < 24; k++) {
      var a = k * TAU / 24 + bt * (calm ? 0.06 : 0.16), ca = Math.cos(a), sa = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(CX + 95 * ca, 95 * PIT * sa); ctx.lineTo(CX + 101 * ca, 101 * PIT * sa); ctx.stroke();
    }
    // poussières lumineuses
    for (k = 0; k < 14; k++) {
      var pp = (bt * (0.03 + (k % 5) * 0.011) * (calm ? 0.6 : 1) + k * 0.137) % 1;
      ctx.fillStyle = k % 2 ? alpha(tint, Math.sin(Math.PI * pp) * 0.6) : 'rgba(255,255,255,' + (Math.sin(Math.PI * pp) * 0.4).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(10 + (k * 53.7) % 220 + 5 * Math.sin(bt * 0.7 + k), 6 + pp * 176, 0.8 + (k % 3) * 0.45, 0, TAU); ctx.fill();
    }
  }

  // ---------- rendu d'une image
  function render(ctx, w, h, ex, t, o) {
    o = o || {};
    var L = o.look || {}, heat = o.heat || 0;
    var shirt = L.shirt || o.shirt || '#f2543f', tint = o.tint || o.shirt || '#f2543f', bt = o.bg === 'full' ? (o.bgt || 0) : -1;
    if (heat > 0.45) tint = '#ff5a1f';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    backdrop(ctx, w, h, tint, bt, o.calm, heat);
    var s = Math.min(w / VW, h / VH), ox = (w - VW * s) / 2, oy = h - (h - VH * s) / 2 - GY * s;
    if (o.focus === 'head') { s = Math.min(w, h) / 44; ox = w / 2 - CX * s; oy = h / 2 + 134 * s; }
    ctx.setTransform(s, 0, 0, -s, ox, oy);
    if (o.focus !== 'head') floor(ctx, tint, bt, o.calm);

    var front = ex.v === 'f';
    var yaw = (ex.yaw != null ? ex.yaw : (front ? -40 : 45)) * D, c = Math.cos(yaw), sn = Math.sin(yaw), ac = Math.abs(c);
    // projection : rotation autour de la verticale, puis légère plongée
    function P(p) { var u = p[0] - CX, ww = p[2] || 0, d = u * sn + ww * c; return [CX + u * c - ww * sn, p[1] - d * PIT, d]; }

    var skin = L.skin || '#e6c3ab', shorts = L.shorts || '#eef2f2', shoe = L.shoe || '#f5f7f7';
    var C = {
      skin: skin, skinF: shade(skin, 0.86), nose: shade(skin, 0.93), hair: L.hair || '#35261f', ink: L.eye || '#1d1512', mouth: shade(skin, 0.7),
      shirt: shirt, shirtF: shade(shirt, 0.74), shorts: shorts, shortsF: shade(shorts, 0.82),
      shoe: shoe, shoeF: shade(shoe, 0.84), sole: L.sole || tint,
      iron: '#0c171d', iron2: '#2c4a59', steel: '#b9c7ce', steelD: '#8196a0', rim: 'rgba(255,255,255,0.3)',
      boxT: '#44707f', boxX: '#2e5362', boxW: '#213f4c', mat: 'rgba(255,255,255,0.08)'
    };
    var p = sample(ex, t), J = solve(p, front, ex), Pr = ex.p || [], i, q;
    var near = front ? 1 : 0, far = 1 - near;

    function cap(a, r1, b, r2, col) {
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / d, ny = dx / d;
      ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(a[0] + nx * r1, a[1] + ny * r1); ctx.lineTo(b[0] + nx * r2, b[1] + ny * r2);
      ctx.lineTo(b[0] - nx * r2, b[1] - ny * r2); ctx.lineTo(a[0] - nx * r1, a[1] - ny * r1);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(a[0], a[1], r1, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(b[0], b[1], r2, 0, TAU); ctx.fill();
    }
    function line(a, b, lw, col) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    function disc(a, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(a[0], a[1], r, 0, TAU); ctx.fill(); }
    function ell(a, rx, ry, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(a[0], a[1], rx, ry, 0, 0, TAU); ctx.fill(); }
    function ellS(a, rx, ry, lw, col) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(a[0], a[1], rx, ry, 0, 0, TAU); ctx.stroke(); }
    function quad(a, b, cc, d, col, stroke) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(cc[0], cc[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.8; ctx.lineJoin = 'round'; ctx.stroke(); }
    }
    function cuboid(x0, x1, y0, y1, w0, w1, cT, cX, cW) {
      quad(P([x1, y0, w0]), P([x1, y1, w0]), P([x1, y1, w1]), P([x1, y0, w1]), cX);
      quad(P([x0, y0, w1]), P([x1, y0, w1]), P([x1, y1, w1]), P([x0, y1, w1]), cW);
      quad(P([x0, y1, w0]), P([x1, y1, w0]), P([x1, y1, w1]), P([x0, y1, w1]), cT);
    }
    // roue ou disque vertical, dans le plan du mouvement
    function wheel(pt, r, fill) { ell(pt, r * ac + 1.2, r, fill); ellS(pt, r * 0.66 * ac + 0.8, r * 0.66, 1.1, C.rim); disc(pt, 2.3, C.steel); }
    function mid3() { return [(J.W[0][0] + J.W[1][0]) / 2, (J.W[0][1] + J.W[1][1]) / 2, 0]; }
    function unit2(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1; return [dx / d, dy / d]; }

    // ombre au sol
    var g0 = P([J.A[0][0], 0, J.A[0][2]]), g1 = P([J.A[1][0], 0, J.A[1][2]]), g2 = P([J.hip[0], 0, 0]), g3 = P([J.sh[0], 0, 0]);
    var gx0 = Math.min(g0[0], g1[0], g2[0], g3[0]), gx1 = Math.max(g0[0], g1[0], g2[0], g3[0]);
    ell([(gx0 + gx1) / 2, (g0[1] + g1[1] + g2[1]) / 3 - 1], (gx1 - gx0) / 2 + 13, 5.5, 'rgba(0,0,0,0.3)');

    // ----- corps
    function leg(k) {
      var f = k === far, sk = f ? C.skinF : C.skin, st = f ? C.shortsF : C.shorts, sh = f ? C.shoeF : C.shoe;
      var H = P(J.H[k]), K = P(J.K[k]), A = P(J.A[k]), a = J.A[k], heel, toe, s1, s2;
      cap(K, 5.2, A, 3.7, sk); cap(H, 7, K, 5.4, sk);
      cap(H, 7.7, [H[0] + (K[0] - H[0]) * 0.52, H[1] + (K[1] - H[1]) * 0.52], 6.8, st);
      if (front) {
        var sg = k === 0 ? 1 : -1;
        heel = P([a[0], a[1] - 1.9, -3]); toe = P([a[0] + sg * 2.5, a[1] - 2.5, 10]);
        s1 = P([a[0], a[1] - 4.6, -5]); s2 = P([a[0] + sg * 2.8, a[1] - 4.6, 11.5]);
      } else {
        var an = J.fa[k] * D, cc = Math.cos(an), ss = Math.sin(an);
        var L = function (x, y) { return P([a[0] + x * cc - y * ss, a[1] + x * ss + y * cc, a[2]]); };
        heel = L(-3.4, -1.7); toe = L(10, -2.3); s1 = L(-5.4, -4.5); s2 = L(11.4, -4.5);
      }
      cap(heel, 3.3, toe, 2.7, sh); line(s1, s2, 1.5, C.sole);
    }
    function arm(k) {
      var f = k === far, sk = f ? C.skinF : C.skin, S = P(J.S[k]), E = P(J.E[k]), W = P(J.W[k]);
      cap(S, 5, E, 4.3, sk); cap(E, 4.1, W, 3.3, sk); disc(W, 3.7, sk);
      if (!L.tank) cap(S, 6, [S[0] + (E[0] - S[0]) * 0.5, S[1] + (E[1] - S[1]) * 0.5], 5.4, f ? C.shirtF : C.shirt);
    }
    function neck() {
      var a = P(J.sh), b = P(J.head);
      cap(a, 3.8, [a[0] + (b[0] - a[0]) * 0.6, a[1] + (b[1] - a[1]) * 0.6], 3.6, C.skinF);
    }
    function torso() {
      var t2 = J.t, k;
      function up(pt, kk) { return P([pt[0] + t2[0] * kk, pt[1] + t2[1] * kk, pt[2]]); }
      function lerp(p, q, u2) { return [p[0] + (q[0] - p[0]) * u2, p[1] + (q[1] - p[1]) * u2]; }
      line(up(J.H[far], -1), up(J.H[near], -1), 16, C.shorts);
      var a = P(J.S[0]), b = P(J.S[1]), c2 = up(J.H[1], 7), d2 = up(J.H[0], 7), pts = [a, b, c2, d2], pat = L.pattern;
      if (pat === 'neon') { roundPoly(ctx, pts, 7.7); ctx.fillStyle = L.accent || '#3ff2e0'; ctx.fill(); }
      roundPoly(ctx, pts, 6.5);
      if (pat === 'gradient') {
        var g0 = lerp(d2, c2, 0.5), g1 = lerp(a, b, 0.5), gg = ctx.createLinearGradient(g0[0], g0[1], g1[0], g1[1]);
        gg.addColorStop(0, C.shirt); gg.addColorStop(1, L.shirt2 || C.shirt); ctx.fillStyle = gg;
      } else ctx.fillStyle = C.shirt;
      ctx.fill();
      if (!pat || pat === 'gradient' || pat === 'neon') return;
      ctx.save(); ctx.clip();
      function at2(u2, v2) { return lerp(lerp(d2, a, v2), lerp(c2, b, v2), u2); }
      if (pat === 'stripe') {
        line(at2(-0.4, 0.66), at2(1.4, 0.66), 4.2, L.accent); line(at2(-0.4, 0.52), at2(1.4, 0.52), 1.8, L.accent);
      } else if (pat === 'camo') {
        var cols = ['#3d4a26', '#7c7448', '#2c3320', '#8a8a5a'];
        for (k = 0; k < 10; k++) ell(at2(((k * 0.37) % 1) * 1.2 - 0.1, ((k * 0.61) % 1) * 1.2 - 0.1), 3.5 + (k % 3) * 1.6, 2.4 + (k % 2) * 1.5, cols[k % 4]);
      } else if (pat === 'lava') {
        var fl = bt < 0 ? 0.8 : 0.65 + 0.35 * Math.sin(bt * 5);
        ctx.globalCompositeOperation = 'lighter';
        for (k = 0; k < 3; k++) {
          var x0 = 0.2 + k * 0.3, pa = [at2(x0, -0.1), at2(x0 + 0.12, 0.25), at2(x0 - 0.08, 0.5), at2(x0 + 0.1, 0.78), at2(x0, 1.1)];
          for (var j = 0; j < pa.length - 1; j++) {
            line(pa[j], pa[j + 1], 3, 'rgba(255,90,20,' + (0.3 * fl).toFixed(3) + ')');
            line(pa[j], pa[j + 1], 1.1, 'rgba(255,190,60,' + fl.toFixed(3) + ')');
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      } else if (pat === 'gold') {
        var f2 = bt < 0 ? 0.45 : ((bt * 0.35) % 1.8) - 0.4;
        line(at2(f2 - 0.25, -0.2), at2(f2 + 0.15, 1.2), 5, 'rgba(255,248,214,0.45)');
        line(at2(f2 + 0.05, -0.2), at2(f2 + 0.3, 1.2), 1.6, 'rgba(255,248,214,0.35)');
      }
      ctx.restore();
    }    function head() {
      var hd = J.head, u = J.hu, up = [u[0], u[1], 0], fr, sd, st = L.style || 'short', wear = L.wear, k, th, rr;
      if (front) { fr = [0, 0, 1]; sd = [u[1], -u[0], 0]; } else { fr = [u[1], -u[0], 0]; sd = [0, 0, 1]; }
      function at(a, b, kk) { return P([hd[0] + HR * (a * fr[0] + b * up[0] + kk * sd[0]), hd[1] + HR * (a * fr[1] + b * up[1] + kk * sd[1]), HR * (a * fr[2] + kk * sd[2])]); }
      // > 0 : la direction (a vers l'avant, kk vers le côté) regarde la caméra
      function dep(a, kk) { return a * (fr[0] * sn + fr[2] * c) + kk * (sd[0] * sn + sd[2] * c); }
      function ringAt(b, wdt, col) {
        var r2 = Math.sqrt(Math.max(0, 1 - b * b)) * 1.04, n = 28, i, t0, t1;
        for (i = 0; i < n; i++) {
          t0 = i * TAU / n; t1 = (i + 1) * TAU / n;
          if (dep(Math.cos((t0 + t1) / 2), Math.sin((t0 + t1) / 2)) < -0.12) continue;
          line(at(Math.cos(t0) * r2, b, Math.sin(t0) * r2), at(Math.cos(t1) * r2, b, Math.sin(t1) * r2), wdt, col);
        }
      }
      function crest(r, lift, col) {
        var pr = null, i, aa, pt;
        for (i = 0; i <= 8; i++) { aa = 0.6 - i * 0.19; pt = at(aa, Math.sqrt(Math.max(0, 1 - aa * aa)) + lift, 0); if (pr) cap(pr, r, pt, r, col); pr = pt; }
      }
      var facing = dep(1, 0), hairC = at(-0.07, 0.08, 0), faceC = at(0.24, -0.2, 0);
      // silhouette de la tête (crâne + visage) pour contenir cheveux, barbe et casquette
      function clipHead() {
        ctx.beginPath();
        ctx.arc(hairC[0], hairC[1], HR * 1.07, 0, TAU);
        ctx.moveTo(faceC[0] + HR * 0.86, faceC[1]);
        ctx.arc(faceC[0], faceC[1], HR * 0.86, 0, TAU);
        ctx.clip();
      }
      var helmet = wear === 'helmet', capOn = wear === 'cap', bald = st === 'bald' || st === 'mohawk';
      var capc = L.capc || '#1f3a6b', skinBase = L.skin || '#e6c3ab';
      var hairCol = helmet ? '#b07a2e' : capOn ? capc : (bald ? C.skin : C.hair), hairR = HR * (helmet || capOn ? 1.06 : 1);
      function brim() {
        poly([at(0.55, 0.44, -0.82), at(1.42, 0.3, -0.66), at(1.74, 0.24, 0), at(1.42, 0.3, 0.66), at(0.55, 0.44, 0.82)], shade(capc, 0.78));
      }
      var back = [];
      if (st === 'pony') back.push([dep(-1, 0), function () { cap(at(-0.9, 0.3, 0), 2.9, at(-1.5, -0.8, 0), 1.6, C.hair); disc(at(-0.95, 0.3, 0), 1.7, L.tie || '#e8402a'); }]);
      if (st === 'bun') back.push([dep(-0.7, 0), function () { disc(at(-0.72, 0.8, 0), 3.9, C.hair); }]);
      if (capOn) back.push([facing + 0.3, brim]);
      back.forEach(function (b2) { if (b2[0] <= 0) b2[1](); });
      if (st === 'afro') {
        var ac2 = at(-0.1, 0.24, 0);
        disc(ac2, HR * 1.28, C.hair);
        for (k = 0; k < 16; k++) { th = k * TAU / 16; disc([ac2[0] + Math.cos(th) * HR * 1.25, ac2[1] + Math.sin(th) * HR * 1.25], 2.5, C.hair); }
      }
      if (facing < -0.2) { disc(faceC, HR * 0.86, C.skin); disc(hairC, hairR, hairCol); }
      else {
        disc(hairC, hairR, hairCol);
        if (capOn) { ctx.save(); clipHead(); disc(at(-0.72, -0.45, 0), HR * 0.55, C.hair); ctx.restore(); }
        disc(faceC, HR * 0.86, C.skin);
      }
      // ligne des cheveux sur le front
      if (!bald && !helmet && !capOn && facing > -0.2) {
        ctx.save(); clipHead();
        disc(at(0.16, 0.98, 0), HR * 0.6, C.hair);
        if (st === 'short' || st === 'afro') disc(at(0.52, 0.82, 0.28), HR * 0.38, C.hair);
        ctx.restore();
      }
      // casquette : panneau avant, bouton, logo
      if (capOn && facing > -0.2) {
        ctx.save(); clipHead();
        disc(at(0.3, 0.95, 0), HR * 0.64, capc);
        ctx.restore();
        line(at(0.55, 0.44, -0.8), at(0.55, 0.44, 0.8), 0.9, shade(capc, 0.6));
        if (facing > 0.25) disc(at(0.88, 0.66, 0), 1.35, L.logo || '#ffd23f');
      }
      if (capOn) disc(at(-0.05, 1.05, 0), 1.1, shade(capc, 0.7));
      if (bald && facing > -0.6) ell(at(0.05, 0.8, 0.22), 2.8, 1.5, 'rgba(255,255,255,0.18)');
      back.forEach(function (b2) { if (b2[0] > 0) b2[1](); });
      if (!helmet) for (k = -1; k <= 1; k += 2) if (dep(-0.1, k) > 0.3) { disc(at(-0.06, -0.14, k * 0.9), 2.1, C.skinF); disc(at(-0.02, -0.14, k * 0.92), 0.9, shade(skinBase, 0.72)); }
      // barbe : favoris, mâchoire et menton, puis moustache
      if (L.beard && facing > -0.35) {
        ctx.save(); clipHead();
        for (k = -1; k <= 1; k += 2) if (dep(0.2, k * 0.8) > -0.25) {
          cap(at(0.02, 0.02, k * 0.95), 1.5, at(0.32, -0.6, k * 0.74), 2.4, L.beard);
          cap(at(0.32, -0.6, k * 0.74), 2.4, at(0.8, -0.9, k * 0.24), 3, L.beard);
        }
        disc(at(0.82, -0.9, 0), 3.2, L.beard);
        ctx.restore();
      }
      if (facing > -0.45) disc(at(1.1, -0.24, 0), 1.6, facing > 0.45 ? C.nose : C.skin);
      if (L.beard && facing > 0.05) {
        cap(at(1.02, -0.42, -0.34), 0.9, at(1.05, -0.38, 0), 1.2, L.beard);
        cap(at(1.05, -0.38, 0), 1.2, at(1.02, -0.42, 0.34), 0.9, L.beard);
        if (facing > 0.25) line(at(1.0, -0.6, -0.13), at(1.0, -0.6, 0.13), 0.9, C.mouth);
      }
      var brow = bald || capOn ? shade(skinBase, 0.5) : C.hair;
      if (capOn && L.hair) brow = L.hair;
      for (k = -1; k <= 1; k += 2) if (dep(0.8, k * 0.42) > 0.14) {
        ell(at(0.84, 0.04, k * 0.4), 1.45, 1.1, '#f6f2ec');
        disc(at(0.93, 0.03, k * 0.37), 0.85, C.ink);
        line(at(0.8, 0.37, k * 0.62), at(0.9, 0.31, k * 0.17), 1.15, brow);
      }
      if (facing > 0.2 && !L.beard) {
        var m0 = at(0.96, -0.55, -0.22), m1 = at(0.99, -0.61, 0), m2 = at(0.96, -0.55, 0.22);
        line(m0, m1, 1, C.mouth); line(m1, m2, 1, C.mouth);
      }
      if (st === 'mohawk') crest(2.5, 0.06, L.crest || C.hair);
      if (L.band) ringAt(0.42, 2.6, L.band);
      if (helmet) { ringAt(0.36, 2.2, '#8a5a1e'); crest(3, 0.22, '#c0282a'); }
      if (wear === 'laurel') {
        ringAt(0.46, 1.4, '#6f8a2a');
        for (k = 0; k < 16; k++) {
          th = k * TAU / 16;
          if (dep(Math.cos(th), Math.sin(th)) < 0) continue;
          disc(at(Math.cos(th) * 0.95, 0.46 + (k % 2 ? 0.09 : -0.07), Math.sin(th) * 0.95), 1.6, k % 2 ? '#e0b83c' : '#a6be4a');
        }
      }
      if (wear === 'crown') {
        ringAt(0.6, 2.3, '#e0b13c');
        for (k = 0; k < 8; k++) {
          th = k * TAU / 8 + TAU / 16; rr = 0.84;
          if (dep(Math.cos(th), Math.sin(th)) < -0.05) continue;
          var bp = at(Math.cos(th) * rr, 0.6, Math.sin(th) * rr), tp = at(Math.cos(th) * rr * 0.95, 1.12, Math.sin(th) * rr * 0.95);
          line(bp, tp, 1.8, '#e0b13c'); disc(tp, 1.05, k % 2 ? '#e8402a' : '#3fa9f5');
        }
      }
      if (wear === 'horns') for (k = -1; k <= 1; k += 2) {
        var h0 = at(0.2, 0.78, k * 0.5), h1 = at(0.05, 1.22, k * 0.86), h2 = at(-0.2, 1.55, k * 0.98);
        cap(h0, 2.3, h1, 1.5, '#6e0f0f'); cap(h1, 1.5, h2, 0.5, '#9a1d16');
      }
      if (wear === 'halo') {
        var fl = bt < 0 ? 1 : 0.75 + 0.25 * Math.sin(bt * 6), hp = [], n2 = 26;
        for (k = 0; k <= n2; k++) { th = k * TAU / n2; hp.push(at(Math.cos(th) * 0.78, 1.62, Math.sin(th) * 0.78)); }
        ctx.globalCompositeOperation = 'lighter';
        for (k = 0; k < n2; k++) line(hp[k], hp[k + 1], 3.8, 'rgba(255,120,30,' + (0.35 * fl).toFixed(3) + ')');
        for (k = 0; k < n2; k++) line(hp[k], hp[k + 1], 1.3, 'rgba(255,214,90,' + fl.toFixed(3) + ')');
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    function poly(pts, col) {
      ctx.fillStyle = col; ctx.beginPath();
      for (var i = 0; i < pts.length; i++) { if (i) ctx.lineTo(pts[i][0], pts[i][1]); else ctx.moveTo(pts[i][0], pts[i][1]); }
      ctx.closePath(); ctx.fill();
    }
    // ----- accessoires
    function dumbbell(ct, mode, f2) {
      var ax = mode === 'e' ? [0, 0, 1] : mode === 'v' ? [0, 1, 0] : mode === 'f' ? [-f2[1], f2[0], 0] : [1, 0, 0];
      var a = P([ct[0] - ax[0] * 6.4, ct[1] - ax[1] * 6.4, (ct[2] || 0) - ax[2] * 6.4]), b = P([ct[0] + ax[0] * 6.4, ct[1] + ax[1] * 6.4, (ct[2] || 0) + ax[2] * 6.4]), sw;
      if (a[2] > b[2]) { sw = a; a = b; b = sw; }
      disc(a, 4.7, C.iron); ellS(a, 4.7, 4.7, 0.8, C.rim);
      line(a, b, 2.3, C.steel);
      disc(b, 4.9, C.iron); ellS(b, 4.9, 4.9, 0.8, C.rim);
    }
    function handProp(k) {
      for (var n = 0; n < Pr.length; n++) {
        var pq = Pr[n];
        if (pq[0] !== 'db') continue;
        if (!front && pq[2] != null && pq[2] !== k) continue;
        dumbbell(J.W[k], pq[1], unit2(J.E[k], J.W[k]));
      }
    }
    function midProps() {
      for (var n = 0; n < Pr.length; n++) {
        var pq = Pr[n], kind = pq[0];
        if (kind !== 'db1' && kind !== 'kb' && kind !== 'ball') continue;
        var m = mid3(), d = unit2([(J.E[0][0] + J.E[1][0]) / 2, (J.E[0][1] + J.E[1][1]) / 2], m), ww = front ? 5 : 0;
        if (kind === 'db1') dumbbell([m[0] + d[0] * 2, m[1] + d[1] * 2, ww], pq[1], d);
        else if (kind === 'kb') {
          var kd = pq[1] === 'a' ? d : [0, -1], hp = P([m[0] + kd[0] * 2.8, m[1] + kd[1] * 2.8, ww]), bp = P([m[0] + kd[0] * 9.6, m[1] + kd[1] * 9.6, ww]);
          ellS(hp, 3.6, 3.6, 2.3, C.steelD); disc(bp, 6.8, C.iron); ellS(bp, 6.8, 6.8, 0.8, C.rim); disc([bp[0] - 2, bp[1] + 2.3], 1.5, C.iron2);
        } else {
          var cp = P([m[0] + d[0] * 6.5, m[1] + d[1] * 6.5, ww]);
          disc(cp, 7.9, C.iron); ellS(cp, 7.9, 7.9, 0.8, C.rim); ellS(cp, 5, 5, 1.1, C.iron2);
        }
      }
    }
    function has(name) { for (var n = 0; n < Pr.length; n++) if (Pr[n][0] === name) return Pr[n]; return null; }

    // ----- mobilier derrière le corps
    for (i = 0; i < Pr.length; i++) {
      q = Pr[i];
      if (q[0] === 'mat') quad(P([q[1], 0, -25]), P([q[2], 0, -25]), P([q[2], 0, 25]), P([q[1], 0, 25]), C.mat, C.rim);
      else if (q[0] === 'box') cuboid(q[1], q[2], 0, q[3], -21, 21, C.boxT, C.boxX, C.boxW);
      else if (q[0] === 'bench') {
        var bx0 = q[1], bx1 = q[2], bh = q[3], xx, wk;
        for (xx = 0; xx < 2; xx++) {
          var lx = xx ? bx1 - 9 : bx0 + 9;
          line(P([lx, 0.8, -13]), P([lx, 0.8, 13]), 2.6, C.steelD);
          for (wk = -11; wk <= 11; wk += 22) line(P([lx, 0.8, wk]), P([lx, bh - 6, wk]), 2.6, C.steelD);
        }
        cuboid(bx0, bx1, bh - 6.5, bh, -13, 13, C.boxT, C.boxX, C.boxW);
      } else if (q[0] === 'ski') {
        quad(P([150, 0, -20]), P([224, 0, -20]), P([224, 0, 20]), P([150, 0, 20]), C.boxW, C.rim);
        line(P([208, 2, 0]), P([208, 180, 0]), 4.2, C.iron2);
        line(P([208, 180, 0]), P([190, 180, 0]), 3, C.iron2);
        line(P([190, 178, -12]), P([190, 178, 12]), 2.6, C.steelD);
        wheel(P([205, 164, 0]), 12.5, C.iron);
        var mo = P([198, 130, 0]); quad([mo[0] - 4, mo[1] - 6], [mo[0] + 4, mo[1] - 6], [mo[0] + 4, mo[1] + 6], [mo[0] - 4, mo[1] + 6], C.iron2, C.rim);
      }
    }
    var bar = has('bar'), bm;
    if (bar && !front) { bm = mid3(); wheel(P([bm[0], bm[1], -34]), 10.5, C.iron); }

    if (front) {
      leg(far); leg(near); neck(); torso(); head(); midProps();
      arm(far); handProp(far); arm(near); handProp(near);
    } else {
      leg(far); arm(far); handProp(far);
      if (has('rower')) {
        line(P([62, 13, 0]), P([204, 13, 0]), 3.2, C.steel);
        line(P([66, 12, 0]), P([66, 1.5, 0]), 3, C.steelD); line(P([66, 1.5, -13]), P([66, 1.5, 13]), 3, C.steelD);
        line(P([216, 16, 0]), P([216, 1.5, 0]), 3.4, C.steelD); line(P([216, 1.5, -14]), P([216, 1.5, 14]), 3, C.steelD);
        line(P([156, 14, -9]), P([168, 33, -9]), 3.4, C.iron2); line(P([156, 14, 9]), P([168, 33, 9]), 3.4, C.iron2);
        wheel(P([216, 30, 0]), 15.5, C.iron);
        line(P([208, 43, 0]), P([198, 64, 0]), 2.4, C.steelD);
        var rm = P([194, 66, 0]); quad([rm[0] - 5, rm[1] - 4], [rm[0] + 5, rm[1] - 4], [rm[0] + 5, rm[1] + 4], [rm[0] - 5, rm[1] + 4], C.iron2, C.rim);
        line(P([J.hip[0], 16.5, -8]), P([J.hip[0], 16.5, 8]), 5, C.iron2);
      }
      if (has('bike')) {
        var bcx = 128, bcy = 26, th = J.x, bc = Math.cos(th), bs = Math.sin(th), fw = P([168, 28, 0]), kk;
        line(P([84, 1.5, 0]), P([196, 1.5, 0]), 3.2, C.steelD);
        line(P([92, 1.5, -12]), P([92, 1.5, 12]), 3, C.steelD); line(P([184, 1.5, -12]), P([184, 1.5, 12]), 3, C.steelD);
        line(P([112, 50, 0]), P([92, 2, 0]), 3.2, C.steelD); line(fw, P([184, 2, 0]), 3.2, C.steelD);
        ell(fw, 22 * ac + 1.2, 22, 'rgba(44,74,89,0.75)'); ellS(fw, 22 * ac + 1.2, 22, 2.2, C.steelD);
        for (kk = 0; kk < 6; kk++) { var sa = th * 1.7 + kk * TAU / 6; line(fw, P([168 + 19 * Math.cos(sa), 28 + 19 * Math.sin(sa), 0]), 1, C.steelD); }
        disc(fw, 3.6, C.steel);
        line(P([bcx, bcy, 0]), P([102, 72, 0]), 3.6, C.steel); line(P([bcx, bcy, 0]), fw, 3.6, C.steel); line(P([114, 50, 0]), P([160, 50, 0]), 3.2, C.steel);
        line(P([101, 73, -6]), P([101, 73, 6]), 6, C.iron2);
        line(P([bcx - 9 * bc, bcy - 9 * bs, -7]), P([bcx, bcy, -7]), 2.2, C.steelD); line(P([bcx, bcy, 7]), P([bcx + 9 * bc, bcy + 9 * bs, 7]), 2.2, C.steel);
        disc(P([bcx, bcy, 0]), 4, C.steelD);
        line(P([160, 46, -6]), P(J.W[1]), 2.6, C.steelD); line(P([160, 46, 6]), P(J.W[0]), 2.6, C.steel);
      }
      neck(); torso(); head();
      leg(near); midProps(); arm(near); handProp(near);
      if (has('rower')) { var hm = mid3(); line(P([hm[0], hm[1], 0]), P([203, 38, 0]), 1, C.steelD); line(P([hm[0], hm[1], -9]), P([hm[0], hm[1], 9]), 2.8, C.steel); }
      if (has('ski')) for (i = 0; i < 2; i++) {
        var sw2 = J.W[i], sgn = i === 0 ? 1 : -1;
        line(P([190, 177, sgn * 12]), P([sw2[0], sw2[1] + 3, sw2[2]]), 0.9, C.steelD);
        line(P([sw2[0] - 2.4, sw2[1] + 2.6, sw2[2]]), P([sw2[0] + 2.4, sw2[1] + 2.6, sw2[2]]), 2.2, C.steel);
      }
      if (bar) { line(P([bm[0], bm[1], -40]), P([bm[0], bm[1], 40]), 2.3, C.steel); wheel(P([bm[0], bm[1], 34]), 10.5, C.iron); }
    }

    // gouttes de sueur quand ça chauffe
    if (heat > 0.3 && bt >= 0 && o.focus !== 'head') {
      var hq = P(J.head);
      for (i = 0; i < 3; i++) {
        var ph = (bt * 1.1 + i * 0.37) % 1, dq = [hq[0] + (i - 1) * 6, hq[1] - 4 - ph * 26];
        ctx.fillStyle = 'rgba(190,230,255,' + (heat * (1 - ph) * 0.9).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(dq[0], dq[1], 1.3, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(dq[0] - 1.25, dq[1] + 0.3); ctx.lineTo(dq[0], dq[1] + 3); ctx.lineTo(dq[0] + 1.25, dq[1] + 0.3); ctx.fill();
      }
    }
  }

  // ---------- gestion des canvas animés
  var live = [], raf = 0, io = null;
  function mount(canvas, ex, o) {
    var f = { c: canvas, ctx: canvas.getContext('2d'), ex: ex, o: o || {}, time: 0, last: 0, vis: true, dirty: true, n: 0 };
    f.set = function (ex2, o2) { if (f.ex !== ex2) f.time = 0; f.ex = ex2; if (o2) f.o = o2; f.dirty = true; };
    f.kill = function () {
      var i = live.indexOf(f);
      if (i >= 0) live.splice(i, 1);
      if (io) io.unobserve(canvas);
    };
    live.push(f);
    canvas._fig = f;
    if (!io && 'IntersectionObserver' in G) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { var ff = e.target._fig; if (ff) { ff.vis = e.isIntersecting; if (ff.vis) ff.dirty = true; } });
      }, { rootMargin: '80px' });
    }
    if (io) io.observe(canvas);
    if (!raf) raf = requestAnimationFrame(tick);
    return f;
  }
  function tick(now) {
    raf = 0;
    for (var i = live.length - 1; i >= 0; i--) {
      var f = live[i];
      if (!f.c.isConnected) { f.kill(); continue; }
      var dt = f.last ? Math.min(0.1, (now - f.last) / 1000) : 0;
      f.last = now;
      if (!f.vis) continue;
      var cw = f.c.clientWidth, ch = f.c.clientHeight;
      if (!cw || !ch) continue;
      var dpr = Math.min(G.devicePixelRatio || 1, 2.5), W = Math.round(cw * dpr), H = Math.round(ch * dpr);
      if (f.c.width !== W || f.c.height !== H) { f.c.width = W; f.c.height = H; f.dirty = true; }
      if (f.o.still) {
        if (!f.dirty) continue;
        render(f.ctx, W, H, f.ex, stillTime(f.ex), f.o);
        f.dirty = false;
      } else {
        if (!f.o.paused) f.time += dt;
        f.n++;
        if (f.o.slow && (f.n & 1) && !f.dirty) continue;
        f.o.bgt = now / 1000;
        render(f.ctx, W, H, f.ex, f.time, f.o);
        f.dirty = false;
      }
    }
    if (live.length) raf = requestAnimationFrame(tick);
  }

  G.PrimeFig = { mount: mount, render: render, sample: sample, period: period, stillTime: stillTime, VW: VW, VH: VH };
})(window);
