# FMTM Fitness App — Spécification complète

## Contexte utilisateur
App de coaching personnalisé pour un homme de 23 ans, 1m70 / 45 kg,
ectomorphe avec digestion sensible (SII), intolérance lactose partielle,
tendinite avant-bras gauche (côté paume) et douleur épaule (élévation scapulaire).
Objectif : +5 kg avant le 20/06/2026, 35 pompes, 5 tractions propres.
Démarrage : 24/04/2026.

## Stack technique
- React 18 + Vite
- Tailwind CSS (mobile-first, design épuré)
- React Router v6 (navigation entre pages)
- localStorage pour la persistance (pas de backend)
- Lucide React pour les icônes

## Architecture — Pages et navigation

### 1. /dashboard — Tableau de bord
- Header avec nom "FMTM" + date du jour + streak (nb jours consécutifs actifs)
- 4 metric cards : Poids actuel (éditable), Objectif (+5 kg), Pompes max (éditable), Tractions max (éditable)
- Barre de progression vers les 3 objectifs mi-parcours (poids, pompes, tractions)
  avec % calculé dynamiquement et date limite affichée (20/06/2026)
- Prochain entraînement recommandé (basé sur la dernière séance loggée)
- Bouton "Commencer la séance" → /session
- Section "Cette semaine" : mini calendrier 7 jours avec indicateur séance faite / repos / aujourd'hui
- Bouton flottant "+" pour logger une séance rapide

### 2. /session — Générateur de séance + minuteur
C'est la fonctionnalité principale. Interface step-by-step interactive.

#### Sélection de séance (écran 1)
- 3 options : Séance A (tirage dominant), Séance B (push dominant), Séance C (full équilibré)
- Chaque option affiche : durée estimée, groupes musculaires ciblés, niveau de difficulté
- Bouton "Personnaliser" pour ajuster les exercices

#### Déroulement de séance (écran 2 — le coeur de l'app)
Afficher UN exercice à la fois (pas tout d'un coup) avec :
- Nom de l'exercice (grand, lisible)
- Description du mouvement + tip technique adapté au profil (poignets, épaule)
- Nombre de séries × répétitions
- Indicateur de tempo (ex: 2-1-3) avec explication visuelle animée (3 cercles qui s'animent)
- Compteur de séries actif : "Série 1/3", "Série 2/3", etc.
- Bouton "Série terminée" → déclenche le minuteur de repos
- Minuteur de repos : grand countdown circulaire (SVG animé), durée selon l'exercice,
  bouton "Skip" et bouton "+15 sec". Son/vibration à la fin si possible.
- Barre de progression globale de la séance (ex: 4/12 séries)
- Bouton "Exercice suivant" actif uniquement après la dernière série ou après le minuteur

#### Exercices inclus par séance (hardcodé, adapté au profil)

**Séance A — Tirage (lun)**
1. Échauffement : rotations épaules 2×10, rotations poignets 2×10 (repos : 0)
2. Traction australienne : 3×8–10, repos 90s
3. Traction négative : 3×3–5, repos 120s
4. Curl marteau haltères : 3×10, repos 60s
5. Face pull (bande/haltère léger) : 2×15, repos 45s
6. Rotation externe couché : 2×12, repos 45s
7. Suspension passive barre : 1×45s, repos 0
8. Étirements poignets + épaule : 2×30s chaque

**Séance B — Push (mer)**
1. Échauffement : bras de brasse 2×10, pompes inclinées mur 1×10 (repos : 0)
2. Pompes standard : 3×10–12, repos 90s
3. Dips sur chaise : 3×8–10, repos 90s
4. Élévation latérale haltères : 2×12, repos 60s
5. Face pull : 2×15, repos 45s
6. Rotation externe couché : 2×12, repos 45s
7. Étirements pec + poignets

**Séance C — Full body (ven)**
1. Échauffement
2. Traction australienne : 3×8, repos 90s
3. Pompes avec pause 1s en bas : 3×10, repos 90s
4. Dips : 2×8, repos 75s
5. Curl marteau : 2×10, repos 60s
6. Planche avant : 3×30–45s, repos 45s
7. Squats corps : 3×15, repos 60s
8. Prévention complète

#### Fin de séance (écran 3)
- Résumé : durée totale, séries complétées, exercice le plus dur (sélectionnable)
- Champ "Note rapide" (humeur, douleurs éventuelles, sensation générale)
- Champ éditable "Max pompes aujourd'hui" et "Max tractions aujourd'hui"
- Bouton "Enregistrer et terminer" → sauvegarde dans localStorage + retour dashboard
- Confettis ou animation de célébration légère

### 3. /program — Programme 8 semaines
- Vue semaine par semaine (accordéon ou tabs)
- Semaine actuelle mise en évidence
- Pour chaque semaine : objectif principal, exercices clés, progression attendue
- Indicateur "Semaine complétée" si les 3 séances ont été faites
- Détail semaine 1 à 8 avec progression progressive :
  - S1-2 : mise en place, australiennes, pompes standard
  - S3-4 : intro tractions négatives, pompes avec pause
  - S5-6 : premières tractions assistées, pompes pieds surélevés
  - S7-8 : tractions propres, consolidation

### 4. /nutrition — Plan alimentaire
- Journée type avec 5–6 repas (heure, contenu, kcal estimées)
- Total calories affiché dynamiquement avec barre de progression vers 2800 kcal
- Section "Shakers hypercaloriques" : 3 recettes avec ingrédients et kcal
- Section "Calories invisibles" : liste d'aliments à ajouter partout
- Section "Snacks rapides" : 5 idées digestes
- Toggle "Jour d'entraînement / Jour de repos" (légère variation des apports)
- Alerte SII : rappel des aliments à éviter en bas de page

### 5. /prevention — Prévention & blessures
- Section tendinite avant-bras :
  - Exercices adaptés (curl marteau prioritaire)
  - Routine étirements poignets (avec timer intégré)
  - Règles poignets neutres
- Section épaule :
  - Exercices supprimés (élévation scapulaire = bannir)
  - Remplacements recommandés
  - Face pull et rotation externe détaillés
- Règles générales de progression (règle des +10%/semaine)
- Timer intégré pour la routine de 5 min post-séance

### 6. /progress — Suivi & statistiques
- Graphique d'évolution du poids (ligne, Chart.js ou Recharts)
- Graphique max pompes et max tractions au fil du temps
- Tableau des dernières séances (date, type, durée, note)
- Formulaire "Ajouter une mesure" : poids, pompes max, tractions max, date
- Estimation de progression vers les objectifs du 20/06/2026

## Données localStorage — structure

```json
{
  "profile": {
    "weight": 45,
    "startDate": "2024-04-24",
    "targetDate": "2026-06-20"
  },
  "sessions": [
    {
      "id": "uuid",
      "date": "2026-04-28",
      "type": "A",
      "duration": 42,
      "completedSets": 24,
      "maxPushups": 12,
      "maxPullups": 1,
      "note": "Bon ressenti, avant-bras ok"
    }
  ],
  "measurements": [
    { "date": "2026-04-24", "weight": 45, "maxPushups": 10, "maxPullups": 1 }
  ]
}
```

## Design system
- Palette : blanc, gris très léger, vert (#1D9E75) comme couleur principale,
  bleu (#378ADD) pour les infos, orange (#BA7517) pour les alertes, rouge (#E24B4A) pour stop
- Typographie : Inter ou system font, 400 et 500 uniquement
- Cards : fond blanc, border 1px gris léger, radius 12px
- Mobile-first : optimisé pour utilisation avec une main pendant la séance
- Pas de gradients, pas de shadows lourdes
- Bottom navigation bar sur mobile (5 onglets : Dashboard, Séance, Programme, Nutrition, Suivi)

## Contraintes importantes du profil à intégrer dans l'UI
- Afficher systématiquement "Poignets neutres" sur tous les exercices de tirage/push
- Bannir les élévations scapulaires de toutes les séances générées
- Sur les élévations latérales : toujours afficher "amplitude max 80° — stop si douleur"
- Sur les tractions négatives : toujours afficher "stop si douleur épaule"
- Sur tous les exercices avec haltères : afficher le tempo 2-1-3

## Fonctionnalités bonus si le temps le permet
- Mode "séance silencieuse" (pas de son, vibration uniquement)
- Export PDF du programme de la semaine
- Notifications de rappel de séance (PWA)
- Mode sombre automatique (prefers-color-scheme)