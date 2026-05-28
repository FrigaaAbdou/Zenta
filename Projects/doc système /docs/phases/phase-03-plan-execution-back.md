# Phase 3 Back Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `back` repository that serves the public API consumed by `front`, persists donors and appointment requests in MongoDB, and establishes a clean modular base for future admin features.

**Architecture:** A modular `Express + TypeScript` backend split into domain modules (`content`, `faq`, `campaigns`, `donors`, `appointments`) with thin route/controller layers, service-led business logic, shared infrastructure for configuration and errors, and MongoDB persistence through Mongoose.

**Tech Stack:** `Node.js`, `Express`, `TypeScript`, `MongoDB`, `Mongoose`, `Zod`, `dotenv`, `cors`, `helmet`, `morgan`, `Vitest`, `Supertest`

## Task 1 - Initialize the `back` repository

- [ ] Create the repository root and initialize `package.json`.
- [ ] Install runtime dependencies:
  - `express`
  - `mongoose`
  - `zod`
  - `dotenv`
  - `cors`
  - `helmet`
  - `morgan`
- [ ] Install development dependencies:
  - `typescript`
  - `tsx`
  - `@types/node`
  - `@types/express`
  - `@types/cors`
  - `@types/morgan`
  - `vitest`
  - `supertest`
  - `@types/supertest`
- [ ] Add npm scripts in `back/package.json`:
  - `"dev": "tsx watch src/app/server.ts"`
  - `"build": "tsc -p tsconfig.json"`
  - `"start": "node dist/app/server.js"`
  - `"test": "vitest run"`
- [ ] Create `back/tsconfig.json` with:
  - `target: ES2022`
  - `module: NodeNext`
  - `moduleResolution: NodeNext`
  - `rootDir: src`
  - `outDir: dist`
  - `strict: true`
  - `esModuleInterop: true`
- [ ] Create the initial folder layout:
  - `back/src/app`
  - `back/src/config`
  - `back/src/lib`
  - `back/src/middlewares`
  - `back/src/modules`
  - `back/src/routes`
  - `back/src/tests`
  - `back/src/types`
- [ ] Create `back/src/app/app.ts` with a `createApp()` function returning an `Express` app.
- [ ] Create `back/src/app/server.ts` as the runtime bootstrap file.
- [ ] Create `back/src/routes/index.ts` with a basic router.
- [ ] Create `back/src/types/express.d.ts` only if request typing extensions become necessary later.

**Files**

- `back/package.json`
- `back/tsconfig.json`
- `back/src/app/app.ts`
- `back/src/app/server.ts`
- `back/src/routes/index.ts`
- `back/src/types/express.d.ts`

**Commands**

```bash
mkdir back
cd back
npm init -y
npm install express mongoose zod dotenv cors helmet morgan
npm install -D typescript tsx @types/node @types/express @types/cors @types/morgan vitest supertest @types/supertest
```

**Implementation notes**

- Keep the first bootstrap minimal.
- Do not add admin modules yet.
- The app must already expose `GET /health` returning `{ "status": "ok" }`.

**Checkpoint**

- Running `npm run dev` starts the server without TypeScript errors.
- Hitting `GET /health` returns `200`.

**Commit**

```bash
git add back
git commit -m "Initialize back repository"
```

## Task 2 - Configure environment, MongoDB, and base middlewares

- [ ] Create `back/.env.example`.
- [ ] Add required environment variables:
  - `PORT=4000`
  - `NODE_ENV=development`
  - `MONGODB_URI=mongodb://localhost:27017/cts`
  - `CORS_ORIGIN=http://127.0.0.1:5175`
- [ ] Create `back/src/config/env.ts`.
- [ ] Validate environment variables with `zod`.
- [ ] Create `back/src/config/db.ts` to centralize `mongoose.connect(...)`.
- [ ] Update `back/src/app/app.ts` to register:
  - `helmet()`
  - `cors({ origin: env.CORS_ORIGIN })`
  - `morgan("dev")`
  - `express.json()`
- [ ] Update `back/src/app/server.ts` so the app connects to MongoDB before listening.

**Files**

- `back/.env.example`
- `back/src/config/env.ts`
- `back/src/config/db.ts`
- `back/src/app/app.ts`
- `back/src/app/server.ts`

**Implementation notes**

- Fail fast if required env vars are missing.
- Keep the DB helper isolated from the HTTP bootstrap.
- Do not silently swallow MongoDB connection errors.

**Checkpoint**

- `npm run dev` starts only when env vars are valid.
- MongoDB connection success and failure are both clearly logged.

**Commit**

```bash
git add back
git commit -m "Configure env and MongoDB connection"
```

## Task 3 - Add shared error, response, and route infrastructure

- [ ] Create a shared `AppError` abstraction.
- [ ] Create a shared error response helper.
- [ ] Add a `notFound` middleware.
- [ ] Add a centralized error middleware.
- [ ] Ensure all unknown routes return a JSON error instead of HTML.
- [ ] Add a small shared constants file for supported locales.
- [ ] Register these middlewares in the correct order inside `createApp()`.

**Files**

- `back/src/lib/errors/app-error.ts`
- `back/src/lib/http/send-error.ts`
- `back/src/middlewares/not-found.middleware.ts`
- `back/src/middlewares/error.middleware.ts`
- `back/src/shared/constants/locales.ts`
- `back/src/app/app.ts`

**Implementation notes**

- Target a response shape such as:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Payload is invalid",
    "details": {}
  }
}
```

- Keep transport concerns in middleware, not in services.

**Checkpoint**

- Unknown routes return `404` JSON.
- Thrown domain errors become consistent JSON responses.

**Commit**

```bash
git add back
git commit -m "Add shared error handling infrastructure"
```

## Task 4 - Add public content, FAQ, and campaign models and endpoints

- [ ] Create the `content` module.
- [ ] Create the `faq` module.
- [ ] Create the `campaigns` module.
- [ ] Add Mongoose models for:
  - `SiteContent`
  - `FAQEntry`
  - `DonationCampaign`
- [ ] Support localized content at least for `fr` and `ar`.
- [ ] Add services to fetch:
  - homepage content
  - published FAQ entries
  - active campaigns
- [ ] Add controllers and routes under `/api/public`.
- [ ] Wire routes into `back/src/routes/index.ts`.

**Files**

- `back/src/modules/content/content.model.ts`
- `back/src/modules/content/content.service.ts`
- `back/src/modules/content/content.controller.ts`
- `back/src/modules/content/content.routes.ts`
- `back/src/modules/faq/faq.model.ts`
- `back/src/modules/faq/faq.service.ts`
- `back/src/modules/faq/faq.controller.ts`
- `back/src/modules/faq/faq.routes.ts`
- `back/src/modules/campaigns/campaign.model.ts`
- `back/src/modules/campaigns/campaign.service.ts`
- `back/src/modules/campaigns/campaign.controller.ts`
- `back/src/modules/campaigns/campaign.routes.ts`
- `back/src/routes/index.ts`

**Routes to expose**

- `GET /api/public/home-content`
- `GET /api/public/faq`
- `GET /api/public/campaigns/active`

**Implementation notes**

- `home-content` should be resilient to incomplete data and support frontend fallbacks.
- `faq` should return an empty array rather than an error if nothing is published.
- `campaigns/active` should filter on publication and activity windows when provided.

**Checkpoint**

- All three public read endpoints respond with valid JSON.
- The `front` homepage can later consume these endpoints without extra contract changes.

**Commit**

```bash
git add back
git commit -m "Add public content, FAQ, and campaigns modules"
```

## Task 5 - Add donor and appointment persistence

- [ ] Create the `donors` module persistence layer.
- [ ] Create the `appointments` module persistence layer.
- [ ] Add a `Donor` model with core contact and profile data.
- [ ] Add an `AppointmentRequest` model with scheduling and donation request data.
- [ ] Add a donor service that can find an existing donor by phone number.
- [ ] Add an appointment service that persists appointment requests.
- [ ] Add indexes for common lookup fields.

**Files**

- `back/src/modules/donors/donor.model.ts`
- `back/src/modules/donors/donor.service.ts`
- `back/src/modules/appointments/appointment.model.ts`
- `back/src/modules/appointments/appointment.service.ts`
- `back/src/modules/appointments/appointment.mapper.ts`

**Suggested donor fields**

- `firstName`
- `lastName`
- `birthDate`
- `gender`
- `phone`
- `email`
- `wilayaCode`
- `commune`
- `bloodGroup`

**Suggested appointment fields**

- `donorId`
- `campaignCode`
- `appointmentDate`
- `appointmentTime`
- `donationType`
- `remarks`
- `isExistingDonor`
- `lastDonationDate`
- `locale`
- `status` with default `pending`
- `eligibilityChecklist`

**Implementation notes**

- Keep `donor` and `appointment_request` separated.
- Use phone as the first practical deduplication key for V1.
- The donor service should update mutable donor fields if the same donor books again.

**Checkpoint**

- Creating an appointment later can reuse or create a donor deterministically.
- MongoDB collections contain cleanly separated donor and appointment records.

**Commit**

```bash
git add back
git commit -m "Add donor and appointment persistence models"
```

## Task 6 - Add validation and public appointment meta endpoints

- [ ] Create appointment input schemas with `zod`.
- [ ] Add a metadata endpoint used by the `front` form.
- [ ] Add a slots endpoint used by the `front` appointment flow.
- [ ] Add route registration for all appointment public endpoints.
- [ ] Keep response payloads aligned with the phase 1 API contract document.

**Files**

- `back/src/modules/appointments/appointment.schema.ts`
- `back/src/modules/appointments/appointment.controller.ts`
- `back/src/modules/appointments/appointment.routes.ts`
- `back/src/modules/appointments/appointment.constants.ts`
- `back/src/modules/appointments/appointment-meta.service.ts`
- `back/src/routes/index.ts`

**Routes to expose**

- `GET /api/public/appointment-form-meta`
- `GET /api/public/appointment-slots`
- `POST /api/public/appointments`

**Implementation notes**

- `appointment-form-meta` can serve static or semi-static choices in V1.
- `appointment-slots` can initially compute availability from a fixed slot list:
  - `08:00`
  - `09:00`
  - `10:00`
  - `11:00`
  - `13:00`
  - `14:00`
  - `15:00`
- Add schema refinement for `lastDonationDate` when `isExistingDonor` is `true`.

**Checkpoint**

- The `front` form can fetch metadata and slots from stable endpoints.
- Invalid query params or invalid bodies return `422` with field-level detail.

**Commit**

```bash
git add back
git commit -m "Add appointment validation and public meta endpoints"
```

## Task 7 - Implement the public appointment creation workflow

- [ ] Accept a public appointment request payload.
- [ ] Validate the payload with `zod`.
- [ ] Enforce that the eligibility checklist is fully positive before persistence.
- [ ] Resolve or create the donor.
- [ ] Create the appointment request.
- [ ] Return a frontend-friendly success payload.
- [ ] Reject obvious duplicate or conflicting pending requests.

**Files**

- `back/src/modules/appointments/appointment.controller.ts`
- `back/src/modules/appointments/appointment.service.ts`
- `back/src/modules/donors/donor.service.ts`
- `back/src/modules/appointments/appointment.schema.ts`

**Expected success response**

```json
{
  "data": {
    "id": "appt_123",
    "status": "pending",
    "appointmentDate": "2026-06-10",
    "appointmentTime": "09:00",
    "createdAt": "2026-05-23T18:00:00.000Z"
  }
}
```

**Conflict rule for V1**

- If the same donor phone number already has a `pending` request for the same date and time, return `409`.
- Error code recommendation: `SLOT_UNAVAILABLE` or `DUPLICATE_REQUEST`.

**Implementation notes**

- Keep email sending and SMS out of scope for this phase.
- Keep the business logic in services, not in controllers.

**Checkpoint**

- `POST /api/public/appointments` creates data correctly in MongoDB.
- Known invalid cases produce predictable JSON errors.

**Manual test example**

```bash
curl -X POST http://127.0.0.1:4000/api/public/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Amine",
    "lastName": "B.",
    "birthDate": "1995-06-10",
    "gender": "male",
    "phone": "0550123456",
    "email": "amine@example.com",
    "wilayaCode": "16",
    "commune": "Alger Centre",
    "bloodGroup": "O+",
    "campaignCode": "MAIN",
    "appointmentDate": "2026-06-10",
    "appointmentTime": "09:00",
    "donationType": "whole_blood",
    "isExistingDonor": false,
    "remarks": "",
    "locale": "fr",
    "eligibilityChecklist": {
      "feelsWell": true,
      "hasValidAge": true,
      "meetsWeightRequirement": true
    }
  }'
```

**Commit**

```bash
git add back
git commit -m "Implement public appointment creation workflow"
```

## Task 8 - Add backend test coverage for critical public endpoints

- [ ] Configure Vitest for backend execution.
- [ ] Add a health endpoint test.
- [ ] Add tests for home content response shape.
- [ ] Add validation tests for appointment creation.
- [ ] Add at least one success-path test for appointment creation.
- [ ] Add one conflict-path test for duplicate pending appointments.

**Files**

- `back/vitest.config.ts`
- `back/src/tests/health.test.ts`
- `back/src/tests/home-content.test.ts`
- `back/src/tests/appointments.validation.test.ts`
- `back/src/tests/appointments.success.test.ts`

**Implementation notes**

- Prefer `supertest` against `createApp()`.
- If DB-backed tests are added now, isolate test database configuration clearly.
- If full DB integration is too heavy for the first pass, at minimum cover validation and route contracts.

**Checkpoint**

- `npm run test` passes.
- The most critical public API behavior is covered before frontend integration deepens.

**Commit**

```bash
git add back
git commit -m "Add critical backend endpoint tests"
```

## Task 9 - Final validation and backend README

- [ ] Write a backend-specific README.
- [ ] Document local startup steps.
- [ ] Document required environment variables.
- [ ] Document the currently available public endpoints.
- [ ] Verify the project builds.
- [ ] Verify the test suite passes.

**Files**

- `back/README.md`

**README must cover**

- Project purpose
- Stack
- Installation
- `.env` setup
- Run commands
- Test command
- Build command
- Current public endpoints
- Known V1 limitations

**Final verification**

```bash
npm run test
npm run build
```

**Completion criteria**

- The `back` repository is runnable locally.
- The public API needed by the existing `front` phase is available.
- MongoDB persistence works for donors and appointment requests.
- The backend structure is ready for later admin extension without refactor pressure.

**Commit**

```bash
git add back
git commit -m "Finalize phase 3 backend baseline"
```
