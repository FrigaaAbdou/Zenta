# back

Backend de l'application web CTS CHU Mustapha.

Ce repo expose :
- l'API publique consommee par `front`
- la persistance MongoDB
- la logique de rendez-vous
- le back-office admin phase 6 sous `/api/admin`

Repo frontend associe :

- [front](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front)

## Stack

- `Node.js`
- `Express`
- `TypeScript`
- `MongoDB`
- `Mongoose`
- `Zod`
- `Vitest`
- `Supertest`

## Fonction actuelle

Le backend couvre actuellement :

- bootstrap serveur Express
- validation d'environnement
- connexion MongoDB
- gestion centralisee des erreurs
- endpoints publics de contenu
- endpoints publics de rendez-vous
- persistance `donors` et `appointment_requests`
- auth admin JWT
- endpoints admin demandes / campagnes / contenus
- couverture de tests critique du perimetre public et admin

## Installation

```bash
cd back
npm install
```

## Variables d'environnement

Copier `back/.env.example` vers `back/.env` puis ajuster les valeurs si necessaire.

Variables requises :

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `CORS_ORIGIN`
- `ADMIN_JWT_SECRET`
- `ADMIN_JWT_EXPIRES_IN`

Exemple :

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cts
CORS_ORIGIN=http://127.0.0.1:5175,http://127.0.0.1:5176
ADMIN_JWT_SECRET=change-me
ADMIN_JWT_EXPIRES_IN=8h
```

## Commandes

Developpement :

```bash
npm run dev
```

Tests :

```bash
npm test
```

Build TypeScript :

```bash
npm run build
```

Seed du contenu public local :

```bash
npm run seed:public
```

Ce seed peuple :

- la homepage publique enrichie en `fr` et `ar`
- plusieurs FAQ bilingues
- plusieurs campagnes actives bilingues avec priorite
- une campagne principale exploitable par la homepage

Seed des comptes admin locaux :

```bash
npm run seed:admin
```

Comptes de developpement generes :

- `super_admin@cts.local` / `Admin123!`
- `manager@cts.local` / `Admin123!`
- `operator@cts.local` / `Admin123!`

Execution du build :

```bash
npm run start
```

## Run full-stack locally

Sequence recommandee :

1. Demarrer MongoDB localement sur `127.0.0.1:27017`
2. Configurer `back/.env`
3. Lancer dans `back/` :

```bash
npm install
npm run seed:public
npm run seed:admin
npm run dev
```

4. Configurer `front/.env.local` avec :

```env
VITE_API_BASE_URL=http://127.0.0.1:4000
VITE_DEFAULT_LOCALE=fr
```

5. Lancer dans `front/` :

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5176
```

6. Ouvrir :

```text
http://127.0.0.1:5176
```

Le parcours public et admin fonctionne alors entre les deux repos.

## Structure utile

```text
back/
  src/
    app/
    config/
    lib/
    middlewares/
    modules/
      admin-auth/
      admin-appointments/
      admin-campaigns/
      admin-content/
      appointments/
      campaigns/
      content/
      donors/
      faq/
    routes/
    scripts/
    shared/
    tests/
```

## Endpoints disponibles

### Health

- `GET /health`

### Public

- `GET /api/public/home-content?locale=fr|ar`
- `GET /api/public/faq?locale=fr|ar&category=...`
- `GET /api/public/campaigns/active?locale=fr|ar`
- `GET /api/public/campaigns/featured?locale=fr|ar`
- `GET /api/public/campaigns/:code?locale=fr|ar`
- `GET /api/public/appointment-form-meta?locale=fr|ar`
- `GET /api/public/appointment-slots?date=YYYY-MM-DD&campaignCode=...`
- `POST /api/public/appointments`

### Admin auth

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/logout`

### Admin demandes

- `GET /api/admin/appointments`
- `GET /api/admin/appointments/:id`
- `PATCH /api/admin/appointments/:id/status`

### Admin campagnes

- `GET /api/admin/campaigns`
- `POST /api/admin/campaigns`
- `PATCH /api/admin/campaigns/:id`

### Admin contenus

- `GET /api/admin/content`
- `PATCH /api/admin/content/:id`

## Format des erreurs

Le backend renvoie un format d'erreur JSON homogene :

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Appointment request payload is invalid.",
    "details": {
      "phone": "Invalid input: expected string, received undefined"
    }
  },
  "fieldErrors": {
    "phone": "Invalid input: expected string, received undefined"
  }
}
```

Codes deja utilises :

- `NOT_FOUND`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `SLOT_UNAVAILABLE`
- `INTERNAL_SERVER_ERROR`

## Modele admin V1

Roles :

- `super_admin`
- `manager`
- `operator`

Auth :

- bearer JWT simple
- restauration de session via `GET /api/admin/auth/me`
- logout stateless en V1

## Modeles metier actuels

Collections principales :

- `donors`
- `appointmentrequests`
- `sitecontents`
- `faqentries`
- `donationcampaigns`
- `adminusers`

## Limites actuelles

- pas de refresh token
- pas de revocation de session
- pas d'audit log admin
- pas de media manager
- pas de gestion avancee des creneaux
- permissions encore simples en V1

## Suite logique

La suite logique apres ce baseline est la phase 7 :

- deploiement public du backend
- observabilite
- securite de production
- QA de bout en bout
