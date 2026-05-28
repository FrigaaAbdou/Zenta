# front

Frontend React + Vite de l'application de don de sang inspirée de `https://cts-chu-mustapha.com/fr`.

## Run locally

```bash
npm install
npm run dev
```

## Test and build

```bash
npm run test
npm run build
```

## Required environment

Create `.env.local` at the root of `front/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:4000
VITE_DEFAULT_LOCALE=fr
```

`VITE_API_BASE_URL` can stay empty during visual integration work. In that case, the homepage uses local fallback content and the appointment form fails gracefully on submit.

## Full-stack local setup

This repo is designed to run with the sibling backend repo at:

- [back](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/back)

Recommended local sequence:

1. Start MongoDB locally on `127.0.0.1:27017`
2. In `back/`, configure `.env`
3. In `back/`, run:

```bash
npm install
npm run seed:public
npm run dev
```

4. In `front/`, run:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5175
```

5. Open:

```text
http://127.0.0.1:5175
```

With the backend running, the homepage, FAQ, campaigns, appointment metadata, slot loading, and appointment submission use the real API.

## Main routes

- `/`
- `/appointment`
- `*` -> not found page

## Current scope

- shared public layout
- homepage sections aligned with the reference site
- appointment gate
- validated multi-section appointment form
- API client layer integrated with `back`
- app-level locale switching `fr/ar`
- `rtl` support on the main public views
- featured campaign support on the homepage
- frontend critical-path tests with Vitest
- full-stack integration completed for the public appointment journey
- bilingual public experience completed for phase 5

## Notes

- UI stays intentionally close to the reference site structure and hierarchy.
- Backend integration follows the documented public API contract in the project docs.
- The frontend uses app-level locale state and propagates `dir="ltr|rtl"` from the root public layout.
- The homepage is primarily backend-driven through `home-content`, `faq`, `campaigns/active`, and `campaigns/featured`.
- The frontend still keeps graceful fallback behavior if public content endpoints are temporarily unavailable or partially translated.
- Appointment form metadata, campaigns, and submission locale all follow the active language.
- One browser-automation limitation was observed during phase 4 validation: the in-app automation surface did not reliably trigger React change handling on the native date input, although the real API flow, tests, and backend contract were verified successfully.
- The admin interface is not part of this repository baseline.
