/* PRIME27 — programmes mensuels.
 *
 * Chaque mois = 4 semaines avec les mêmes séances. Pour ajouter un mois :
 * copier un objet de `months`, changer id / n / title / sessions.
 *
 * Séance : 5 min d'échauffement + mise en place (`prep`) + blocs = 45 min pile,
 * puis 4 min d'étirements en plus.
 *
 * Règle des repos : effort de 20 à 40 s -> 20 s · 45 s -> 25 s · 60 s -> 30 s · 90 s -> 35 s · 2 min -> 40 s.
 *
 * Bloc : { name, sub (zone / matériel), note, items, rounds, work, rest, after }
 *   - items : identifiants d'exercices (voir exercises.js) ou { ex, work, rest, tag }
 *   - rounds + work + rest : nombre de tours et durées en secondes
 *   - laps : [{work, rest}, …] pour des tours de durées différentes (pyramide)
 *   - after : transition vers le bloc suivant (60 s par défaut)
 * Séance : rpe = effort ressenti proposé par défaut ; scores[].sug = valeur proposée dans le bilan.
 */
(function (G) {
  'use strict';

  var PYRAMIDE = [{ work: 60, rest: 30 }, { work: 45, rest: 25 }, { work: 30, rest: 20 }];

  G.PRIME_PROGRAM = {

    // Échauffements (5 min pile). A : renfo et mixte — B : cardio.
    warmups: {
      A: [['jacks', 50], ['arm_circles', 40], ['air_squat', 50], ['lunge_twist', 60], ['inchworm', 60], ['high_knees', 40]],
      B: [['row', 90], ['arm_circles', 30], ['air_squat', 45], ['lunge_twist', 60], ['inchworm', 45], ['jacks', 30]]
    },

    // Étirements de fin (4 min).
    stretch: [['st_fold', 40], ['st_quad', 40], ['st_hipflexor', 40], ['st_child', 40], ['st_cobra', 40], ['st_shoulder', 40]],

    // Mini challenges : supplément facultatif de 10 à 20 min, au nombre de répétitions.
    // items : [exercice, répétitions (ou libellé, ou tableau par jour), nom affiché facultatif]
    minis: [
      {
        id: 'progressif', name: 'Crescendo', tag: 'Cinq jours, un peu plus chaque jour', dur: '5 à 20 min', days: 5,
        items: [['pushup', [5, 10, 15, 20, 25]], ['burpee', [10, 15, 20, 25, 30]], ['air_squat', [15, 20, 25, 30, 35]], ['lunge_fwd', [10, 20, 30, 40, 50]], ['jacks', [20, 40, 60, 80, 100]]]
      },
      {
        id: 'quarante', name: '40 – 40', tag: '40 burpees puis 40 squats', dur: '8 à 12 min',
        items: [['burpee', 40], ['air_squat', 40, 'Squats']],
        extreme: [['db_devil', 40], ['kb_goblet', 40, 'Squats chargés (haltères ou barre)']]
      },
      {
        id: 'sangle', name: 'Sangle', tag: 'Abdos et gainage au sol', dur: '10 à 12 min',
        items: [['situp', 20], ['leg_raise', 20], ['superman', 20], ['shoulder_taps', 20], ['v_up', 20], ['climbers', 40], ['bridge', 20], ['plank', '1 min']]
      },
      {
        id: 'hyrox', name: 'Hyrox express', tag: 'SkiErg, rameur, burpees, wall balls, fermier', dur: '12 à 15 min',
        items: [['ski', '1 000 m'], ['row', '1 000 m'], ['burpee', 20], ['wall_ball', 30], ['farmer_carry', '1 min']]
      },
      {
        id: 'pyramide', name: 'Pyramide', tag: '5, 4, 3, 2, 1 sans pause', dur: '6 à 9 min', rounds: [5, 4, 3, 2, 1],
        items: [['burpee'], ['pushup'], ['jump_squat']]
      }
    ],

    months: [
      {
        id: 'm1', n: 1, title: 'Fondations',
        focus: [
          'Repères. Pars des charges proposées et ajuste-les : chaque série doit se finir avec deux répétitions en réserve.',
          'Régularité. Mêmes charges, technique plus propre, une ou deux répétitions de plus par série.',
          'Surcharge. Monte les charges de 5 à 10 % en renforcement et vise plus de calories sur les ergomètres.',
          'Records. Dernière semaine du cycle : bats tes scores et tes charges du mois.'
        ],
        sessions: [

          // ---------------------------------------------------------------- RENFO
          {
            id: 'm1-titan', name: 'Titan', type: 'renfo', core: true, day: 'Lundi', rpe: 7, prep: 60, bg: 'beams',
            tag: 'Force, corps entier',
            format: '40 s d’effort · 20 s de repos',
            intro: 'Six stations en duo : un mouvement du haut, un mouvement du bas, trois tours chacun. Charge lourde mais propre, tempo contrôlé.',
            equip: ['Banc', 'Haltères', 'Box', 'Barre', 'Tapis'],
            warmup: 'A',
            blocks: [
              { name: 'Station 1', sub: 'Banc + haltères', note: 'Deux paires d’haltères : lourde pour le développé, moyenne pour la fente bulgare. Change de jambe à mi-série.', rounds: 3, work: 40, rest: 20, items: ['db_bench', 'db_bulgarian'] },
              { name: 'Station 2', sub: 'Box + haltères', note: 'Rowing lourd, change de bras à mi-série. Step-up avec une paire plus légère.', rounds: 3, work: 40, rest: 20, items: ['db_row1', 'db_stepup'] },
              { name: 'Station 3', sub: 'Barre', note: 'Une seule barre chargée pour le rowing et les fentes.', rounds: 3, work: 40, rest: 20, items: ['bb_row', 'bb_lunge'] },
              { name: 'Station 4', sub: 'Barre', note: 'Même barre pour le push press. Ajoute 20 kg pour le soulevé de terre.', rounds: 3, work: 40, rest: 20, items: ['bb_pushpress', 'bb_rdl'] },
              { name: 'Station 5', sub: 'Haltères', note: 'Curl : paire légère. Squat sumo : paire lourde.', rounds: 3, work: 40, rest: 20, items: ['db_curl', 'db_sumo'] },
              { name: 'Station 6', sub: 'Tapis', note: 'Dernière station : va chercher les dernières répétitions.', rounds: 3, work: 40, rest: 20, items: ['pushup', 'bridge'] }
            ]
          },

          // ---------------------------------------------------------------- CARDIO
          {
            id: 'm1-mistral', name: 'Mistral', type: 'cardio', core: true, day: 'Mercredi', rpe: 9, prep: 30, bg: 'speed',
            tag: 'Ergomètres et plyométrie',
            format: 'Pyramide 60 / 45 / 30 s, puis sprints',
            intro: 'Trois vagues en pyramide autour du rameur, du SkiErg et du vélo : 60, 45 puis 30 secondes, de plus en plus vite. Huit sprints au SkiErg pour finir à fond.',
            equip: ['Rameur', 'SkiErg', 'Vélo', 'Tapis'],
            warmup: 'B',
            scores: [
              { id: 'sprint_ski', label: 'Sprints SkiErg, total', unit: 'cal', sug: 60 }
            ],
            blocks: [
              { name: 'Vague 1', sub: 'Rameur', note: 'Reste à côté du rameur pour les burpees et les fentes.', laps: PYRAMIDE, items: ['row', 'burpee', 'lunge_fwd'], after: 80 },
              { name: 'Vague 2', sub: 'SkiErg', note: 'Squats sautés et mountain climbers au pied du SkiErg.', laps: PYRAMIDE, items: ['ski', 'jump_squat', 'climbers'], after: 80 },
              { name: 'Vague 3', sub: 'Vélo', note: 'Prévois un tapis à côté du vélo pour les sit-ups.', laps: PYRAMIDE, items: ['bike', 'high_knees', 'situp'], after: 80 },
              { name: 'Sprints', sub: 'SkiErg', note: 'Huit sprints de 20 secondes, 20 secondes de repos. Compteur à zéro, note les calories à la fin.', rounds: 8, work: 20, rest: 20, items: ['ski'] }
            ]
          },

          // ---------------------------------------------------------------- MIXTE
          {
            id: 'm1-fusion', name: 'Fusion', type: 'mixte', core: true, day: 'Vendredi', rpe: 8, prep: 50, bg: 'rings',
            tag: 'Force et cardio alternés',
            format: '40 s d’effort · 20 s de repos',
            intro: 'Quatre trios : un mouvement de force, un ergomètre, un mouvement explosif ou de gainage. Trois tours par trio, sans traîner entre les exercices.',
            equip: ['Kettlebell', 'Rameur', 'Haltères', 'SkiErg', 'Box', 'Vélo', 'Slam ball', 'Tapis'],
            warmup: 'A',
            blocks: [
              { name: 'Trio 1', sub: 'Kettlebell + rameur', note: 'Pose la kettlebell et un tapis à côté du rameur.', rounds: 3, work: 40, rest: 20, items: ['kb_goblet', 'row', 'situp'], after: 90 },
              { name: 'Trio 2', sub: 'Haltères + SkiErg', note: 'Une paire d’haltères modérée au pied du SkiErg.', rounds: 3, work: 40, rest: 20, items: ['db_cleanpress', 'ski', 'db_devil'], after: 90 },
              { name: 'Trio 3', sub: 'Box + vélo', note: 'Box et haltères près du vélo. Box jump : descends en marchant.', rounds: 3, work: 40, rest: 20, items: ['db_stepover', 'bike', 'box_jump'], after: 90 },
              { name: 'Trio 4', sub: 'Slam ball + tapis', note: 'Dernier trio, sans machine : donne tout.', rounds: 3, work: 40, rest: 20, items: ['ball_slam', 'burpee', 'plank'] }
            ]
          },

          // ---------------------------------------------------------------- RENFO 2 (bonus)
          {
            id: 'm1-atlas', name: 'Atlas', type: 'renfo', core: false, day: 'Samedi', rpe: 7, prep: 60, bg: 'beams',
            tag: 'Épaules, fessiers, gainage',
            format: '40 s d’effort · 20 s de repos',
            intro: 'La deuxième séance de renforcement : cinq stations en duo plus accessoires, puis un bloc de gainage pour terminer.',
            equip: ['Haltères', 'Banc', 'Kettlebell', 'Med ball', 'Tapis'],
            warmup: 'A',
            blocks: [
              { name: 'Station 1', sub: 'Haltères', note: 'Une paire modérée pour le développé et les fentes latérales.', rounds: 3, work: 40, rest: 20, items: ['db_press', 'db_latlunge'] },
              { name: 'Station 2', sub: 'Banc + haltères', note: 'Triceps : haltères légers. Hip thrust : un haltère lourd sur les hanches.', rounds: 3, work: 40, rest: 20, items: ['db_skull', 'db_hipthrust'] },
              { name: 'Station 3', sub: 'Kettlebell', note: 'Swing : kettlebell lourde. Tirage menton : plus légère.', rounds: 3, work: 40, rest: 20, items: ['kb_swing', 'kb_uprow'] },
              { name: 'Station 4', sub: 'Med ball + haltères légers', note: 'Élévations latérales : petits haltères, tempo lent.', rounds: 3, work: 40, rest: 20, items: ['ball_lunge', 'db_raise'] },
              { name: 'Station 5', sub: 'Banc + haltères', note: 'Dips sur le banc, puis thrusters avec la paire modérée.', rounds: 3, work: 40, rest: 20, items: ['bench_dips', 'db_thruster'] },
              { name: 'Gainage', sub: 'Tapis', note: 'Deux tours sans relâcher le ventre.', rounds: 2, work: 40, rest: 20, items: ['plank', 'leg_raise', 'climbers'] }
            ]
          },

          // ---------------------------------------------------------------- DÉFI (bonus)
          {
            id: 'm1-defi', name: 'Défi', type: 'defi', core: false, day: 'Dimanche', rpe: 9, prep: 35, bg: 'speed',
            tag: 'Le test de la semaine, en solo',
            format: 'Quatre parties chronométrées',
            intro: 'La version solo du challenge : moteur au rameur, charge maximale, points sur la box et le vélo, puis l’hybride haltères et SkiErg. Note tes scores et bats-les la semaine suivante.',
            equip: ['Rameur', 'Kettlebell', 'Box', 'Haltères', 'Vélo', 'SkiErg', 'Tapis'],
            warmup: 'B',
            scores: [
              { id: 'row_cal', label: 'Partie 1 — rameur, total', unit: 'cal', sug: 88 },
              { id: 'kb_kg', label: 'Partie 2 — kettlebell', unit: 'kg', sug: 24, step: 4 },
              { id: 'bike_cal', label: 'Partie 3 — vélo, total', unit: 'cal', sug: 50 },
              { id: 'ski_cal', label: 'Partie 4 — SkiErg, total', unit: 'cal', sug: 60 }
            ],
            blocks: [
              {
                name: 'Partie 1 · Moteur', sub: 'Rameur', note: 'Compteur du rameur à zéro : note les calories cumulées sur les trois passages.',
                items: [
                  { ex: 'row', work: 120, rest: 40 }, { ex: 'lunge_fwd', work: 60, rest: 30 },
                  { ex: 'row', work: 90, rest: 35 }, { ex: 'burpee', work: 60, rest: 30 },
                  { ex: 'row', work: 60, rest: 30 }, { ex: 'situp', work: 60 }
                ],
                after: 80
              },
              { name: 'Partie 2 · Charge max', sub: 'Kettlebell lourde', note: 'La kettlebell la plus lourde que tu tiens proprement pendant 40 secondes.', rounds: 4, work: 40, rest: 20, items: ['kb_goblet', 'kb_swing'], after: 80 },
              {
                name: 'Partie 3 · Points max', sub: 'Box + vélo', note: 'Compteur du vélo à zéro. Le dernier passage se fait à fond.',
                items: [
                  { ex: 'db_stepover', work: 60, rest: 30 }, { ex: 'bike', work: 60, rest: 30 },
                  { ex: 'db_stepover', work: 60, rest: 30 }, { ex: 'bike', work: 60, rest: 30 },
                  { ex: 'bike', work: 60, tag: 'MAX' }
                ],
                after: 80
              },
              {
                name: 'Partie 4 · Hybride', sub: 'Haltères + SkiErg', note: 'Compteur du SkiErg à zéro. Trois tours, haltères au pied de la machine.',
                rounds: 3,
                items: [{ ex: 'db_cleanpress', work: 40, rest: 20 }, { ex: 'ski', work: 40, rest: 20 }, { ex: 'db_devil', work: 40, rest: 30 }],
                after: 30
              },
              { name: 'Bonus', sub: 'SkiErg', note: 'Une minute, tout ce qui reste.', items: [{ ex: 'ski', work: 60, tag: 'MAX' }] }
            ]
          }
        ]
      }
    ]
  };
})(window);
