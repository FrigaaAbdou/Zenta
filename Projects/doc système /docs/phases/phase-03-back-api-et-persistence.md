# Phase 3 - Back API et persistence

## 1. Objet de la phase

Cette phase transforme le cadrage backend en plan d'implementation concret pour le repo `back`.

L'objectif est de construire:

- l'API publique consommee par `front`
- la connexion MongoDB
- les schemas et models Mongoose
- la validation des requetes
- la logique de creation de demandes de rendez-vous
- la base des contenus publics et campagnes

Cette phase ne couvre pas encore l'interface admin, mais elle doit la preparer proprement.

## 2. Resultat attendu

A la fin de la phase 3, le repo `back` doit permettre:

- de servir les donnees publiques de la homepage
- de servir la FAQ
- de servir les meta du formulaire
- de fournir des creneaux de rendez-vous
- de enregistrer une demande de rendez-vous
- de persister les donnees dans MongoDB
- de renvoyer des erreurs homogenes et exploitables

## 3. Perimetre

### Inclus

- setup du repo `back`
- configuration environnement
- connexion MongoDB
- architecture Express modulaire
- modules `appointments`, `donors`, `campaigns`, `content`, `faq`, `eligibility`
- validation serveur
- gestion d'erreurs
- endpoints publics V1

### Hors perimetre

- auth admin
- dashboard admin
- CRUD admin complet
- notifications email/SMS
- analytics avancees
- moteur complexe de disponibilite

## 4. Stack backend retenue

- `Node.js`
- `Express`
- `TypeScript`
- `MongoDB`
- `Mongoose`
- `Zod` ou `Joi`
- `dotenv`
- `cors`
- `helmet`
- `morgan` ou logger equivalent

## 5. Livrables de la phase

1. repo `back` initialise
2. structure modulaire en place
3. connexion MongoDB fonctionnelle
4. models Mongoose principaux
5. validation des payloads
6. endpoints publics V1
7. format d'erreur unifie
8. documentation backend de prise en main

## 6. Structure de dossiers cible

```text
back/
  src/
    app/
      app.ts
      server.ts
    config/
      env.ts
      db.ts
    modules/
      appointments/
        appointment.model.ts
        appointment.schema.ts
        appointment.service.ts
        appointment.controller.ts
        appointment.routes.ts
        appointment.mapper.ts
        appointment.types.ts
      donors/
        donor.model.ts
        donor.schema.ts
        donor.service.ts
        donor.controller.ts
        donor.routes.ts
        donor.types.ts
      campaigns/
        campaign.model.ts
        campaign.schema.ts
        campaign.service.ts
        campaign.controller.ts
        campaign.routes.ts
      content/
        content.model.ts
        content.schema.ts
        content.service.ts
        content.controller.ts
        content.routes.ts
      faq/
        faq.model.ts
        faq.schema.ts
        faq.service.ts
        faq.controller.ts
        faq.routes.ts
      eligibility/
        eligibility.rules.ts
        eligibility.service.ts
      admin/
        README.md
    middlewares/
      error.middleware.ts
      not-found.middleware.ts
      request-id.middleware.ts
    lib/
      http/
      logger/
      errors/
    shared/
      constants/
      types/
      utils/
    docs/
  package.json
```

## 7. Architecture backend cible

## 7.1 Couche `app`

### `app.ts`

Responsabilite:

- creation de l'instance Express
- branchement middlewares
- montage des routes
- branchement gestionnaires d'erreur

### `server.ts`

Responsabilite:

- boot serveur HTTP
- connexion MongoDB
- gestion du port

## 7.2 Couche `config`

### `env.ts`

Responsabilite:

- centraliser la lecture des variables d'environnement
- valider la presence des variables critiques

Variables probables:

- `PORT`
- `MONGODB_URI`
- `NODE_ENV`
- `CORS_ORIGIN`

### `db.ts`

Responsabilite:

- encapsuler la connexion MongoDB
- centraliser les options Mongoose

## 7.3 Couche `modules`

Chaque module doit suivre le meme contrat mental:

- `model` pour persistence
- `schema` pour validation
- `service` pour logique metier
- `controller` pour transport HTTP
- `routes` pour declaration Express

## 7.4 Couche `middlewares`

Responsabilite:

- request id
- erreurs centralisees
- 404 route non trouvee

## 7.5 Couche `lib`

Responsabilite:

- helpers transversaux
- abstractions d'erreurs
- normalisation de reponses si necessaire
- logger

## 8. Modules a implementer

## 8.1 Module `appointments`

Role:

- creer et lire les demandes de rendez-vous
- gerer les slots
- appliquer les validations metier de base

Fonctions attendues:

- creation de demande publique
- verification de disponibilite du creneau
- listage futur cote admin

Endpoints V1:

- `GET /api/public/appointment-slots`
- `POST /api/public/appointments`

## 8.2 Module `donors`

Role:

- gerer l'identite donneur
- retrouver ou creer un donneur a partir de la soumission

Fonctions attendues:

- rechercher par telephone
- creation si absent
- mise a jour douce si necessaire

Pas d'endpoint public direct requis en V1.

## 8.3 Module `campaigns`

Role:

- servir la campagne active
- valider ou resoudre un code campagne

Endpoint V1:

- `GET /api/public/campaigns/active`

## 8.4 Module `content`

Role:

- servir les contenus de homepage
- preparer le futur contenu administrable

Endpoint V1:

- `GET /api/public/home`

## 8.5 Module `faq`

Role:

- servir la FAQ publique

Endpoint V1:

- `GET /api/public/faq`

## 8.6 Module `eligibility`

Role:

- centraliser les regles de pre-eligibilite
- fournir les templates de checklist si utile

Pas forcement d'endpoint dedie en V1, mais logique utilisee par:

- `appointment-form-meta`
- `POST appointments`

## 9. Endpoints V1 a implementer

## 9.1 `GET /api/public/home`

Source possible:

- `site_content`
- fallback contenu code si V1 hybride

Comportement:

- resoudre la locale
- renvoyer le payload homepage contractuel

## 9.2 `GET /api/public/faq`

Comportement:

- filtrer `isPublished = true`
- ordonner par `order`
- resoudre la locale

## 9.3 `GET /api/public/campaigns/active`

Comportement:

- retourner les campagnes actives visibles
- ou campagne principale si la logique produit l'exige

## 9.4 `GET /api/public/appointment-form-meta`

Comportement:

- renvoyer:
  - genders
  - bloodGroups
  - donationTypes
  - wilayas
  - communes
  - template checklist eligibility

Source possible:

- constantes backend versionnees

## 9.5 `GET /api/public/appointment-slots`

Comportement V1 recommande:

- accepter `date`
- si date absente -> `400`
- retourner une liste simple de slots
- marquer les slots disponibles / indisponibles

Au debut, cette logique peut etre simple:

- slots semi-statiques
- exclusions selon certaines regles

## 9.6 `POST /api/public/appointments`

Comportement:

1. valider payload
2. verifier pre-eligibilite declaree
3. resoudre le donneur
4. resoudre la campagne si code fourni
5. verifier slot
6. creer la demande
7. renvoyer `201`

## 10. Models Mongoose a creer

## 10.1 `donor.model.ts`

Champs attendus:

- identite
- contact
- localisation
- groupe sanguin
- statut ancien donneur
- date dernier don
- timestamps

## 10.2 `appointment.model.ts`

Champs attendus:

- lien donneur
- campagne
- date
- heure
- statut
- snapshot metier
- checklist eligibilite
- remarques
- timestamps

## 10.3 `campaign.model.ts`

Champs attendus:

- code
- titre par locale
- description par locale
- statut
- dates
- CTA

## 10.4 `faq.model.ts`

Champs attendus:

- slug
- question localisee
- answer localisee
- category
- order
- isPublished

## 10.5 `content.model.ts`

Champs attendus:

- key
- section
- locale
- value
- isPublished

## 11. Validation backend

## 11.1 Strategie

Toutes les requetes entrantes critiques doivent passer par validation schema avant service.

## 11.2 Schemas a creer en priorite

- `createAppointmentRequestSchema`
- `getAppointmentSlotsQuerySchema`
- `getFaqQuerySchema`
- `getHomeQuerySchema`

## 11.3 Cas conditionnels a couvrir

- `lastDonationDate` requise si `isExistingDonor = true`
- `appointmentTime` requis si `appointmentDate` fournie
- `commune` requise si `wilayaCode` fournie

## 12. Logique metier critique

## 12.1 Resolution du donneur

Regle recommande:

- chercher `donor` par `phone`
- si absent -> creer
- si present -> mettre a jour certains champs modifiables si besoin

## 12.2 Validation slot

V1 simple:

- controler que le slot existe dans la liste du jour
- controler qu'il est `isAvailable = true`

Plus tard:

- quotas
- surcharge par creneau
- fermeture dates speciales

## 12.3 Resolution campagne

Si `campaignCode` fourni:

- chercher campagne par code
- si inexistante:
  - soit ignorer avec `null`
  - soit renvoyer erreur metier

Recommendation V1:

- comportement tolerant si le code n'est pas essentiel

## 13. Gestion d'erreurs

## 13.1 Types d'erreurs a standardiser

- `VALIDATION_ERROR`
- `SLOT_UNAVAILABLE`
- `RESOURCE_NOT_FOUND`
- `INTERNAL_SERVER_ERROR`

## 13.2 Middleware d'erreur global

Le middleware doit:

- centraliser les codes
- transformer les exceptions internes en reponse API stable
- logguer les erreurs serveur

## 13.3 Pas de documents Mongoose bruts en sortie

Toujours passer par:

- mapper
- serializer
- DTO de reponse implicite

## 14. CORS, securite et hygiene

## 14.1 CORS

Autoriser uniquement l'origine du `front` en environnement cible.

## 14.2 Helmet

Activer `helmet` des le debut.

## 14.3 Logs

Au minimum:

- requete entrante
- methode
- path
- status
- duree

## 14.4 Sanitization

Le backend ne doit jamais faire confiance:

- au `campaignCode`
- aux champs texte
- a la checklist d'eligibilite sans structure valide

## 15. Donnees de reference

Le backend doit etre source de verite pour:

- groupes sanguins
- types de don
- statuts
- locales
- wilayas
- communes

Recommendation V1:

- stocker ces references dans `shared/constants`
- exposer ce qui doit etre consomme par `front` via `appointment-form-meta`

## 16. Ordre d'implementation recommande

## Bloc A - Setup

1. initialiser repo Node TypeScript
2. installer Express
3. installer Mongoose
4. installer dotenv, cors, helmet
5. poser `env.ts`
6. poser `db.ts`

## Bloc B - Squelette API

1. creer `app.ts`
2. creer `server.ts`
3. brancher middlewares de base
4. brancher middleware erreur
5. brancher namespace `/api/public`

## Bloc C - Models et schemas

1. `donor.model.ts`
2. `appointment.model.ts`
3. `campaign.model.ts`
4. `faq.model.ts`
5. `content.model.ts`
6. schemas de validation

## Bloc D - Lecture publique

1. `GET /home`
2. `GET /faq`
3. `GET /campaigns/active`
4. `GET /appointment-form-meta`

## Bloc E - Rendez-vous

1. `GET /appointment-slots`
2. `POST /appointments`
3. resolution donneur
4. verification slot
5. persistance demande

## 17. Tests cibles minimums

## 17.1 Tests unitaires service

- creation d'un donneur si absent
- reutilisation d'un donneur existant
- refus d'un slot indisponible

## 17.2 Tests d'integration API

- `GET /home` retourne `200`
- `GET /faq` retourne `200`
- `GET /appointment-form-meta` retourne `200`
- `POST /appointments` valide retourne `201`
- `POST /appointments` invalide retourne `422`

## 18. Risques backend principaux

### Risque 1 - Controllers trop lourds

Effet:

- code fragile
- logique metier dispersee

Mitigation:

- deplacer la logique dans `service.ts`

### Risque 2 - Contrat API non respecte

Effet:

- blocage integration frontend

Mitigation:

- developper strictement contre le document contrat API

### Risque 3 - Modele trop couplé au formulaire actuel

Effet:

- evolution future difficile

Mitigation:

- separer `donor` et `appointment_request`

## 19. Criteres d'acceptation de la phase 3

La phase 3 est complete si:

- le repo `back` est initialise proprement
- MongoDB est branche
- les models principaux existent
- les endpoints publics V1 existent
- les erreurs sont homogenes
- le `front` peut integrer l'API sans ambiguite majeure

## 20. Dependances de la phase

Cette phase depend de:

- phase 1 complete
- contrat API detaille
- modele de donnees valide

Elle peut avancer en parallele du `front` a partir du moment ou le contrat API est respecte.

## 21. Suite logique

Apres cette phase, les suites possibles sont:

1. execution reelle du repo `front`
2. execution reelle du repo `back`
3. redaction de la phase 4 detaillee de branchement et orchestration full-stack

## 22. Plan d'execution associe

Le plan d'execution detaille de cette phase est disponible ici:

- `docs/phases/phase-03-plan-execution-back.md`
