/* PRIME27 — bibliothèque d'exercices.
 * Chaque exercice : nom, catégorie, matériel, muscles, 3 points clés, alternative
 * si le matériel est pris, puis l'animation (poses clés `k`, durées `t` en secondes).
 * Voir figure.js pour le format des poses.
 */
(function (G) {
  'use strict';

  function R(x, y) { return [x, y, 0]; }   // main relative à l'épaule
  function A(x, y) { return [x, y, 1]; }   // main en position absolue
  function T(x, y) { return [x, y, 2]; }   // main dans le repère du buste (avant, vers la tête)

  var FT = [[117, 5, 0], [123, 5, 0]];                 // pieds, debout de profil
  var FTF = [[129, 5, 0], [111, 5, 0]];                // pieds, debout de face
  var PLK = [[41, 13, -75], [45, 13, -75]];            // pieds en planche
  var RACK = [60, 160];                                // barre en position « front rack »
  var DBR = [35, 150];                                 // haltères aux épaules
  var HIPS = [-20, 70];                                // mains sur les hanches

  var CATS = [
    { id: 'erg', n: 'Ergomètres' },
    { id: 'barre', n: 'Barre' },
    { id: 'halteres', n: 'Haltères' },
    { id: 'kettlebell', n: 'Kettlebell' },
    { id: 'ball', n: 'Ballon' },
    { id: 'box', n: 'Box et banc' },
    { id: 'corps', n: 'Poids du corps' },
    { id: 'mobilite', n: 'Échauffement' },
    { id: 'etirement', n: 'Étirements' }
  ];

  var EX = {

    // ================= ERGOMÈTRES =================
    row: {
      n: 'Rameur', c: 'erg', eq: ['Rameur'], m: 'Jambes, dos, cardio',
      cues: ['Pousse d’abord avec les jambes', 'Puis bascule le buste, puis tire les bras', 'Retour dans l’ordre inverse : bras, buste, jambes'],
      alt: 'SkiErg ou vélo, même durée',
      p: [['rower']],
      k: [
        { h: [130, 27], l: 22, d: -8, a: A(190, 56), f: [[162, 24, 40], [164, 24, 40]] },
        { h: [97, 27], l: -5, d: -4, a: A(139, 58), f: [[162, 24, 40], [164, 24, 40]] },
        { h: [96, 27], l: -22, d: 4, a: A(104, 58), f: [[162, 24, 40], [164, 24, 40]] },
        { h: [98, 27], l: 10, d: -4, a: A(146, 57), f: [[162, 24, 40], [164, 24, 40]] }
      ],
      t: [0.45, 0.35, 0.5, 0.7], th: 0.8
    },
    ski: {
      n: 'SkiErg', c: 'erg', eq: ['SkiErg'], m: 'Dorsaux, abdos, triceps, cardio',
      cues: ['Bras tendus en haut, sur la pointe des pieds', 'Tire en fléchissant hanches et genoux', 'Mains jusqu’aux cuisses, remonte grand'],
      alt: 'Slam ball debout ou rameur',
      p: [['ski']],
      k: [
        { h: [130, 79], l: 4, d: -8, a: A(156, 162), f: [[124, 7, -12], [130, 7, -12]] },
        { h: [118, 62], l: 46, d: -12, a: A(128, 50), f: [[124, 5, 0], [130, 5, 0]] }
      ],
      t: [0.5, 0.75], e: 'is', th: 0
    },
    bike: {
      n: 'Vélo (air bike / BikeErg)', c: 'erg', eq: ['Vélo'], m: 'Jambes, cardio',
      cues: ['Selle à hauteur de hanche', 'Pousse et tire avec les bras sur un air bike', 'Cadence régulière, souffle fort'],
      alt: 'Rameur, ou montées de genoux sur place',
      p: [['bike']], per: 1.208,
      fn: function (t) {
        var th = -t * 5.2, c = Math.cos(th), s = Math.sin(th);
        return {
          h: [98, 82], l: 28, d: -12, x: th,
          a: [A(150 + 7 * s, 100), A(150 - 7 * s, 100)],
          f: [[128 + 9 * c - 5, 26 + 9 * s + 4.5, -8 + 8 * s], [128 - 9 * c - 5, 26 - 9 * s + 4.5, -8 - 8 * s]]
        };
      }
    },

    // ================= BARRE =================
    bb_row: {
      n: 'Rowing barre buste penché', c: 'barre', eq: ['Barre'], m: 'Dos, biceps', load: 1,
      cues: ['Buste penché, dos plat, genoux souples', 'Tire la barre vers le nombril', 'Serre les omoplates, descends en contrôle'],
      alt: 'Rowing avec deux haltères',
      p: [['bar']],
      k: [
        { h: [104, 68], l: 60, d: -14, a: R(0, -46), f: FT },
        { h: [104, 68], l: 58, d: -14, a: R(-7, -21), f: FT }
      ],
      t: [0.8, 1.0]
    },
    bb_lunge: {
      n: 'Fente arrière barre en front rack', c: 'barre', eq: ['Barre'], m: 'Quadriceps, fessiers, gainage', load: 1,
      cues: ['Barre sur les épaules, coudes hauts', 'Grand pas en arrière, genou frôle le sol', 'Pousse dans le talon avant pour remonter'],
      alt: 'Fente arrière avec haltères',
      p: [['bar']],
      k: [
        { h: [120, 77], l: 0, a: RACK, f: [[122, 5, 0], [118, 5, 0]] },
        { h: [96, 44], l: 6, a: RACK, f: [[122, 5, 0], [60, 10, -60]] },
        { h: [120, 77], l: 0, a: RACK, f: [[122, 5, 0], [118, 5, 0]] },
        { h: [96, 44], l: 6, a: RACK, f: [[60, 10, -60], [122, 5, 0]] }
      ],
      t: [0.9, 0.9, 0.9, 0.9]
    },
    bb_pushpress: {
      n: 'Push press barre', c: 'barre', eq: ['Barre'], m: 'Épaules, triceps, jambes', load: 1,
      cues: ['Barre sur les clavicules, gainage serré', 'Petite flexion des genoux puis impulsion', 'Verrouille les bras, tête dans la fenêtre'],
      alt: 'Push press avec haltères',
      p: [['bar']],
      k: [
        { h: [120, 77], l: 0, a: RACK, f: FT },
        { h: [116, 67], l: 4, a: RACK, f: FT },
        { h: [120, 77], l: 0, d: -4, a: [178, 3], f: FT },
        { h: [120, 77], l: 0, d: -4, a: [178, 3], f: FT }
      ],
      t: [0.35, 0.3, 0.45, 0.7], e: 'soss', th: 0.7
    },
    bb_rdl: {
      n: 'Soulevé de terre roumain', c: 'barre', eq: ['Barre'], m: 'Ischios, fessiers, lombaires', load: 1,
      cues: ['Recule les hanches, genoux à peine fléchis', 'La barre glisse le long des jambes', 'Dos plat, remonte en serrant les fessiers'],
      alt: 'Même mouvement avec haltères ou kettlebell',
      p: [['bar']],
      k: [
        { h: [120, 77], l: 0, a: R(7, -45), f: FT },
        { h: [102, 73], l: 72, d: -16, a: R(-22, -40), f: FT }
      ],
      t: [1.3, 1.0]
    },

    // ================= HALTÈRES =================
    db_bench: {
      n: 'Développé couché haltères', c: 'halteres', eq: ['Banc', 'Haltères'], m: 'Pectoraux, triceps, épaules', load: 1,
      cues: ['Omoplates serrées, pieds ancrés au sol', 'Descends les haltères au niveau de la poitrine', 'Pousse sans verrouiller brutalement'],
      alt: 'Au sol (floor press) ou pompes',
      p: [['bench', 60, 152, 28], ['db', 'e']],
      k: [
        { h: [132, 38.5], l: -90, a: T(13, -3), f: [[160, 5, 0], [166, 5, 0]] },
        { h: [132, 38.5], l: -90, a: T(46, 0), f: [[160, 5, 0], [166, 5, 0]] }
      ],
      t: [0.9, 1.1]
    },
    db_bulgarian: {
      n: 'Fente bulgare haltères', c: 'halteres', eq: ['Banc', 'Haltères'], m: 'Quadriceps, fessiers', load: 1, sides: 1,
      cues: ['Pied arrière posé sur le banc', 'Descends à la verticale, buste légèrement penché', 'Pousse dans le talon avant'],
      alt: 'Fente arrière classique',
      p: [['bench', 28, 92, 28], ['db', 'h']],
      k: [
        { h: [113, 71], l: 6, a: [0, 6], f: [[142, 5, 0], [80, 33, 170]] },
        { h: [108, 46], l: 16, a: [0, 6], f: [[142, 5, 0], [80, 33, 170]] }
      ],
      t: [1.1, 1.0]
    },
    db_row1: {
      n: 'Rowing unilatéral haltère', c: 'halteres', eq: ['Box', 'Haltères'], m: 'Dorsaux, biceps', load: 1, sides: 1,
      cues: ['Une main en appui sur la box, dos plat', 'Tire le coude vers la hanche', 'Pas de rotation du buste'],
      alt: 'Appui sur un banc',
      p: [['box', 142, 182, 34], ['db', 'h', 0]],
      k: [
        { h: [98, 70], l: 74, d: -16, a: [R(-2, -45), A(152, 38)], f: [[84, 5, 0], [120, 5, 0]] },
        { h: [98, 70], l: 74, d: -16, a: [R(-9, -17), A(152, 38)], f: [[84, 5, 0], [120, 5, 0]] }
      ],
      t: [0.8, 1.0]
    },
    db_stepup: {
      n: 'Step-up sur box avec haltères', c: 'halteres', eq: ['Box', 'Haltères'], m: 'Quadriceps, fessiers', load: 1,
      cues: ['Pied entier posé sur la box', 'Monte en poussant sur la jambe du haut', 'Descends en contrôle, alterne les jambes'],
      alt: 'Step-up sur un banc',
      p: [['box', 138, 180, 34], ['db', 'h']],
      k: [
        { h: [122, 74], l: 10, a: [0, 6], f: [[114, 5, 0], [150, 39, 0]] },
        { h: [150, 111], l: 0, a: [0, 6], f: [[146, 39, 0], [153, 39, 0]] },
        { h: [122, 74], l: 10, a: [0, 6], f: [[150, 39, 0], [114, 5, 0]] },
        { h: [150, 111], l: 0, a: [0, 6], f: [[146, 39, 0], [153, 39, 0]] }
      ],
      t: [0.8, 0.7, 0.8, 0.7]
    },
    db_stepover: {
      n: 'Passage de box avec haltères', c: 'halteres', eq: ['Box', 'Haltères'], m: 'Jambes, cardio', load: 1,
      cues: ['Monte sur la box, redescends de l’autre côté', 'Haltères le long du corps, buste droit', 'Garde un rythme régulier'],
      alt: 'Step-up alternés',
      p: [['box', 100, 140, 34], ['db', 'h']],
      k: [
        { h: [80, 77], l: 0, a: [0, 6], f: [[78, 5, 0], [84, 5, 0]] },
        { h: [94, 76], l: 12, a: [0, 6], f: [[78, 5, 0], [114, 39, 0]] },
        { h: [120, 111], l: 0, a: [0, 6], f: [[118, 39, 0], [124, 39, 0]] },
        { h: [146, 76], l: 8, a: [0, 6], f: [[126, 39, 0], [160, 5, 0]] },
        { h: [160, 77], l: 0, a: [0, 6], f: [[158, 5, 0], [164, 5, 0]] },
        { h: [146, 76], l: 8, a: [0, 6], f: [[126, 39, 0], [160, 5, 0]] },
        { h: [120, 111], l: 0, a: [0, 6], f: [[118, 39, 0], [124, 39, 0]] },
        { h: [94, 76], l: 12, a: [0, 6], f: [[78, 5, 0], [114, 39, 0]] }
      ],
      t: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], th: 0.4
    },
    db_curl: {
      n: 'Curl biceps haltères', c: 'halteres', eq: ['Haltères'], m: 'Biceps', load: 1,
      cues: ['Coudes collés au corps', 'Monte sans élan du buste', 'Descends lentement, bras presque tendu'],
      alt: 'Curl à la barre',
      p: [['db', 'e']],
      k: [
        { h: [120, 77], l: 0, a: [[2, 10], [2, 10]], f: FT },
        { h: [120, 77], l: 0, a: [[10, 138], [2, 10]], f: FT },
        { h: [120, 77], l: 0, a: [[2, 10], [2, 10]], f: FT },
        { h: [120, 77], l: 0, a: [[2, 10], [10, 138]], f: FT }
      ],
      t: [0.7, 0.7, 0.7, 0.7]
    },
    db_sumo: {
      n: 'Squat sumo haltères', c: 'halteres', eq: ['Haltères'], m: 'Adducteurs, fessiers, quadriceps', load: 1,
      cues: ['Pieds larges, pointes ouvertes', 'Haltères entre les jambes, buste droit', 'Genoux dans l’axe des pieds'],
      alt: 'Avec une seule kettlebell lourde',
      v: 'f', p: [['db', 'e']],
      k: [
        { h: [120, 74], a: R(-8, -45), f: [[150, 5, 0], [90, 5, 0]], ts: [1, 1] },
        { h: [120, 43], a: R(-8, -45), f: [[150, 5, 0], [90, 5, 0]], ts: [0.72, 0.72] }
      ],
      t: [1.1, 1.0]
    },
    db_skull: {
      n: 'Extension triceps allongé', c: 'halteres', eq: ['Haltères', 'Tapis'], m: 'Triceps', load: 1,
      cues: ['Allongé, bras à la verticale', 'Plie les coudes, haltères vers le front', 'Coudes fixes et serrés, remonte'],
      alt: 'Sur un banc, ou dips sur banc',
      p: [['mat', 48, 186], ['db', 'e']],
      k: [
        { h: [125, 10.5], l: -90, a: T(47, 0), f: [[166, 5, 0], [171, 5, 0]] },
        { h: [125, 10.5], l: -90, a: T(25, 23), f: [[166, 5, 0], [171, 5, 0]] }
      ],
      t: [1.0, 1.0]
    },
    db_latlunge: {
      n: 'Fente latérale haltères', c: 'halteres', eq: ['Haltères'], m: 'Adducteurs, fessiers, quadriceps', load: 1,
      cues: ['Pieds très écartés, pointes vers l’avant', 'Charge une jambe, l’autre reste tendue', 'Fesses en arrière, talon au sol'],
      alt: 'Sans charge, mains devant',
      v: 'f', p: [['db', 'e']],
      k: [
        { h: [120, 64], l: 0, a: R(-9, -44), f: [[168, 5, 0], [72, 5, 0]], ts: [1, 1] },
        { h: [142, 42], l: -6, a: R(-9, -42), f: [[168, 5, 0], [72, 5, 0]], ts: [0.5, 1] },
        { h: [120, 64], l: 0, a: R(-9, -44), f: [[168, 5, 0], [72, 5, 0]], ts: [1, 1] },
        { h: [98, 42], l: 6, a: R(-9, -42), f: [[168, 5, 0], [72, 5, 0]], ts: [1, 0.5] }
      ],
      t: [0.9, 0.9, 0.9, 0.9]
    },
    db_cleanpress: {
      n: 'Hang clean + push press haltères', c: 'halteres', eq: ['Haltères'], m: 'Corps entier, puissance', load: 1,
      cues: ['Départ haltères aux genoux, dos plat', 'Extension des hanches, haltères aux épaules', 'Fléchis légèrement puis pousse au-dessus de la tête'],
      alt: 'Thruster haltères',
      p: [['db', 'h']],
      k: [
        { h: [110, 71], l: 28, d: -8, a: [2, 6], f: FT },
        { h: [120, 77], l: 0, a: DBR, f: FT },
        { h: [116, 68], l: 4, a: DBR, f: FT },
        { h: [120, 77], l: 0, a: [176, 4], f: FT },
        { h: [120, 77], l: 0, a: DBR, f: FT }
      ],
      t: [0.45, 0.3, 0.3, 0.5, 0.55], e: 'ososs', th: 1.05
    },
    db_devil: {
      n: 'Devil’s press', c: 'halteres', eq: ['Haltères'], m: 'Corps entier, cardio', load: 1,
      cues: ['Poitrine au sol, mains sur les haltères', 'Saute les pieds vers les mains', 'Balance les haltères entre les jambes puis au-dessus de la tête'],
      alt: 'Burpee classique',
      p: [['db', 'h']],
      k: [
        { h: [105, 36], l: 72, d: -20, a: A(146, 7), f: [[37, 13, -75], [41, 13, -75]] },
        { h: [109, 17.5], l: 86.5, d: -26, a: A(146, 7), f: [[37, 13, -75], [41, 13, -75]] },
        { h: [105, 36], l: 72, d: -20, a: A(146, 7), f: [[37, 13, -75], [41, 13, -75]] },
        { h: [98, 34], l: 66, d: -10, a: A(146, 7), f: [[114, 5, 0], [120, 5, 0]] },
        { h: [100, 64], l: 58, d: -18, a: A(112, 46), f: [[114, 5, 0], [120, 5, 0]] },
        { h: [118, 77], l: 0, d: 0, a: A(122, 166), f: [[114, 5, 0], [120, 5, 0]] },
        { h: [98, 34], l: 66, d: -10, a: A(146, 7), f: [[114, 5, 0], [120, 5, 0]] }
      ],
      t: [0.4, 0.4, 0.35, 0.4, 0.45, 0.55, 0.4], th: 2.0
    },
    db_thruster: {
      n: 'Thruster haltères', c: 'halteres', eq: ['Haltères'], m: 'Jambes, épaules, cardio', load: 1,
      cues: ['Haltères aux épaules, squat complet', 'Remonte en explosant', 'Enchaîne la poussée au-dessus de la tête'],
      alt: 'Thruster avec une kettlebell',
      p: [['db', 'h']],
      k: [
        { h: [101, 37], l: 30, a: DBR, f: FT },
        { h: [120, 77], l: 0, a: [176, 4], f: FT }
      ],
      t: [0.8, 0.9], e: 'os', th: 0
    },
    db_press: {
      n: 'Développé épaules haltères', c: 'halteres', eq: ['Haltères'], m: 'Épaules, triceps', load: 1,
      cues: ['Debout, abdos et fessiers serrés', 'Pousse à la verticale sans cambrer', 'Redescends les haltères au niveau des oreilles'],
      alt: 'Assis sur un banc',
      v: 'f', p: [['db', 'h']],
      k: [
        { h: [120, 77.9], a: [70, 110], f: FTF },
        { h: [120, 77.9], a: [165, 15], f: FTF }
      ],
      t: [0.8, 0.9]
    },
    db_raise: {
      n: 'Élévations latérales', c: 'halteres', eq: ['Haltères'], m: 'Épaules (deltoïde moyen)', load: 1,
      cues: ['Coudes légèrement fléchis', 'Monte les bras jusqu’à l’horizontale', 'Épaules basses, descente lente'],
      alt: 'Charge plus légère, tempo lent',
      v: 'f', p: [['db', 'e']],
      k: [
        { h: [120, 77.9], a: [6, 12], f: FTF },
        { h: [120, 77.9], a: [86, 10], f: FTF }
      ],
      t: [0.8, 1.0]
    },
    db_hipthrust: {
      n: 'Hip thrust sur banc', c: 'halteres', eq: ['Banc', 'Haltères'], m: 'Fessiers, ischios', load: 1,
      cues: ['Haut du dos en appui sur le banc', 'Haltère posé au creux des hanches', 'Monte le bassin, serre fort en haut'],
      alt: 'Pont fessier au sol',
      p: [['bench', 26, 88, 28], ['db1', 'h']],
      k: [
        { h: [118, 12.5], l: -56.7, d: 18, a: T(9, -36), f: [[160, 5, 0], [165, 5, 0]] },
        { h: [125, 36], l: -90, d: 30, a: T(9, -36), f: [[160, 5, 0], [165, 5, 0]] }
      ],
      t: [0.9, 1.0]
    },

    // ================= KETTLEBELL =================
    kb_goblet: {
      n: 'Goblet squat kettlebell', c: 'kettlebell', eq: ['Kettlebell'], m: 'Quadriceps, fessiers, gainage', load: 1,
      cues: ['Kettlebell contre la poitrine', 'Descends entre les talons, buste haut', 'Coudes à l’intérieur des genoux'],
      alt: 'Avec un haltère tenu verticalement',
      p: [['kb', 'g']],
      k: [
        { h: [120, 77], l: 0, a: T(10, -7), f: FT },
        { h: [102, 36], l: 26, a: T(10, -7), f: FT }
      ],
      t: [1.0, 0.9]
    },
    kb_swing: {
      n: 'Swing kettlebell', c: 'kettlebell', eq: ['Kettlebell'], m: 'Fessiers, ischios, cardio', load: 1,
      cues: ['Charnière de hanche, pas un squat', 'Claque les hanches, bras relâchés', 'La kettlebell monte à hauteur d’épaules'],
      alt: 'Swing avec un haltère',
      p: [['kb', 'a']],
      k: [
        { h: [100, 66], l: 58, d: -24, a: [-40, 3], f: FT },
        { h: [120, 77], l: -3, d: 0, a: [92, 3], f: FT }
      ],
      t: [0.55, 0.75], e: 'os'
    },
    kb_uprow: {
      n: 'Tirage menton kettlebell', c: 'kettlebell', eq: ['Kettlebell'], m: 'Épaules, trapèzes', load: 1,
      cues: ['Kettlebell tenue à deux mains', 'Tire le long du corps, coudes hauts', 'Arrête-toi sous le menton'],
      alt: 'Tirage menton avec haltères',
      v: 'f', p: [['kb', 'g']],
      k: [
        { h: [120, 77.9], a: R(-13, -44), f: FTF },
        { h: [120, 77.9], a: R(-13, -7), f: FTF }
      ],
      t: [0.8, 0.9]
    },

    // ================= BALLON =================
    ball_slam: {
      n: 'Slam ball à genoux', c: 'ball', eq: ['Slam ball', 'Tapis'], m: 'Abdos, dorsaux, épaules', load: 1,
      cues: ['À genoux, ballon bras tendus au-dessus', 'Claque le ballon au sol devant toi', 'Engage les abdos, rattrape au rebond'],
      alt: 'Slam debout, ou SkiErg',
      p: [['mat', 56, 190], ['ball']],
      k: [
        { h: [112, 41], l: -6, d: -10, a: [172, 12], f: [[76, 4, 180], [72, 4, 180]] },
        { h: [108, 36], l: 58, d: 4, a: [22, 5], f: [[76, 4, 180], [72, 4, 180]] }
      ],
      t: [0.4, 0.75], e: 'is', th: 0
    },
    ball_lunge: {
      n: 'Fente arrière avec ballon', c: 'ball', eq: ['Med ball'], m: 'Quadriceps, fessiers', load: 1,
      cues: ['Ballon serré contre la poitrine', 'Grand pas en arrière, genou vers le sol', 'Buste droit, alterne les jambes'],
      alt: 'Avec une kettlebell en goblet',
      p: [['ball']],
      k: [
        { h: [120, 77], l: 0, a: T(10, -8), f: [[122, 5, 0], [118, 5, 0]] },
        { h: [96, 44], l: 6, a: T(10, -8), f: [[122, 5, 0], [60, 10, -60]] },
        { h: [120, 77], l: 0, a: T(10, -8), f: [[122, 5, 0], [118, 5, 0]] },
        { h: [96, 44], l: 6, a: T(10, -8), f: [[60, 10, -60], [122, 5, 0]] }
      ],
      t: [0.8, 0.8, 0.8, 0.8]
    },

    // ================= BOX ET BANC =================
    box_jump: {
      n: 'Box jump', c: 'box', eq: ['Box'], m: 'Jambes, explosivité',
      cues: ['Bras en arrière, hanches fléchies', 'Saute et atterris en douceur, pieds à plat', 'Redresse-toi puis redescends en marchant'],
      alt: 'Step-up rapides ou squats sautés',
      p: [['box', 152, 192, 34]],
      k: [
        { h: [112, 77], l: 0, a: [0, 8], f: [[110, 5, 0], [116, 5, 0]] },
        { h: [98, 46], l: 42, a: [-45, 10], f: [[110, 5, 0], [116, 5, 0]] },
        { h: [138, 96], l: 22, a: [110, 15], f: [[146, 52, -10], [152, 52, -10]] },
        { h: [160, 82], l: 32, a: [70, 20], f: [[166, 39, 0], [172, 39, 0]] },
        { h: [168, 111], l: 0, a: [0, 8], f: [[166, 39, 0], [172, 39, 0]] }
      ],
      t: [0.5, 0.3, 0.3, 0.45, 0.9], e: 'sools', th: 0.8
    },
    bench_dips: {
      n: 'Dips sur banc', c: 'box', eq: ['Banc'], m: 'Triceps, épaules',
      cues: ['Mains au bord du banc, doigts vers l’avant', 'Descends coudes vers l’arrière', 'Fesses proches du banc, remonte bras tendus'],
      alt: 'Pompes serrées',
      p: [['bench', 44, 104, 28]],
      k: [
        { h: [107, 35], l: -3, a: A(101, 31.5), f: [[170, 6, 55], [175, 6, 55]] },
        { h: [109, 15], l: -3, a: A(101, 31.5), f: [[170, 6, 55], [175, 6, 55]] }
      ],
      t: [1.0, 0.9]
    },

    // ================= POIDS DU CORPS =================
    pushup: {
      n: 'Pompes', c: 'corps', eq: ['Tapis'], m: 'Pectoraux, triceps, gainage',
      cues: ['Corps gainé de la tête aux talons', 'Poitrine près du sol, coudes à 45°', 'Pousse fort, ne casse pas le bassin'],
      alt: 'Sur les genoux, ou mains sur un banc',
      p: [['mat', 26, 176]],
      k: [
        { h: [109, 36], l: 72, d: -22, a: [A(150, 3), A(154, 3)], f: PLK },
        { h: [113, 17.5], l: 86.5, d: -28, a: [A(150, 3), A(154, 3)], f: PLK }
      ],
      t: [0.9, 0.8]
    },
    bridge: {
      n: 'Pont fessier', c: 'corps', eq: ['Tapis'], m: 'Fessiers, ischios',
      cues: ['Talons proches des fesses', 'Monte le bassin, serre les fessiers', 'Deux secondes en haut, descends lentement'],
      alt: 'Sur une jambe, ou talons sur sliders',
      p: [['mat', 44, 190]],
      k: [
        { h: [120, 10.5], l: -90, d: 0, a: A(124.6, 4), f: [[163, 5, 0], [168, 5, 0]] },
        { h: [114.2, 32], l: -120, d: 26, a: A(124.6, 4), f: [[163, 5, 0], [168, 5, 0]] }
      ],
      t: [0.9, 1.1]
    },
    burpee: {
      n: 'Burpees', c: 'corps', eq: [], m: 'Corps entier, cardio',
      cues: ['Mains au sol, pieds en arrière', 'Poitrine au sol puis pieds vers les mains', 'Saute, bras au-dessus de la tête'],
      alt: 'Sans pompe ni saut (step-back)',
      k: [
        { h: [120, 77], l: 0, a: A(123, 74), f: [[117, 5, 0], [123, 5, 0]] },
        { h: [100, 32], l: 68, d: -10, a: A(146, 3), f: [[117, 5, 0], [123, 5, 0]] },
        { h: [105, 36], l: 72, d: -20, a: A(146, 3), f: [[37, 13, -75], [41, 13, -75]] },
        { h: [109, 17.5], l: 86.5, d: -26, a: A(146, 3), f: [[37, 13, -75], [41, 13, -75]] },
        { h: [105, 36], l: 72, d: -20, a: A(146, 3), f: [[37, 13, -75], [41, 13, -75]] },
        { h: [100, 32], l: 68, d: -10, a: A(146, 3), f: [[117, 5, 0], [123, 5, 0]] },
        { h: [120, 94], l: 0, a: A(119, 180), f: [[117, 22, -35], [123, 22, -35]] }
      ],
      t: [0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.35], th: 0.65
    },
    climbers: {
      n: 'Mountain climbers', c: 'corps', eq: ['Tapis'], m: 'Abdos, épaules, cardio',
      cues: ['Épaules au-dessus des mains', 'Ramène un genou vers la poitrine, alterne vite', 'Bassin bas et stable'],
      alt: 'Version lente, pied posé à chaque pas',
      p: [['mat', 26, 176]],
      k: [
        { h: [110, 37], l: 72, d: -22, a: [A(150, 3), A(154, 3)], f: [[118, 12, -40], [45, 13, -75]] },
        { h: [110, 37], l: 72, d: -22, a: [A(150, 3), A(154, 3)], f: [[41, 13, -75], [122, 12, -40]] }
      ],
      t: [0.32, 0.32]
    },
    situp: {
      n: 'Sit-ups', c: 'corps', eq: ['Tapis'], m: 'Abdominaux',
      cues: ['Pieds au sol, mains aux tempes', 'Enroule le buste jusqu’aux genoux', 'Redescends vertèbre par vertèbre'],
      alt: 'Crunch, amplitude réduite',
      p: [['mat', 40, 186]],
      k: [
        { h: [112, 10.5], l: -88, d: 8, a: T(8, 15), f: [[154, 5, 0], [159, 5, 0]] },
        { h: [112, 10.5], l: -14, d: 6, a: T(8, 15), f: [[154, 5, 0], [159, 5, 0]] }
      ],
      t: [0.9, 1.0]
    },
    leg_raise: {
      n: 'Relevés de jambes', c: 'corps', eq: ['Tapis'], m: 'Abdominaux bas, fléchisseurs',
      cues: ['Bas du dos plaqué au sol', 'Monte les jambes tendues à la verticale', 'Descends lentement sans toucher le sol'],
      alt: 'Genoux fléchis',
      p: [['mat', 34, 196]],
      k: [
        { h: [108, 10.5], l: -90, d: 4, a: A(112.5, 4), f: [[180, 9, 88], [180, 12, 88]] },
        { h: [108, 10.5], l: -90, d: 4, a: A(112.5, 4), f: [[110, 82, 172], [113, 82, 172]] }
      ],
      t: [1.0, 1.2]
    },
    plank: {
      n: 'Planche', c: 'corps', eq: ['Tapis'], m: 'Gainage complet',
      cues: ['Coudes sous les épaules', 'Fessiers et abdos serrés, bassin neutre', 'Respire, regarde le sol'],
      alt: 'Sur les genoux',
      p: [['mat', 22, 186]],
      k: [
        { h: [107.4, 22.4], l: 82.5, d: -12, a: [A(172, 3), A(175, 3)], f: [[36, 13, -75], [40, 13, -75]] },
        { h: [107.4, 23.6], l: 82, d: -12, a: [A(172, 3), A(175, 3)], f: [[36, 13, -75], [40, 13, -75]] }
      ],
      t: [1.6, 1.6]
    },
    jump_squat: {
      n: 'Squats sautés', c: 'corps', eq: [], m: 'Jambes, explosivité',
      cues: ['Descends en squat, bras devant', 'Saute le plus haut possible', 'Atterris souple et enchaîne'],
      alt: 'Squats rapides sans saut',
      k: [
        { h: [100, 40], l: 40, a: [55, 25], f: FT },
        { h: [120, 98], l: 0, a: [-25, 10], f: [[117, 26, -35], [123, 26, -35]] },
        { h: [114, 68], l: 15, a: [10, 15], f: FT }
      ],
      t: [0.4, 0.35, 0.35], e: 'ois', th: 0.4
    },
    lunge_fwd: {
      n: 'Fentes avant alternées', c: 'corps', eq: [], m: 'Quadriceps, fessiers',
      cues: ['Grand pas vers l’avant', 'Genou arrière vers le sol, buste droit', 'Repousse le sol pour revenir, alterne'],
      alt: 'Fentes arrière, plus douces pour les genoux',
      k: [
        { h: [108, 77], l: 0, a: HIPS, f: [[106, 5, 0], [111, 5, 0]] },
        { h: [120, 44], l: 5, a: HIPS, f: [[148, 5, 0], [84, 10, -60]] },
        { h: [108, 77], l: 0, a: HIPS, f: [[106, 5, 0], [111, 5, 0]] },
        { h: [120, 44], l: 5, a: HIPS, f: [[84, 10, -60], [148, 5, 0]] }
      ],
      t: [0.75, 0.75, 0.75, 0.75]
    },
    high_knees: {
      n: 'Montées de genoux', c: 'corps', eq: [], m: 'Cardio, fléchisseurs de hanche',
      cues: ['Genoux à hauteur de hanches', 'Appuis sur l’avant du pied', 'Bras actifs, buste droit'],
      alt: 'Marche rapide sur place',
      k: [
        { h: [120, 78], l: 3, a: [[-40, 85], [45, 95]], f: [[133, 42, -25], [119, 6, -10]] },
        { h: [120, 78], l: 3, a: [[45, 95], [-40, 85]], f: [[119, 6, -10], [133, 42, -25]] }
      ],
      t: [0.28, 0.28], th: 0
    },
    jacks: {
      n: 'Jumping jacks', c: 'corps', eq: [], m: 'Cardio, coordination',
      cues: ['Saute en écartant pieds et bras', 'Mains au-dessus de la tête', 'Reste léger sur les appuis'],
      alt: 'Pas latéraux sans saut',
      v: 'f',
      k: [
        { h: [120, 77.9], a: [8, 6], f: [[126, 5, 0], [114, 5, 0]] },
        { h: [120, 73], a: [160, 8], f: [[146, 5, 0], [94, 5, 0]] }
      ],
      t: [0.36, 0.36]
    },

    // ================= ÉCHAUFFEMENT =================
    arm_circles: {
      n: 'Cercles de bras', c: 'mobilite', eq: [], m: 'Épaules',
      cues: ['Bras tendus, grands cercles', 'Dix secondes dans un sens, puis l’autre', 'Épaules relâchées'],
      per: 2.1,
      fn: function (t) {
        var a = (t * 170) % 360;
        return { h: [120, 77], l: 0, a: [[a, 4], [a + 28, 4]], f: FT };
      }
    },
    air_squat: {
      n: 'Squats sans charge', c: 'mobilite', eq: [], m: 'Jambes, hanches',
      cues: ['Pieds largeur d’épaules', 'Fesses en arrière, talons au sol', 'Bras devant pour l’équilibre'],
      k: [
        { h: [120, 77], l: 0, a: [5, 8], f: FT },
        { h: [100, 38], l: 38, a: [80, 8], f: FT }
      ],
      t: [0.9, 0.9]
    },
    inchworm: {
      n: 'Chenille (inchworm)', c: 'mobilite', eq: [], m: 'Ischios, épaules, gainage',
      cues: ['Mains au sol, jambes presque tendues', 'Avance les mains jusqu’à la planche', 'Reviens en marchant sur les mains'],
      k: [
        { h: [52, 77], l: 0, d: 0, a: A(55, 74), f: [[50, 5, 0], [56, 5, 0]] },
        { h: [42, 68], l: 128, d: 0, a: A(82, 3), f: [[50, 5, 0], [56, 5, 0]] },
        { h: [118.4, 35.7], l: 72, d: -20, a: A(159, 3), f: [[50, 13, -75], [56, 13, -75]] },
        { h: [42, 68], l: 128, d: 0, a: A(82, 3), f: [[50, 5, 0], [56, 5, 0]] }
      ],
      t: [0.8, 1.1, 1.1, 0.8], th: 1.9
    },
    lunge_twist: {
      n: 'Fente basse avec rotation', c: 'mobilite', eq: [], m: 'Hanches, dos, épaules', sides: 1,
      cues: ['Grande fente, une main au sol', 'Ouvre le bras opposé vers le plafond', 'Suis ta main du regard'],
      k: [
        { h: [112, 38], l: 72, d: -10, a: [A(152, 4), [8, 5]], f: [[146, 5, 0], [70, 10, -60]] },
        { h: [112, 38], l: 70, d: -40, a: [A(152, 4), [172, 5]], f: [[146, 5, 0], [70, 10, -60]] }
      ],
      t: [1.2, 1.2]
    },

    // ================= ÉTIREMENTS =================
    st_fold: {
      n: 'Flexion avant debout', c: 'etirement', eq: [], m: 'Ischios, lombaires',
      cues: ['Genoux déverrouillés', 'Laisse tomber la tête et les bras', 'Expire longuement, relâche le dos'],
      k: [
        { h: [108, 72], l: 138, d: 10, a: A(128, 5), f: FT },
        { h: [108, 72], l: 143, d: 12, a: A(127, 4), f: FT }
      ],
      t: [2, 2]
    },
    st_quad: {
      n: 'Étirement quadriceps debout', c: 'etirement', eq: [], m: 'Quadriceps', sides: 1,
      cues: ['Attrape la cheville, talon vers la fesse', 'Genoux serrés, bassin en avant', 'Tiens-toi à un appui si besoin'],
      k: [
        { h: [120, 77], l: 2, a: [A(104, 73), [28, 25]], f: [[103, 72, 125], [122, 5, 0]] },
        { h: [121, 77], l: 4, a: [A(103, 74), [32, 25]], f: [[102, 73, 125], [122, 5, 0]] }
      ],
      t: [2, 2]
    },
    st_hipflexor: {
      n: 'Fente basse, fléchisseurs de hanche', c: 'etirement', eq: ['Tapis'], m: 'Psoas, quadriceps', sides: 1,
      cues: ['Genou arrière au sol', 'Avance le bassin, buste droit', 'Lève le bras du côté du genou posé'],
      p: [['mat', 30, 190]],
      k: [
        { h: [112, 34], l: -4, d: -5, a: [HIPS, [174, 6]], f: [[148, 5, 0], [64, 4, 180]] },
        { h: [117, 33], l: -8, d: -8, a: [HIPS, [180, 6]], f: [[148, 5, 0], [64, 4, 180]] }
      ],
      t: [2, 2]
    },
    st_child: {
      n: 'Posture de l’enfant', c: 'etirement', eq: ['Tapis'], m: 'Dos, épaules, hanches',
      cues: ['Fesses sur les talons', 'Bras loin devant, front vers le sol', 'Respire dans le bas du dos'],
      p: [['mat', 60, 196]],
      k: [
        { h: [92, 20], l: 86, d: 24, a: A(178, 3.5), f: [[89, 4, 180], [86, 4, 180]] },
        { h: [92, 19.2], l: 87.5, d: 26, a: A(179, 3.5), f: [[89, 4, 180], [86, 4, 180]] }
      ],
      t: [2.2, 2.2]
    },
    st_cobra: {
      n: 'Cobra', c: 'etirement', eq: ['Tapis'], m: 'Abdominaux, fléchisseurs de hanche',
      cues: ['Mains sous les épaules, bassin au sol', 'Pousse doucement, ouvre la poitrine', 'Épaules loin des oreilles'],
      p: [['mat', 16, 176]],
      k: [
        { h: [100, 9.5], l: 52, d: -18, a: A(140, 3.5), f: [[28, 4, 180], [32, 4, 180]] },
        { h: [100, 9.5], l: 47, d: -22, a: A(140, 3.5), f: [[28, 4, 180], [32, 4, 180]] }
      ],
      t: [2.2, 2.2]
    },
    st_shoulder: {
      n: 'Étirement épaule, bras croisé', c: 'etirement', eq: [], m: 'Deltoïde postérieur', sides: 1,
      cues: ['Bras tendu en travers de la poitrine', 'L’autre bras le plaque vers toi', 'Épaule basse, ne tourne pas le buste'],
      v: 'f',
      k: [
        { h: [120, 77.9], a: [[-84, 4], [-12, -118]], f: FTF },
        { h: [120, 77.9], a: [[-88, 4], [-14, -124]], f: FTF }
      ],
      t: [2, 2]
    }
  };

  // ================= AJOUTS : gainage au sol =================
  EX.superman = {
    n: 'Superman', c: 'corps', eq: ['Tapis'], m: 'Lombaires, fessiers, haut du dos',
    cues: ['Allongé sur le ventre, bras devant', 'Décolle bras, poitrine et jambes ensemble', 'Tiens une seconde en haut, redescends doucement'],
    alt: 'Bras le long du corps',
    p: [['mat', 16, 200]],
    k: [
      { h: [100, 9.5], l: 88, d: -12, a: A(190, 5), f: [[28, 4, 180], [32, 4, 180]] },
      { h: [100, 9.5], l: 76, d: -26, a: A(187, 30), f: [[30, 16, 170], [34, 16, 170]] }
    ],
    t: [0.7, 0.9]
  };
  EX.shoulder_taps = {
    n: 'Planche, touches d’épaules', c: 'corps', eq: ['Tapis'], m: 'Gainage, épaules',
    cues: ['En planche haute, pieds écartés', 'Une main touche l’épaule opposée', 'Le bassin ne bouge pas'],
    alt: 'Sur les genoux',
    p: [['mat', 26, 176]],
    k: [
      { h: [109, 36], l: 72, d: -22, a: [A(150, 3), A(154, 3)], f: PLK },
      { h: [109, 36], l: 72, d: -22, a: [A(142, 44), A(154, 3)], f: PLK },
      { h: [109, 36], l: 72, d: -22, a: [A(150, 3), A(154, 3)], f: PLK },
      { h: [109, 36], l: 72, d: -22, a: [A(150, 3), A(146, 44)], f: PLK }
    ],
    t: [0.4, 0.4, 0.4, 0.4]
  };
  EX.v_up = {
    n: 'V-ups', c: 'corps', eq: ['Tapis'], m: 'Abdominaux complets',
    cues: ['Allongé, bras derrière la tête, jambes tendues', 'Monte buste et jambes en même temps', 'Les mains vont chercher les tibias'],
    alt: 'Genoux fléchis (crunch complet, mains aux genoux)',
    p: [['mat', 10, 196]],
    k: [
      { h: [112, 10.5], l: -88, d: 6, a: A(22, 6), f: [[184, 7, 88], [184, 10, 88]] },
      { h: [112, 10.5], l: -42, d: 4, a: A(126, 58), f: [[160, 62, 130], [162, 59, 130]] }
    ],
    t: [0.8, 0.9]
  };

  // Réglages 3D (hz : demi-écart des mains, fz : demi-écart des pieds) et charges conseillées.
  // sug = charge de départ en kg (par haltère, ou barre chargée) pour un pratiquant confirmé
  // d'environ 88 kg ; step = pas des boutons + / − dans le bilan.
  var EXTRA = {
    row: { hz: 7, fz: 7 }, ski: { hz: 9 }, bike: { hz: 7, fz: 7 },
    bb_row: { sug: 40, step: 5 }, bb_lunge: { sug: 40, step: 5 }, bb_pushpress: { sug: 40, step: 5, fz: 11 }, bb_rdl: { sug: 60, step: 5 },
    db_bench: { sug: 20, hz: 17 }, db_bulgarian: { sug: 14 }, db_row1: { sug: 20 }, db_stepup: { sug: 14 }, db_stepover: { sug: 12 },
    db_curl: { sug: 12 }, db_sumo: { sug: 20 }, db_skull: { sug: 10, hz: 7 }, db_latlunge: { sug: 12 }, db_cleanpress: { sug: 14 },
    db_devil: { sug: 12 }, db_thruster: { sug: 12, fz: 11 }, db_press: { sug: 14 }, db_raise: { sug: 6, step: 1 }, db_hipthrust: { sug: 30, hz: 7 },
    kb_goblet: { sug: 20, step: 4, hz: 3.5, fz: 11 }, kb_swing: { sug: 24, step: 4, hz: 3.5, fz: 11 }, kb_uprow: { sug: 16, step: 4 },
    ball_slam: { sug: 10, step: 1, hz: 5 }, ball_lunge: { sug: 9, step: 1, hz: 5 },
    air_squat: { fz: 11 }, jump_squat: { fz: 11 }, situp: { hz: 9 }, st_child: { hz: 9 }, st_fold: { hz: 8 }
  };
  Object.keys(EXTRA).forEach(function (id) { for (var k in EXTRA[id]) EX[id][k] = EXTRA[id][k]; });
  EX.db_hipthrust.p[1] = ['db1', 'e'];

  // Remplaçants quand le matériel manque (du plus proche au poids du corps).
  var ALTS = {
    row: ['ski', 'bike', 'high_knees'], ski: ['row', 'bike', 'jacks'], bike: ['row', 'ski', 'high_knees'],
    bb_row: ['db_row1', 'superman'], bb_lunge: ['ball_lunge', 'lunge_fwd'], bb_pushpress: ['db_press', 'db_thruster', 'pushup'], bb_rdl: ['kb_swing', 'bridge'],
    db_bench: ['pushup'], db_bulgarian: ['lunge_fwd'], db_row1: ['bb_row', 'superman'], db_stepup: ['box_jump', 'lunge_fwd'], db_stepover: ['box_jump', 'jump_squat'],
    db_curl: ['kb_uprow', 'shoulder_taps'], db_sumo: ['kb_goblet', 'air_squat'], db_skull: ['bench_dips', 'pushup'], db_latlunge: ['lunge_fwd'],
    db_cleanpress: ['kb_swing', 'burpee'], db_devil: ['burpee'], db_thruster: ['kb_goblet', 'jump_squat'], db_press: ['bb_pushpress', 'pushup'],
    db_raise: ['shoulder_taps'], db_hipthrust: ['bridge'], kb_goblet: ['db_sumo', 'air_squat'], kb_swing: ['bb_rdl', 'jump_squat'], kb_uprow: ['db_raise', 'shoulder_taps'],
    ball_slam: ['burpee'], ball_lunge: ['lunge_fwd'], box_jump: ['jump_squat'], bench_dips: ['pushup']
  };
  Object.keys(ALTS).forEach(function (id) { EX[id].alts = ALTS[id]; });

  Object.keys(EX).forEach(function (id) { EX[id].id = id; });


  G.PRIME_EX = EX;
  G.PRIME_CATS = CATS;
})(window);
