# PRIME27

Séances HIIT de 45 minutes pour la salle de sport, à suivre depuis le téléphone : minuteur, coach vocal, mouvements animés, badges et mini challenges.

## Utiliser l'appli

Ouvre le lien de l'appli dans Chrome (Android) ou Safari (iPhone), puis ajoute-la à l'écran d'accueil : elle s'ouvre en plein écran et fonctionne sans réseau une fois chargée.

Les séances, charges et badges restent sur ton téléphone. Pour les garder ou les transférer : Réglages, puis « Copier ma sauvegarde ».

## Structure

- `index.html` : page de l'appli
- `js/figure.js` : moteur du personnage animé
- `js/exercises.js` : bibliothèque des mouvements
- `js/programs.js` : séances du mois, échauffements, mini challenges
- `js/app.js` : interface, lecteur de séance, suivi, vestiaire
- `css/app.css` : style
- `sw.js`, `manifest.webmanifest`, `icons/` : installation et usage hors ligne
- `tools/` : serveur local de test, planche de poses, assemblage en un seul fichier

Aucune dépendance ni étape de compilation : les fichiers sont servis tels quels.
