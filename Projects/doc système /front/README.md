# front

Frontend React + Vite de l'application de don de sang inspiree de `https://cts-chu-mustapha.com/fr`.

Le repo couvre maintenant :
- l'experience publique bilingue
- le parcours de rendez-vous
- le back-office admin phase 6

## Run locally

```bash
npm install
npm run dev
```

Le serveur local est generalement utilise sur `http://127.0.0.1:5176`.

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

`VITE_API_BASE_URL` can stay empty during visual public-only integration work. In that case, the homepage uses local fallback content and the appointment form fails gracefully on submit. The admin area does not have that fallback path and requires the backend.

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
npm run seed:admin
npm run dev
```

4. In `front/`, run:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5176
```

5. Open:

```text
http://127.0.0.1:5176
```

With the backend running, the public pages and the admin area use the real API.

## Main routes

- `/`
- `/appointment`
- `/admin/login`
- `/admin`
- `/admin/appointments`
- `/admin/campaigns`
- `/admin/content`
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
- admin login with protected routes
- admin dashboard
- admin appointment list/detail/status workflow
- admin campaign management
- admin homepage content editor
- frontend critical-path tests with Vitest

## Admin flow

Current admin flow:

1. open `/admin/login`
2. sign in with a seeded admin account from `back`
3. browse dashboard, demands, campaigns, and content
4. sign out from the topbar menu

The admin shell uses:

- persistent desktop sidebar
- mobile sheet navigation
- KPI cards and dashboard widgets
- data tables for operational views
- simple FR/AR-aware layout behavior

## Notes

- UI stays intentionally close to the public product identity while using a more sober dashboard pattern for admin.
- Backend integration follows the documented public and admin API contracts in the project docs.
- The frontend uses app-level locale state and propagates `dir="ltr|rtl"` from the root layout.
- The homepage is primarily backend-driven through `home-content`, `faq`, `campaigns/active`, and `campaigns/featured`.
- The frontend still keeps graceful fallback behavior if public content endpoints are temporarily unavailable or partially translated.
- Appointment form metadata, campaigns, and submission locale all follow the active language.
- The admin interface requires the backend admin API, `ADMIN_JWT_SECRET`, and seeded users from `npm run seed:admin`.
