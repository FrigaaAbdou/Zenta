# Phase 7 - Stabilisation, tests, observabilite et deploiement

## 1. Objet de la phase

Cette phase clot le cycle de conception en decrivant tout ce qui est necessaire pour faire passer le projet d'un etat "fonctionnel" a un etat "exploitable serieusement".

L'objectif est de structurer:

- la stabilisation technique
- les tests
- l'observabilite
- la securite minimale de production
- le deploiement des deux repos
- les checklists de mise en ligne

Cette phase n'ajoute pas une grosse feature produit. Elle consolide l'ensemble.

## 2. Resultat attendu

A la fin de la phase 7, l'equipe doit disposer:

- d'une strategie de tests claire
- d'une politique de logs et d'erreurs
- d'une strategie de deploiement pour `front` et `back`
- d'une checklist de validation avant mise en production
- d'une vision claire des risques restants

## 3. Perimetre

### Inclus

- tests frontend
- tests backend
- tests d'integration full-stack
- observabilite minimale
- configuration de deploiement
- hygiene de securite
- readiness check de production

### Hors perimetre

- SRE avance
- haute disponibilite complexe
- cluster multi-region
- SOC / SIEM entreprise

## 4. Pourquoi cette phase est indispensable

Un projet qui "marche en local" n'est pas un projet pret pour la production.

Sans cette phase:

- les regressions s'accumulent
- les erreurs sont difficiles a diagnostiquer
- le deploiement est fragile
- la confiance produit baisse

Cette phase sert donc a rendre le projet predictible et maintenable.

## 5. Strategie de tests globale

## 5.1 Objectif

Tester ce qui est critique sans surconstruire une usine a gaz.

La pyramide recommandee:

- tests unitaires sur logique isolee
- tests d'integration sur API et persistance
- tests UI cibles sur les parcours critiques
- quelques tests end-to-end sur le flux principal

## 5.2 Priorites de test

Les priorites doivent suivre le risque produit:

1. parcours de rendez-vous
2. validation formulaire
3. endpoints publics
4. gestion des statuts admin
5. contenu et bilingue

## 6. Tests frontend

## 6.1 Outils recommandes

- `Vitest`
- `React Testing Library`
- `jsdom`

## 6.2 Ce qui doit etre teste en priorite

### Homepage

- rendu des sections critiques
- fallback si certaines donnees manquent
- affichage correct du contenu FR/AR

### Formulaire de rendez-vous

- pre-eligibilite bloque / debloque le formulaire
- validation locale des champs
- affichage erreurs `422`
- comportement si slot indisponible
- affichage confirmation apres succes

### Admin

- protection de certaines vues
- rendu des tableaux
- changement de statut visible

## 6.3 Cas frontend minimaux recommandes

- `EligibilityGate` interdit la suite si cases non valides
- `AppointmentForm` refuse soumission si schema invalide
- `AppointmentForm` affiche erreur serveur de champ
- `LanguageSwitcher` change la locale active
- page `home` affiche les cartes attendues

## 7. Tests backend

## 7.1 Outils recommandes

- `Vitest` ou `Jest`
- `supertest`
- MongoDB de test ou base isolee

## 7.2 Ce qui doit etre teste en priorite

### Lecture publique

- `GET /api/public/home`
- `GET /api/public/faq`
- `GET /api/public/campaigns/active`
- `GET /api/public/appointment-form-meta`

### Rendez-vous

- `GET /api/public/appointment-slots`
- `POST /api/public/appointments`

### Admin

- login
- protection des routes
- listing des demandes
- changement de statut

## 7.3 Cas backend minimaux recommandes

- payload appointment valide retourne `201`
- payload appointment invalide retourne `422`
- slot indisponible retourne `409`
- route admin sans auth retourne refus
- creation campagne invalide retourne `422`

## 8. Tests d'integration full-stack

## 8.1 Objectif

Verifier que `front` et `back` se parlent reellement selon le contrat.

## 8.2 Parcours critiques a couvrir

### Parcours 1 - Homepage

- le front charge les contenus depuis le backend
- la FAQ s'affiche

### Parcours 2 - Rendez-vous reussi

- la page appointment charge les meta
- la date recharge les slots
- la soumission cree une demande
- la confirmation apparait

### Parcours 3 - Erreur metier

- un slot indisponible renvoie `409`
- le front affiche un message compréhensible

### Parcours 4 - Bilingue

- FR charge correctement
- AR charge correctement
- le layout passe en `RTL`

## 8.3 Outils possibles

- tests manuels formalises
- Playwright e2e si voulu plus tard

## 9. Observabilite minimale

## 9.1 Frontend

Le `front` doit au minimum:

- gerer proprement les erreurs utilisateur
- afficher des erreurs utiles sans exposer de details techniques sensibles
- pouvoir journaliser en dev certaines erreurs reseau

Recommandations:

- centraliser la gestion des erreurs API
- prevoir un composant de message global

## 9.2 Backend

Le `back` doit au minimum journaliser:

- methode HTTP
- route
- status code
- duree
- request id
- erreur serveur si exception

## 9.3 Categories de logs

- `info` pour requetes normales
- `warn` pour erreurs metier ou cas limites
- `error` pour erreurs serveur

## 9.4 Audit fonctionnel

Particulierement utile pour l'admin:

- connexion admin
- changement de statut
- edition campagne
- edition contenu

## 10. Securite minimale de production

## 10.1 Frontend

- ne jamais exposer de secrets build
- limiter les infos techniques dans les erreurs UI

## 10.2 Backend

- `helmet`
- `cors` restreint
- validation stricte
- sanitation des entrees
- sessions ou tokens admin securises
- mots de passe admin hashes

## 10.3 Donnees personnelles

Le projet manipule des donnees personnelles simples:

- nom
- prenom
- telephone
- email
- historique de don declare

Donc il faut:

- limiter les fuites de logs
- ne pas exposer les donnees inutilement
- restreindre les acces admin

## 11. Strategie de deploiement

## 11.1 Deploiement `front`

Le `front` peut etre deploye sur une plateforme statique ou frontend moderne.

Exemples possibles:

- Netlify
- Vercel
- autre hebergement statique

Pre-requis:

- variable `VITE_API_BASE_URL`
- build valide
- verification FR/AR

## 11.2 Deploiement `back`

Le `back` doit etre deploye sur un environnement Node compatible.

Exemples possibles:

- Render
- Railway
- VPS
- autre hebergement Node

Pre-requis:

- `MONGODB_URI`
- `CORS_ORIGIN`
- port configure
- logs accessibles

## 11.3 Base MongoDB

MongoDB peut etre:

- locale en dev
- managée en staging/prod

Pre-requis:

- credentials securises
- base staging distincte de prod

## 12. Environnements recommandes

## 12.1 Development

- front local
- back local
- mongo locale ou de dev

## 12.2 Staging

- proche de la prod
- jeux de donnees de test
- valide les integrations

## 12.3 Production

- variables propres
- contenus publies
- admin restreint

## 13. Checklist avant mise en production

## 13.1 Checklist fonctionnelle

- homepage complete
- FAQ correcte
- formulaire de rendez-vous complet
- creation de demande OK
- admin login OK
- changement statut OK

## 13.2 Checklist technique

- build `front` OK
- build `back` OK
- DB connectee
- CORS verifie
- logs disponibles
- variables env configurees

## 13.3 Checklist UX

- mobile OK
- FR OK
- AR OK
- `RTL` OK
- erreurs lisibles
- CTA visibles

## 13.4 Checklist securite

- routes admin protegees
- mots de passe hashes
- aucune variable sensible exposee
- erreurs serveur non bavardes cote public

## 14. Monitoring minimal recommande

Sans aller vers une stack lourde, il faut au moins savoir:

- si le `back` repond
- si la DB est joignable
- si les erreurs explosent

Approche simple:

- healthcheck backend
- logs accessibles
- monitoring plateforme

## 15. Endpoint healthcheck recommande

Endpoint conseille:

- `GET /api/health`

Reponse type:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "back",
    "database": "connected"
  },
  "message": "Service healthy."
}
```

## 16. Gestion des seeds et migrations de contenu

## 16.1 Seeds

Prevoir des seeds pour:

- campagnes
- FAQ
- contenus homepage
- admin user initial

## 16.2 Strategie

Recommendation:

- scripts seed idempotents
- environnement staging avec contenu de test

## 17. Documentation de runbook minimale

Le projet doit idealement disposer de:

- comment lancer `front`
- comment lancer `back`
- comment seed la base
- comment verifier le healthcheck
- comment deployer un changement de contenu

## 18. Risques principaux en fin de projet

### Risque 1 - "Ça marche chez moi"

Effet:

- echec en staging/prod

Mitigation:

- staging reel
- variables d'environnement explicites

### Risque 2 - Pas assez de tests sur le flux principal

Effet:

- regressions silencieuses

Mitigation:

- couvrir en priorite le parcours rendez-vous

### Risque 3 - Admin peu securise

Effet:

- fuite ou usage non autorise

Mitigation:

- auth minimale robuste
- audit des actions

## 19. Criteres d'acceptation de la phase 7

La phase 7 est complete si:

- une strategie de tests existe
- les parcours critiques sont identifies
- une strategie d'observabilite minimale existe
- une strategie de deploiement existe pour `front` et `back`
- une checklist de mise en production existe

## 20. Dependances de la phase

Cette phase depend de:

- l'ensemble des phases precedentes
- au moins un noyau applicatif fonctionnel

## 21. Suite logique

Apres cette phase, le cycle documentaire principal est complet.

Les suites naturelles sont:

1. commencer l'execution reelle des repos `front` et `back`
2. produire un plan d'execution pas-a-pas si tu veux deleguer a un autre developpeur
3. lancer directement la creation du repo `front`, puis `back`, selon les phases deja ecrites
