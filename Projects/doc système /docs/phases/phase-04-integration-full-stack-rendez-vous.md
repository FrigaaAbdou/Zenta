# Phase 4 - Integration full-stack du parcours de rendez-vous

## 1. Objet de la phase

Cette phase decrit comment assembler `front` et `back` pour obtenir un parcours utilisateur complet, coherent et testable de bout en bout.

L'objectif est de transformer:

- une interface publique frontend
- une API backend
- un modele MongoDB

en une experience reelle de prise de rendez-vous.

Cette phase n'ajoute pas encore le back-office admin. Elle se concentre sur le flux public end-to-end.

## 2. Resultat attendu

A la fin de la phase 4, l'application doit permettre a un utilisateur public de:

- consulter la homepage
- consulter la FAQ et les informations d'eligibilite
- ouvrir la page de rendez-vous
- passer la pre-eligibilite
- remplir le formulaire
- recuperer les horaires disponibles
- soumettre sa demande
- recevoir une confirmation ou une erreur comprehensible

Et a l'equipe technique de:

- tester le flux de bout en bout
- tracer les erreurs
- valider que `front` et `back` respectent le contrat

## 3. Perimetre

### Inclus

- branchement `front` -> `back`
- configuration d'environnement locale
- consommation des endpoints publics
- gestion des etats de chargement
- mapping des erreurs serveur
- test du flux rendez-vous complet
- strategie de mock/fallback si certaines parties du `back` arrivent plus tard

### Hors perimetre

- admin
- auth
- notifications email/SMS
- analytics
- optimisation perf avancee

## 4. Vue d'ensemble du flux full-stack

## 4.1 Flux homepage

1. `front` charge la homepage
2. `front` appelle:
   - `GET /api/public/home-content`
   - `GET /api/public/faq`
   - optionnel `GET /api/public/campaigns/active`
3. `back` renvoie les contenus localises
4. `front` rend les sections

## 4.2 Flux rendez-vous

1. `front` charge la page `/appointment`
2. utilisateur valide la pre-eligibilite
3. `front` appelle `GET /api/public/appointment-form-meta`
4. utilisateur remplit le formulaire
5. utilisateur choisit une date
6. `front` appelle `GET /api/public/appointment-slots?date=...`
7. utilisateur choisit une heure
8. utilisateur soumet
9. `front` appelle `POST /api/public/appointments`
10. `back` valide, persiste, repond
11. `front` affiche succes ou erreur

## 5. Contrat d'environnement entre les deux repos

## 5.1 Variables `front`

Variables minimales recommandees:

- `VITE_API_BASE_URL`
- `VITE_DEFAULT_LOCALE`

Exemple local:

```env
VITE_API_BASE_URL=http://127.0.0.1:4000
VITE_DEFAULT_LOCALE=fr
```

## 5.2 Variables `back`

Variables minimales recommandees:

- `PORT`
- `MONGODB_URI`
- `NODE_ENV`
- `CORS_ORIGIN`

Exemple local:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/cts
CORS_ORIGIN=http://127.0.0.1:5175
NODE_ENV=development
```

## 5.3 Ports locaux recommandes

- `front`: `5175`
- `back`: `4000`

## 6. Strategie d'integration frontend

## 6.1 Couche API

Le `front` doit centraliser l'integration dans `src/lib/api`.

Responsabilites:

- injecter `VITE_API_BASE_URL`
- construire les URLs d'API
- gerer les erreurs HTTP
- renvoyer des exceptions ou objets standardises

## 6.2 Services de lecture publique

Services recommends:

- `homeApi.getHomeContent(locale, activeCampaign?)`
- `faqApi.getFaq(locale)`
- `campaignApi.getActiveCampaigns(locale)`
- `appointmentApi.getAppointmentFormMeta(locale)`
- `appointmentApi.getAppointmentSlots(date, campaignCode?)`
- `appointmentApi.createAppointmentRequest(payload)`

## 6.3 Hooks frontend recommandés

Hooks possibles:

- `useHomeContent`
- `useFaq`
- `useAppointmentFormMeta`
- `useAppointmentSlots`
- `useCreateAppointment`

Ces hooks doivent:

- isoler la logique de fetch
- exposer `data`, `loading`, `error`
- simplifier les pages et composants

## 7. Strategie d'integration backend

## 7.1 Namespace public

Le `back` doit exposer un namespace stable:

- `/api/public`

## 7.2 Ordre de mise a disposition recommande

1. `GET /home-content`
2. `GET /faq`
3. `GET /appointment-form-meta`
4. `GET /appointment-slots`
5. `POST /appointments`
6. `GET /campaigns/active`

## 7.3 Politique de compatibilite

Pendant l'integration:

- ne pas casser les contrats une fois branchés
- si un champ change, mettre a jour la documentation avant le code consommateur

## 8. Strategie de fallback pour developpement parallele

## 8.1 Si `back` n'est pas encore pret

Le `front` peut avancer avec:

- fixtures locales
- mocks de payload alignes sur le contrat API
- fichiers JSON de travail

Regle:

- les mocks doivent respecter strictement le contrat documente

## 8.2 Si `front` n'est pas encore pret

Le `back` peut avancer avec:

- tests d'integration
- collection Postman/Bruno/Insomnia
- scripts curl

## 9. Flux detaille de la page homepage

## 9.1 Chargement initial

Sequence recommandee:

1. router ouvre `/`
2. `front` determine la locale
3. appels paralleles:
   - `getHomeContent`
   - `getFaq`
   - optionnel `getActiveCampaigns`
4. rendu des sections

## 9.2 Comportement en cas d'erreur

Si `getHome` echoue:

- afficher un message simple
- ou fallback contenu local si la strategie produit le permet

Si `getFaq` echoue:

- ne pas bloquer tout le rendu
- afficher un fallback ou masquer la section

## 10. Flux detaille de la page rendez-vous

## 10.1 Chargement initial

1. router ouvre `/appointment`
2. `front` determine la locale
3. le gate d'eligibilite bloque l'acces au formulaire complet
4. quand le gate est valide, `front` appelle `getAppointmentFormMeta`
5. `front` hydrate:
   - groupes sanguins
   - types de don
   - wilayas
   - communes
   - checklist eligibility

## 10.2 Gate d'eligibilite

Regle:

- le formulaire principal ne doit pas etre actif tant que la pre-eligibilite n'est pas validee

Comportement:

- si les checkboxes minimales ne sont pas confirmees, le bouton de continuation reste bloque ou absent
- une fois le gate valide, le chargement des metadonnees backend est autorise

## 10.3 Recuperation des slots

Sequence:

1. utilisateur choisit `appointmentDate`
2. `front` reinitialise `appointmentTime`
3. `front` appelle `getSlots(date)`
4. `front` peuple la liste des horaires

Comportements attendus:

- loading local sur le select heure
- message si aucun slot
- reset si date change

## 10.4 Soumission

Sequence:

1. validation `zod`
2. mapping du formulaire vers payload API
3. appel `createRequest`
4. si succes:
   - afficher confirmation
   - eventuellement reset ou verrouiller le formulaire
5. si erreur:
   - afficher message global
   - mapper erreurs de champs si `422`

## 11. Mapping des erreurs full-stack

## 11.1 Erreurs de lecture homepage

Cas:

- `500`
- reseau indisponible

UX recommande:

- message non bloquant
- garder le layout

## 11.2 Erreurs meta formulaire

Cas:

- `500`
- `404` si endpoint absent pendant integration

UX recommande:

- bloquer le formulaire
- afficher message clair

## 11.3 Erreurs slots

Cas:

- date invalide
- pas de slots
- erreur serveur

UX recommande:

- distinction entre `aucun slot disponible` et `erreur technique`

## 11.4 Erreurs soumission

Cas:

- `422` validation
- `409` slot indisponible
- `500` erreur serveur

UX recommande:

- `422`: erreurs de champs visibles
- `409`: message de conflit metier + rechoix du slot
- `500`: message generique rassurant

## 12. Donnees de test recommandees

## 12.1 Jeux de donnees frontend

Prevoir au minimum:

- homepage FR
- homepage AR
- FAQ FR
- formulaire meta FR
- slots avec disponibilite
- slots vides

## 12.2 Jeux de donnees backend

Prevoir au minimum:

- 1 campagne active
- plusieurs FAQ publiees
- contenus homepage
- quelques communes pour Alger
- plusieurs slots de test

## 13. Tests d'integration full-stack

## 13.1 Tests manuels indispensables

1. homepage charge sans erreur
2. FAQ s'affiche
3. changement langue fonctionne
4. page rendez-vous charge
5. gate d'eligibilite bloque le formulaire au bon moment
6. changement date recharge les horaires
7. soumission valide cree une demande
8. erreur `422` remonte bien dans le formulaire
9. erreur `409` slot non disponible remonte correctement

## 13.1.1 Resultats observes pendant la validation de phase 4

- homepage verifiee en browser avec contenu Mongo persiste:
  - hero present
  - FAQ presente
  - campagne `SOLIDARITE-2026` visible
- gate d'eligibilite verifie en browser
- chargement des metadonnees verifie en browser apres ouverture du formulaire
- soumission reelle verifiee contre `POST /api/public/appointments` avec creation en base
- conflit `409 SLOT_UNAVAILABLE` verifie par appel HTTP reel
- validation `422` verifiee par appel HTTP reel

Note importante:

- dans la surface d'automatisation du navigateur integre, le champ natif `input[type=date]` n'emettait pas de maniere fiable l'evenement `change` React lors du pilotage automatique
- ce point a bloque la demonstration browser complete du passage `date -> slots -> submit`
- ce n'est pas une preuve d'un bug produit en soi, car:
  - le Task 4 est couvert par les tests frontend automatisés
  - le backend a ete verifie en HTTP reel pour le succes, le `409` et le `422`
  - la valeur DOM du champ date etait bien renseignee pendant l'automatisation, mais sans propagation d'evenement exploitable dans cette surface

## 13.2 Tests techniques minimums

### Cote `front`

- test du mapper payload formulaire
- test des hooks API si possible

### Cote `back`

- test creation appointment
- test validation `422`
- test slot indisponible `409`

## 14. Observabilite minimale

## 14.1 Cote `front`

- logs uniquement en dev
- pas de bruit inutile en prod

## 14.2 Cote `back`

- logs de requetes
- logs d'erreurs
- request id si possible

## 15. Risques d'integration

### Risque 1 - Contrat non respecte

Effet:

- blocage integration
- erreurs runtime

Mitigation:

- utiliser le document API comme reference stricte

### Risque 2 - Slots trop simplistes ou incoherents

Effet:

- UX confuse

Mitigation:

- definir une logique V1 simple mais stable

### Risque 3 - Fallbacks trop differents du back reel

Effet:

- mauvaises surprises au branchement

Mitigation:

- mocks strictement alignes contrat

## 16. Criteres d'acceptation de la phase 4

La phase 4 est complete si:

- `front` consomme `back` sans ambiguite
- la homepage est alimentee correctement
- le formulaire de rendez-vous est branche
- les horaires dependent de la date
- la soumission cree une demande persistante
- les erreurs principales sont gerees proprement
- le parcours public est testable de bout en bout

## 17. Dependances de la phase

Cette phase depend de:

- phase 2 `front`
- phase 3 `back`
- contrat API stable

## 18. Plan d'execution associe

Le plan d'execution detaille de cette phase est disponible ici:

- `docs/phases/phase-04-plan-execution-full-stack.md`

## 19. Suite logique

Apres cette phase, les suites les plus utiles sont:

1. execution reelle des repos
2. phase 5 detaillee pour contenus dynamiques, campagnes et bilingue avance
3. ou phase admin si le noyau public est deja stable
