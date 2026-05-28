# Phase 4 Full-Stack Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `front` and `back` into one end-to-end public experience so the homepage and appointment flow work against the real backend instead of local placeholders.

**Architecture:** The integration keeps `front` and `back` as two independent repos with a strict API boundary. `front` consumes only documented public endpoints through the shared API client layer, while `back` remains the single source of truth for content, metadata, slot availability, and appointment creation. The phase is considered successful only when the full appointment journey works locally from browser interaction through backend persistence and error handling.

**Tech Stack:** React, Vite, TypeScript, React Hook Form, Zod, Express, MongoDB, Mongoose, Vitest, Supertest

---

## Task 1 - Align local environment and runtime assumptions

**Files:**
- Modify: `front/.env.local`
- Modify: `back/.env`
- Verify: `front/package.json`
- Verify: `back/package.json`
- Verify: `back/.env.example`

- [ ] Create or update `front/.env.local` with the backend base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:4000
VITE_DEFAULT_LOCALE=fr
```

- [ ] Create or update `back/.env` with a valid local MongoDB target:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cts
CORS_ORIGIN=http://127.0.0.1:5175
```

- [ ] Confirm the dev commands are still the canonical ones:
  - `front`: `npm run dev -- --host 127.0.0.1 --port 5175`
  - `back`: `npm run dev`

- [ ] Verify that the chosen `front` and `back` ports do not conflict with anything else already running locally.

- [ ] Start `back` first and confirm it listens on `http://127.0.0.1:4000`.

- [ ] Start `front` second and confirm it still opens on `http://127.0.0.1:5175`.

**Checkpoint**

- both repos boot locally
- `front` points to the real `back`
- MongoDB connection succeeds before moving on

**Commit**

```bash
git add front/.env.local back/.env
git commit -m "chore: align local full-stack environment"
```

## Task 2 - Replace homepage fallback usage with real backend reads

**Files:**
- Modify: `front/src/pages/home/HomePage.tsx`
- Modify: `front/src/lib/api/homeApi.ts`
- Create or Modify: `front/src/features/home/types.ts`
- Test: `front/src/pages/home/HomePage.test.tsx`

- [ ] Review how `HomePage` currently loads content and identify any hardcoded fallback blocks still acting as the primary source.

- [ ] Define the response type expected from `GET /api/public/home-content`.

- [ ] Update `homeApi.ts` so its return type matches the backend response contract instead of `unknown`.

- [ ] Update `HomePage.tsx` to:
  - fetch real homepage content from `back`
  - preserve a graceful fallback only for backend outage scenarios
  - keep the page renderable while FAQ or campaigns fail independently

- [ ] Ensure the homepage load strategy is:
  - `home-content` is primary
  - `faq` loads independently
  - `campaigns/active` is additive, not blocking

- [ ] Update tests so they assert:
  - homepage can render with successful backend payloads
  - homepage still renders safely when a secondary read fails

**Checkpoint**

- homepage uses real backend data as the default source
- FAQ and campaigns no longer depend on hardcoded page-local content
- no regression in page rendering

**Commit**

```bash
git add front
git commit -m "feat: integrate homepage with backend content endpoints"
```

## Task 3 - Replace appointment metadata placeholders with backend-driven options

**Files:**
- Modify: `front/src/components/appointment/AppointmentForm.tsx`
- Modify: `front/src/features/appointment/constants/formOptions.ts`
- Create or Modify: `front/src/features/appointment/types.ts`
- Modify: `front/src/lib/api/appointmentApi.ts`
- Test: `front/src/components/appointment/AppointmentForm.test.tsx`

- [ ] Identify which appointment form options are still locally hardcoded:
  - wilayas
  - campaign list
  - time slots
  - potentially gender and donation labels

- [ ] Define the response type for `GET /api/public/appointment-form-meta`.

- [ ] Update `AppointmentForm.tsx` to fetch appointment form metadata after the gate unlock.

- [ ] Replace direct constant-driven select options with backend-driven options where available.

- [ ] Keep a fallback strategy for metadata fetch failure, but move local constants into explicit fallback use rather than primary use.

- [ ] Ensure locale-aware labels come from the backend response where relevant.

- [ ] Update tests so they verify:
  - metadata load hydrates the form
  - fallback mode still keeps the form usable if metadata fails

**Checkpoint**

- form option lists are backend-driven
- current UI remains functional if the API is temporarily unavailable
- no duplicate source-of-truth confusion between constants and API payloads

**Commit**

```bash
git add front
git commit -m "feat: integrate appointment metadata into form"
```

## Task 4 - Wire dynamic slot loading to the selected date

**Files:**
- Modify: `front/src/components/appointment/AppointmentForm.tsx`
- Modify: `front/src/lib/api/appointmentApi.ts`
- Test: `front/src/components/appointment/AppointmentForm.test.tsx`

- [ ] Replace the static appointment time list with slot state derived from `GET /api/public/appointment-slots`.

- [ ] Trigger slot fetch only when:
  - a valid appointment date exists
  - the eligibility gate has already been passed

- [ ] Ensure the selected slot list resets when the date changes.

- [ ] Disable the appointment-time selector while slots are loading or when no date is set.

- [ ] Render slot availability from the backend response and avoid exposing unavailable values as valid selections.

- [ ] Add UI handling for:
  - slot loading state
  - no slots available state
  - slot fetch error state

- [ ] Extend tests to verify:
  - changing date triggers a slot fetch
  - slot options are populated from the response
  - invalid or empty slot responses do not break the form

**Checkpoint**

- appointment time choices come from `back`
- date changes correctly drive slot changes
- the user cannot accidentally submit a stale slot selection

**Commit**

```bash
git add front
git commit -m "feat: connect appointment slots to selected date"
```

## Task 5 - Validate the real appointment submission flow in the UI

**Files:**
- Modify: `front/src/components/appointment/AppointmentForm.tsx`
- Modify: `front/src/lib/api/client.ts`
- Test: `front/src/components/appointment/AppointmentForm.test.tsx`

- [ ] Review the current submit path and remove any remaining placeholder assumptions around success or failure handling.

- [ ] Confirm the payload sent by `front` matches the actual backend schema:
  - `locale`
  - `eligibilityChecklist`
  - appointment fields
  - donor fields

- [ ] Ensure `422` field errors coming from `back` are mapped directly into `react-hook-form` errors.

- [ ] Ensure `409 SLOT_UNAVAILABLE` produces a specific user-facing message and invites slot reselection.

- [ ] Ensure generic server failures (`500` or network failure) show a non-destructive fallback error.

- [ ] Clear stale success state when the user edits and resubmits.

- [ ] Update tests to explicitly cover:
  - successful submission
  - `422` field error mapping
  - `409` conflict handling
  - generic API failure

**Checkpoint**

- the appointment form behaves correctly against the real backend contract
- errors shown in the UI map to actual backend response families
- successful submission shows a stable confirmation state

**Commit**

```bash
git add front
git commit -m "feat: finalize real appointment submission handling"
```

## Task 6 - Seed or insert realistic content for integration validation

**Files:**
- Create: `back/src/scripts/seed-public-content.ts`
- Create or Modify: `back/package.json`
- Optionally Create: `back/src/scripts/seed-appointments-demo.ts`
- Document: `back/README.md`

- [ ] Add a minimal seed script for:
  - homepage content
  - FAQ entries
  - optionally one active campaign

- [ ] Keep the seeded content close to the current frontend copy so the UI does not shift unpredictably.

- [ ] Add an npm script such as:

```json
"seed:public": "tsx src/scripts/seed-public-content.ts"
```

- [ ] Ensure the script is idempotent enough for repeated local use.

- [ ] Run the seed against the local MongoDB instance.

- [ ] Verify the seeded data is visible through:
  - `GET /api/public/home-content`
  - `GET /api/public/faq`
  - `GET /api/public/campaigns/active`

**Checkpoint**

- local integration no longer depends only on service fallbacks
- the browser reflects persisted public content from MongoDB

**Commit**

```bash
git add back
git commit -m "feat: add public content seed for integration"
```

## Task 7 - Run a manual browser-level end-to-end integration pass

**Files:**
- Verify: `front/src/pages/home/HomePage.tsx`
- Verify: `front/src/components/appointment/AppointmentForm.tsx`
- Verify: `back/src/modules/appointments/appointment.controller.ts`
- Document: `docs/phases/phase-04-integration-full-stack-rendez-vous.md`

- [ ] Start `back` with a live MongoDB connection.

- [ ] Start `front` against that running backend.

- [ ] In the browser, verify homepage behavior:
  - homepage renders backend-driven content
  - FAQ loads
  - campaign information appears if seeded

- [ ] In the browser, verify appointment behavior:
  - gate blocks the form until confirmed
  - form metadata loads
  - slot list loads after date selection
  - valid submit succeeds

- [ ] Verify error behavior intentionally:
  - submit an invalid payload path if feasible
  - trigger a conflict path if feasible

- [ ] Record any discovered mismatches between the documentation contract and the actual behavior, then fix either the code or the docs immediately.

**Checkpoint**

- the full user journey works in the browser from `/` to successful appointment submission
- documented behavior matches observed behavior

**Commit**

```bash
git add front back docs
git commit -m "test: validate full-stack integration journey"
```

## Task 8 - Stabilize integration documentation and handoff

**Files:**
- Modify: `docs/phases/phase-04-integration-full-stack-rendez-vous.md`
- Modify: `docs/phase-master-plan.md`
- Modify: `front/README.md`
- Modify: `back/README.md`

- [ ] Update the phase 4 documentation to reflect:
  - actual endpoint names
  - real env variable values used locally
  - any fallback behavior that still exists
  - the current seeding approach

- [ ] Add this execution plan to the master plan's execution-document list.

- [ ] Ensure both `front/README.md` and `back/README.md` mention the other repo as part of local integration.

- [ ] Add a short “how to run full-stack locally” section in at least one README with:
  - start MongoDB
  - start `back`
  - start `front`
  - open the browser

- [ ] Re-run the final validation:

```bash
cd /Users/abdoufrigaa/Projects/doc\ système/front && npm test && npm run build
cd /Users/abdoufrigaa/Projects/doc\ système/back && npm test && npm run build
```

**Completion criteria**

- `front` and `back` work together locally
- the appointment journey is browser-testable end to end
- the docs reflect the actual integrated state, not just the intended one

**Commit**

```bash
git add front back docs
git commit -m "docs: finalize phase 4 full-stack integration handoff"
```
