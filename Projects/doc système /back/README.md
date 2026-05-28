# back

Backend public de l'application web CTS CHU Mustapha.

Ce repo expose l'API consommée par `front`, gère la validation des requêtes publiques, prépare la persistance MongoDB et pose une base modulaire pour les futures fonctionnalités admin.

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

- le bootstrap serveur Express
- la validation d'environnement
- la connexion MongoDB
- la gestion centralisée des erreurs
- les endpoints publics de contenu
- les endpoints publics de rendez-vous
- la persistance `donors` et `appointment_requests`
- la couverture de tests critique du périmètre public

## Installation

```bash
cd back
npm install
```

## Variables d'environnement

Copier `back/.env.example` vers `back/.env` puis ajuster les valeurs si nécessaire.

Variables requises :

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `CORS_ORIGIN`

Exemple :

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cts
CORS_ORIGIN=http://127.0.0.1:5175
```

## Commandes

Développement :

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

Exécution du build :

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
npm run dev -- --host 127.0.0.1 --port 5175
```

6. Ouvrir :

```text
http://127.0.0.1:5175
```

Le parcours public integre fonctionne alors entre les deux repos :

- homepage backend-driven
- FAQ backend-driven
- campagnes actives backend-driven
- metadata de rendez-vous
- chargement dynamique des creneaux
- creation de demande de rendez-vous

## Structure utile

```text
back/
  src/
    app/
    config/
    lib/
    middlewares/
    modules/
      appointments/
      campaigns/
      content/
      donors/
      faq/
    routes/
    shared/
    tests/
```

## Endpoints publics actuellement disponibles

### Health

- `GET /health`

Réponse :

```json
{
  "status": "ok"
}
```

### Contenu public

- `GET /api/public/home-content?locale=fr|ar`
- `GET /api/public/faq?locale=fr|ar&category=...`
- `GET /api/public/campaigns/active?locale=fr|ar`
- `GET /api/public/campaigns/featured?locale=fr|ar`
- `GET /api/public/campaigns/:code?locale=fr|ar`

### Métadonnées et créneaux de rendez-vous

- `GET /api/public/appointment-form-meta?locale=fr|ar`
- `GET /api/public/appointment-slots?date=YYYY-MM-DD&campaignCode=...`

### Création de demande de rendez-vous

- `POST /api/public/appointments`

Le payload attendu suit le contrat défini dans la phase 1 et inclut notamment :

- identité donneur
- coordonnées
- groupe sanguin
- date/heure de rendez-vous
- type de don
- checklist d'éligibilité
- locale

## Format des erreurs

Le backend renvoie un format d'erreur JSON homogène :

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

Codes déjà utilisés :

- `NOT_FOUND`
- `VALIDATION_ERROR`
- `SLOT_UNAVAILABLE`
- `INTERNAL_SERVER_ERROR`

## Modèles métier actuels

### `Donor`

Champs principaux :

- `firstName`
- `lastName`
- `birthDate`
- `gender`
- `phone`
- `email`
- `wilayaCode`
- `commune`
- `bloodGroup`

### `AppointmentRequest`

Champs principaux :

- `donorId`
- `campaignCode`
- `appointmentDate`
- `appointmentTime`
- `donationType`
- `isExistingDonor`
- `lastDonationDate`
- `eligibilityChecklist`
- `remarks`
- `locale`
- `status`

## Limites actuelles de la V1 backend

- pas d'authentification admin
- pas de CRUD admin
- pas d'envoi email ou SMS
- calcul des créneaux encore statique
- contenu public avec fallback local si la base n'est pas alimentée
- seed public disponible, mais pas encore de seed admin ou de seed de jeux de données avancés

## Validation locale recommandée

Avant de considérer une modification comme stable :

```bash
npm test
npm run build
```

## Prochaine étape logique

Apres les phases 4 et 5 executees :

- lancer la phase 6 admin
- remplacer le calcul statique des creneaux par une logique reelle de disponibilites
- deployer une API publique si le frontend en ligne doit utiliser le vrai backend
