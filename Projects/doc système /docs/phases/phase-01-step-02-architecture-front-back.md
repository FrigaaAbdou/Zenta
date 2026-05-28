# Phase 1 - Etape 2 - Architecture detaillee de `front` et `back`

## 1. Objet

Cette etape transforme le cadrage general en architecture de travail concrete.

Le but est de definir:

- la structure cible du repo `front`
- la structure cible du repo `back`
- les responsabilites de chaque couche
- les conventions de nommage
- les interfaces entre frontend et backend
- les decisions de base qui evitent la dette technique des le demarrage

Ce document doit permettre a n'importe quel developpeur de creer les deux repos avec une organisation coherente sans inventer sa propre structure.

## 2. Principes directeurs

## 2.1 Separation stricte des responsabilites

Le repo `front` ne doit pas contenir:

- de logique de persistence
- de logique metier critique
- de validation de confiance serveur
- de couplage direct aux schemas MongoDB

Le repo `back` ne doit pas contenir:

- de logique de rendu UI
- de composition d'ecrans
- de contenu layout-specifique

## 2.2 Fidelite UI, rigueur metier

La fidelite au site source concerne d'abord:

- les ecrans
- la hierarchie visuelle
- le parcours utilisateur

La rigueur production concerne d'abord:

- les validations
- la structure modulaire
- les erreurs HTTP
- la testabilite
- la maintenabilite

## 2.3 Simplicite evolutive

Le projet ne doit pas etre sur-ingenierie au depart.

Mais il doit etre suffisamment structure pour:

- absorber l'ajout de l'admin
- absorber la croissance des contenus
- absorber plus de logique de creneaux
- absorber l'ajout de notifications

## 3. Architecture cible du repo `front`

## 3.1 Mission du repo

`front` porte l'experience utilisateur publique:

- accueil
- eligibilite
- FAQ
- pages institutionnelles utiles
- formulaire de prise de rendez-vous
- messages de retour utilisateur
- experience FR/AR

## 3.2 Stack recommandee

- `React`
- `Vite`
- `TypeScript`
- `React Router`
- `Tailwind CSS`
- `shadcn/ui`
- `blocks.so`
- `react-hook-form`
- `zod`
- client HTTP via `fetch` encapsule

TypeScript est recommande meme si la contrainte initiale n'etait pas explicite. Pour un projet traite comme quasi-production, la valeur en lisibilite et robustesse est nette.

## 3.3 Structure de dossiers recommandee

```text
front/
  public/
    images/
    icons/
  src/
    app/
      router/
      providers/
      layouts/
    pages/
      home/
      appointment/
      not-found/
    components/
      layout/
      marketing/
      appointment/
      ui/
    features/
      home/
        components/
        data/
      eligibility/
        components/
        utils/
      faq/
        components/
        data/
      appointment/
        components/
        schema/
        hooks/
        utils/
      campaigns/
        components/
        utils/
    lib/
      api/
      config/
      utils/
      constants/
      formatters/
    hooks/
    content/
      fr/
      ar/
    i18n/
    styles/
    main.tsx
  docs/
  package.json
```

## 3.4 Responsabilite par dossier

### `app/`

Contient la structure transversale:

- router global
- providers
- layouts
- contexte de langue si besoin

### `pages/`

Contient les points d'entree de route.

Regle:

- une page assemble
- une feature implemente

Une page ne doit pas contenir toute la logique.

### `components/layout/`

Composants globaux:

- `AppHeader`
- `AppFooter`
- `PageSection`
- `LanguageSwitcher`

### `components/marketing/`

Composants visuels reutilisables de la homepage:

- `HeroSection`
- `StatsSection`
- `EligibilityPreview`
- `ProcessTimeline`
- `FaqPreview`
- `CampaignBanner`

### `components/appointment/`

Composants transversaux du formulaire:

- `AppointmentForm`
- `FormSectionCard`
- `BloodGroupSelector`
- `DonationTypeSelector`
- `EligibilityGate`

### `components/ui/`

Composants `shadcn/ui` generes ou adaptes.

Regle:

- si un composant vient du design system transversal, il va ici
- si un composant est tres metier, il reste dans `features/.../components`

### `features/`

Le coeur fonctionnel du front.

Chaque feature contient sa logique, ses composants et ses helpers.

Exemple:

- `features/appointment/schema` pour le schema `zod`
- `features/appointment/hooks` pour les hooks de formulaire et soumission

### `lib/api/`

Couche d'acces backend:

- client HTTP
- gestion base URL
- helpers de parsing de reponse
- services d'appel d'API

Cette couche ne doit pas connaitre les composants UI.

### `content/`

Contenus statiques provisoires versionnes:

- textes homepage
- FAQ initiale
- labels de certaines sections

Cette structure doit faciliter plus tard la bascule vers contenu dynamique.

### `i18n/`

Configuration de langue:

- ressources
- mapping locale -> direction `ltr/rtl`
- helpers de selection de langue

## 3.5 Conventions techniques `front`

### Convention 1 - Pages minces

Une page doit ressembler a:

- layout
- sections
- orchestration de feature

Elle ne doit pas contenir toute la logique formulaire ou toute la logique de fetch.

### Convention 2 - Feature locale

La logique rendez-vous vit dans `features/appointment/`.

Exemples:

- schema de validation
- transformation payload
- configuration des groupes sanguins
- soumission au backend

### Convention 3 - Pas de hardcode eparpille

Les textes repetitifs doivent vivre dans:

- `content/`
- `i18n/`
- `constants/`

Pas directement dans 30 composants differents.

### Convention 4 - Un composant = un role clair

Mauvais exemple:

- un composant `HomePage.tsx` de 700 lignes

Bon exemple:

- `HeroSection`
- `StatsSection`
- `EligibilitySection`
- `FaqSection`

### Convention 5 - Validation front explicite

Utiliser `react-hook-form + zod` pour:

- valider les champs
- afficher les erreurs
- documenter implicitement le contrat du formulaire

## 4. Architecture cible du repo `back`

## 4.1 Mission du repo

`back` expose les API et la logique metier.

Il doit gerer:

- validation serveur
- persistence MongoDB
- logique de rendez-vous
- gestion de campagnes
- gestion de contenu lisible par le front
- prefiguration de l'admin

## 4.2 Stack recommandee

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

TypeScript est ici aussi fortement recommande pour la robustesse des contrats.

## 4.3 Structure de dossiers recommandee

```text
back/
  src/
    app/
      server.ts
      app.ts
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
      donors/
        donor.model.ts
        donor.schema.ts
        donor.service.ts
        donor.controller.ts
        donor.routes.ts
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
    shared/
      constants/
      types/
      utils/
    docs/
  package.json
```

## 4.4 Responsabilite par fichier dans un module

### `*.model.ts`

Schema Mongoose et definition de persistence.

### `*.schema.ts`

Schema de validation d'entree/sortie.

Exemples:

- validation `create appointment`
- validation `campaign query`

### `*.service.ts`

Logique metier pure ou quasi-pure:

- creation d'une demande
- verification de regles simples
- liaison donneur / rendez-vous

### `*.controller.ts`

Traduit HTTP vers service:

- lit `req`
- appelle validation
- appelle service
- renvoie `res`

Le controller ne doit pas contenir toute la logique metier.

### `*.routes.ts`

Declaration des endpoints Express.

## 4.5 Conventions techniques `back`

### Convention 1 - Flux HTTP standardise

Flux recommande:

`route -> controller -> validation -> service -> model -> response`

### Convention 2 - Reponses homogenes

Format de reponse recommande:

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

Format d'erreur recommande:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "string",
    "details": []
  }
}
```

### Convention 3 - Validation avant service

Le service ne doit pas traiter des donnees HTTP non validees.

### Convention 4 - Statuts de domaine explicites

Exemple pour `AppointmentRequest`:

- `pending`
- `confirmed`
- `rejected`
- `cancelled`
- `completed`

Ne pas utiliser des strings libres eparpilles.

### Convention 5 - Admin prepare mais non lance

Le module `admin/` peut etre vide ou documentaire au debut.

L'important est de reserver le domaine sans le melanger au public.

## 5. Contrat entre `front` et `back`

## 5.1 Mode de communication

- API REST JSON
- aucun rendu serveur HTML
- `front` consomme `back` via HTTP

## 5.2 Couches cote front

Le `front` doit parler au `back` via:

- un client HTTP central
- des services d'API versionnes ou bien nommes

Exemple:

- `appointmentApi.createRequest(payload)`
- `contentApi.getHome(locale)`
- `faqApi.list(locale)`

## 5.3 Couches cote back

Le `back` expose:

- routes publiques
- routes admin futures

Convention conseillee:

- `/api/public/...`
- `/api/admin/...`

## 5.4 Donnees de reference partagees

Il faut definir une source de verite pour:

- groupes sanguins
- types de don
- statuts de demande
- locales supportees

Option simple au depart:

- `back` possede la source metier
- `front` possede une copie typed/const tant que le contrat n'est pas encore dynamique

## 6. Mapping modules metier -> implementation

## 6.1 Domaine accueil

### Front

- page `home`
- composants hero/stats/eligibility/process/faq/footer

### Back

- contenu public statique ou dynamique
- FAQ publique
- campagne active

## 6.2 Domaine rendez-vous

### Front

- gate d'eligibilite
- formulaire multi-sections
- validation locale
- soumission

### Back

- validation serveur
- creation donneur si necessaire
- creation appointment request
- retour de confirmation

## 6.3 Domaine campagnes

### Front

- affichage du code ou message de campagne

### Back

- gestion des campagnes actives
- lecture du code campagne

## 6.4 Domaine admin futur

### Front

- hors perimetre initial

### Back

- namespace reserve
- modeles et statuts prepares

## 7. Choix de routage recommandes

## 7.1 Routing `front`

Routes minimales conseillees:

- `/`
- `/appointment`
- `/faq` si besoin plus tard
- `/eligibility` si besoin plus tard
- `*` pour not found

Recommendation:

- la page contact source doit devenir semantiquement `appointment`
- on peut garder une redirection depuis `/contact` si utile

## 7.2 Routing `back`

Routes publiques minimales conseillees:

- `GET /api/public/home`
- `GET /api/public/faq`
- `GET /api/public/campaigns/active`
- `GET /api/public/appointment-form-meta`
- `POST /api/public/appointments`

## 8. Gestion du bilingue

## 8.1 Cote front

Le `front` doit gerer:

- `fr`
- `ar`
- direction `ltr/rtl`

La langue doit impacter:

- textes
- alignements
- sens de certaines icones
- layout des groupes inline

## 8.2 Cote back

Le `back` doit etre capable de:

- retourner des contenus par locale
- enregistrer la locale source de la demande si utile

## 9. Securite minimale a integrer des le debut

### `front`

- sanitation basique des rendus dynamiques
- aucune confiance dans la validation front seule

### `back`

- `helmet`
- `cors` explicit
- validation stricte
- limitation future de taux a prevoir
- logs de requetes utiles

## 10. Decisions recommandees de setup initial

## 10.1 Repo `front`

Checklist de demarrage:

- init Vite React TypeScript
- installer Tailwind
- installer shadcn/ui
- ajouter React Router
- ajouter react-hook-form + zod
- poser les aliases de chemins
- poser le layout global

## 10.2 Repo `back`

Checklist de demarrage:

- init Node TypeScript
- installer Express
- installer Mongoose
- installer dotenv, cors, helmet
- poser config env
- poser connexion MongoDB
- poser middleware d'erreur global
- creer module `appointments`

## 11. Risques si cette architecture n'est pas respectee

### Risque 1 - front spaghetti

Symptomes:

- pages geantes
- logique formulaire dispersee
- textes hardcodes partout

### Risque 2 - back monolithique

Symptomes:

- `app.ts` ou `server.ts` enormes
- logique metier dans les controllers
- validation melangee a la persistence

### Risque 3 - contrat API flou

Symptomes:

- duplication de logique
- bugs de payload
- confusion sur les champs attendus

## 12. Criteres d'acceptation de l'etape 2

L'etape 2 est consideree complete si:

- la structure cible de `front` est claire
- la structure cible de `back` est claire
- la responsabilite de chaque couche est decrite
- les conventions majeures sont fixees
- le contrat de communication entre les deux repos est explicite
- un developpeur peut creer les deux repos sans improviser l'architecture

## 13. Suite logique

Les etapes les plus logiques apres cette architecture sont:

1. modele de donnees MongoDB detaille
2. contrat API detaille
3. specification de phase 2 pour construire `front`
