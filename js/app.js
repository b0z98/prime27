/* PRIME27 — interface : semaine, séance, lecteur, bibliothèque, suivi, réglages. */
(function () {
  'use strict';

  var EX = window.PRIME_EX, CATS = window.PRIME_CATS, PROG = window.PRIME_PROGRAM, Fig = window.PrimeFig;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function secLabel(s) { return s >= 60 ? (s % 60 ? fmt(s) : (s / 60) + ' min') : s + ' s'; }

  var SHIRT = { renfo: '#f0a01c', cardio: '#f0523d', mixte: '#17b596', defi: '#8e6ee6', neutral: '#3f86c9' };
  var TYPE = { renfo: 'Renforcement', cardio: 'Cardio', mixte: 'Mixte', defi: 'Défi' };
  var PHASE = { warm: 'Échauffement', prep: 'Mise en place', work: 'Effort', rest: 'Repos', trans: 'Transition', stretch: 'Étirement' };
  var DAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
  var MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function svg(d, fill) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="' + (fill ? 'none' : 'currentColor') +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  var I = {
    week: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    lib: svg('<path d="M3 9v6M6.5 6v12M17.5 6v12M21 9v6M6.5 12h11"/>'),
    log: svg('<path d="M4 20V11M10 20V4M16 20v-7M21 20H3"/>'),
    set: svg('<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.5"/><circle cx="8" cy="17" r="2.5"/>'),
    back: svg('<path d="M15 5l-7 7 7 7"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    play: svg('<path d="M8 5.2v13.6a1 1 0 0 0 1.5.9l11-6.8a1 1 0 0 0 0-1.8l-11-6.8A1 1 0 0 0 8 5.2z"/>', true),
    pause: svg('<rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/>', true),
    prev: svg('<path d="M6 5v14"/><path d="M19 6.2v11.6a.8.8 0 0 1-1.3.7L9.6 12.6a.8.8 0 0 1 0-1.2l8.1-5.9a.8.8 0 0 1 1.3.7z" fill="currentColor"/>'),
    next: svg('<path d="M18 5v14"/><path d="M5 6.2v11.6a.8.8 0 0 0 1.3.7l8.1-5.9a.8.8 0 0 0 0-1.2L6.3 5.5a.8.8 0 0 0-1.3.7z" fill="currentColor"/>'),
    sound: svg('<path d="M4 10v4h3l5 4V6l-5 4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),
    mute: svg('<path d="M4 10v4h3l5 4V6l-5 4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    google: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6H1.4a12 12 0 0 0 0 10.8l4-3z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1c.9-2.8 3.5-4.9 6.6-4.9z"/></svg>',
    chev: svg('<path d="M9 5l7 7-7 7"/>'),
    swap: svg('<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>'),
    locker: svg('<path d="M10 6.5a2 2 0 1 1 2.6 1.9c-.4.1-.6.5-.6.9V10"/><path d="M12 10.5L3.6 16.6a1 1 0 0 0 .6 1.9h15.6a1 1 0 0 0 .6-1.9z"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    share: svg('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/>')
  };

  // ------------------------------------------------------------------ données locales
  var KEY = 'prime27.v1';
  function blank() {
    return { v: 1, settings: { sound: true, voice: true, vibrate: true, start: null, vVoice: 1, vBeep: 0.6, voiceName: '', hard: false, equip: null, kg: 75, level: 'inter', head: 'classique', outfit: 'seance', onboarded: false }, history: [], weights: {}, live: null, minis: [], badges: {}, del: [], mt: 0 };
  }
  var db = blank();
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var o = JSON.parse(raw);
      if (o && o.v === 1) {
        db = blank();
        Object.assign(db.settings, o.settings || {});
        db.history = Array.isArray(o.history) ? o.history : [];
        db.weights = o.weights || {};
        db.live = o.live || null;
        db.minis = Array.isArray(o.minis) ? o.minis : [];
        db.badges = o.badges || {};
        db.del = Array.isArray(o.del) ? o.del : [];
        db.mt = o.mt || 0;
      }
    }
  } catch (e) { /* stockage indisponible : l'app fonctionne sans mémoire */ }
  // contenu à sauvegarder (sans la séance en cours) ; sert à dater les changements et à la synchronisation
  function payloadStr() { return JSON.stringify({ s: db.settings, h: db.history, w: db.weights, m: db.minis, b: db.badges, d: db.del || [] }); }
  var lastPayload = payloadStr();
  function save() {
    try {
      var p = payloadStr();
      if (p !== lastPayload) { db.mt = Date.now(); lastPayload = p; }
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) { /* stockage indisponible */ }
    cloudQueue();
  }

  // ------------------------------------------------------------------ dates et programme
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parseYmd(s) { var p = String(s).split('-').map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1); }
  function monday(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function niceDate(d) { return DAYS[(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }

  if (!db.settings.start) { db.settings.start = ymd(monday(new Date())); save(); }

  function weekIndex(d) { return Math.round((monday(d) - monday(parseYmd(db.settings.start))) / 6048e5); }
  function position(d) {
    var wi = Math.max(0, weekIndex(d || new Date())), mi = Math.floor(wi / 4);
    return { wi: wi, mi: mi, week: wi % 4 + 1, month: PROG.months[Math.min(mi, PROG.months.length - 1)], beyond: mi >= PROG.months.length };
  }
  function findSession(id) {
    for (var m = 0; m < PROG.months.length; m++) {
      var ss = PROG.months[m].sessions;
      for (var i = 0; i < ss.length; i++) if (ss[i].id === id) return ss[i];
    }
    return null;
  }

  // ------------------------------------------------------------------ déroulé d'une séance
  function lapsOf(b) {
    if (b.laps) return b.laps;
    var a = [];
    for (var i = 0; i < (b.rounds || 1); i++) a.push({ work: b.work, rest: b.rest });
    return a;
  }
  function itemOf(it) { return typeof it === 'string' ? { ex: it } : it; }
  function timeline(s) {
    if (s._tl) return s._tl;
    var segs = [], W = safeList(PROG.warmups[s.warmup || 'A'], WPOOL), S = safeList(PROG.stretch, SPOOL);
    W.forEach(function (w, i) { segs.push({ t: 'warm', ex: w[0], dur: w[1], n: i + 1, of: W.length, grp: 0 }); });
    segs.push({ t: 'prep', dur: s.prep || 30, bi: 0, grp: 1 });
    // blocs adaptés au matériel disponible
    var seenAll = {};
    var blocks = s.blocks.map(function (b) {
      var its = adaptItems(b, seenAll), c = {}, k;
      for (k in b) c[k] = b[k];
      c.items = its;
      if (its.swapped) {
        c.sub = 'Adapté pour toi';
        c.note = its.swapped + (its.swapped > 1 ? ' mouvements remplacés' : ' mouvement remplacé') + ' selon ton matériel ou tes douleurs.';
      }
      return c;
    });
    blocks.forEach(function (b, bi) {
      var laps = lapsOf(b), items = b.items;
      laps.forEach(function (lap, li) {
        items.forEach(function (it, ii) {
          var rest = it.rest != null ? it.rest : (it.work ? 0 : (lap.rest || 0));
          segs.push({ t: 'work', ex: it.ex, dur: it.work || lap.work, bi: bi, round: li + 1, rounds: laps.length, n: ii + 1, of: items.length, tag: it.tag, grp: bi + 1, fin: li === laps.length - 1 && ii === items.length - 1 });
          var last = li === laps.length - 1 && ii === items.length - 1;
          if (last) { if (bi < s.blocks.length - 1) segs.push({ t: 'trans', dur: b.after != null ? b.after : 60, bi: bi + 1, grp: bi + 1 }); }
          else if (rest > 0) segs.push({ t: 'rest', dur: rest, bi: bi, grp: bi + 1 });
        });
      });
    });
    S.forEach(function (w, i) { segs.push({ t: 'stretch', ex: w[0], dur: w[1], n: i + 1, of: S.length, grp: s.blocks.length + 1 }); });

    var nextEx = null, nextIdx = -1, i, g, t = 0;
    for (i = segs.length - 1; i >= 0; i--) {
      g = segs[i];
      if (g.t === 'rest' || g.t === 'trans' || g.t === 'prep') { g.ex = nextEx; g.nx = nextIdx; }
      else { nextEx = g.ex; nextIdx = i; }
    }
    var groups = [];
    for (i = 0; i < segs.length; i++) {
      g = segs[i]; g.at = t; t += g.dur;
      if (!groups[g.grp]) groups[g.grp] = { at: g.at, dur: 0, kind: g.t === 'warm' ? 'warm' : (g.t === 'stretch' ? 'stretch' : 'block') };
      groups[g.grp].dur += g.dur;
    }
    var moves = {};
    segs.forEach(function (x) { if (x.t === 'work') moves[x.ex] = 1; });
    s._tl = { warm: W, str: S, blocks: blocks, segs: segs, groups: groups, total: t, stretch: groups[groups.length - 1].dur, main: t - groups[groups.length - 1].dur, moves: Object.keys(moves) };
    return s._tl;
  }
  function blockDur(s, bi) {
    var d = 0;
    timeline(s).segs.forEach(function (g) { if (g.grp === bi + 1 && g.t !== 'trans' && g.t !== 'prep') d += g.dur; });
    return d;
  }
  function blockFormat(b) {
    var items = b.items.map(itemOf);
    if (b.laps) return b.laps.length + ' tours · ' + b.laps.map(function (l) { return l.work; }).join(' / ') + ' s';
    if (items[0].work) {
      var same = items.every(function (x) { return x.work === items[0].work; });
      if (items.length === 1) return secLabel(items[0].work) + (items[0].tag ? ' à fond' : '');
      return (b.rounds > 1 ? b.rounds + ' tours · ' : '') + (same ? secLabel(items[0].work) + ' par exercice' : 'de ' + secLabel(Math.min.apply(null, items.map(function (x) { return x.work; }))) + ' à ' + secLabel(Math.max.apply(null, items.map(function (x) { return x.work; }))));
    }
    if (items.length === 1) return b.rounds + ' × ' + b.work + ' s / ' + b.rest + ' s';
    return b.rounds + ' tours · ' + b.work + ' s / ' + b.rest + ' s';
  }
  function frise(s, big) {
    var tl = timeline(s);
    return '<span class="frise' + (big ? ' big' : '') + '">' + tl.groups.map(function (g) {
      return '<i class="fr-' + g.kind + '" style="flex:' + g.dur + ' 1 0"></i>';
    }).join('') + '</span>';
  }

  // ------------------------------------------------------------------ son, voix, vibration, écran
  var AC = null;
  function audio() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
      // annonces courtes par-dessus la musique d'une autre appli, sans la couper
      try { if (navigator.audioSession) navigator.audioSession.type = 'transient'; } catch (e2) { /* rien */ }
    }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) { /* rien */ } }
    return AC;
  }
  function tone(freq, dur, delay, vol) {
    if (!db.settings.sound) return;
    var ac = audio(); if (!ac) return;
    try {
      var t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, Math.min(1, (vol || 0.5) * db.settings.vBeep * 1.6)), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + dur + 0.03);
    } catch (e) { /* rien */ }
  }
  var SND = {
    tick: function () { tone(880, 0.13, 0, 0.45); },
    go: function () { tone(988, 0.16, 0, 0.55); tone(1319, 0.5, 0.16, 0.6); },
    rest: function () { tone(660, 0.18, 0, 0.5); tone(440, 0.45, 0.18, 0.5); },
    half: function () { tone(1175, 0.1, 0, 0.5); tone(1175, 0.1, 0.16, 0.5); },
    end: function () { tone(784, 0.16, 0, 0.5); tone(988, 0.16, 0.17, 0.5); tone(1175, 0.16, 0.34, 0.5); tone(1568, 0.7, 0.51, 0.6); },
    hell: function () { tone(98, 0.7, 0, 0.7); tone(147, 0.6, 0.04, 0.45); tone(196, 0.35, 0.3, 0.35); }
  };
  function buzz(p) {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    if (db.settings.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { /* rien */ } }
  }
  // Voix du coach : la meilleure voix française installée sur l'appareil (modifiable dans les réglages).
  var voices = [];
  function voiceScore(v) {
    var n = (v.name || '').toLowerCase(), s = 0;
    if (/^fr[-_]fr/i.test(v.lang)) s += 3; else if (/^fr/i.test(v.lang)) s += 1; else return -1;
    if (/natural|neural|online/.test(n)) s += 6;
    if (/enhanced|premium|siri/.test(n)) s += 5;
    if (/google/.test(n)) s += 4;
    if (/compact|espeak/.test(n)) s -= 3;
    if (v.localService === false) s += 1;
    return s;
  }
  function voiceOptions() {
    return '<option value="">Automatique' + (voices[0] ? ' (' + esc(voices[0].name) + ')' : '') + '</option>' + voices.map(function (v) {
      return '<option value="' + esc(v.name) + '"' + (v.name === db.settings.voiceName ? ' selected' : '') + '>' + esc(v.name) + '</option>';
    }).join('');
  }
  function loadVoices() {
    try {
      voices = window.speechSynthesis.getVoices().filter(function (v) { return voiceScore(v) >= 0; })
        .sort(function (a, b) { return voiceScore(b) - voiceScore(a); });
    } catch (e) { voices = []; }
    var sel = document.getElementById('set-voice');
    if (sel) sel.innerHTML = voiceOptions();
  }
  function currentVoice() {
    for (var i = 0; i < voices.length; i++) if (voices[i].name === db.settings.voiceName) return voices[i];
    if (db.settings.hard && !db.settings.voiceName) {
      for (i = 0; i < voices.length; i++) if (/thomas|henri|paul|claude|nicolas|antoine|remi|rémi|male|homme/i.test(voices[i].name)) return voices[i];
    }
    return voices[0] || null;
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    try { window.speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { /* rien */ }
  }
  function say(text) {
    if (!db.settings.voice || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text), v = currentVoice();
      u.lang = v ? v.lang : 'fr-FR'; u.rate = db.settings.hard ? 0.98 : 1.08; u.pitch = db.settings.hard ? 0.62 : 1.08;
      u.volume = Math.max(0.05, Math.min(1, db.settings.vVoice));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* rien */ }
  }
  function pickOne(list) { return list[Math.floor(Math.random() * list.length)]; }
  var wake = null, wakeOk = null;
  function wakeOn() {
    if (!('wakeLock' in navigator)) { wakeOk = false; paintWake(); return; }
    if (wake) return;
    navigator.wakeLock.request('screen').then(function (w) {
      wake = w; wakeOk = true; paintWake();
      w.addEventListener('release', function () { wake = null; });
    }).catch(function () { wake = null; wakeOk = false; paintWake(); });
  }
  function wakeOff() { try { if (wake) wake.release(); } catch (e) { /* rien */ } wake = null; }
  function paintWake() {
    var el = $('#p-wake');
    if (el) el.textContent = wakeOk === false ? 'Pense à désactiver la mise en veille de l’écran.' : '';
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && P && P.run && !P.done) { wakeOn(); P.last = Date.now(); }
  });

  // ------------------------------------------------------------------ navigation
  var route = { name: 'home', id: null }, libCat = 'all';
  var app = $('#app');
  app.innerHTML = '<main id="view"></main><nav class="tabs" id="tabs" aria-label="Navigation"></nav><div id="overlay"></div><div id="sheet"></div><div id="toast" role="status"></div>';
  var view = $('#view'), tabs = $('#tabs'), overlay = $('#overlay'), sheet = $('#sheet');

  function go(name, id) {
    route = { name: name, id: id || null };
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    var html;
    if (route.name === 'session') html = viewSession(findSession(route.id));
    else if (route.name === 'lib') html = viewLib();
    else if (route.name === 'log') html = viewLog();
    else if (route.name === 'settings') html = viewSettings();
    else if (route.name === 'locker') html = viewLocker();
    else html = viewHome();
    view.innerHTML = html;
    var T = [['home', 'Semaine', I.week], ['lib', 'Exercices', I.lib], ['log', 'Suivi', I.log], ['locker', 'Vestiaire', I.locker], ['settings', 'Réglages', I.set]];
    tabs.hidden = route.name === 'session';
    tabs.innerHTML = '<div class="tabs-in">' + T.map(function (t) {
      return '<button data-go="' + t[0] + '"' + (route.name === t[0] ? ' aria-current="page"' : '') + '>' + t[2] + '<span>' + t[1] + '</span></button>';
    }).join('') + '</div>';
    mountFigs(view);
  }
  function mountFigs(root) {
    $$('canvas.fig', root).forEach(function (c) {
      if (c._fig) return;
      var id = c.getAttribute('data-ex'), ex = id === '_idle' ? IDLE : EX[id];
      if (!ex) return;
      var lk = c.hasAttribute('data-head') ? lookOf(c.getAttribute('data-head'), c.getAttribute('data-outfit'), c.hasAttribute('data-raw')) : LOOK();
      Fig.mount(c, ex, { still: c.hasAttribute('data-still'), slow: c.hasAttribute('data-slow'), bg: c.hasAttribute('data-still') ? 'plain' : 'full', shirt: SHIRT[c.getAttribute('data-c')] || SHIRT.neutral, look: lk, focus: c.getAttribute('data-focus') });
    });
  }
  var toastT = 0;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2400);
  }
  function thumb(exId, type, still) {
    return '<span class="thumb"><canvas class="fig" data-ex="' + exId + '" data-c="' + type + '"' + (still === false ? ' data-slow' : ' data-still') + '></canvas></span>';
  }

  // ------------------------------------------------------------------ vue : semaine
  // une séance écourtée compte dans la semaine à partir de 20 minutes
  function counts(h) { return !h.partial || h.dur >= 1200; }
  function weekEntries(wi) { return db.history.filter(function (h) { return counts(h) && weekIndex(parseYmd(h.date)) === wi; }); }
  function viewHome() {
    var pos = position(), m = pos.month, today = new Date(), w0 = monday(today), entries = weekEntries(pos.wi);
    var doneBy = {};
    entries.forEach(function (h) { doneBy[h.sid] = h; });
    var nDone = Object.keys(doneBy).length;
    var nextS = m.sessions.filter(function (s) { return !doneBy[s.id]; })[0];
    var trainedToday = entries.some(function (h) { return h.date === ymd(today); });

    var strip = '';
    for (var d = 0; d < 7; d++) {
      var dt = addDays(w0, d), key = ymd(dt);
      var hs = entries.filter(function (h) { return h.date === key; });
      var s0 = hs.length ? findSession(hs[0].sid) : null;
      strip += '<li class="' + (key === ymd(today) ? 'today ' : '') + (hs.length ? 'done s-' + (s0 ? s0.type : 'renfo') : '') + '">' +
        '<span>' + DAYS[d].charAt(0).toUpperCase() + '</span><b>' + dt.getDate() + '</b><i>' + (hs.length ? I.check : '') + '</i></li>';
    }

    var live = '';
    if (db.live && findSession(db.live.sid) && Date.now() - db.live.ts < 3 * 3600e3 && timeline(findSession(db.live.sid)).segs[db.live.i]) {
      var ls = findSession(db.live.sid);
      live = '<section class="resume s-' + ls.type + '"><div><p class="eyebrow">Séance interrompue</p><b>' + esc(ls.name) + ' · ' + fmt(timeline(ls).segs[db.live.i].at + db.live.el) + ' écoulées</b></div>' +
        '<div class="resume-b"><button class="btn sm" data-act="resume">Reprendre</button><button class="btn sm ghost" data-act="drop">Abandonner</button></div></section>';
    }

    var goal = nDone >= 5 ? 'Semaine complète. Bravo.' : nDone >= 3 ? 'Objectif atteint. Les séances bonus restent ouvertes.' :
      (3 - nDone) + (3 - nDone > 1 ? ' séances' : ' séance') + ' pour atteindre l’objectif de la semaine.';

    return '<div class="view v-home">' +
      '<header class="top"><div class="brand disp">' + logo('b') + 'Prime<em>27</em><span>HIIT 45</span></div><p class="top-date">' + niceDate(today) + '</p></header>' +
      '<section class="phase">' +
        '<p class="eyebrow">Mois ' + m.n + ' · ' + esc(m.title) + '</p>' +
        '<h1 class="disp wk">Semaine ' + pos.week + '<small>/4</small></h1>' +
        '<p class="focus">' + esc(pos.beyond ? 'Cycle terminé. Les séances restent disponibles en attendant le mois suivant.' : m.focus[pos.week - 1]) + '</p>' +
        '<ol class="strip">' + strip + '</ol>' +
        '<p class="goal"><b>' + nDone + ' / ' + m.sessions.length + '</b> ' + goal + '</p>' +
        weekTiles(entries) +
      '</section>' + inviteBanner() + live + backupNudge() + installCard() +
      '<section class="list"><h2 class="h2">Séances de la semaine</h2>' +
      '<div class="pills"><button class="pill tap" data-act="equip">' + esc(equipLabel()) + I.chev + '</button>' +
      '<button class="pill tap' + (painList().length ? ' warn' : '') + '" data-act="pain">' + esc(painShort()) + I.chev + '</button></div>' +
      m.sessions.map(function (s) {
        var tl = timeline(s), h = doneBy[s.id], isNext = nextS && nextS.id === s.id && !trainedToday;
        var st = h ? '<span class="pill ok">' + I.check + 'Fait ' + DAYS[(parseYmd(h.date).getDay() + 6) % 7] + '</span>' :
          (isNext ? '<span class="pill hot">À faire</span>' : '<span class="pill">' + esc(s.day) + '</span>');
        return '<button class="card s-' + s.type + (h ? ' is-done' : '') + '" data-go="session" data-id="' + s.id + '">' +
          '<span class="card-top"><span class="kind">' + TYPE[s.type] + (s.core ? '' : ' · bonus') + '</span>' + st + '</span>' +
          '<span class="card-mid"><span class="card-name disp">' + esc(s.name) + '</span><span class="card-fig">' + thumb(tl.moves[0], s.type) + '</span></span>' +
          '<span class="card-tag">' + esc(s.tag) + '</span>' +
          frise(s) +
          '<span class="card-meta">' + fmt(tl.main).replace(':00', ' min') + ' + ' + (tl.stretch / 60) + ' min d’étirements · ' + tl.moves.length + ' mouvements</span>' +
          '</button>';
      }).join('') +
      '</section>' +
      minisSection() +
      '<p class="hint">Trois séances au minimum par semaine : un renforcement, un cardio, un mixte. Atlas et Défi complètent jusqu’à cinq.</p>' +
      '</div>';
  }

  // ------------------------------------------------------------------ vue : détail d'une séance
  function rowHtml(exId, type, right) {
    var ex = EX[exId], w = loadLabel(exId);
    return '<li><button class="row" data-ex="' + exId + '" data-c="' + type + '">' + thumb(exId, type) +
      '<span class="row-t"><b>' + esc(ex.n) + '</b><small>' + esc(ex.m) + (ex.load && w ? ' · ' + w : '') + '</small></span>' +
      '<span class="row-d">' + right + '</span></button></li>';
  }
  // rappel de la dernière fois sur la fiche d'une séance
  function lastLine(s) {
    var h = null, i;
    for (i = db.history.length - 1; i >= 0; i--) if (db.history[i].sid === s.id && counts(db.history[i])) { h = db.history[i]; break; }
    if (!h) return '<p class="last">Première fois : les charges et scores proposés serviront de point de départ.</p>';
    var bits = [niceDate(parseYmd(h.date))];
    if (h.kcal) bits.push(num(h.kcal) + ' kcal');
    if (h.hr && h.hr.avg) bits.push(h.hr.avg + ' bpm moy.');
    if (h.rpe) bits.push('effort ' + h.rpe + '/10');
    return '<p class="last"><b>Dernière fois</b> · ' + bits.join(' · ') + '</p>';
  }
  function viewSession(s) {
    if (!s) return viewHome();
    var tl = timeline(s), W = tl.warm, S = tl.str;
    var blocks = tl.blocks.map(function (b, bi) {
      var items = b.items, seen = {};
      var rows = items.filter(function (it) { var k = it.ex; if (seen[k]) return false; seen[k] = 1; return true; }).map(function (it) {
        var d = it.work ? items.filter(function (x) { return x.ex === it.ex; }).map(function (x) { return secLabel(x.work); }).join(' · ') : '';
        return rowHtml(it.ex, s.type, d);
      }).join('');
      return '<article class="blk"><header><div><h3 class="disp">' + esc(b.name) + '</h3><p>' + esc(b.sub) + '</p></div>' +
        '<div class="blk-t"><b>' + fmt(blockDur(s, bi)) + '</b><span>' + blockFormat(b) + '</span></div></header>' +
        (b.note ? '<p class="blk-note">' + esc(b.note) + '</p>' : '') + '<ul class="rows">' + rows + '</ul></article>';
    }).join('');

    return '<div class="view v-session s-' + s.type + '">' +
      '<button class="back" data-go="home">' + I.back + 'Semaine</button>' +
      '<header class="hero"><p class="eyebrow acc">' + TYPE[s.type] + (s.core ? '' : ' · séance bonus') + '</p>' +
        '<h1 class="disp hero-name">' + esc(s.name) + '</h1><p class="lede">' + esc(s.intro) + '</p>' + lastLine(s) + '</header>' +
      '<dl class="facts">' +
        '<div><dt>Durée</dt><dd class="disp">' + fmt(tl.main) + '</dd><small>+ ' + fmt(tl.stretch) + ' d’étirements</small></div>' +
        '<div><dt>Mouvements</dt><dd class="disp">' + tl.moves.length + '</dd><small>hors échauffement</small></div>' +
        '<div><dt>Format</dt><dd class="fmt">' + esc(s.format) + '</dd></div>' +
      '</dl>' +
      '<section class="plan">' + frise(s, true) + '<div class="scale"><span style="left:0">0</span><span style="left:' + (300 / tl.total * 100).toFixed(1) + '%">5</span>' +
        '<span style="right:0">' + Math.round(tl.main / 60) + ' + ' + Math.round(tl.stretch / 60) + ' min</span></div></section>' +
      teamSection() +
      '<section><h2 class="h2">Matériel à prévoir</h2><ul class="chips">' + sessionEquip(tl).map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></section>' +
      '<section class="blocks"><h2 class="h2">Déroulé</h2>' +
        '<article class="blk"><header><div><h3 class="disp">Échauffement</h3><p>' + (W[0][0] === 'row' ? 'Rameur en douceur, puis sans matériel' : 'Sans matériel') + '</p></div><div class="blk-t"><b>5:00</b><span>enchaîné</span></div></header><ul class="rows">' +
          W.map(function (w) { return rowHtml(w[0], s.type, secLabel(w[1])); }).join('') + '</ul></article>' +
        blocks +
        '<article class="blk"><header><div><h3 class="disp">Étirements</h3><p>Retour au calme</p></div><div class="blk-t"><b>' + fmt(tl.stretch) + '</b><span>en plus des 45 min</span></div></header><ul class="rows">' +
          S.map(function (w) { return rowHtml(w[0], s.type, secLabel(w[1])); }).join('') + '</ul></article>' +
      '</section>' +
      '<div class="cta"><div class="cta-in"><button class="btn go" data-act="start">' + I.play + 'Démarrer la séance</button></div></div>' +
      '</div>';
  }

  // ------------------------------------------------------------------ vue : bibliothèque
  function viewLib() {
    var ids = Object.keys(EX).filter(function (id) { return libCat === 'all' || EX[id].c === libCat; });
    var chips = [{ id: 'all', n: 'Tout' }].concat(CATS).map(function (c) {
      return '<button class="chip' + (libCat === c.id ? ' on' : '') + '" data-cat="' + c.id + '">' + esc(c.n) + '</button>';
    }).join('');
    return '<div class="view v-lib">' +
      '<header class="top"><h1 class="disp page">Exercices</h1><p class="top-date">' + Object.keys(EX).length + ' mouvements</p></header>' +
      '<div class="chipbar">' + chips + '</div>' +
      '<ul class="xgrid">' + ids.map(function (id) {
        var ex = EX[id];
        return '<li><button class="xcard" data-ex="' + id + '" data-c="neutral"><span class="xfig"><canvas class="fig" data-ex="' + id + '" data-c="neutral" data-slow></canvas></span>' +
          '<b>' + esc(ex.n) + '</b>' + (hurts(id) ? '<small class="warn">À ménager : ' + esc(ex.z.filter(function (z) { return db.settings.pain[z]; }).map(zoneName).join(', ')) + '</small>' :
          '<small>' + esc(ex.eq.length ? ex.eq.join(' · ') : 'Sans matériel') + '</small>') + '</button></li>';
      }).join('') + '</ul></div>';
  }

  // ------------------------------------------------------------------ vue : suivi
  function viewLog() {
    var SS = stats(), pos = position(), H = db.history.slice().sort(function (a, b) { return b.ts - a.ts; });
    var mins = Math.round(H.reduce(function (a, h) { return a + (h.dur || 0); }, 0) / 60);
    var byWeek = {};
    H.filter(counts).forEach(function (h) { var k = weekIndex(parseYmd(h.date)); (byWeek[k] = byWeek[k] || {})[h.sid] = 1; });
    var fullWeeks = Object.keys(byWeek).filter(function (k) { return Object.keys(byWeek[k]).length >= 3; }).length;
    var thisWeek = Object.keys(byWeek[pos.wi] || {}).length;

    var m0 = addDays(monday(parseYmd(db.settings.start)), pos.mi * 28), cal = '', today = ymd(new Date());
    for (var w = 0; w < 4; w++) {
      cal += '<tr><th scope="row">S' + (w + 1) + '</th>';
      for (var d = 0; d < 7; d++) {
        var key = ymd(addDays(m0, w * 7 + d));
        var hs = H.filter(function (h) { return h.date === key; });
        var s0 = hs.length ? findSession(hs[0].sid) : null;
        cal += '<td class="' + (key === today ? 'today' : '') + '">' + (hs.length ? '<i class="dot s-' + (s0 ? s0.type : 'renfo') + '" title="' + esc(s0 ? s0.name : '') + '"></i>' : '<i class="dot"></i>') + '</td>';
      }
      cal += '</tr>';
    }

    var wIds = Object.keys(db.weights).filter(function (id) { return EX[id] && db.weights[id]; });
    var charges = wIds.length ? '<ul class="kv">' + wIds.map(function (id) {
      return '<li><span>' + esc(EX[id].n) + '</span><b>' + db.weights[id] + ' kg</b></li>';
    }).join('') + '</ul>' : '<p class="empty">Tes charges apparaîtront ici dès que tu les noteras en fin de séance.</p>';

    var bests = {};
    H.forEach(function (h) {
      var s = findSession(h.sid); if (!s || !s.scores || !h.scores) return;
      s.scores.forEach(function (sc) {
        var v = +h.scores[sc.id]; if (!v) return;
        var k = s.id + '/' + sc.id;
        if (!bests[k] || v > bests[k].v) bests[k] = { v: v, label: s.name + ' · ' + sc.label, unit: sc.unit, date: h.date };
      });
    });
    var bk = Object.keys(bests);
    var records = bk.length ? '<ul class="kv">' + bk.map(function (k) {
      var b = bests[k]; return '<li><span>' + esc(b.label) + '<small>' + niceDate(parseYmd(b.date)) + '</small></span><b>' + b.v + ' ' + b.unit + '</b></li>';
    }).join('') + '</ul>' : '<p class="empty">Les séances Mistral et Défi ont des scores à noter : ils serviront de records à battre.</p>';

    var journal = H.length ? '<ul class="journal">' + H.map(function (h) {
      var s = findSession(h.sid), sc = '';
      if (s && s.scores && h.scores) sc = s.scores.filter(function (x) { return h.scores[x.id]; }).map(function (x) { return esc(x.label) + ' : ' + esc(h.scores[x.id]) + ' ' + x.unit; }).join(' · ');
      return '<li class="s-' + (s ? s.type : 'renfo') + '"><div class="j-h"><b class="disp">' + esc(s ? s.name : h.sid) + '</b><span>' + niceDate(parseYmd(h.date)) + '</span></div>' +
        '<p>' + durLabel(h.dur) + (h.partial ? ' · séance écourtée' : '') + (h.rpe ? ' · effort ressenti ' + h.rpe + '/10' : '') + '</p>' +
        (h.kcal || h.hr ? '<p class="j-v">' + (h.kcal ? '<b>' + num(h.kcal) + '</b> kcal' : '') + (h.hr && h.hr.avg ? ' · <b>' + h.hr.avg + '</b> bpm moy.' : '') + (h.hr && h.hr.max ? ' · <b>' + h.hr.max + '</b> bpm max' : '') + '</p>' : '') +
        (sc ? '<p>' + sc + '</p>' : '') + (h.note ? '<p class="j-n">' + esc(h.note) + '</p>' : '') +
        '<button class="link" data-del="' + h.id + '">Supprimer</button></li>';
    }).join('') + '</ul>' : '<p class="empty">Aucune séance enregistrée pour l’instant. La première apparaîtra ici.</p>';

    return '<div class="view v-log">' +
      '<header class="top"><h1 class="disp page">Suivi</h1><p class="top-date">Mois ' + pos.month.n + '</p></header>' +
      '<dl class="stats"><div><dd class="disp">' + H.length + '</dd><dt>séances</dt></div><div><dd class="disp">' + num(SS.kcal) + '</dd><dt>kcal dépensées</dt></div>' +
        '<div><dd class="disp">' + (SS.rpe ? SS.rpe.toFixed(1).replace('.', ',') : '—') + '</dd><dt>effort moyen</dt></div><div><dd class="disp">' + SS.streak + '</dd><dt>semaines d’affilée</dt></div></dl>' +
      badgeSection() +
      '<section><h2 class="h2">Calendrier du mois</h2><table class="cal"><thead><tr><th></th><th>L</th><th>M</th><th>M</th><th>J</th><th>V</th><th>S</th><th>D</th></tr></thead><tbody>' + cal + '</tbody></table>' +
        '<p class="legend"><span class="s-renfo"><i class="dot"></i>Renfo</span><span class="s-cardio"><i class="dot"></i>Cardio</span><span class="s-mixte"><i class="dot"></i>Mixte</span><span class="s-defi"><i class="dot"></i>Défi</span></p></section>' +
      intensitySection() +
      '<section><h2 class="h2">Records</h2>' + records + '</section>' +
      '<section><h2 class="h2">Charges</h2>' + charges + '</section>' +
      miniJournal() +
      '<section><h2 class="h2">Journal</h2>' + journal + '</section>' +
      '</div>';
  }

  // ------------------------------------------------------------------ vue : réglages
  function viewSettings() {
    function sw(id, label, hint) {
      return '<label class="sw"><span><b>' + label + '</b><small>' + hint + '</small></span><input type="checkbox" id="set-' + id + '" data-set="' + id + '"' + (db.settings[id] ? ' checked' : '') + '><i></i></label>';
    }
    return '<div class="view v-settings">' +
      '<header class="top"><h1 class="disp page">Réglages</h1></header>' +
      accountSection() +
      friendsSection() +
      '<section><h2 class="h2">Pendant la séance</h2>' +
        sw('sound', 'Signaux sonores', 'Décompte 3-2-1, début et fin d’effort') +
        sw('voice', 'Annonces vocales', 'Nom du prochain exercice, changement de côté') +
        sw('hard', 'Coach sans pitié', 'Encouragements musclés, façon David Goggins') +
        sw('vibrate', 'Vibrations', 'À chaque changement de phase') +
        volControls() +
        '<label class="field"><span>Voix du coach</span><select id="set-voice">' + voiceOptions() + '</select></label>' +
        '<p class="hint">La voix est celle de ton téléphone. Pour une voix plus naturelle sur Android : Paramètres, Synthèse vocale, puis installe la voix française en haute qualité.</p>' +
        '<button class="btn sm ghost" data-act="testsound">Tester le son</button></section>' +
      profileSection() +
      '<section><h2 class="h2">Matériel</h2><p class="hint">En déplacement ou salle incomplète : indique ce que tu as, les séances s’adaptent.</p>' +
        '<button class="btn sm" data-act="equip">Matériel disponible : ' + esc(equipLabel()) + '</button></section>' +
      '<section><h2 class="h2">Douleurs</h2><p class="hint">Indique une zone sensible : les mouvements qui la sollicitent sont remplacés.</p>' +
        '<button class="btn sm" data-act="pain">' + esc(painShort()) + '</button></section>' +
      '<section><h2 class="h2">Programme</h2>' +
        '<label class="field"><span>Début du cycle (lundi de la semaine 1)</span><input type="date" id="set-start" value="' + esc(db.settings.start) + '"></label>' +
        '<p class="hint">Les quatre semaines du mois se calent sur cette date. Change-la pour recommencer un cycle.</p></section>' +
      shareSection() +

      '<p class="hint">PRIME27 · mois ' + PROG.months.length + ' sur ' + PROG.months.length + ' disponible · ' + Object.keys(EX).length + ' mouvements animés.</p>' +
      '</div>';
  }

  // ------------------------------------------------------------------ fiche exercice et dialogues
  function openSheet(exId, type) {
    var ex = EX[exId]; if (!ex) return;
    var w = loadOf(exId);
    sheet.innerHTML = '<div class="sheet-bg" data-sheet="close"></div><div class="sheet-p s-' + (SHIRT[type] && type !== 'neutral' ? type : 'none') + '" role="dialog" aria-modal="true" aria-label="' + esc(ex.n) + '">' +
      '<button class="ic sheet-x" data-sheet="close" aria-label="Fermer">' + I.close + '</button>' +
      '<div class="stage"><canvas class="fig" data-ex="' + exId + '" data-c="' + (type || 'neutral') + '"></canvas></div>' +
      '<h2 class="disp sheet-n">' + esc(ex.n) + '</h2>' +
      '<p class="sheet-m">' + esc(ex.m) + ' · ' + esc(ex.eq.length ? ex.eq.join(', ') : 'sans matériel') + '</p>' +
      '<ol class="cues">' + ex.cues.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol>' +
      (ex.z && ex.z.length ? '<p class="sheet-m">Sollicite : ' + esc(ex.z.map(zoneName).join(', ')) + (hurts(exId) ? ' · à ménager selon tes douleurs' : '') + '</p>' : '') +
      (ex.sides ? '<p class="note">Mouvement unilatéral : change de côté à mi-série, un double bip te le signale.</p>' : '') +
      (ex.alt ? '<p class="note"><b>Si le matériel est pris :</b> ' + esc(ex.alt) + '.</p>' : '') +
      (ex.load ? '<label class="field inline"><span>Ma charge' + (db.weights[exId] ? '' : ' (proposée)') + '</span><span class="unit"><input type="number" inputmode="decimal" min="0" step="0.5" id="sheet-w" value="' + (w || '') + '" placeholder="—"><em>kg</em></span></label>' : '') +
      '</div>';
    sheet.classList.add('on');
    mountFigs(sheet);
    var inp = $('#sheet-w');
    if (inp) inp.addEventListener('change', function () {
      var v = parseFloat(inp.value);
      if (v > 0) db.weights[exId] = v; else delete db.weights[exId];
      save();
      if (P && !P.done) paintLoad();
    });
  }
  function closeSheet() { sheet.classList.remove('on'); sheet.innerHTML = ''; }
  function ask(title, text, actions) {
    sheet.innerHTML = '<div class="sheet-bg"></div><div class="dialog" role="alertdialog" aria-modal="true"><h2 class="disp">' + esc(title) + '</h2><p>' + esc(text) + '</p>' +
      actions.map(function (a, i) { return '<button class="btn ' + (a.cls || '') + '" data-ask="' + i + '">' + esc(a.label) + '</button>'; }).join('') + '</div>';
    sheet.classList.add('on');
    $$('[data-ask]', sheet).forEach(function (b) {
      b.addEventListener('click', function () { closeSheet(); var a = actions[+b.getAttribute('data-ask')]; if (a.fn) a.fn(); });
    });
  }

  // ------------------------------------------------------------------ lecteur de séance
  var P = null, timer = 0;

  function startSession(s, from, sync) {
    var tl = cloneTl(timeline(s));
    P = { swap: {}, team: teamSize(), s: s, tl: tl, i: from ? from.i : 0, el: from ? from.el : 0, active: from ? (from.active || 0) : 0, run: true, last: Date.now(), done: false, fired: {}, saveAt: 0, fig: null, nfig: null, cueI: 0, heat: 0 };
    if (sync) {
      P.sync = { id: sync.id, state: sync.data.state, t0: sync.data.t0 || 0, pausePos: sync.data.pausePos || 0 };
      applyRoomData(sync.data, true);
    }
    overlay.innerHTML = '<div class="player s-' + s.type + '" id="player">' +
      '<canvas class="p-fire" id="p-fire" aria-hidden="true"></canvas>' +
      '<header class="p-top"><button class="ic" data-p="quit" aria-label="Quitter la séance">' + I.close + '</button>' +
        '<div class="p-where"><b id="p-sec"></b><span id="p-sub"></span></div>' +
        '<div class="p-rem"><span>Reste</span><b id="p-total"></b></div></header>' +
      '<div class="p-prog" id="p-prog">' + tl.groups.map(function (g) { return '<i class="fr-' + g.kind + '" style="flex:' + g.dur + ' 1 0"><b></b></i>'; }).join('') + '</div>' +
      '<div class="p-clock" id="p-clock"><div class="p-digits disp" id="p-digits" aria-live="off"></div><div class="p-side"><b id="p-round"></b><span id="p-item"></span></div><div class="p-bar"><i id="p-bar"></i></div></div>' +
      '<div class="p-info"><div class="p-row"><p class="p-phase" id="p-phase"></p><button class="swapbtn" data-p="swap" id="p-swap" aria-label="Changer d’exercice pour ce bloc">' + I.swap + 'Changer</button></div>' +
        '<h2 class="disp" id="p-name"></h2><p class="p-cue" id="p-cue"></p></div>' +
      '<div class="p-team" id="p-team" hidden></div>' +
      '<button class="p-stage" data-p="info" aria-label="Voir les points clés de l’exercice"><canvas id="p-fig"></canvas><span class="p-badge" id="p-badge"></span><span class="p-load" id="p-load"></span></button>' +      '<div class="p-next" id="p-next"><span class="thumb"><canvas id="p-nfig"></canvas></span><span class="row-t"><small id="p-nlabel"></small><b id="p-nname"></b></span></div>' +
      '<footer class="p-ctl">' +
        '<button class="ic" data-p="sound" id="p-sound" aria-label="Couper ou rétablir le son"></button>' +
        '<button class="ic lg" data-p="prev" aria-label="Revenir en arrière">' + I.prev + '</button>' +
        '<button class="playbtn" data-p="toggle" id="p-toggle" aria-label="Pause"></button>' +
        '<button class="ic lg" data-p="next" aria-label="Passer à la suite">' + I.next + '</button>' +
        '<button class="ic" data-p="info" aria-label="Points clés">' + I.info + '</button>' +
      '</footer><p class="p-wake" id="p-wake"></p><div class="p-stamp" id="p-stamp" aria-live="polite"></div></div>';
    overlay.classList.add('on');
    document.documentElement.classList.add('locked');
    audio(); wakeOn();
    if (P.sync) {
      P.counting = syncPos() < 0;
      paintSeg(false);
      if (P.counting) paintCountdown(-syncPos());
    } else paintSeg(true);
    clearInterval(timer);
    timer = setInterval(tick, 100);
  }

  function nextMove(i) {
    var segs = P.tl.segs, g = segs[i], j = (g.t === 'rest' || g.t === 'trans' || g.t === 'prep') ? g.nx + 1 : i + 1, pause = 0, kind = '';
    for (; j < segs.length; j++) {
      if (segs[j].t === 'rest' || segs[j].t === 'trans' || segs[j].t === 'prep') { pause += segs[j].dur; kind = segs[j].t; continue; }
      return { seg: segs[j], pause: pause, kind: kind };
    }
    return null;
  }

  function paintSeg(announce) {
    var g = P.tl.segs[P.i], s = P.s, ex = EX[myEx(g)], b = g.bi != null ? P.tl.blocks[g.bi] : null, pl = $('#player');
    if (!pl) return;
    pl.className = 'player s-' + s.type + ' ph-' + g.t + (P.run ? '' : ' paused') + (g.t === 'work' && g.fin ? ' inferno' : '');
    P.fired = {};
    P.cueI = 0;

    var sec, sub, phase = PHASE[g.t], name = ex ? ex.n : '', badge = '', cue = '';
    if (g.t === 'warm') { sec = 'Échauffement'; sub = 'Mouvement ' + g.n + ' sur ' + g.of; }
    else if (g.t === 'stretch') { sec = 'Étirements'; sub = 'Posture ' + g.n + ' sur ' + g.of; }
    else {
      sec = b.name + ' · ' + b.sub;
      if (g.t === 'work') sub = (g.rounds > 1 ? 'Tour ' + g.round + ' sur ' + g.rounds + ' · ' : '') + 'exercice ' + g.n + ' sur ' + g.of;
      else if (g.t === 'rest') sub = 'Récupère, respire';
      else sub = 'Installe ton matériel';
    }
    if (g.t === 'work' && g.tag) phase = 'Effort max';
    if (g.t === 'work' && g.fin) phase = db.settings.hard ? 'Zone rouge · fin de bloc' : (g.tag ? 'Effort max' : 'Dernier effort') + ' · fin de bloc';
    if (g.t === 'work' && P.team > 1) {
      var tp0 = teamPlan(g);
      if (tp0 && tp0[P.me || 0].rest) { var act0 = tp0.filter(function (x) { return !x.rest; })[0]; phase = 'À ' + (act0 ? act0.name : 'ton partenaire') + ' · récupère'; }
    }
    if (g.t === 'rest' || g.t === 'trans' || g.t === 'prep') badge = 'À suivre';
    $('#p-sec').textContent = sec;
    $('#p-sub').textContent = sub;
    $('#p-phase').textContent = phase;
    $('#p-name').textContent = name;
    $('#p-badge').textContent = badge;
    $('#p-badge').hidden = !badge;
    $('#p-swap').hidden = !(canSwap(g) && swapOptions(g).length > 1);
    paintTeam(g);
    paintLoad();
    $('#p-round').textContent = g.t === 'work' && g.rounds > 1 ? 'Tour ' + g.round + '/' + g.rounds : (g.t === 'warm' || g.t === 'stretch' ? g.n + '/' + g.of : '');
    $('#p-item').textContent = g.t === 'work' && g.of > 1 ? 'Exo ' + g.n + '/' + g.of : '';
    paintCue();

    var o = { shirt: SHIRT[s.type], paused: !P.run, bg: 'full', calm: g.t !== 'work' && g.t !== 'warm', look: LOOK(), heat: P.heat || 0 };
    if (ex) { if (P.fig) P.fig.set(ex, o); else P.fig = Fig.mount($('#p-fig'), ex, o); }

    var nx = nextMove(P.i), nb = $('#p-next');
    if (nx) {
      var nex = EX[myEx(nx.seg)];
      $('#p-nlabel').textContent = 'Ensuite' + (nx.pause ? ' · après ' + secLabel(nx.pause) + (nx.kind === 'rest' ? ' de repos' : ' de transition') : '') + ' · ' + secLabel(nx.seg.dur);
      $('#p-nname').textContent = nex.n;
      var no = { still: true, shirt: SHIRT[s.type], look: LOOK() };
      if (P.nfig) P.nfig.set(nex, no); else P.nfig = Fig.mount($('#p-nfig'), nex, no);
      nb.classList.remove('last');
    } else {
      $('#p-nlabel').textContent = 'Ensuite';
      $('#p-nname').textContent = g.t === 'stretch' ? 'Fin de la séance' : 'Étirements';
      nb.classList.add('last');
    }
    paintClock(true);
    paintCtl();

    var prev = P.i > 0 ? P.tl.segs[P.i - 1] : null, survived = announce && prev && prev.t === 'work' && prev.fin && g.t !== 'work';
    if (survived) stamp(prev.bi, g.t === 'stretch');
    if (announce) {
      buzz(g.t === 'work' ? (g.fin ? [260, 70, 260, 70, 260] : [180, 60, 180]) : 120);
      if (g.t === 'work') {
        SND.go();
        if (g.fin) SND.hell();
        var tp = P.team > 1 ? teamPlan(g) : null;
        if (tp) say((g.fin ? pickOne(coach().hell) + ' ' : '') + tp.map(function (x) { return x.name + ', ' + (x.rest ? 'récupère' : EX[x.ex].n); }).join('. ') + '.');
        else if (g.tag) say(ex.n + pickOne(coach().max));
        else if (g.fin) coachSay('hell');
        else if (g.rounds > 1 && g.round === g.rounds && g.n === 1) coachSay('last');
        else if (db.settings.hard && Math.random() < 0.4) coachSay('go');
      }
      else if (g.t === 'rest') { SND.rest(); coachSay('rest', ex.n + '.'); }
      else if (g.t === 'trans') { SND.rest(); say((survived ? pickOne(coach().survive) + ' ' : '') + 'Transition. ' + b.name.replace(' · ', ', ') + ' : ' + b.sub.replace(/\+/g, 'et') + '. Premier exercice : ' + ex.n + '.'); }
      else if (g.t === 'prep') { SND.rest(); say('Mise en place. ' + b.name + ' : ' + b.sub.replace(/\+/g, 'et') + '. Premier exercice : ' + ex.n + '.'); }
      else if (g.t === 'warm') { SND.go(); say((g.n === 1 ? 'Échauffement. ' : '') + ex.n + '.'); }
      else if (g.t === 'stretch') { SND.rest(); say((g.n === 1 ? (db.settings.hard ? 'Séance survécue. Tu es encore debout. Étirements. ' : 'Bravo, c’est fini. Étirements. ') : '') + ex.n + '.'); }
    }
    if (!P.sync) db.live = { sid: s.id, i: P.i, el: P.el, active: P.active, ts: Date.now() };
    save();
  }
  function paintLoad() {
    var ex = EX[myEx(P.tl.segs[P.i])], w = ex && ex.load ? loadLabel(ex.id) : '', el = $('#p-load');
    if (!el) return;
    el.textContent = w;
    el.hidden = !w;
  }
  function paintCue() {
    var g = P.tl.segs[P.i], ex = EX[myEx(g)], b = g.bi != null ? P.tl.blocks[g.bi] : null, cue = '';
    if (!ex) return;
    if (g.t === 'trans' || g.t === 'prep') cue = b.note || ex.cues[0];
    else if (g.t === 'rest') cue = ex.cues[0];
    else cue = ex.cues[P.cueI % ex.cues.length];
    $('#p-cue').textContent = cue;
  }
  function paintClock(force) {
    var g = P.tl.segs[P.i], rem = Math.max(0, g.dur - P.el), shown = Math.ceil(rem - 0.001);
    if (force || P.shown !== shown) {
      P.shown = shown;
      var txt = fmt(shown), h = '';
      for (var k = 0; k < txt.length; k++) h += txt.charAt(k) === ':' ? '<span class="c">:</span>' : '<span>' + txt.charAt(k) + '</span>';
      $('#p-digits').innerHTML = h;
      $('#p-total').textContent = fmt(P.tl.main - Math.min(P.tl.main, g.at + P.el) || (P.tl.total - g.at - P.el));
      $('#p-clock').classList.toggle('last3', shown <= 3 && g.dur >= 5 && P.run);
      $('#player').classList.toggle('quake', g.t === 'work' && !!g.fin && shown <= 5 && P.run);
    }
    $('#p-bar').style.transform = 'scaleX(' + (rem / g.dur).toFixed(4) + ')';
    var pos = g.at + P.el, bars = $('#p-prog').children;
    for (var i = 0; i < bars.length; i++) {
      var gr = P.tl.groups[i], f = Math.max(0, Math.min(1, (pos - gr.at) / gr.dur));
      bars[i].firstChild.style.transform = 'scaleX(' + f.toFixed(4) + ')';
    }
  }
  function paintCtl() {
    var on = db.settings.sound || db.settings.voice;
    $('#p-toggle').innerHTML = P.run ? I.pause : I.play;
    $('#p-toggle').setAttribute('aria-label', P.run ? 'Mettre en pause' : 'Reprendre');
    $('#p-sound').innerHTML = on ? I.sound : I.mute;
    $('#p-sound').setAttribute('aria-pressed', on ? 'false' : 'true');
    var pl = $('#player'); if (pl) pl.classList.toggle('paused', !P.run);
    if (P.fig) P.fig.o.paused = !P.run;
  }

  function tick() {
    if (!P || P.done) return;
    var now = Date.now(), dt = (now - P.last) / 1000, g, jumped = 0;
    P.last = now;
    if (P.sync) {
      // séance synchronisée : l'étape se déduit de l'horloge commune
      var pos = syncPos(), segs = P.tl.segs, i = P.i, wasRun = P.run;
      P.run = P.sync.state === 'run';
      if (wasRun !== P.run) { if (P.run) wakeOn(); paintCtl(); paintClock(true); }
      if (pos < 0) { P.counting = true; paintCountdown(-pos); return; }
      if (P.counting) { P.counting = false; P.cd = null; P.i = 0; P.el = Math.max(0, pos); paintSeg(true); return; }
      if (pos >= P.tl.total) { finish(false); return; }
      while (i < segs.length - 1 && pos >= segs[i].at + segs[i].dur) i++;
      while (i > 0 && pos < segs[i].at) i--;
      if (P.run && dt > 0 && dt < 5) P.active += dt;
      jumped = i !== P.i ? 1 : 0;
      P.i = i; P.el = pos - segs[i].at; g = segs[i];
      if (!P.run) { if (jumped) paintSeg(false); else paintClock(false); return; }
    } else {
      if (!P.run || dt <= 0) return;
      P.el += dt; P.active += dt;
      g = P.tl.segs[P.i];
      while (P.el >= g.dur) {
        P.el -= g.dur;
        if (P.i >= P.tl.segs.length - 1) { finish(false); return; }
        P.i++; jumped++;
        g = P.tl.segs[P.i];
      }
    }
    var tgt = g.t === 'work' && g.fin ? 0.35 + 0.65 * Math.pow(Math.min(1, P.el / g.dur), 1.5) : 0;
    P.heat = tgt > P.heat ? tgt : Math.max(tgt, P.heat - dt * 0.7);
    applyHeat();
    if (jumped) { paintSeg(P.el < 1.5); return; }

    var rem = g.dur - P.el, c = Math.ceil(rem);
    if (c <= 3 && c >= 1 && P.fired.c !== c && g.dur >= 5) { P.fired.c = c; SND.tick(); }
    var ex = EX[myEx(g)];
    if (ex && ex.sides && (g.t === 'work' || g.t === 'warm' || g.t === 'stretch') && g.dur >= 30 && !P.fired.half && P.el >= g.dur / 2) {
      P.fired.half = 1; SND.half(); buzz([90, 60, 90]); coachSay('side');
      var cu = $('#p-cue'); if (cu) cu.textContent = 'Change de côté.';
    }
    if (g.t === 'trans' && !P.fired.ten && c === 10) { P.fired.ten = 1; say('Dix secondes, en place !'); }
    if (g.t === 'work' && g.dur >= 40 && !P.fired.ten && c === 10) { P.fired.ten = 1; coachSay('ten'); }
    if (g.t === 'work' && g.dur >= 90 && !P.fired.mid && P.el >= g.dur / 2 && !(ex && ex.sides)) { P.fired.mid = 1; coachSay('mid'); }
    if ((g.t === 'work' || g.t === 'warm' || g.t === 'stretch') && ex) {
      var ci = Math.floor(P.el / 7);
      if (ci !== P.cueI && !(ex.sides && P.fired.half && P.el < g.dur / 2 + 5)) { P.cueI = ci; paintCue(); }
    }
    paintClock(false);
    if (!P.sync && now - P.saveAt > 4000) { P.saveAt = now; db.live = { sid: P.s.id, i: P.i, el: P.el, active: P.active, ts: now }; save(); }
  }
  function jump(dir) {
    if (!P || P.done) return;
    if (P.sync) {
      // saut appliqué à tout le salon
      var segs = P.tl.segs, ji = P.i;
      if (dir < 0) { if (!(P.el > 3 || ji === 0)) ji--; }
      else { if (ji >= segs.length - 1) { finish(false); return; } ji++; }
      var np = segs[ji].at + 0.01;
      syncSet(P.sync.state === 'run' ? { t0: serverNow() - np * 1000 } : { pausePos: np });
      tick(); return;
    }
    if (dir < 0) { if (P.el > 3 || P.i === 0) P.el = 0; else { P.i--; P.el = 0; } }
    else { if (P.i >= P.tl.segs.length - 1) { finish(false); return; } P.i++; P.el = 0; }
    P.last = Date.now();
    paintSeg(P.run);
  }
  function toggleRun() {
    if (!P || P.done) return;
    if (P.sync) {
      // pause et reprise pour tout le salon
      var pp = Math.max(0, syncPos());
      if (P.sync.state === 'run') { syncSet({ state: 'pause', pausePos: pp }); try { window.speechSynthesis.cancel(); } catch (e) { /* rien */ } }
      else { audio(); syncSet({ state: 'run', t0: serverNow() - pp * 1000 }); }
      P.last = Date.now(); tick(); paintCtl(); return;
    }
    P.run = !P.run; P.last = Date.now();
    if (P.run) { audio(); wakeOn(); } else { wakeOff(); try { window.speechSynthesis.cancel(); } catch (e) { /* rien */ } }
    paintCtl(); paintClock(true);
  }
  function quitPlayer() {
    roomClose();
    clearInterval(timer); wakeOff();
    try { window.speechSynthesis.cancel(); } catch (e) { /* rien */ }
    P = null; db.live = null; save();
    fx.parts = []; fx.burst = 0;
    overlay.classList.remove('on'); overlay.innerHTML = '';
    document.documentElement.classList.remove('locked');
    render();
  }
  function askQuit() {
    var was = P.run && !P.sync;
    if (was) toggleRun();
    var mainDone = P.tl.segs[P.i].at + P.el;
    ask('Arrêter la séance ?', fmt(mainDone) + ' écoulées sur ' + fmt(P.tl.main) + '.', [
      { label: 'Continuer la séance', cls: 'go', fn: function () { if (was) toggleRun(); } },
      { label: 'Terminer et enregistrer', fn: function () { finish(true); } },
      { label: 'Quitter sans enregistrer', cls: 'ghost', fn: quitPlayer }
    ]);
  }

  // ------------------------------------------------------------------ bilan de fin de séance
  function loadOf(id) { return db.weights[id] || sugLoad(id) || 0; }
  function loadLabel(id) { var w = loadOf(id); return w ? (db.weights[id] ? '' : '≈ ') + w + ' kg' : ''; }
  function stepper(id, attr, key, value, unit, step) {
    return '<span class="unit"><button type="button" class="st" data-step="-' + step + '" data-for="' + id + '" aria-label="Diminuer">−</button>' +
      '<input type="number" inputmode="decimal" min="0" step="0.5" id="' + id + '" ' + attr + '="' + key + '" value="' + (value || '') + '" placeholder="—">' +
      '<button type="button" class="st" data-step="' + step + '" data-for="' + id + '" aria-label="Augmenter">+</button><em>' + unit + '</em></span>';
  }
  function lastScore(sid, scId) {
    for (var i = db.history.length - 1; i >= 0; i--) {
      var h = db.history[i];
      if (h.sid === sid && h.scores && h.scores[scId]) return h.scores[scId];
    }
    return 0;
  }
  function finish(partial) {
    if (!P) return;
    P.done = true; P.run = false;
    roomClose();
    clearInterval(timer); wakeOff();
    var s = P.s, tl = P.tl, pos = tl.segs[P.i].at + P.el;
    var isPartial = partial && pos < tl.main - 1;
    if (!partial) { SND.end(); buzz([200, 80, 200, 80, 400]); coachSay('end'); }
    var used = {};
    tl.segs.forEach(function (x) { if (x.t === 'work') used[x.ex] = 1; });
    var loads = Object.keys(used).filter(function (id) { return EX[id].load; });
    var rpe0 = s.rpe || 7, sg = SUG[s.type] || SUG.mixte, lv = lastVitals(s.id), frac = Math.min(1, pos / tl.main);
    overlay.innerHTML = '<div class="player finish s-' + s.type + '"><div class="fin">' +
      '<p class="eyebrow acc">' + (isPartial ? 'Séance écourtée' : 'Séance terminée') + '</p>' +
      '<h1 class="disp fin-n">' + esc(s.name) + '</h1>' +
      '<p class="fin-t"><b class="disp">' + fmt(P.active) + '</b> de travail' + (isPartial ? ' sur ' + fmt(tl.main) + ' prévues' : ', étirements compris') + '</p>' +
      '<p class="note">Les valeurs sont déjà remplies : tes derniers chiffres, ou une proposition selon ton profil (poids et niveau dans Réglages). Corrige avec + et − puis enregistre.</p>' +
      '<section><h2 class="h2">Effort ressenti</h2><div class="rpe" id="fin-rpe" role="radiogroup" aria-label="Effort ressenti sur 10">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return '<button role="radio" aria-checked="' + (n === rpe0 ? 'true' : 'false') + '" data-rpe="' + n + '">' + n + '</button>'; }).join('') +
        '</div><p class="hint">1 = très facile · 10 = effort maximal</p></section>' +
      (s.scores ? '<section><h2 class="h2">Scores</h2>' + s.scores.map(function (sc) {
        return '<div class="field inline"><label for="fin-sc-' + sc.id + '">' + esc(sc.label) + '</label>' + stepper('fin-sc-' + sc.id, 'data-score', sc.id, lastScore(s.id, sc.id) || scoreSug(sc), sc.unit, sc.step || 1) + '</div>';
      }).join('') + '</section>' : '') +
      '<section><h2 class="h2">Dépense et cardio</h2>' +
        '<div class="field inline"><label for="fin-kcal">Calories dépensées</label>' + stepper('fin-kcal', 'data-k', 'kcal', lv.kcal || Math.round(sg.kcal * frac * kg() / 88 / 10) * 10, 'kcal', 10) + '</div>' +
        '<div class="field inline"><label for="fin-hr-avg">Fréquence moyenne</label>' + stepper('fin-hr-avg', 'data-k', 'avg', lv.avg || sg.hr[0], 'bpm', 1) + '</div>' +
        '<div class="field inline"><label for="fin-hr-max">Fréquence maximale</label>' + stepper('fin-hr-max', 'data-k', 'max', lv.max || sg.hr[1], 'bpm', 1) + '</div>' +
        '<p class="hint">Recopie les trois chiffres de ta montre : ils servent à comparer les séances entre elles.</p></section>' +
      (loads.length ? '<section><h2 class="h2">Charges utilisées</h2><p class="hint">Par haltère, ou barre chargée.</p>' + loads.map(function (id) {
        return '<div class="field inline"><label for="fin-w-' + id + '">' + esc(EX[id].n) + '</label>' + stepper('fin-w-' + id, 'data-w', id, loadOf(id), 'kg', EX[id].step || 2) + '</div>';
      }).join('') + '</section>' : '') +
      '<section><h2 class="h2">Note</h2><textarea id="fin-note" rows="2" placeholder="Sensations, matériel indisponible, idée pour la prochaine fois…"></textarea></section>' +
      '<div class="btncol"><button class="btn go" data-p="save">Enregistrer la séance</button><button class="btn" data-p="savemini">Enregistrer et enchaîner un mini challenge</button><button class="btn ghost" data-p="discard">Ne pas enregistrer</button></div>' +
      '</div></div>';
    P.partial = isPartial;
    P.hr = null;
  }
  function saveSession(chain) {
    var full = !P.partial;
    var s = P.s, rpeBtn = $('#fin-rpe [aria-checked="true"]'), scores = {};
    $$('[data-score]', overlay).forEach(function (i) { if (i.value !== '') scores[i.getAttribute('data-score')] = parseFloat(i.value); });
    $$('[data-w]', overlay).forEach(function (i) {
      var v = parseFloat(i.value), id = i.getAttribute('data-w');
      if (v > 0) db.weights[id] = v; else if (i.value === '') delete db.weights[id];
    });
    var now = new Date(), ha = parseInt($('#fin-hr-avg').value, 10) || 0, hm = parseInt($('#fin-hr-max').value, 10) || 0;
    pendingRecord = beatsRecord(s, scores);
    db.history.push({ team: P.team > 1 ? P.team : 0, id: now.getTime(), sid: s.id, date: ymd(now), ts: now.getTime(), dur: Math.round(P.active), partial: !!P.partial,
      rpe: rpeBtn ? +rpeBtn.getAttribute('data-rpe') : 0, scores: scores, note: ($('#fin-note').value || '').trim().slice(0, 400),
      hr: (ha || hm) ? { avg: ha, max: hm } : null, kcal: parseInt($('#fin-kcal').value, 10) || 0 });
    route = { name: 'home', id: null };
    quitPlayer();
    afterSave(full ? 'Séance enregistrée. Bien joué !' : 'Séance enregistrée', chain, full);
  }
  // ------------------------------------------------------------------ réglages du son
  function volControls() {
    function sl(id, label, key) {
      return '<label class="field"><span>' + label + '</span><input type="range" min="0" max="1" step="0.05" id="' + id + '" data-vol="' + key + '" value="' + db.settings[key] + '"></label>';
    }
    return sl('vol-voice', 'Volume des annonces vocales', 'vVoice') + sl('vol-beep', 'Volume des bips', 'vBeep');
  }
  function swHtml(id, label, hint) {
    return '<label class="sw"><span><b>' + label + '</b><small>' + hint + '</small></span><input type="checkbox" id="snd-' + id + '" data-set="' + id + '"' + (db.settings[id] ? ' checked' : '') + '><i></i></label>';
  }
  function openSound() {
    sheet.innerHTML = '<div class="sheet-bg" data-sheet="close"></div><div class="sheet-p" role="dialog" aria-modal="true" aria-label="Réglages du son">' +
      '<button class="ic sheet-x alt" data-sheet="close" aria-label="Fermer">' + I.close + '</button>' +
      '<h2 class="disp sheet-n">Son</h2>' +
      swHtml('voice', 'Annonces vocales', 'Prochain exercice, encouragements') +
      swHtml('hard', 'Coach sans pitié', 'Encouragements musclés, façon David Goggins') +
      swHtml('sound', 'Bips', 'Décompte 3-2-1, début et fin d’effort') +
      volControls() +
      '<p class="hint">Ta musique continue en fond. Règle ici le niveau des annonces par rapport à elle.</p></div>';
    sheet.classList.add('on');
  }

  // ------------------------------------------------------------------ coach : deux styles d'annonces
  var COACH = {
    classic: {
      rest: ['Repos. Ensuite : ', 'Souffle ! On enchaîne avec : ', 'Bien joué, récupère. Prochain exercice : '],
      last: ['Dernier tour, on donne tout !'],
      ten: ['Dix secondes, tiens bon !', 'Encore dix secondes, lâche rien !', 'Dix secondes, accélère !'],
      mid: ['Mi-parcours, garde le rythme !'],
      side: ['Change de côté.'],
      max: [', à fond, tout ce qui reste !'],
      go: ['C’est parti !'],
      end: ['Séance terminée. Bravo, beau travail !'],
      mini: ['Mini challenge terminé. Bien joué !'],
      hell: ['Dernier exercice du bloc, vide le réservoir !', 'Fin de bloc : tout ce qui reste !', 'Dernier effort du bloc, accroche-toi !'],
      survive: ['Bloc terminé, bien joué !', 'Bloc bouclé, bravo !']
    },
    hard: {
      rest: ['Repos. Respire, mais ne te raconte pas d’histoires. Ensuite : ', 'Profite, ça ne va pas durer. Ensuite : ', 'Tu souffles ? Très bien. La suite arrive : ', 'Repos mérité, pas offert. Ensuite : '],
      last: ['Dernier tour. C’est ici que les autres abandonnent. Pas toi !', 'Dernier tour ! Personne ne viendra le finir à ta place !'],
      ten: ['Dix secondes ! Ton cerveau te ment, tu en as encore !', 'Dix secondes. Reste dur !', 'Tu veux arrêter ? Trop tard. Dix secondes !', 'Dix secondes ! La douleur passe, la fierté reste !'],
      mid: ['Tu n’es qu’à quarante pour cent de ce que tu peux donner. Accélère !', 'Mi-parcours. Le confort, ce sera pour demain !'],
      side: ['Change de côté. Même guerre, autre côté !'],
      max: [', à fond ! Vide le réservoir, il ne sert à rien plein !'],
      go: ['Au boulot !', 'Montre-moi qui tu es !', 'Qui va porter les bateaux ? Toi !', 'Pas d’excuses. On y va !', 'Va chercher ton âme !'],
      end: ['Terminé. Tu ne t’es pas dégonflé. Reste dur !', 'Séance pliée. Aujourd’hui, tu as gagné contre toi-même. Reste dur !'],
      mini: ['Du rab, et tu l’as fini. C’est comme ça qu’on se construit. Reste dur !'],
      hell: ['Bienvenue en enfer. C’est ici que tout se joue !', 'Ça brûle ? Parfait. C’est là que tu grandis !', 'Tu es dans tes retranchements. Personne ne viendra te sauver !', 'Le feu monte. Toi aussi !'],
      survive: ['Bloc survécu. L’enfer reprend après la pause.', 'Tu es encore debout. Bien. On continue.', 'Survécu. Ne te relâche pas, ce n’est pas fini.']
    }
  };
  function coach() { return db.settings.hard ? COACH.hard : COACH.classic; }
  function coachSay(key, suffix) { say(pickOne(coach()[key]) + (suffix || '')); }

  // ------------------------------------------------------------------ matériel disponible
  var EQUIP = ['Rameur', 'SkiErg', 'Vélo', 'Barre', 'Haltères', 'Kettlebell', 'Banc', 'Box', 'Ballon'];
  var POOL = ['jump_squat', 'climbers', 'high_knees', 'jacks', 'v_up', 'superman', 'air_squat', 'shoulder_taps', 'leg_raise', 'situp', 'plank', 'bridge', 'pushup', 'lunge_fwd', 'burpee', 'lunge_jump', 'dead_bug', 'hollow_rock', 'side_plank'];
  function have(e) {
    if (e === 'Tapis') return true;
    if (e === 'Slam ball' || e === 'Med ball') e = 'Ballon';
    var q = db.settings.equip;
    return !q || q[e] !== false;
  }
  function canDo(id) { return EX[id].eq.every(have) && !hurts(id); }
  // g : mouvements déjà placés ailleurs dans la séance, pour varier les remplaçants
  function adaptItems(b, g) {
    var used = {}, map = {}, swapped = 0;
    g = g || {};
    var items = b.items.map(itemOf);
    items.forEach(function (it) { if (canDo(it.ex)) used[it.ex] = 1; });
    items = items.map(function (it) {
      var id = it.ex, c = {}, k, i, alts;
      if (!canDo(id)) {
        if (!map[id]) {
          alts = (EX[id].alts || []).concat(POOL).filter(function (a) { return canDo(a) && !used[a]; });
          for (i = 0; i < alts.length; i++) if (!g[alts[i]]) break;
          map[id] = alts[i < alts.length ? i : 0] || SAFE.filter(canDo)[0] || id;
          used[map[id]] = 1;
          swapped++;
        }
        id = map[id];
      }
      for (k in it) c[k] = it[k];
      c.ex = id;
      g[id] = 1;
      return c;
    });
    items.swapped = swapped;
    return items;
  }
  function resetTimelines() { PROG.months.forEach(function (m) { m.sessions.forEach(function (s) { delete s._tl; }); }); }
  function sessionEquip(tl) {
    var seen = {}, out = [];
    tl.moves.forEach(function (id) { EX[id].eq.forEach(function (e) { if (e !== 'Tapis' && !seen[e]) { seen[e] = 1; out.push(e); } }); });
    out.push('Tapis');
    return out;
  }
  function equipLabel() {
    var n = EQUIP.filter(have).length;
    return n === EQUIP.length ? 'Salle complète' : n === 0 ? 'Poids du corps' : n + ' équipements sur ' + EQUIP.length;
  }
  function openEquip() {
    sheet.innerHTML = '<div class="sheet-bg" data-sheet="close"></div><div class="sheet-p" role="dialog" aria-modal="true" aria-label="Matériel disponible">' +
      '<button class="ic sheet-x alt" data-sheet="close" aria-label="Fermer">' + I.close + '</button>' +
      '<h2 class="disp sheet-n">Matériel</h2>' +
      '<p class="hint">Décoche ce que tu n’as pas sous la main : chaque séance remplace les mouvements concernés et garde sa durée.</p>' +
      '<div class="btnrow"><button class="chip" data-preset="all">Salle complète</button><button class="chip" data-preset="db">Haltères seuls</button><button class="chip" data-preset="none">Poids du corps</button></div>' +
      EQUIP.map(function (e, i) {
        return '<label class="sw"><span><b>' + e + '</b></span><input type="checkbox" id="eq-' + i + '" data-eq="' + e + '"' + (have(e) ? ' checked' : '') + '><i></i></label>';
      }).join('') + '</div>';
    sheet.classList.add('on');
  }
  function setEquip(q) {
    var all = q && EQUIP.every(function (e) { return q[e] !== false; });
    db.settings.equip = !q || all ? null : q;
    save(); resetTimelines(); render();
  }
  function presetEquip(p) {
    var q = {};
    if (p !== 'all') EQUIP.forEach(function (e) { q[e] = p === 'db' && e === 'Haltères'; });
    setEquip(p === 'all' ? null : q);
    openEquip();
  }

  // ------------------------------------------------------------------ dépense, effort, badges
  // Repères de départ pour 88 kg (calories sur 45 min, fréquence moyenne et maximale).
  var SUG = { renfo: { kcal: 420, hr: [145, 175] }, cardio: { kcal: 620, hr: [163, 184] }, mixte: { kcal: 540, hr: [156, 182] }, defi: { kcal: 640, hr: [165, 186] } };
  var pendingRecord = false;
  function lastVitals(sid) {
    for (var i = db.history.length - 1; i >= 0; i--) {
      var h = db.history[i];
      if (h.sid === sid && !h.partial && (h.kcal || h.hr)) return { kcal: h.kcal || 0, avg: h.hr ? h.hr.avg : 0, max: h.hr ? h.hr.max : 0 };
    }
    return {};
  }
  function beatsRecord(s, scores) {
    return !!s.scores && s.scores.some(function (sc) {
      var best = 0;
      db.history.forEach(function (h) { if (h.sid === s.id && h.scores && +h.scores[sc.id] > best) best = +h.scores[sc.id]; });
      return best > 0 && +scores[sc.id] > best;
    });
  }
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function stats() {
    var H = db.history.filter(counts), byWeek = {}, kcal = 0, rs = 0, rn = 0, kinds = {}, st = { n: H.length, minis: db.minis.filter(function (m) { return m.done >= m.total; }).length };
    H.forEach(function (h) {
      var k = weekIndex(parseYmd(h.date));
      (byWeek[k] = byWeek[k] || {})[h.sid] = 1;
      kinds[h.sid] = 1;
      if (h.rpe) { rs += h.rpe; rn++; }
    });
    db.history.forEach(function (h) { kcal += h.kcal || 0; });
    function ok(w) { return byWeek[w] && Object.keys(byWeek[w]).length >= 3; }
    var wi = Math.max(0, weekIndex(new Date())), w = ok(wi) ? wi : wi - 1, run = 0, best = 0;
    while (w >= 0 && ok(w)) { run++; w--; }
    Object.keys(byWeek).forEach(function (k) { best = Math.max(best, Object.keys(byWeek[k]).length); });
    st.kcal = kcal; st.rpe = rn ? rs / rn : 0; st.distinct = Object.keys(kinds).length; st.streak = run; st.bestWeek = best;
    st.rpe10 = H.some(function (h) { return h.rpe === 10; });
    st.hr190 = db.history.some(function (h) { return h.hr && h.hr.max >= 190; });
    st.early = H.some(function (h) { return new Date(h.ts).getHours() < 8; });
    st.extreme = db.minis.some(function (m) { return m.extreme && m.done >= m.total; });
    st.record = pendingRecord || !!db.badges.record;
    return st;
  }
  var BADGES = [
    { id: 'premier', g: '1', c: 'renfo', n: 'Premier pas', d: 'Une séance terminée', t: function (s) { return s.n >= 1; } },
    { id: 'trio', g: '3', c: 'mixte', n: 'Contrat rempli', d: 'Trois séances dans la semaine', t: function (s) { return s.bestWeek >= 3; } },
    { id: 'quinte', g: '5/5', c: 'mixte', n: 'Semaine parfaite', d: 'Les cinq séances dans la semaine', t: function (s) { return s.bestWeek >= 5; } },
    { id: 'serie2', g: '×2', c: 'mixte', n: 'Régulier', d: 'Deux semaines d’affilée à trois séances', t: function (s) { return s.streak >= 2; } },
    { id: 'serie4', g: '×4', c: 'mixte', n: 'Mois de fer', d: 'Quatre semaines d’affilée à trois séances', t: function (s) { return s.streak >= 4; } },
    { id: 'tour', g: 'A–Z', c: 'renfo', n: 'Tour complet', d: 'Les cinq séances faites au moins une fois', t: function (s) { return s.distinct >= 5; } },
    { id: 'dix', g: '10', c: 'renfo', n: 'Dix au compteur', d: 'Dix séances terminées', t: function (s) { return s.n >= 10; } },
    { id: 'vingtcinq', g: '25', c: 'renfo', n: 'Vingt-cinq', d: 'Vingt-cinq séances terminées', t: function (s) { return s.n >= 25; } },
    { id: 'kcal5', g: '5K', c: 'cardio', n: 'Fournaise', d: '5 000 kcal dépensées', t: function (s) { return s.kcal >= 5000; } },
    { id: 'kcal20', g: '20K', c: 'cardio', n: 'Haut fourneau', d: '20 000 kcal dépensées', t: function (s) { return s.kcal >= 20000; } },
    { id: 'mal', g: '10/10', c: 'cardio', n: 'Dans le mal', d: 'Une séance notée 10 sur 10', t: function (s) { return s.rpe10; } },
    { id: 'rouge', g: '190', c: 'cardio', n: 'Zone rouge', d: '190 bpm ou plus au maximum', t: function (s) { return s.hr190; } },
    { id: 'aube', g: '8 h', c: 'defi', n: 'Lève-tôt', d: 'Une séance bouclée avant 8 h', t: function (s) { return s.early; } },
    { id: 'record', g: 'PR', c: 'defi', n: 'Record battu', d: 'Un score amélioré', t: function (s) { return s.record; } },
    { id: 'rab', g: '+1', c: 'defi', n: 'Du rab', d: 'Un mini challenge terminé', t: function (s) { return s.minis >= 1; } },
    { id: 'rab5', g: '+5', c: 'defi', n: 'Insatiable', d: 'Cinq mini challenges terminés', t: function (s) { return s.minis >= 5; } },
    { id: 'extreme', g: 'XT', c: 'defi', n: 'Version extrême', d: 'Le 40 – 40 extrême terminé', t: function (s) { return s.extreme; } }
  ];
  function medal(b, on, big) {
    return '<li class="bdg s-' + b.c + (on ? ' on' : '') + (big ? ' big' : '') + '"><span class="medal"><b class="disp">' + b.g + '</b></span><strong>' + esc(b.n) + '</strong><small>' + esc(b.d) + '</small></li>';
  }
  function checkBadges() {
    var st = stats(), fresh = [];
    BADGES.forEach(function (b) { if (!db.badges[b.id] && b.t(st)) { db.badges[b.id] = ymd(new Date()); fresh.push(b); } });
    pendingRecord = false;
    if (fresh.length) save();
    return fresh;
  }
  function badgeSection() {
    var got = BADGES.filter(function (b) { return db.badges[b.id]; }).length;
    return '<section><h2 class="h2">Badges · ' + got + ' sur ' + BADGES.length + '</h2><ul class="badges">' +
      BADGES.map(function (b) { return medal(b, !!db.badges[b.id]); }).join('') + '</ul></section>';
  }
  function showBadges(list, then) {
    sheet.innerHTML = '<div class="sheet-bg"></div><div class="dialog" role="alertdialog" aria-modal="true"><p class="eyebrow">' + (list.length > 1 ? 'Badges débloqués' : 'Badge débloqué') + '</p>' +
      '<ul class="badges won">' + list.map(function (b) { return medal(b, true, true); }).join('') + '</ul>' +
      (function () {
        var r = [];
        list.forEach(function (b) { itemsFor(b.id).forEach(function (x) { r.push(x.n); }); });
        return r.length ? '<p class="won-r">Nouveau au vestiaire : <b>' + esc(r.join(', ')) + '</b></p>' : '';
      })() +
      '<button class="btn go" id="bdg-ok">Continuer</button></div>';
    sheet.classList.add('on');
    $('#bdg-ok').addEventListener('click', function () { closeSheet(); if (then) then(); });
  }
  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'), w = c.width = window.innerWidth, h = c.height = window.innerHeight, x = c.getContext('2d');
    var cols = ['#ffb224', '#ff6250', '#37d6b4', '#b99aff', '#f0f4f0'], ps = [], i, t0 = performance.now();
    c.className = 'confetti'; document.body.appendChild(c);
    for (i = 0; i < 120; i++) ps.push({ x: Math.random() * w, y: -20 - Math.random() * h * 0.5, vx: (Math.random() - 0.5) * 2.6, vy: 2.6 + Math.random() * 4.2, s: 6 + Math.random() * 6, r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.3, c: cols[i % cols.length] });
    (function step(now) {
      var k = (now - t0) / 2800;
      if (k >= 1 || !c.isConnected) { c.remove(); return; }
      x.clearRect(0, 0, w, h);
      x.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1;
      ps.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      requestAnimationFrame(step);
    })(t0);
  }
  function afterSave(msg, chain, big) {
    var fresh = checkBadges();
    if (fresh.length || big) confetti();
    if (fresh.length) showBadges(fresh, chain ? openMinis : null);
    else { toast(msg); if (chain) openMinis(); }
  }
  function weekTiles(entries) {
    var kcal = 0, rs = 0, rn = 0, wi = Math.max(0, weekIndex(new Date()));
    db.history.forEach(function (h) { if (weekIndex(parseYmd(h.date)) === wi) kcal += h.kcal || 0; });
    entries.forEach(function (h) { if (h.rpe) { rs += h.rpe; rn++; } });
    return '<dl class="stats three"><div><dd class="disp">' + num(kcal) + '</dd><dt>kcal cette semaine</dt></div>' +
      '<div><dd class="disp">' + (rn ? (rs / rn).toFixed(1).replace('.', ',') : '—') + '</dd><dt>effort moyen sur 10</dt></div>' +
      '<div><dd class="disp">' + stats().streak + '</dd><dt>semaines d’affilée</dt></div></dl>';
  }
  function intensitySection() {
    var rows = [];
    PROG.months.forEach(function (m) {
      m.sessions.forEach(function (s) {
        var hs = db.history.filter(function (h) { return h.sid === s.id && counts(h); }), k = 0, kn = 0, a = 0, an = 0, mx = 0, r = 0, rn = 0;
        if (!hs.length) return;
        hs.forEach(function (h) {
          if (h.kcal) { k += h.kcal; kn++; }
          if (h.hr && h.hr.avg) { a += h.hr.avg; an++; }
          if (h.hr && h.hr.max > mx) mx = h.hr.max;
          if (h.rpe) { r += h.rpe; rn++; }
        });
        rows.push({ s: s, n: hs.length, kcal: kn ? k / kn : 0, avg: an ? a / an : 0, max: mx, rpe: rn ? r / rn : 0 });
      });
    });
    rows.sort(function (x, y) { return (y.avg - x.avg) || (y.rpe - x.rpe); });
    return '<section><h2 class="h2">Intensité par séance</h2>' + (rows.length ? '<ul class="inten">' + rows.map(function (o) {
      return '<li class="s-' + o.s.type + '"><div class="in-h"><b class="disp">' + esc(o.s.name) + '</b><span>' + o.n + (o.n > 1 ? ' séances' : ' séance') + '</span></div>' +
        '<div class="in-bar"><i style="width:' + Math.round(o.rpe * 10) + '%"></i></div>' +
        '<p><b>' + (o.kcal ? num(o.kcal) : '—') + '</b> kcal · <b>' + (o.avg ? Math.round(o.avg) : '—') + '</b> bpm moy. · <b>' + (o.max || '—') + '</b> bpm max · effort <b>' + (o.rpe ? o.rpe.toFixed(1).replace('.', ',') : '—') + '</b></p></li>';
    }).join('') + '</ul><p class="hint">Classées de la plus éprouvante à la plus douce pour le cœur. La barre représente l’effort ressenti moyen sur 10.</p>' :
      '<p class="empty">Après ta première séance, tu verras ici laquelle te met le plus dans le mal.</p>') + '</section>';
  }

  // ------------------------------------------------------------------ mini challenges
  var M = null, mtimer = 0;
  function miniById(id) { return PROG.minis.filter(function (c) { return c.id === id; })[0]; }
  function miniDay(c) {
    var wi = weekIndex(new Date());
    var n = db.minis.filter(function (m) { return m.cid === c.id && m.done >= m.total && weekIndex(parseYmd(m.date)) === wi; }).length;
    return Math.min(c.days || 1, n + 1);
  }
  function miniItems(c, extreme) {
    var src = extreme && c.extreme ? c.extreme : c.items, out = [], day = miniDay(c);
    (c.rounds || [0]).forEach(function (r) {
      src.forEach(function (it) {
        var reps = c.rounds ? r : (Array.isArray(it[1]) ? it[1][day - 1] : it[1]);
        out.push({ ex: it[0], label: typeof reps === 'number' ? reps + ' ×' : reps, name: it[2] || EX[it[0]].n, done: false });
      });
    });
    return out;
  }
  function miniCards() {
    return '<div class="minis">' + PROG.minis.map(function (c) {
      return '<button class="mcard" data-mini="' + c.id + '"><span class="kind">' + esc(c.dur) + '</span><span class="disp mini-n">' + esc(c.name) + '</span>' +
        '<span class="mini-t">' + esc(c.tag) + (c.days ? ' · jour ' + miniDay(c) + ' sur ' + c.days : '') + '</span></button>';
    }).join('') + '</div>';
  }
  function minisSection() {
    return '<section class="list s-defi"><h2 class="h2">Mini challenges</h2><p class="hint">En forme ? Ajoute un supplément après ta séance, ou fais-le seul un jour de repos.</p>' + miniCards() + '</section>';
  }
  function openMinis() {
    sheet.innerHTML = '<div class="sheet-bg" data-sheet="close"></div><div class="sheet-p s-defi" role="dialog" aria-modal="true" aria-label="Mini challenges">' +
      '<button class="ic sheet-x alt" data-sheet="close" aria-label="Fermer">' + I.close + '</button>' +
      '<h2 class="disp sheet-n">Encore un peu ?</h2><p class="hint">Choisis ton supplément. Il se fait au nombre de répétitions, à ton rythme, chronomètre lancé.</p>' + miniCards() + '</div>';
    sheet.classList.add('on');
  }
  function miniRows() {
    return M.items.map(function (it, i) {
      return '<li><button class="m-row" data-mi="' + i + '"><span class="m-check">' + I.check + '</span><span class="m-reps disp">' + esc(it.label) + '</span><span class="m-name">' + esc(it.name) + '</span></button></li>';
    }).join('');
  }
  function startMini(id) {
    var c = miniById(id);
    if (!c) return;
    closeSheet();
    M = { c: c, extreme: false, items: miniItems(c, false), t0: Date.now(), fig: null };
    overlay.innerHTML = '<div class="player mini s-defi" id="mini">' +
      '<header class="p-top"><button class="ic" data-m="quit" aria-label="Quitter le mini challenge">' + I.close + '</button>' +
        '<div class="p-where"><b>Mini challenge · ' + esc(c.name) + '</b><span id="m-sub"></span></div>' +
        '<div class="p-rem"><span>Chrono</span><b id="m-clock">0:00</b></div></header>' +
      '<div class="p-stage m-stage"><canvas id="m-fig"></canvas><span class="p-badge" id="m-now"></span></div>' +
      (c.extreme ? '<label class="sw m-x"><span><b>Version extrême</b><small>Devil’s press et squats chargés</small></span><input type="checkbox" id="m-extreme" data-mx="1"><i></i></label>' : '') +
      '<ul class="m-list" id="m-list">' + miniRows() + '</ul>' +
      '<footer class="m-foot"><button class="btn go" data-m="finish">Terminer le challenge</button></footer></div>';
    overlay.classList.add('on');
    document.documentElement.classList.add('locked');
    audio(); wakeOn();
    paintMini();
    clearInterval(mtimer);
    mtimer = setInterval(function () { var el = $('#m-clock'); if (M && el) el.textContent = fmt((Date.now() - M.t0) / 1000); }, 500);
    SND.go();
    if (db.settings.hard) coachSay('go');
  }
  function paintMini() {
    var cur = -1, done = 0, rows = $$('#m-list .m-row');
    M.items.forEach(function (it, i) { if (it.done) done++; else if (cur < 0) cur = i; });
    rows.forEach(function (r, i) { r.classList.toggle('done', M.items[i].done); r.classList.toggle('cur', i === cur); });
    $('#m-sub').textContent = done + ' sur ' + M.items.length + (M.c.days ? ' · jour ' + miniDay(M.c) + ' sur ' + M.c.days : '');
    var it = M.items[cur < 0 ? M.items.length - 1 : cur], o = { shirt: SHIRT.defi, bg: 'full' };
    $('#m-now').textContent = cur < 0 ? 'Terminé' : it.label + ' ' + it.name;
    if (M.fig) M.fig.set(EX[it.ex], o); else M.fig = Fig.mount($('#m-fig'), EX[it.ex], o);
    if (cur >= 0 && rows[cur] && rows[cur].scrollIntoView) rows[cur].scrollIntoView({ block: 'nearest' });
  }
  function toggleMini(i) {
    var it = M.items[i];
    it.done = !it.done;
    if (it.done) {
      buzz(80);
      if (M.items.every(function (x) { return x.done; })) { SND.end(); coachSay('mini'); }
      else { SND.tick(); if (db.settings.hard && Math.random() < 0.35) coachSay('go'); }
    }
    paintMini();
  }
  function closeMini() {
    clearInterval(mtimer); wakeOff();
    M = null;
    overlay.classList.remove('on'); overlay.innerHTML = '';
    document.documentElement.classList.remove('locked');
    render();
  }
  function finishMini() {
    var done = M.items.filter(function (x) { return x.done; }).length, now = new Date(), dur = Math.round((now - M.t0) / 1000), c = M.c, ex = M.extreme;
    if (!done) { closeMini(); return; }
    db.minis.push({ id: now.getTime(), cid: c.id, date: ymd(now), ts: now.getTime(), dur: dur, done: done, total: M.items.length, extreme: ex });
    save();
    var total = M.items.length;
    closeMini();
    if (done >= total) afterSave(c.name + ' terminé en ' + fmt(dur), false, true); else toast(c.name + ' : ' + done + ' sur ' + total + ' enregistré');
  }
  function miniAct(a) {
    if (!M) return;
    if (a === 'finish') finishMini();
    else if (a === 'quit') {
      if (!M.items.some(function (x) { return x.done; })) { closeMini(); return; }
      ask('Arrêter le mini challenge ?', 'Ce que tu as déjà fait peut être enregistré.', [
        { label: 'Continuer', cls: 'go' },
        { label: 'Enregistrer et arrêter', fn: finishMini },
        { label: 'Quitter sans enregistrer', cls: 'ghost', fn: closeMini }
      ]);
    }
  }
  function miniJournal() {
    if (!db.minis.length) return '';
    return '<section><h2 class="h2">Mini challenges</h2><ul class="kv">' + db.minis.slice().reverse().slice(0, 12).map(function (m) {
      var c = miniById(m.cid);
      return '<li><span>' + esc(c ? c.name : m.cid) + (m.extreme ? ' · extrême' : '') + '<small>' + niceDate(parseYmd(m.date)) + (m.done < m.total ? ' · ' + m.done + ' sur ' + m.total : '') + '</small></span><b>' + fmt(m.dur) + '</b></li>';
    }).join('') + '</ul></section>';
  }

  // ------------------------------------------------------------------ logo
  function logo(id) {
    return '<svg class="logo" viewBox="0 0 512 512" aria-hidden="true"><defs><linearGradient id="lf' + id + '" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0" stop-color="#ff3d2e"/><stop offset=".55" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs>' +
      '<circle cx="256" cy="256" r="176" fill="none" stroke="#1d3a47" stroke-width="30"/>' +
      '<circle cx="256" cy="256" r="176" fill="none" stroke="url(#lf' + id + ')" stroke-width="30" stroke-linecap="round" stroke-dasharray="830 1106" transform="rotate(-90 256 256)"/>' +
      '<path fill="url(#lf' + id + ')" d="M256 104C298 160 350 196 350 282C350 342 308 388 256 388C204 388 162 342 162 282C162 238 186 208 206 188C210 224 222 246 242 258C234 206 236 154 256 104Z"/>' +
      '<path d="M206 344L256 294L306 344" fill="none" stroke="#0b1920" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function durLabel(s) { s = s || 0; return s < 60 ? 'moins d’une minute' : Math.round(s / 60) + ' min'; }

  // ------------------------------------------------------------------ profil : charges et calories proposées
  var LEVELS = [['debut', 'Débutant', 0.6], ['inter', 'Intermédiaire', 0.8], ['conf', 'Confirmé', 1]];
  function lvf() { for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i][0] === db.settings.level) return LEVELS[i][2]; return 0.8; }
  function kg() { return Math.max(40, Math.min(160, +db.settings.kg || 75)); }
  // charges de base pensées pour 88 kg, niveau confirmé
  function sugLoad(id) {
    var ex = EX[id];
    if (!ex || !ex.sug) return 0;
    var st = ex.step || 2;
    return Math.max(st, Math.round(ex.sug * lvf() * Math.sqrt(kg() / 88) / st) * st);
  }
  function scoreSug(sc) { var st = sc.step || 1; return Math.max(st, Math.round(sc.sug * lvf() / st) * st); }
  function levelSeg() {
    return '<div class="seg" role="radiogroup" aria-label="Niveau">' + LEVELS.map(function (l) {
      return '<button role="radio" aria-checked="' + (db.settings.level === l[0] ? 'true' : 'false') + '" data-level="' + l[0] + '">' + l[1] + '</button>';
    }).join('') + '</div>';
  }
  function profileSection() {
    return '<section><h2 class="h2">Profil</h2>' +
      '<div class="field inline"><label for="set-kg">Poids</label>' + stepper('set-kg', 'data-prof', 'kg', kg(), 'kg', 1) + '</div>' +
      levelSeg() +
      '<p class="hint">Sert à proposer des charges et des calories adaptées en fin de séance.</p></section>';
  }
  function openWelcome() {
    sheet.innerHTML = '<div class="sheet-bg"></div><div class="sheet-p welcome s-cardio" role="dialog" aria-modal="true" aria-label="Bienvenue">' +
      '<div class="w-logo">' + logo('w') + '</div>' +
      '<h2 class="disp sheet-n">Bienvenue sur Prime<em>27</em></h2>' +
      '<p>Des séances HIIT de 45 minutes pour la salle : un minuteur, un coach qui te parle et des mouvements animés. Trois séances par semaine suffisent pour progresser.</p>' +
      '<div class="field inline"><label for="w-kg">Ton poids</label>' + stepper('w-kg', 'data-prof', 'kg', kg(), 'kg', 1) + '</div>' +
      '<p class="h2">Ton niveau</p>' + levelSeg() +
      '<button class="btn go" data-act="welcome">C’est parti</button>' +
      (cloud.state !== 'off' ? '<button class="btn" data-act="welcome-login">J’ai déjà un compte</button>' : '') +
      '<p class="hint">Tu avais déjà l’appli ailleurs ? Restaure ta sauvegarde dans Réglages.</p></div>';
    sheet.classList.add('on');
  }

  // ------------------------------------------------------------------ installation et partage
  var deferredInstall = null;
  var onClaude = /claude/.test(location.hostname);
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferredInstall = e;
    if (!P && !M && (route.name === 'home' || route.name === 'settings')) render();
  });
  window.addEventListener('appinstalled', function () { deferredInstall = null; toast('PRIME27 est installée'); if (!P && !M) render(); });
  function installCard() {
    return deferredInstall ? '<button class="install" data-act="install">' + logo('i') + '<span><b>Installer l’appli</b><small>Icône sur l’écran d’accueil, plein écran, marche sans réseau</small></span>' + I.chev + '</button>' : '';
  }
  function installApp() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function () { deferredInstall = null; render(); }, function () { /* rien */ });
  }
  function shareSection() {
    if (onClaude) return '';
    return '<section><h2 class="h2">Partager</h2><p class="hint">Envoie l’appli à tes amis : chacun garde ses propres séances sur son téléphone.</p>' +
      '<div class="btnrow"><button class="btn sm" data-act="share">' + I.share + 'Partager l’appli</button>' +
      (deferredInstall ? '<button class="btn sm ghost" data-act="install">Installer sur l’écran d’accueil</button>' : '') + '</div></section>';
  }
  function shareApp() {
    var url = location.href.split('#')[0].split('?')[0];
    if (navigator.share) {
      navigator.share({ title: 'PRIME27', text: 'Séances HIIT de 45 minutes avec coach, minuteur et badges.', url: url }).catch(function () { /* partage annulé */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast('Lien copié'); }, function () { toast(url); });
    } else toast(url);
  }

  // ------------------------------------------------------------------ vestiaire : têtes et tenues
  var HEADS = [
    { id: 'classique', n: 'Classique', skin: '#e6c3ab', hair: '#35261f', style: 'short' },
    { id: 'rase', n: 'Rasé barbu', skin: '#c99b76', style: 'bald', beard: '#2a1d17' },
    { id: 'queue', n: 'Queue de cheval', skin: '#efcdb4', hair: '#d9b26a', style: 'pony' },
    { id: 'boucles', n: 'Boucles', skin: '#6e4630', hair: '#1d1411', style: 'afro' },
    { id: 'chignon', n: 'Chignon', skin: '#b9875f', hair: '#2b1a12', style: 'bun' },
    { id: 'crete', n: 'Crête', skin: '#e2bda0', style: 'mohawk', crest: '#ff5a2a' },
    { id: 'roux', n: 'Viking roux', skin: '#f0cfb8', hair: '#b4532a', style: 'short', beard: '#a8492a' },
    { id: 'bandeau', n: 'Bandeau', skin: '#8a5a3b', hair: '#151010', style: 'short', band: '#e8332a' },
    { id: 'casquette', n: 'Casquette', skin: '#d9a982', hair: '#3a2a1f', style: 'short', wear: 'cap', capc: '#1f3a6b', logo: '#ffd23f' },
    { id: 'casquette2', n: 'Casquette rouge', skin: '#7d5136', hair: '#151010', style: 'short', beard: '#151010', wear: 'cap', capc: '#c8302a', logo: '#f2f4f4' },
    { id: 'laurier', n: 'Lauriers', skin: '#d9b08f', hair: '#3a2a1f', style: 'short', wear: 'laurel', badge: 'quinte' },
    { id: 'cornes', n: 'Démon', skin: '#e6c3ab', hair: '#151010', style: 'short', wear: 'horns', eye: '#ff3b1f', badge: 'mal' },
    { id: 'casque', n: 'Gladiateur', skin: '#c99b76', style: 'short', wear: 'helmet', badge: 'serie4' },
    { id: 'aureole', n: 'Auréole de feu', skin: '#e6c3ab', hair: '#efe2c2', style: 'short', wear: 'halo', badge: 'kcal20' },
    { id: 'couronne', n: 'Couronne', skin: '#b9875f', hair: '#1d1411', style: 'short', beard: '#1d1411', wear: 'crown', badge: 'vingtcinq' }
  ];
  var OUTFITS = [
    { id: 'seance', n: 'Couleur de séance' },
    { id: 'noir', n: 'Tout noir', shirt: '#1b2226', shorts: '#11171a', shoe: '#1b2226', sole: '#e9eef0' },
    { id: 'marine', n: 'Marine', shirt: '#1f3a6b', shorts: '#9aa6b0', shoe: '#f5f7f7' },
    { id: 'debardeur', n: 'Débardeur', shirt: '#f2f4f4', tank: true, shorts: '#1b2226', shoe: '#1b2226', sole: '#f2f4f4' },
    { id: 'compet', n: 'Compétition', shirt: '#ffd23f', tank: true, shorts: '#11171a', shoe: '#ffd23f', sole: '#11171a' },
    { id: 'retro', n: 'Rétro', shirt: '#f2f4f4', pattern: 'stripe', accent: '#d8322a', shorts: '#d8322a', shoe: '#f5f7f7', sole: '#d8322a' },
    { id: 'kaki', n: 'Kaki', shirt: '#6d7a4a', shorts: '#c2b28a', shoe: '#6b4a2e', sole: '#c2b28a' },
    { id: 'lilas', n: 'Lilas', shirt: '#9c7bd6', shorts: '#2a2238', shoe: '#f5f7f7', sole: '#9c7bd6' },
    { id: 'treillis', n: 'Treillis', shirt: '#55623a', pattern: 'camo', shorts: '#3f4a2a', shoe: '#2a2a22', sole: '#2a2a22', badge: 'extreme' },
    { id: 'lave', n: 'Coulée de lave', shirt: '#1d1412', pattern: 'lava', shorts: '#140d0c', shoe: '#1d1412', sole: '#ff6a1a', badge: 'kcal5' },
    { id: 'neon', n: 'Néon', shirt: '#10161c', pattern: 'neon', accent: '#3ff2e0', shorts: '#10161c', shoe: '#ff3fa4', sole: '#3ff2e0', badge: 'rouge' },
    { id: 'or', n: 'Or massif', shirt: '#d4a537', pattern: 'gold', shorts: '#14181b', shoe: '#d4a537', sole: '#14181b', badge: 'record' },
    { id: 'aurore', n: 'Aurore', shirt: '#ff8a5c', shirt2: '#c64fd6', pattern: 'gradient', shorts: '#2a1b3d', shoe: '#f5f7f7', sole: '#ff8a5c', badge: 'aube' }
  ];
  // posture debout de face, qui respire, pour les vignettes du vestiaire
  var IDLE = {
    n: '', v: 'f',
    k: [{ h: [120, 77], a: [[12, 10], [12, 10]], f: [[127, 5, 0], [113, 5, 0]] }, { h: [120, 76.2], a: [[15, 14], [15, 14]], f: [[127, 5, 0], [113, 5, 0]] }],
    t: [1.5, 1.5]
  };
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }
  function unlocked(item) { return !item.badge || !!db.badges[item.badge]; }
  function lookOf(hid, oid, raw) {
    var hd = byId(HEADS, hid || db.settings.head), of = byId(OUTFITS, oid || db.settings.outfit), L = {}, k;
    if (!raw && !unlocked(hd)) hd = HEADS[0];
    if (!raw && !unlocked(of)) of = OUTFITS[0];
    for (k in hd) L[k] = hd[k];
    for (k in of) if (k !== 'id' && k !== 'n' && k !== 'badge') L[k] = of[k];
    return L;
  }
  function LOOK() { return lookOf(); }
  function badgeName(id) { for (var i = 0; i < BADGES.length; i++) if (BADGES[i].id === id) return BADGES[i].n; return ''; }
  function itemsFor(bid) { return HEADS.concat(OUTFITS).filter(function (x) { return x.badge === bid; }); }
  function tile(kind, it) {
    var on = unlocked(it), cur = db.settings[kind] === it.id;
    var hid = kind === 'head' ? it.id : db.settings.head, oid = kind === 'outfit' ? it.id : db.settings.outfit;
    return '<li><button class="lk' + (cur ? ' cur' : '') + (on ? '' : ' locked') + '" data-pick="' + kind + '" data-id="' + it.id + '"' + (cur ? ' aria-pressed="true"' : '') + '>' +
      '<span class="lk-fig"><canvas class="fig" data-ex="_idle" data-still data-raw data-c="neutral" data-head="' + hid + '" data-outfit="' + oid + '"' + (kind === 'head' ? ' data-focus="head"' : '') + '></canvas>' +
      (on ? '' : '<i class="lk-lock">' + I.lock + '</i>') + (cur ? '<i class="lk-on">' + I.check + '</i>' : '') + '</span>' +
      '<b>' + esc(it.n) + '</b>' + (it.badge ? '<small>' + (on ? 'Prestige' : 'Badge « ' + esc(badgeName(it.badge)) + ' »') + '</small>' : '') + '</button></li>';
  }
  function viewLocker() {
    var all = HEADS.concat(OUTFITS), nOn = all.filter(unlocked).length, cur = LOOK();
    return '<div class="view v-locker">' +
      '<header class="top"><h1 class="disp page">Vestiaire</h1><p class="top-date">' + nOn + ' sur ' + all.length + ' débloqués</p></header>' +
      '<div class="lk-stage"><canvas class="fig" data-ex="jacks" data-c="neutral"></canvas><span class="lk-name">' + esc(byId(HEADS, db.settings.head).n) + ' · ' + esc(byId(OUTFITS, db.settings.outfit).n) + '</span></div>' +
      '<section><h2 class="h2">Têtes</h2><ul class="lks">' + HEADS.map(function (x) { return tile('head', x); }).join('') + '</ul></section>' +
      '<section><h2 class="h2">Tenues</h2><ul class="lks">' + OUTFITS.map(function (x) { return tile('outfit', x); }).join('') + '</ul></section>' +
      '<p class="hint">Les pièces prestige se débloquent avec les badges. Ton personnage les porte partout : séances, exercices et mini challenges.' + (cur.wear ? '' : '') + '</p></div>';
  }
  function pick(kind, id) {
    var it = byId(kind === 'head' ? HEADS : OUTFITS, id);
    if (!unlocked(it)) { toast('À débloquer avec le badge « ' + badgeName(it.badge) + ' »'); return; }
    db.settings[kind] = it.id; save();
    var y = window.scrollY; render(); window.scrollTo(0, y);
    toast(it.n + ' : équipé');
  }

  // ------------------------------------------------------------------ fin de bloc : effets « enfer »
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fx = { raf: 0, parts: [], last: 0, acc: 0, burst: 0 };
  function fxStart() { if (!fx.raf && !REDUCED) { fx.last = 0; fx.raf = requestAnimationFrame(fxFrame); } }
  function fxSpawn(w, h, fast) {
    if (fx.parts.length > 260) return;
    var life = 1.4 + Math.random() * 1.6;
    fx.parts.push({ x: Math.random() * w, y: h + 4, vx: (Math.random() - 0.5) * 40, vy: -(70 + Math.random() * 150) * (fast ? 1.8 : 1), r: 1 + Math.random() * 2.4, life: life, max: life, s: Math.random() * 6.3, c: ['255,214,90', '255,140,40', '255,80,30'][Math.floor(Math.random() * 3)] });
  }
  function fxFrame(now) {
    fx.raf = 0;
    var cv = document.getElementById('p-fire');
    if (!cv || !P || P.done) { fx.parts = []; fx.burst = 0; return; }
    var w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2), heat = P.heat || 0, k;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var ctx = cv.getContext('2d'), dt = fx.last ? Math.min(0.05, (now - fx.last) / 1000) : 0.016, t = now / 1000;
    fx.last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    if (heat > 0.01) {
      var n = 8, fw = w / n;
      for (k = 0; k <= n; k++) {
        var x = k * fw, fh = h * heat * (0.2 + 0.1 * Math.sin(t * 6 + k * 1.9) + 0.06 * Math.sin(t * 11 + k)), sw = Math.sin(t * 4 + k) * fw * 0.3;
        var g = ctx.createLinearGradient(0, h, 0, h - fh);
        g.addColorStop(0, 'rgba(255,200,60,0.55)'); g.addColorStop(0.5, 'rgba(255,90,20,0.38)'); g.addColorStop(1, 'rgba(180,10,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - fw * 0.8, h);
        ctx.quadraticCurveTo(x - fw * 0.5, h - fh * 0.55, x + sw, h - fh);
        ctx.quadraticCurveTo(x + fw * 0.5, h - fh * 0.55, x + fw * 0.8, h); ctx.closePath(); ctx.fill();
      }
      fx.acc += dt * 45 * heat;
    }
    if (fx.burst > 0) { fx.acc += dt * 240; fx.burst -= dt; }
    while (fx.acc >= 1) { fxSpawn(w, h, fx.burst > 0); fx.acc -= 1; }
    for (k = fx.parts.length - 1; k >= 0; k--) {
      var p = fx.parts[k];
      p.life -= dt;
      if (p.life <= 0 || p.y < -10) { fx.parts.splice(k, 1); continue; }
      p.vx += Math.sin(t * 3 + p.s) * 30 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.fillStyle = 'rgba(' + p.c + ',' + (p.life / p.max).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    if (heat > 0.01 || fx.parts.length || fx.burst > 0) fx.raf = requestAnimationFrame(fxFrame);
    else ctx.clearRect(0, 0, w, h);
  }
  function applyHeat() {
    var pl = document.getElementById('player');
    if (!pl || !P) return;
    var h = P.heat || 0;
    pl.style.setProperty('--heat', h.toFixed(3));
    if (P.fig) {
      P.fig.o.heat = h;
      var gw = P.tl.segs[P.i];
      P.fig.o.effort = gw && gw.t === 'work' ? Math.min(1, 0.4 + h * 0.6) : 0;
    }
    if (h > 0.01) fxStart();
  }
  function stamp(bi, final) {
    var el = document.getElementById('p-stamp');
    if (!el) return;
    var nb = P.tl.blocks.length;
    el.innerHTML = '<b class="disp">' + (final ? 'Séance survécue' : (db.settings.hard ? 'Survécu' : 'Bloc terminé')) + '</b>' +
      '<span>' + (final ? 'Place aux étirements' : esc(P.tl.blocks[bi].name) + ' · ' + (bi + 1) + ' sur ' + nb) + '</span>';
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    fx.burst = 0.9; fxStart();
    clearTimeout(stamp.t);
    stamp.t = setTimeout(function () { el.classList.remove('on'); }, 2700);
  }

  // ------------------------------------------------------------------ sauvegarde : protection locale, fichier, compte en ligne
  // Configuration Firebase (publique par conception : l'accès aux données est verrouillé par les règles Firestore).
  var FIREBASE = {
    apiKey: "AIzaSyD4hpkP7Z6ZxxqZsIzi_NxHU9poSxsIoRM",
    authDomain: "prime27-54683.firebaseapp.com",
    projectId: "prime27-54683",
    appId: "1:514005330054:web:39d882d7161c7468514907"
  };
  var FB_BASE = 'https://www.gstatic.com/firebasejs/11.0.2/';
  var cloud = { state: FIREBASE && !onClaude ? 'out' : 'off', user: null, busy: false, pending: false, timer: 0, sent: null, last: 0, pulled: 0 };
  var persisted = null;

  function protectStorage() {
    try {
      if (!navigator.storage || !navigator.storage.persist) return;
      navigator.storage.persisted().then(function (p) { return p || navigator.storage.persist(); })
        .then(function (p) { persisted = !!p; }, function () { persisted = false; });
    } catch (e) { /* rien */ }
  }

  // fusion de deux sauvegardes : on garde toutes les séances, les badges les plus anciens,
  // et les réglages de la version la plus récente
  function mergeData(r, rmt) {
    if (!r) return;
    var del = {}, k;
    (db.del || []).concat(r.d || []).forEach(function (id) { del[id] = 1; });
    function union(a, b) {
      var seen = {}, out = [];
      (a || []).concat(b || []).forEach(function (x) { if (x && x.id != null && !del[x.id] && !seen[x.id]) { seen[x.id] = 1; out.push(x); } });
      return out.sort(function (x, y) { return (x.ts || 0) - (y.ts || 0); });
    }
    db.history = union(db.history, r.h);
    db.minis = union(db.minis, r.m);
    var rb = r.b || {};
    for (k in rb) if (!db.badges[k] || rb[k] < db.badges[k]) db.badges[k] = rb[k];
    if ((rmt || 0) > (db.mt || 0)) {
      var vn = db.settings.voiceName;
      Object.assign(db.settings, r.s || {});
      db.settings.voiceName = vn;
      db.weights = Object.assign({}, db.weights, r.w || {});
      db.mt = rmt;
    } else db.weights = Object.assign({}, r.w || {}, db.weights);
    db.del = Object.keys(del).map(Number);
    resetTimelines();
  }
  function storeQuiet() {
    lastPayload = payloadStr();
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* rien */ }
  }
  function ago(ts) {
    var s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return 'à l’instant';
    if (s < 3600) return 'il y a ' + Math.round(s / 60) + ' min';
    if (s < 86400) return 'il y a ' + Math.round(s / 3600) + ' h';
    return 'il y a ' + Math.round(s / 86400) + ' j';
  }
  function repaintAccount() {
    if (P || M) return;
    if (route.name === 'settings' || route.name === 'home') { var y = window.scrollY; render(); window.scrollTo(0, y); }
  }

  // ----- compte en ligne (Firebase)
  var fbReady = null;
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error('script')); };
      document.head.appendChild(s);
    });
  }
  function fb() {
    if (!FIREBASE || onClaude) return Promise.reject(new Error('off'));
    if (!fbReady) {
      fbReady = loadScript(FB_BASE + 'firebase-app-compat.js')
        .then(function () { return Promise.all([loadScript(FB_BASE + 'firebase-auth-compat.js'), loadScript(FB_BASE + 'firebase-firestore-compat.js')]); })
        .then(function () {
          var f = window.firebase;
          f.initializeApp(FIREBASE);
          f.auth().languageCode = 'fr';
          f.auth().onAuthStateChanged(function (u) {
            cloud.user = u;
            cloud.state = u ? 'in' : 'out';
            if (u) { db.settings.cloud = true; storeQuiet(); cloudPull(); socialStart(); } else socialStop();
            repaintAccount();
            tryPending();
          });
          return f;
        });
      fbReady.catch(function () { fbReady = null; cloud.state = db.settings.cloud ? 'wait' : 'out'; repaintAccount(); });
    }
    return fbReady;
  }
  function docRef() { return window.firebase.firestore().collection('users').doc(cloud.user.uid); }
  function cloudPull() {
    if (!cloud.user || !navigator.onLine) return;
    cloud.busy = true; cloud.pulled = Date.now();
    docRef().get().then(function (snap) {
      var remote = null;
      if (snap.exists) {
        var d = snap.data();
        remote = d.data;
        try { mergeData(JSON.parse(d.data), d.mt || 0); } catch (e) { /* sauvegarde illisible : on garde le local */ }
        cloud.sent = remote;
      }
      storeQuiet();
      cloud.busy = false; cloud.last = Date.now();
      if (payloadStr() !== remote) cloudPush();
      checkBadges();
      repaintAccount();
    }).catch(function () { cloud.busy = false; cloud.pending = true; repaintAccount(); });
  }
  function cloudQueue() {
    if (!cloud || cloud.state !== 'in') return;
    clearTimeout(cloud.timer);
    cloud.timer = setTimeout(cloudPush, 3000);
  }
  function cloudPush() {
    if (!cloud.user) return;
    var p = payloadStr();
    if (p === cloud.sent) return;
    if (!navigator.onLine) { cloud.pending = true; repaintAccount(); return; }
    cloud.busy = true;
    docRef().set({ data: p, mt: db.mt || Date.now(), at: window.firebase.firestore.FieldValue.serverTimestamp(), v: 1 })
      .then(function () { cloud.sent = p; cloud.busy = false; cloud.pending = false; cloud.last = Date.now(); repaintAccount(); })
      .catch(function () { cloud.busy = false; cloud.pending = true; repaintAccount(); });
  }
  window.addEventListener('online', function () { if (cloud.state === 'in') cloudPull(); else if (cloud.state === 'wait') fb().catch(function () { /* toujours hors ligne */ }); });
  document.addEventListener('visibilitychange', function () {
    if (cloud.state !== 'in') return;
    if (document.visibilityState === 'hidden') { clearTimeout(cloud.timer); cloudPush(); }
    else if (Date.now() - cloud.pulled > 60000 && !P) cloudPull();
  });

  var AUTH_ERR = {
    'auth/invalid-email': 'Cette adresse e-mail n’est pas valide.',
    'auth/missing-password': 'Indique un mot de passe.',
    'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cette adresse : connecte-toi.',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/invalid-login-credentials': 'E-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
    'auth/user-not-found': 'Aucun compte avec cette adresse : crée-le.',
    'auth/popup-blocked': 'La fenêtre Google ne s’ouvre pas ici. Utilise l’e-mail et le mot de passe.',
    'auth/operation-not-supported-in-this-environment': 'La fenêtre Google ne s’ouvre pas ici. Utilise l’e-mail et le mot de passe.',
    'auth/web-storage-unsupported': 'La fenêtre Google ne s’ouvre pas ici. Utilise l’e-mail et le mot de passe.',
    'auth/network-request-failed': 'Pas de réseau. Réessaie une fois connecté.',
    'auth/too-many-requests': 'Trop d’essais. Patiente quelques minutes.',
    'auth/unauthorized-domain': 'Cette adresse n’est pas autorisée dans Firebase.',
    'auth/requires-recent-login': 'Par sécurité, déconnecte-toi puis reconnecte-toi avant de supprimer ton compte.'
  };
  function authErr(e) {
    var c = e && e.code;
    if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return;
    var msg = AUTH_ERR[c] || (e && e.message === 'script' ? 'Connexion impossible sans réseau.' : 'Connexion impossible (' + (c || 'erreur') + ').');
    var el = document.getElementById('acc-err');
    if (el) el.textContent = msg; else toast(msg);
  }
  function signGoogle() {
    fb().then(function (f) { return f.auth().signInWithPopup(new f.auth.GoogleAuthProvider()); })
      .then(function () { closeSheet(); toast('Connecté : ta progression est sauvegardée'); }, authErr);
  }
  function openEmail() {
    sheet.innerHTML = '<div class="sheet-bg" data-sheet="close"></div><div class="sheet-p s-cardio" role="dialog" aria-modal="true" aria-label="Connexion par e-mail">' +
      '<button class="ic sheet-x alt" data-sheet="close" aria-label="Fermer">' + I.close + '</button>' +
      '<h2 class="disp sheet-n">Ton compte</h2>' +
      '<p class="hint">Un e-mail et un mot de passe suffisent, sans compte Google. Ça marche sur iPhone comme sur Android.</p>' +
      '<form class="acc-form" id="acc-form" novalidate>' +
        '<label class="field"><span>E-mail</span><input type="email" id="acc-email" autocomplete="email" inputmode="email" required></label>' +
        '<label class="field"><span>Mot de passe (6 caractères minimum)</span><input type="password" id="acc-pass" autocomplete="current-password" minlength="6" required></label>' +
        '<p class="acc-err" id="acc-err" role="alert"></p>' +
        '<button class="btn go" type="submit">Se connecter</button>' +
        '<button class="btn" type="button" data-acc="signup">Créer mon compte</button>' +
        '<button class="link" type="button" data-acc="reset">Mot de passe oublié</button>' +
      '</form></div>';
    sheet.classList.add('on');
    fb().catch(function () { authErr({ message: 'script' }); });
    $('#acc-form').addEventListener('submit', function (e) { e.preventDefault(); emailAuth('in'); });
  }
  function emailAuth(mode) {
    var em = ($('#acc-email').value || '').trim(), pw = $('#acc-pass').value || '';
    $('#acc-err').textContent = '';
    fb().then(function (f) {
      if (mode === 'reset') {
        return f.auth().sendPasswordResetEmail(em).then(function () { $('#acc-err').textContent = 'E-mail envoyé : suis le lien pour choisir un nouveau mot de passe.'; });
      }
      var a = mode === 'signup' ? f.auth().createUserWithEmailAndPassword(em, pw) : f.auth().signInWithEmailAndPassword(em, pw);
      return a.then(function () { closeSheet(); toast(mode === 'signup' ? 'Compte créé : ta progression est sauvegardée' : 'Connecté : ta progression est sauvegardée'); });
    }).catch(authErr);
  }
  function signOutCloud() {
    ask('Se déconnecter ?', 'Tes données restent sur ce téléphone et dans ton compte. Elles ne seront plus synchronisées tant que tu ne te reconnectes pas.', [
      { label: 'Se déconnecter', fn: function () { clearTimeout(cloud.timer); cloudPush(); db.settings.cloud = false; storeQuiet(); fb().then(function (f) { return f.auth().signOut(); }).then(repaintAccount); } },
      { label: 'Annuler', cls: 'ghost' }
    ]);
  }
  function deleteCloud() {
    ask('Supprimer ton compte en ligne ?', 'Ta sauvegarde en ligne et ton compte seront effacés. Les données de ce téléphone restent.', [
      { label: 'Supprimer mon compte', cls: 'danger', fn: function () {
        var u = cloud.user;
        docRef().delete().then(function () { return u.delete(); }).then(function () {
          db.settings.cloud = false; cloud.sent = null; storeQuiet(); toast('Compte en ligne supprimé'); repaintAccount();
        }).catch(authErr);
      } },
      { label: 'Annuler', cls: 'ghost' }
    ]);
  }

  // ----- fichier de sauvegarde
  function backupJson() { return JSON.stringify({ v: 1, app: 'prime27', mt: db.mt || 0, settings: db.settings, history: db.history, weights: db.weights, minis: db.minis, badges: db.badges, del: db.del || [] }); }
  function backupFile() {
    var name = 'prime27-sauvegarde-' + ymd(new Date()) + '.json', blob = new Blob([backupJson()], { type: 'application/json' });
    function done() { db.settings.lastBackup = Date.now(); save(); repaintAccount(); }
    var file = null;
    try { file = new File([blob], name, { type: 'application/json' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Sauvegarde PRIME27' }).then(function () { done(); toast('Sauvegarde envoyée'); }, function () { /* partage annulé */ });
      return;
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    done(); toast('Fichier enregistré dans tes téléchargements');
  }
  function restoreObj(o) {
    if (!o || o.v !== 1 || !Array.isArray(o.history)) throw new Error('format');
    var before = db.history.length;
    mergeData({ s: o.settings, h: o.history, w: o.weights, m: o.minis, b: o.badges, d: o.del }, o.mt || 1);
    save();
    return db.history.length - before;
  }
  function restoreFile(file) {
    if (!file) return;
    var fr = new FileReader();
    fr.onload = function () {
      try { var n = restoreObj(JSON.parse(String(fr.result || ''))); toast('Sauvegarde restaurée' + (n > 0 ? ' : ' + n + (n > 1 ? ' séances ajoutées' : ' séance ajoutée') : '')); render(); }
      catch (e) { toast('Ce fichier n’est pas une sauvegarde PRIME27'); }
    };
    fr.readAsText(file);
  }

  // ----- écrans
  function accountSection() {
    var h = '<section><h2 class="h2">Compte et sauvegarde</h2>';
    if (cloud.state === 'in') {
      var u = cloud.user || {}, st = cloud.busy ? 'Synchronisation en cours…' : cloud.pending ? 'En attente de réseau : la sauvegarde partira dès que possible.' : cloud.last ? 'Sauvegardé ' + ago(cloud.last) + '.' : 'Connecté.';
      h += '<div class="acct on"><span class="acc-dot"></span><span><b>' + esc(u.email || 'Compte connecté') + '</b><small>' + st + ' Tout se sauvegarde tout seul.</small></span></div>' +
        '<div class="btnrow"><button class="btn sm" data-act="syncnow">Synchroniser maintenant</button><button class="btn sm ghost" data-act="signout">Se déconnecter</button></div>';
    } else if (cloud.state === 'wait' || cloud.state === 'loading') {
      h += '<div class="acct"><span class="acc-dot"></span><span><b>Compte connecté</b><small>' + (cloud.state === 'wait' ? 'Pas de réseau : la synchronisation reprendra toute seule.' : 'Connexion au compte…') + '</small></span></div>';
    } else if (cloud.state === 'out') {
      h += '<p class="hint">Connecte-toi pour sauvegarder ta progression automatiquement et la retrouver sur un autre téléphone.</p>' +
        '<div class="btncol"><button class="btn go-g" data-act="google">' + I.google + 'Continuer avec Google</button><button class="btn" data-act="email">Continuer avec un e-mail</button></div>';
    }
    h += '<p class="hint">' + (persisted ? 'Ce navigateur protège tes données : il ne les effacera pas de lui-même.' : 'Tes données sont sur ce téléphone.') +
      (db.settings.lastBackup ? ' Dernier fichier de sauvegarde ' + ago(db.settings.lastBackup) + '.' : '') + '</p>';
    if (!onClaude) h += '<div class="btnrow"><button class="btn sm ghost" data-act="backupfile">Sauvegarder dans un fichier</button><label class="btn sm ghost filebtn">Restaurer un fichier<input type="file" id="restore-file" accept=".json,application/json"></label></div>';
    h += '<details class="adv"><summary>Copier ou coller une sauvegarde en texte</summary>' +
      '<textarea id="set-data" rows="4" spellcheck="false" aria-label="Données de sauvegarde"></textarea>' +
      '<div class="btnrow"><button class="btn sm" data-act="export">Copier ma sauvegarde</button><button class="btn sm ghost" data-act="import">Restaurer ce texte</button></div></details>';
    if (cloud.state === 'in') h += '<button class="link" data-act="deletecloud">Supprimer mon compte en ligne</button>';
    h += '<button class="link danger" data-act="reset">Effacer toutes mes données de ce téléphone</button></section>';
    return h;
  }
  // rappel sur l'accueil quand rien n'est sauvegardé depuis une semaine
  function backupNudge() {
    if (cloud.state === 'in' || cloud.state === 'loading' || !db.history.length || onClaude) return '';
    var ref = db.settings.lastBackup || db.history[0].ts || Date.now();
    if (Date.now() - ref < 7 * 864e5) return '';
    return '<section class="nudge"><p><b>Ta progression n’est que sur ce téléphone.</b> ' +
      (db.settings.lastBackup ? 'Dernière sauvegarde ' + ago(db.settings.lastBackup) + '.' : 'Aucune sauvegarde pour l’instant.') + '</p>' +
      '<div class="btnrow">' + (cloud.state === 'out' ? '<button class="btn sm" data-go="settings">Créer un compte</button>' : '') +
      '<button class="btn sm ghost" data-act="backupfile">Sauvegarder un fichier</button></div></section>';
  }

  // ------------------------------------------------------------------ douleurs : zones à ménager
  var ZONES = window.PRIME_ZONES || [];
  var SAFE = ['dead_bug', 'bridge', 'plank', 'superman', 'bike', 'air_squat', 'jacks', 'side_plank', 'hollow_rock', 'arm_circles'];
  var WPOOL = ['jacks', 'arm_circles', 'air_squat', 'lunge_twist', 'inchworm', 'high_knees', 'dead_bug', 'bridge', 'superman', 'bike'];
  var SPOOL = ['st_fold', 'st_quad', 'st_hipflexor', 'st_child', 'st_cobra', 'st_shoulder', 'dead_bug', 'bridge'];
  function hurts(id) {
    var p = db.settings.pain;
    return !!p && (EX[id].z || []).some(function (z) { return p[z]; });
  }
  function zoneName(z) { for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === z) return ZONES[i].n.toLowerCase(); return z; }
  function painList() { var p = db.settings.pain || {}; return ZONES.filter(function (z) { return p[z.id]; }); }
  function painShort() {
    var l = painList();
    return !l.length ? 'Aucune douleur' : l.length === 1 ? 'Ménage : ' + l[0].n.toLowerCase() : 'Ménage : ' + l.length + ' zones';
  }
  // échauffement et étirements : remplace ce qui est impossible (matériel ou douleur)
  function safeList(list, pool) {
    var used = {};
    list.forEach(function (w) { if (canDo(w[0])) used[w[0]] = 1; });
    return list.map(function (w) {
      if (canDo(w[0])) return w;
      var ok = pool.filter(function (id) { return EX[id] && canDo(id); });
      var alt = ok.filter(function (id) { return !used[id]; })[0] || ok[0] || w[0];
      used[alt] = 1;
      return [alt, w[1]];
    });
  }
  function openPain() {
    var p = db.settings.pain || {};
    sheet.innerHTML = '<div class="sheet-bg" data-sheet="close"></div><div class="sheet-p" role="dialog" aria-modal="true" aria-label="Douleurs">' +
      '<button class="ic sheet-x alt" data-sheet="close" aria-label="Fermer">' + I.close + '</button>' +
      '<h2 class="disp sheet-n">Où as-tu mal ?</h2>' +
      '<p class="hint">Douleur, contracture ou grosse courbature : les mouvements qui sollicitent ces zones sont remplacés par d’autres. La séance garde sa durée.</p>' +
      [['art', 'Articulations'], ['mus', 'Muscles']].map(function (gr) {
        return '<h3 class="h2 pain-g">' + gr[1] + '</h3>' + ZONES.map(function (z, i) {
          if ((z.g || 'art') !== gr[0]) return '';
          return '<label class="sw"><span><b>' + z.n + '</b></span><input type="checkbox" id="pain-' + i + '" data-zone="' + z.id + '"' + (p[z.id] ? ' checked' : '') + '><i></i></label>';
        }).join('');
      }).join('') +
      '<button class="btn sm ghost" data-act="nopain">Tout va bien</button>' +
      '<p class="note">Une douleur vive, qui dure ou qui revient, mérite l’avis d’un médecin ou d’un kiné avant de reprendre.</p></div>';
    sheet.classList.add('on');
  }
  function setPain(z, on) {
    var p = {}, k, cur = db.settings.pain || {};
    for (k in cur) p[k] = cur[k];
    if (on) p[z] = true; else delete p[z];
    db.settings.pain = Object.keys(p).length ? p : null;
    save(); resetTimelines(); render();
  }

  // ------------------------------------------------------------------ échange d'exercice en un geste
  function cloneTl(tl) {
    return {
      blocks: tl.blocks, groups: tl.groups, total: tl.total, stretch: tl.stretch, main: tl.main, moves: tl.moves, warm: tl.warm, str: tl.str,
      segs: tl.segs.map(function (g) { var c = {}, k; for (k in g) c[k] = g[k]; return c; })
    };
  }
  function swapOrig(bi, cur) { var map = P.swap[bi] || {}, k; for (k in map) if (map[k] === cur) return k; return cur; }
  function swapOptions(g) {
    var cur = myEx(g), orig = swapOrig(g.bi, cur), inBlock = {}, seen = {}, out;
    P.tl.segs.forEach(function (x) { if (x.t === 'work' && x.bi === g.bi) inBlock[x.ex] = 1; });
    out = [orig].concat(EX[orig].alts || [], POOL, SAFE).filter(function (id) {
      if (!EX[id] || seen[id]) return false;
      seen[id] = 1;
      return id === cur || (canDo(id) && (id === orig || !inBlock[id]));
    }).slice(0, 5);
    if (out.indexOf(cur) < 0) out.unshift(cur);
    return out;
  }
  function canSwap(g) { return g.bi != null && !!g.ex && g.t !== 'warm' && g.t !== 'stretch'; }
  function swapNow() {
    var g = P.tl.segs[P.i];
    if (!canSwap(g)) return;
    var opts = swapOptions(g), cur = myEx(g), next = opts[(opts.indexOf(cur) + 1) % opts.length], bi = g.bi, orig;
    if (!next || next === cur) { toast('Pas d’autre mouvement possible avec ton matériel'); return; }
    orig = swapOrig(bi, cur);
    P.tl.segs.forEach(function (x) { if (x.bi === bi && x.ex === cur && x.t !== 'warm' && x.t !== 'stretch') x.ex = next; });
    (P.swap[bi] = P.swap[bi] || {})[orig] = next;
    if (P.sync) syncSet({ exs: P.tl.segs.map(function (x) { return x.ex; }) });
    P.cueI = 0;
    paintSeg(false);
    buzz(60);
    say(EX[next].n + '.');
    toast(EX[cur].n + ' → ' + EX[next].n + (opts.length > 2 ? ' · touche encore pour une autre option' : ''));
  }

  // ------------------------------------------------------------------ à plusieurs : chacun démarre sur un exercice différent
  function teamSize() { return Math.max(1, Math.min(3, +db.settings.team || 1)); }
  function mateNames() {
    var m = db.settings.mates || [];
    return ['Toi', (m[0] || '').trim() || 'Partenaire 2', (m[1] || '').trim() || 'Partenaire 3'];
  }
  function teamSection() {
    var n = teamSize(), m = db.settings.mates || [], i, h = '';
    for (i = 1; i < n; i++) {
      h += '<label class="field inline"><span>Partenaire ' + (i + 1) + '</span><input type="text" id="mate-' + i + '" data-mate="' + (i - 1) + '" maxlength="16" autocomplete="off" placeholder="Prénom" value="' + esc(m[i - 1] || '') + '"></label>';
    }
    return '<section><h2 class="h2">À plusieurs</h2>' +
      '<div class="seg" role="radiogroup" aria-label="Nombre de personnes">' + [[1, 'Solo'], [2, 'Duo'], [3, 'Trio']].map(function (o) {
        return '<button role="radio" aria-checked="' + (n === o[0] ? 'true' : 'false') + '" data-team="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div>' + h +
      '<p class="hint">' + (n > 1 ? 'Sur un seul téléphone : chacun démarre sur un exercice différent du groupe et tourne au changement d’exercice. Dans les blocs à un seul exercice, vous alternez les tours.' :
        'À deux ou trois sur un seul téléphone, chacun démarre sur un exercice différent du groupe pour ne pas se gêner sur le matériel.') + '</p>' + syncBox() + '</section>';
  }
  // exercice de chacun pour une étape d'effort (ou la prochaine, pendant un repos)
  function teamPlan(g) {
    var n = P.team, names = P.names || mateNames(), w = g.t === 'work' ? g : (g.nx != null && g.nx >= 0 ? P.tl.segs[g.nx] : null);
    if (n < 2 || !w || w.t !== 'work') return null;
    var list = P.tl.segs.filter(function (x) { return x.t === 'work' && x.bi === w.bi && x.round === w.round; })
      .sort(function (a, b) { return a.n - b.n; }).map(function (x) { return x.ex; });
    var N = list.length, out = [], p, k, slots = Math.max(N, n), filler = canDo('plank') ? 'plank' : 'dead_bug';
    for (p = 0; p < n; p++) {
      if (N === 1) out.push({ name: names[p], ex: list[0], rest: (w.round - 1) % n !== p, me: p === (P.me || 0) });
      else { k = (w.n - 1 + p) % slots; out.push({ name: names[p], ex: k < N ? list[k] : filler, rest: false, me: p === (P.me || 0) }); }
    }
    return out;
  }
  function paintTeam(g) {
    var el = document.getElementById('p-team'), plan = teamPlan(g);
    if (!el) return;
    el.hidden = !plan;
    if (!plan) return;
    el.innerHTML = plan.map(function (x) {
      return '<span class="tm' + (x.me ? ' me' : '') + (x.rest ? ' off' : '') + '"><b>' + esc(x.name) + '</b>' + esc(x.rest ? 'Récupère' : EX[x.ex].n) + '</span>';
    }).join('');
  }

  // ------------------------------------------------------------------ amis et séances synchronisées sur plusieurs téléphones
  // Un « salon » (rooms/{code}) porte la séance, l'ordre des participants, les exercices et l'horloge commune :
  // position = (heure serveur − t0) quand ça tourne, pausePos à l'arrêt. Chaque téléphone en déduit l'étape en cours.
  // Sur le serveur local, ?mock=1&name=X simule le salon entre deux onglets (sans compte), pour les tests.
  var MOCK = location.hostname === 'localhost' && /[?&]mock=1/.test(location.search);
  var mockId = '', mockName = '';
  if (MOCK) {
    try { mockId = sessionStorage.getItem('p27uid') || ''; } catch (e) { /* rien */ }
    if (!mockId) mockId = 'u' + Math.random().toString(36).slice(2, 8);
    try { sessionStorage.setItem('p27uid', mockId); } catch (e) { /* rien */ }
    mockName = new URLSearchParams(location.search).get('name') || 'Testeur';
  }
  var ALPH = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  function rcode(n) { var s = ''; for (var i = 0; i < n; i++) s += ALPH.charAt(Math.floor(Math.random() * ALPH.length)); return s; }
  function cleanCode(v) { return String(v || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/^PRIME/, ''); }
  var social = { name: '', code: '', friends: [], invites: [], unsubs: [], offset: 0, sent: {} };
  var ROOM = null, pendingJoin = null, pendingFriend = null;
  function uid() { return MOCK ? mockId : (cloud.user ? cloud.user.uid : ''); }
  function myName() {
    if (MOCK) return mockName;
    return (social.name || (cloud.user && (cloud.user.displayName || (cloud.user.email || '').split('@')[0])) || 'Moi').slice(0, 16);
  }
  function online() { return MOCK || (cloud.state === 'in' && !!cloud.user); }
  function requireCloud(fn) {
    if (online()) { fn(); return; }
    toast('Connecte-toi d’abord (Réglages, Compte) pour jouer sur plusieurs téléphones');
    go('settings');
  }
  function serverNow() { return Date.now() + (MOCK ? 0 : social.offset); }
  function shareUrl(hash) { return location.origin + location.pathname + '#' + hash; }
  function primeAudio() {
    audio();
    try { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); } catch (e) { /* rien */ }
  }

  // ----- accès aux salons (Firestore, ou simulation entre onglets)
  var DEL = { del: 1 };
  var mockL = {};
  function mockKey(id) { return 'p27mock.room.' + id; }
  function mockGet(id) { try { var v = localStorage.getItem(mockKey(id)); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function mockPut(id, d) {
    try { if (d) localStorage.setItem(mockKey(id), JSON.stringify(d)); else localStorage.removeItem(mockKey(id)); } catch (e) { /* rien */ }
    (mockL[id] || []).forEach(function (cb) { setTimeout(function () { cb(d ? JSON.parse(JSON.stringify(d)) : null); }, 0); });
  }
  if (MOCK) window.addEventListener('storage', function (e) {
    if (!e.key || e.key.indexOf('p27mock.room.') !== 0) return;
    var id = e.key.slice(13), d = e.newValue ? JSON.parse(e.newValue) : null;
    (mockL[id] || []).forEach(function (cb) { cb(d); });
  });
  function applyPatch(d, patch) {
    for (var k in patch) {
      var parts = k.split('.'), o = d, i;
      for (i = 0; i < parts.length - 1; i++) o = o[parts[i]] = o[parts[i]] || {};
      if (patch[k] === DEL) delete o[parts[i]]; else o[parts[i]] = patch[k];
    }
  }
  function roomRef(id) { return window.firebase.firestore().collection('rooms').doc(id); }
  var Rooms = {
    get: function (id) {
      if (MOCK) return Promise.resolve(mockGet(id));
      return roomRef(id).get().then(function (s) { return s.exists ? s.data() : null; });
    },
    create: function (id, d) {
      if (MOCK) { mockPut(id, d); return Promise.resolve(); }
      d.at = window.firebase.firestore.FieldValue.serverTimestamp();
      return roomRef(id).set(d);
    },
    update: function (id, patch) {
      if (MOCK) { var d = mockGet(id); if (!d) return Promise.reject(new Error('absent')); applyPatch(d, patch); mockPut(id, d); return Promise.resolve(); }
      var p = {}, k;
      for (k in patch) p[k] = patch[k] === DEL ? window.firebase.firestore.FieldValue.delete() : patch[k];
      return roomRef(id).update(p);
    },
    remove: function (id) {
      if (MOCK) { mockPut(id, null); return Promise.resolve(); }
      return roomRef(id).delete();
    },
    listen: function (id, cb) {
      if (MOCK) {
        (mockL[id] = mockL[id] || []).push(cb);
        setTimeout(function () { cb(mockGet(id)); }, 0);
        return function () { mockL[id] = (mockL[id] || []).filter(function (x) { return x !== cb; }); };
      }
      return roomRef(id).onSnapshot(function (s) { cb(s.exists ? s.data() : null); }, function () { /* hors ligne : on garde l'horloge locale */ });
    },
    // ajoute le participant s'il reste de la place (3 personnes au plus)
    join: function (id, member) {
      var me = uid();
      function add(d) {
        if (!d) throw new Error('absent');
        var mem = d.members || {};
        if (mem[me]) return { d: d, patch: null };
        if (Object.keys(mem).length >= 3) throw new Error('plein');
        var patch = {}, order = Object.keys(mem).reduce(function (m, k) { return Math.max(m, (mem[k].order || 0) + 1); }, 0);
        patch['members.' + me] = { name: member.name, order: order };
        return { d: d, patch: patch };
      }
      if (MOCK) {
        try { var r = add(mockGet(id)); if (r.patch) { applyPatch(r.d, r.patch); mockPut(id, r.d); } return Promise.resolve(r.d); }
        catch (e) { return Promise.reject(e); }
      }
      var fs = window.firebase.firestore(), ref = roomRef(id);
      return fs.runTransaction(function (tx) {
        return tx.get(ref).then(function (snap) {
          var r = add(snap.exists ? snap.data() : null);
          if (r.patch) tx.update(ref, r.patch);
          return r.d;
        });
      });
    }
  };
  // écart entre l'horloge du téléphone et celle du serveur, pour un départ simultané
  function clockSync(id) {
    if (MOCK || !cloud.user) return Promise.resolve();
    var ref = roomRef(id), p = {}, t1 = Date.now();
    p['pings.' + cloud.user.uid] = window.firebase.firestore.FieldValue.serverTimestamp();
    return ref.update(p).then(function () {
      var t2 = Date.now();
      return ref.get({ source: 'server' }).then(function (snap) {
        var ts = ((snap.data() || {}).pings || {})[cloud.user.uid];
        if (ts && ts.toMillis) social.offset = ts.toMillis() - (t1 + t2) / 2;
      });
    }).catch(function () { /* on garde l'horloge du téléphone */ });
  }
  function members(d) {
    var m = (d && d.members) || {};
    return Object.keys(m).map(function (k) { return { uid: k, name: m[k].name || 'Ami', order: m[k].order || 0 }; })
      .sort(function (a, b) { return a.order - b.order; });
  }

  // ----- salon : création, adhésion, attente du départ
  function createRoom(s) {
    requireCloud(function () {
      primeAudio();
      var tries = 0;
      (function attempt() {
        var id = rcode(5);
        Rooms.get(id).then(function (d) {
          if (d && tries++ < 4) return attempt();
          var data = { host: uid(), sid: s.id, sname: s.name, state: 'lobby', t0: 0, pausePos: 0, exs: timeline(s).segs.map(function (x) { return x.ex; }), members: {}, v: 1 };
          data.members[uid()] = { name: myName(), order: 0 };
          return Rooms.create(id, data).then(function () { roomOpen(id); clockSync(id); });
        }).catch(function () { toast('Création impossible : vérifie le réseau'); });
      })();
    });
  }
  function joinRoom(raw) {
    var id = cleanCode(raw);
    if (id.length !== 5) { toast('Un code de salon fait 5 caractères'); return; }
    requireCloud(function () {
      primeAudio();
      Rooms.join(id, { name: myName() }).then(function () {
        closeSheet();
        if (!MOCK) window.firebase.firestore().collection('users').doc(uid()).collection('invites').doc(id).delete().catch(function () { /* rien */ });
        clockSync(id).then(function () { roomOpen(id); });
      }).catch(function (e) {
        toast(e && e.message === 'plein' ? 'Ce salon est complet (3 personnes au plus)' : e && e.message === 'absent' ? 'Salon introuvable : vérifie le code' : 'Impossible de rejoindre : vérifie le réseau');
      });
    });
  }
  function roomOpen(id) {
    roomClose();
    ROOM = { id: id, data: null };
    showLobby();
    ROOM.unsub = Rooms.listen(id, roomUpdate);
  }
  function roomClose() {
    if (ROOM && ROOM.unsub) { try { ROOM.unsub(); } catch (e) { /* rien */ } }
    ROOM = null;
  }
  function roomUpdate(d) {
    if (!ROOM) return;
    if (!d) {
      var playing = P && P.sync;
      roomClose();
      if (playing) { P.sync = null; toast('Le salon est fermé : tu continues seul'); }
      else { closeLobby(); toast('Le salon a été fermé'); }
      return;
    }
    ROOM.data = d;
    if (P && P.sync && P.sync.id === ROOM.id) { if (!P.done) applyRoomData(d); return; }
    if (d.state === 'lobby') paintLobby();
    else if (!P) startSynced();
  }
  function startSynced() {
    var d = ROOM.data, s = findSession(d.sid);
    if (!s) { toast('Séance inconnue : mets l’appli à jour'); return; }
    startSession(s, null, { id: ROOM.id, data: d });
  }
  function showLobby() {
    overlay.innerHTML = '<div class="player lobby" id="lobby"><header class="p-top">' +
      '<button class="ic" data-l="leave" aria-label="Quitter le salon">' + I.close + '</button>' +
      '<div class="p-where"><b>Séance à plusieurs</b><span id="l-sname">Connexion au salon…</span></div></header>' +
      '<div class="l-body" id="l-body"><p class="hint">Connexion au salon…</p></div></div>';
    overlay.classList.add('on');
    document.documentElement.classList.add('locked');
  }
  function closeLobby() {
    if (P) return;
    overlay.classList.remove('on'); overlay.innerHTML = '';
    document.documentElement.classList.remove('locked');
    render();
  }
  function paintLobby() {
    var body = document.getElementById('l-body');
    if (!body || !ROOM || !ROOM.data) return;
    var d = ROOM.data, me = uid(), host = d.host === me, mem = members(d), s = findSession(d.sid), inRoom = {};
    mem.forEach(function (m) { inRoom[m.uid] = 1; });
    var sn = document.getElementById('l-sname');
    if (sn) sn.textContent = (s ? s.name : d.sname || '') + (s ? ' · ' + TYPE[s.type] : '');
    var friends = social.friends.filter(function (f) { return !inRoom[f.uid]; });
    body.innerHTML =
      '<section class="l-code"><span class="h2">Code du salon</span><b class="disp">' + esc(ROOM.id) + '</b>' +
        '<div class="btnrow"><button class="btn sm" data-l="share">' + I.share + 'Inviter par message</button></div></section>' +
      (friends.length ? '<section><h2 class="h2">Inviter un ami</h2><ul class="kv">' + friends.map(function (f) {
        var sent = social.sent[ROOM.id + ':' + f.uid];
        return '<li><span>' + esc(f.name) + '</span><button class="btn sm' + (sent ? ' ghost' : '') + '" data-l-invite="' + f.uid + '"' + (sent ? ' disabled' : '') + '>' + (sent ? 'Invité' : 'Inviter') + '</button></li>';
      }).join('') + '</ul></section>' : '') +
      '<section><h2 class="h2">Participants · ' + mem.length + ' sur 3</h2><ul class="l-mem">' + mem.map(function (m, k) {
        return '<li' + (m.uid === me ? ' class="me"' : '') + '><i>' + (k + 1) + '</i><span>' + esc(m.uid === me ? m.name + ' (toi)' : m.name) + '</span>' + (m.uid === d.host ? '<small>organise</small>' : '') + '</li>';
      }).join('') + '</ul></section>' +
      '<p class="hint">Le départ est donné en même temps sur chaque téléphone, avec un décompte. Ensuite, chacun voit son exercice, et une pause ou un saut d’exercice s’applique à tout le monde.</p>' +
      (host ? '<button class="btn go s-cardio" data-l="start"' + (mem.length < 2 ? ' disabled' : '') + '>' + I.play + (mem.length < 2 ? 'En attente d’un partenaire' : 'Démarrer pour tous') + '</button>' :
        '<p class="l-wait">En attente du départ donné par ' + esc((mem[0] || {}).name || 'l’organisateur') + '…</p>');
  }
  function lobbyAct(a, el) {
    if (!ROOM) return;
    var d = ROOM.data || {};
    if (a === 'leave') {
      var id = ROOM.id, host = d.host === uid(), p = {};
      roomClose(); closeLobby();
      if (host && d.state === 'lobby') Rooms.remove(id).catch(function () { /* rien */ });
      else { p['members.' + uid()] = DEL; Rooms.update(id, p).catch(function () { /* rien */ }); }
    } else if (a === 'share') {
      var url = shareUrl('salon-' + ROOM.id), text = 'Rejoins ma séance ' + (d.sname || '') + ' sur PRIME27 : code ' + ROOM.id;
      if (navigator.share) navigator.share({ title: 'PRIME27', text: text, url: url }).catch(function () { /* annulé */ });
      else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(function () { toast('Lien copié'); }, function () { toast(url); });
      else toast(url);
    } else if (a === 'start') {
      if (members(d).length < 2) return;
      primeAudio();
      Rooms.update(ROOM.id, { state: 'run', t0: serverNow() + 4000, pausePos: 0 }).catch(function () { toast('Départ impossible : vérifie le réseau'); });
    } else if (a === 'invite') {
      var fid = el.getAttribute('data-l-invite'), fs = window.firebase.firestore();
      fs.collection('users').doc(fid).collection('invites').doc(ROOM.id).set({
        from: uid(), fromName: myName(), room: ROOM.id, sid: d.sid, sname: d.sname || '', at: window.firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () { social.sent[ROOM.id + ':' + fid] = 1; paintLobby(); toast('Invitation envoyée'); }, function () { toast('Invitation impossible : vérifie le réseau'); });
    }
  }

  // ----- lecteur synchronisé
  function syncPos() { var s = P.sync; return s.state === 'run' ? (serverNow() - s.t0) / 1000 : (s.pausePos || 0); }
  function syncSet(patch) {
    if (!P || !P.sync) return;
    for (var k in patch) P.sync[k] = patch[k];
    Rooms.update(P.sync.id, patch).catch(function () { toast('Réseau instable : la commande n’est pas partie'); });
  }
  function applyRoomData(d, initial) {
    if (!P || !P.sync || !d) return;
    P.sync.state = d.state; P.sync.t0 = d.t0 || 0; P.sync.pausePos = d.pausePos || 0;
    var mem = members(d), idx = -1, k, before = P.names ? P.names.join('|') : '', changed = false;
    for (k = 0; k < mem.length; k++) if (mem[k].uid === uid()) idx = k;
    P.team = Math.max(1, mem.length); P.me = Math.max(0, idx);
    P.names = mem.map(function (m, j) { return j === P.me ? 'Toi' : m.name; });
    if (d.exs && d.exs.length === P.tl.segs.length) P.tl.segs.forEach(function (x, j) { if (d.exs[j] && EX[d.exs[j]] && x.ex !== d.exs[j]) { x.ex = d.exs[j]; changed = true; } });
    if (!initial && (changed || before !== P.names.join('|')) && !P.counting) paintSeg(false);
  }
  function paintCountdown(sec) {
    var c = Math.ceil(sec);
    if (P.cd === c) return;
    P.cd = c;
    $('#p-digits').innerHTML = '<span>' + c + '</span>';
    $('#p-phase').textContent = 'Départ synchronisé';
    $('#p-name').textContent = c > 3 ? 'Prêts ?' : 'Partez dans ' + c;
    $('#p-cue').textContent = 'Tout le monde démarre en même temps.';
    if (c <= 3) { SND.tick(); buzz(60); }
  }

  // ----- amis
  function socialStart() {
    if (MOCK || !cloud.user) return;
    var fs = window.firebase.firestore(), u = cloud.user;
    socialStop();
    fs.collection('profiles').doc(u.uid).get().then(function (snap) {
      var p = snap.exists ? snap.data() : {};
      social.name = (p.name || u.displayName || (u.email || '').split('@')[0] || 'Moi').slice(0, 16);
      if (p.code) { social.code = p.code; repaintAccount(); tryPending(); return; }
      return newCode(0);
    }).catch(function () { /* hors ligne */ });
    social.unsubs.push(fs.collection('users').doc(u.uid).collection('friends').onSnapshot(function (qs) {
      social.friends = qs.docs.map(function (x) { var f = x.data(); f.uid = x.id; return f; })
        .sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
      repaintAccount(); paintLobby();
    }, function () { /* rien */ }));
    social.unsubs.push(fs.collection('users').doc(u.uid).collection('invites').onSnapshot(function (qs) {
      var now = Date.now();
      social.invites = qs.docs.map(function (x) { var v = x.data(); v.id = x.id; v.ms = v.at && v.at.toMillis ? v.at.toMillis() : now; return v; })
        .filter(function (v) { return now - v.ms < 6 * 3600e3; }).sort(function (a, b) { return b.ms - a.ms; });
      if (social.invites.length && route.name === 'home' && !P && !ROOM) { buzz(80); }
      repaintAccount();
    }, function () { /* rien */ }));
  }
  function socialStop() {
    social.unsubs.forEach(function (f) { try { f(); } catch (e) { /* rien */ } });
    social.unsubs = []; social.friends = []; social.invites = []; social.code = '';
  }
  function newCode(tries) {
    var fs = window.firebase.firestore(), u = cloud.user, c = rcode(6);
    return fs.collection('codes').doc(c).get().then(function (s) {
      if (s.exists) { if (tries < 4) return newCode(tries + 1); throw new Error('code'); }
      return fs.collection('codes').doc(c).set({ uid: u.uid, name: social.name })
        .then(function () { return fs.collection('profiles').doc(u.uid).set({ name: social.name, code: c }); })
        .then(function () { social.code = c; repaintAccount(); tryPending(); });
    });
  }
  function setPseudo(v) {
    v = String(v || '').trim().slice(0, 16);
    if (!v || !cloud.user || v === social.name) return;
    social.name = v;
    var fs = window.firebase.firestore();
    fs.collection('profiles').doc(cloud.user.uid).set({ name: v, code: social.code }, { merge: true }).catch(function () { /* rien */ });
    if (social.code) fs.collection('codes').doc(social.code).set({ uid: cloud.user.uid, name: v }).catch(function () { /* rien */ });
    toast('Pseudo enregistré');
  }
  function addFriend(raw) {
    var c = cleanCode(raw);
    if (c.length !== 6) { toast('Un code ami fait 6 caractères'); return; }
    if (!cloud.user) { requireCloud(function () { /* rien */ }); return; }
    var fs = window.firebase.firestore(), u = cloud.user;
    fs.collection('codes').doc(c).get().then(function (s) {
      if (!s.exists) { toast('Code inconnu : vérifie-le avec ton ami'); return; }
      var f = s.data();
      if (f.uid === u.uid) { toast('C’est ton propre code'); return; }
      var b = fs.batch(), ts = window.firebase.firestore.FieldValue.serverTimestamp();
      b.set(fs.collection('users').doc(u.uid).collection('friends').doc(f.uid), { name: f.name || 'Ami', code: c, at: ts });
      b.set(fs.collection('users').doc(f.uid).collection('friends').doc(u.uid), { name: social.name || myName(), code: social.code, at: ts });
      return b.commit().then(function () { toast((f.name || 'Ton ami') + ' fait partie de tes amis'); var i = document.getElementById('addf-code'); if (i) i.value = ''; });
    }).catch(function () { toast('Ajout impossible : vérifie le réseau'); });
  }
  function removeFriend(fid) {
    var f = social.friends.filter(function (x) { return x.uid === fid; })[0];
    ask('Retirer ' + (f ? f.name : 'cet ami') + ' ?', 'Vous ne pourrez plus vous inviter directement. Vous pourrez vous rajouter avec vos codes.', [
      { label: 'Retirer', cls: 'danger', fn: function () {
        var fs = window.firebase.firestore(), b = fs.batch();
        b.delete(fs.collection('users').doc(cloud.user.uid).collection('friends').doc(fid));
        b.delete(fs.collection('users').doc(fid).collection('friends').doc(cloud.user.uid));
        b.commit().catch(function () { toast('Impossible pour le moment : vérifie le réseau'); });
      } },
      { label: 'Annuler', cls: 'ghost' }
    ]);
  }
  function shareCode() {
    if (!social.code) return;
    var url = shareUrl('ami-' + social.code), text = 'Ajoute-moi sur PRIME27 pour s’entraîner ensemble : mon code ami est ' + social.code;
    if (navigator.share) navigator.share({ title: 'PRIME27', text: text, url: url }).catch(function () { /* annulé */ });
    else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(function () { toast('Code copié'); }, function () { toast(social.code); });
    else toast(social.code);
  }
  function friendsSection() {
    if (MOCK || onClaude || cloud.state !== 'in') return '';
    return '<section><h2 class="h2">Amis</h2>' +
      '<div class="field inline"><label for="set-pseudo">Ton pseudo</label><input type="text" id="set-pseudo" data-pseudo maxlength="16" autocomplete="nickname" value="' + esc(social.name) + '"></div>' +
      '<div class="acct"><span class="fcode disp">' + esc(social.code || '······') + '</span><span><b>Ton code ami</b><small>Partage-le : tes amis t’ajoutent en un geste, puis vous vous invitez à une séance.</small></span></div>' +
      '<div class="btnrow"><button class="btn sm" data-act="sharecode"' + (social.code ? '' : ' disabled') + '>' + I.share + 'Partager mon code</button></div>' +
      '<form class="addf" id="addf"><input type="text" id="addf-code" maxlength="12" autocomplete="off" autocapitalize="characters" aria-label="Code ami" placeholder="Code de ton ami"><button class="btn sm" type="submit">Ajouter</button></form>' +
      (social.friends.length ? '<ul class="kv">' + social.friends.map(function (f) {
        return '<li><span>' + esc(f.name) + '<small>' + esc(f.code || '') + '</small></span><button class="link" data-unfriend="' + esc(f.uid) + '">Retirer</button></li>';
      }).join('') + '</ul>' : '<p class="empty">Pas encore d’amis : partage ton code.</p>') + '</section>';
  }
  function inviteBanner() {
    var iv = social.invites[0];
    if (!iv) return '';
    return '<section class="invite s-defi"><p><b>' + esc(iv.fromName || 'Un ami') + '</b> t’invite pour <b>' + esc(iv.sname || 'une séance') + '</b></p>' +
      '<div class="btnrow"><button class="btn sm go" data-room-join="' + esc(iv.room) + '">Rejoindre</button><button class="btn sm ghost" data-invite-del="' + esc(iv.id) + '">Ignorer</button></div></section>';
  }
  function syncBox() {
    return '<div class="syncbox"><p><b>Un téléphone chacun ?</b> Lancez une séance synchronisée : même départ, même minuteur, et chacun voit son exercice.</p>' +
      (online() ? '<div class="btnrow"><button class="btn sm" data-act="room-create">Créer un salon</button><button class="btn sm ghost" data-act="room-join">Rejoindre avec un code</button></div>' :
        (onClaude ? '<p class="hint">Disponible dans la version installée de l’appli (b0z98.github.io/prime27).</p>' : '<p class="hint">Connecte-toi dans Réglages pour l’utiliser.</p>')) + '</div>';
  }
  function openJoin() {
    sheet.innerHTML = '<div class="sheet-bg" data-sheet="close"></div><div class="sheet-p" role="dialog" aria-modal="true" aria-label="Rejoindre un salon">' +
      '<button class="ic sheet-x alt" data-sheet="close" aria-label="Fermer">' + I.close + '</button>' +
      '<h2 class="disp sheet-n">Rejoindre</h2><p class="hint">Entre le code du salon affiché sur le téléphone de ton ami.</p>' +
      '<form class="addf" id="joinf"><input type="text" id="join-code" maxlength="8" autocomplete="off" autocapitalize="characters" aria-label="Code du salon" placeholder="Code du salon"><button class="btn sm" type="submit">Rejoindre</button></form></div>';
    sheet.classList.add('on');
    var i = document.getElementById('join-code'); if (i) i.focus();
  }
  // liens partagés : #salon-CODE (rejoindre) et #ami-CODE (s'ajouter en ami)
  function handleHash() {
    var h = location.hash.slice(1), m;
    if ((m = /^salon-([0-9A-Z]{5})$/i.exec(h))) pendingJoin = m[1].toUpperCase();
    else if ((m = /^ami-([0-9A-Z]{6})$/i.exec(h))) pendingFriend = m[1].toUpperCase();
    else return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* rien */ }
    tryPending();
  }
  function tryPending() {
    if (pendingJoin) {
      if (online()) { var j = pendingJoin; pendingJoin = null; joinRoom(j); }
      else if (cloud.state === 'out' || cloud.state === 'off') { toast('Connecte-toi pour rejoindre le salon'); go('settings'); }
    }
    if (pendingFriend && cloud.state === 'in' && social.code) { var c = pendingFriend; pendingFriend = null; addFriend(c); }
    else if (pendingFriend && (cloud.state === 'out' || cloud.state === 'off')) { toast('Connecte-toi pour ajouter ton ami'); go('settings'); }
  }
  window.addEventListener('hashchange', handleHash);

  // exercice affiché sur ce téléphone (à plusieurs, chacun a le sien)
  function myEx(g) {
    if (!P || P.team < 2 || !P.me) return g.ex;
    var plan = teamPlan(g);
    return plan && plan[P.me] ? plan[P.me].ex : g.ex;
  }
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'addf') { e.preventDefault(); addFriend((document.getElementById('addf-code') || {}).value); }
    else if (f.id === 'joinf') { e.preventDefault(); joinRoom((document.getElementById('join-code') || {}).value); }
  });

  // ------------------------------------------------------------------ interactions
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,[data-sheet]');
    if (!t) return;
    if (t.hasAttribute('data-sheet')) { closeSheet(); return; }
    if (t.hasAttribute('data-step')) {
      var inp = document.getElementById(t.getAttribute('data-for'));
      if (inp) inp.value = Math.max(0, Math.round(((parseFloat(inp.value) || 0) + parseFloat(t.getAttribute('data-step'))) * 2) / 2) || '';
      if (inp) inp.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    if (t.hasAttribute('data-l')) { lobbyAct(t.getAttribute('data-l'), t); return; }
    if (t.hasAttribute('data-l-invite')) { lobbyAct('invite', t); return; }
    if (t.hasAttribute('data-room-join')) { joinRoom(t.getAttribute('data-room-join')); return; }
    if (t.hasAttribute('data-invite-del')) {
      var ivd = t.getAttribute('data-invite-del');
      if (!MOCK && cloud.user) window.firebase.firestore().collection('users').doc(cloud.user.uid).collection('invites').doc(ivd).delete().catch(function () { /* rien */ });
      social.invites = social.invites.filter(function (v) { return v.id !== ivd; });
      render(); return;
    }
    if (t.hasAttribute('data-unfriend')) { removeFriend(t.getAttribute('data-unfriend')); return; }
    if (t.hasAttribute('data-acc')) { emailAuth(t.getAttribute('data-acc')); return; }
    if (t.hasAttribute('data-pick')) { pick(t.getAttribute('data-pick'), t.getAttribute('data-id')); return; }
    if (t.hasAttribute('data-level')) {
      db.settings.level = t.getAttribute('data-level'); save();
      $$('[data-level]').forEach(function (b) { b.setAttribute('aria-checked', b.getAttribute('data-level') === db.settings.level ? 'true' : 'false'); });
      return;
    }
    if (t.hasAttribute('data-m')) { miniAct(t.getAttribute('data-m')); return; }
    if (t.hasAttribute('data-mi')) { if (M) toggleMini(+t.getAttribute('data-mi')); return; }
    if (t.hasAttribute('data-mini')) { startMini(t.getAttribute('data-mini')); return; }
    if (t.hasAttribute('data-preset')) { presetEquip(t.getAttribute('data-preset')); return; }
    if (t.hasAttribute('data-team')) { db.settings.team = +t.getAttribute('data-team'); save(); var ty = window.scrollY; render(); window.scrollTo(0, ty); return; }
    if (t.hasAttribute('data-p')) { playerAct(t.getAttribute('data-p')); return; }
    if (t.hasAttribute('data-rpe')) {
      $$('#fin-rpe button').forEach(function (b) { b.setAttribute('aria-checked', b === t ? 'true' : 'false'); });
      return;
    }
    if (t.hasAttribute('data-go')) { go(t.getAttribute('data-go'), t.getAttribute('data-id')); return; }
    if (t.hasAttribute('data-cat')) { libCat = t.getAttribute('data-cat'); render(); return; }
    if (t.hasAttribute('data-del')) {
      var id = +t.getAttribute('data-del');
      ask('Supprimer cette séance ?', 'Elle disparaîtra du journal et du calendrier.', [
        { label: 'Supprimer', cls: 'danger', fn: function () { db.history = db.history.filter(function (h) { return h.id !== id; }); db.del = (db.del || []).concat([id]); save(); render(); } },
        { label: 'Annuler', cls: 'ghost' }
      ]);
      return;
    }
    if (t.hasAttribute('data-act')) { act(t.getAttribute('data-act')); return; }
    if (t.hasAttribute('data-ex')) { openSheet(t.getAttribute('data-ex'), t.getAttribute('data-c')); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-set')) { db.settings[t.getAttribute('data-set')] = t.checked; save(); if (P && !P.done) paintCtl(); if (t.getAttribute('data-set') === 'hard') coachSay('ten'); }
    if (t.hasAttribute && t.hasAttribute('data-vol')) {
      db.settings[t.getAttribute('data-vol')] = parseFloat(t.value); save();
      if (t.getAttribute('data-vol') === 'vBeep') { audio(); SND.go(); } else say('Volume des annonces.');
    }
    if (t.id === 'restore-file') { restoreFile(t.files && t.files[0]); t.value = ''; }
    if (t.hasAttribute && t.hasAttribute('data-pseudo')) setPseudo(t.value);
    if (t.hasAttribute && t.hasAttribute('data-prof')) { var kv = parseFloat(t.value); if (kv > 0) { db.settings.kg = Math.round(kv); save(); } }
    if (t.id === 'set-voice') { db.settings.voiceName = t.value; save(); say('Voici la voix de ton coach. Prêt ? C’est parti !'); }
    if (t.hasAttribute && t.hasAttribute('data-zone')) setPain(t.getAttribute('data-zone'), t.checked);
    if (t.hasAttribute && t.hasAttribute('data-mate')) {
      var ms = (db.settings.mates || []).slice();
      ms[+t.getAttribute('data-mate')] = t.value.trim().slice(0, 16);
      db.settings.mates = ms; save();
    }
    if (t.hasAttribute && t.hasAttribute('data-eq')) {
      var q = {};
      EQUIP.forEach(function (e) { q[e] = have(e); });
      q[t.getAttribute('data-eq')] = t.checked;
      setEquip(q);
    }
    if (t.hasAttribute && t.hasAttribute('data-mx') && M) {
      M.extreme = t.checked; M.items = miniItems(M.c, M.extreme);
      $('#m-list').innerHTML = miniRows(); paintMini();
    }
    if (t.id === 'set-start' && t.value) { db.settings.start = ymd(monday(parseYmd(t.value))); save(); toast('Cycle calé sur le ' + niceDate(parseYmd(db.settings.start))); render(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('on') && !$('.dialog', sheet)) closeSheet();
    if (P && !P.done && !sheet.classList.contains('on')) {
      if (e.key === ' ') { e.preventDefault(); toggleRun(); }
      else if (e.key === 'ArrowRight') jump(1);
      else if (e.key === 'ArrowLeft') jump(-1);
    }
  });

  function playerAct(a) {
    if (!P) return;
    if (a === 'toggle') toggleRun();
    else if (a === 'next') jump(1);
    else if (a === 'prev') jump(-1);
    else if (a === 'quit') askQuit();
    else if (a === 'swap') swapNow();
    else if (a === 'info') { var g = P.tl.segs[P.i]; if (g.ex) openSheet(g.ex, P.s.type); }
    else if (a === 'sound') openSound();
    else if (a === 'save') saveSession(false);
    else if (a === 'savemini') saveSession(true);
    else if (a === 'discard') { route = { name: 'home', id: null }; quitPlayer(); }
  }
  function act(a) {
    if (a === 'equip') openEquip();
    else if (a === 'pain') openPain();
    else if (a === 'room-create') { var rs = findSession(route.id); if (rs) createRoom(rs); }
    else if (a === 'room-join') requireCloud(openJoin);
    else if (a === 'sharecode') shareCode();
    else if (a === 'nopain') { db.settings.pain = null; save(); resetTimelines(); render(); openPain(); }
    else if (a === 'welcome') { db.settings.onboarded = true; save(); closeSheet(); render(); }
    else if (a === 'share') shareApp();
    else if (a === 'install') installApp();
    else if (a === 'welcome-login') { db.settings.onboarded = true; save(); closeSheet(); go('settings'); }
    else if (a === 'google') signGoogle();
    else if (a === 'email') openEmail();
    else if (a === 'signout') signOutCloud();
    else if (a === 'deletecloud') deleteCloud();
    else if (a === 'syncnow') { cloud.sent = null; cloudPull(); repaintAccount(); }
    else if (a === 'backupfile') backupFile();
    else if (a === 'start') { var s = findSession(route.id); if (s) startSession(s); }
    else if (a === 'resume') { var ls = findSession(db.live.sid); if (ls) startSession(ls, db.live); }
    else if (a === 'drop') { db.live = null; save(); render(); }
    else if (a === 'testsound') {
      var s0 = db.settings.sound; db.settings.sound = true; audio(); SND.go(); db.settings.sound = s0;
      var v0 = db.settings.voice; db.settings.voice = true; say('Souffle ! On enchaîne avec : rameur.'); db.settings.voice = v0;
    }
    else if (a === 'export') {
      var ta = $('#set-data'), txt = backupJson();
      ta.value = txt; ta.select();
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast('Sauvegarde copiée'); }, function () { toast('Texte prêt : copie-le à la main'); });
      else toast('Texte prêt : copie-le à la main');
    }
    else if (a === 'import') {
      try {
        restoreObj(JSON.parse($('#set-data').value));
        toast('Sauvegarde restaurée : ' + db.history.length + ' séances'); render();
      } catch (err) { toast('Texte illisible : colle la sauvegarde complète'); }
    }
    else if (a === 'reset') {
      ask('Tout effacer ?', 'Séances, charges et réglages seront supprimés de cet appareil.', [
        { label: 'Tout effacer', cls: 'danger', fn: function () { db = blank(); db.settings.start = ymd(monday(new Date())); save(); render(); toast('Données effacées'); } },
        { label: 'Annuler', cls: 'ghost' }
      ]);
    }
  }

  render();
  protectStorage();
  handleHash();
  if (FIREBASE && !onClaude && db.settings.cloud) { cloud.state = 'loading'; fb().catch(function () { /* hors ligne */ }); }
  if (!db.settings.onboarded && !db.history.length) openWelcome();
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude/.test(location.hostname)) {
    try { navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne indisponible */ }); } catch (e) { /* rien */ }
  }
  // outils de test, uniquement sur le serveur local
  if (location.hostname === 'localhost') {
    window.__prime = { timeline: timeline, findSession: findSession, db: function () { return db; }, setEquip: setEquip, resetTimelines: resetTimelines, stats: stats, EQUIP: EQUIP, canDo: canDo, player: function () { return P; }, room: function () { return ROOM; } };
  }
})();
