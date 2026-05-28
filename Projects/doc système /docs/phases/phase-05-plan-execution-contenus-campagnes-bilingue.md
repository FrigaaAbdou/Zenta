# Phase 5 - Plan d'execution contenus, campagnes et bilingue

**Etat d'execution actuel :** tasks 1 a 9 executees. La phase 5 est cloturee sur le perimetre prevu: contenu public majoritairement dynamique, campagnes structurees pour l'experience publique, locale applicative `fr/ar`, support `rtl` sur les vues principales, seed bilingue enrichi, et validation navigateur documentee.

> **Pour les agents d'execution :** utiliser `superpowers:subagent-driven-development` (recommande) ou `superpowers:executing-plans`. Les etapes utilisent le format checkbox (`- [ ]`) pour suivi direct.

**Objectif :** faire passer l'application d'un contenu encore partiellement code en dur a une experience publique pilotee par des contenus dynamiques, des campagnes structurees et une gestion bilingue `FR/AR` propre, incluant `LTR/RTL`.

**Architecture :** `back` devient la source principale de verite pour les contenus publics, les FAQ et les campagnes. `front` consomme ces donnees via sa couche API, garde des fallbacks limites pour les pannes, et gere la locale active ainsi que la direction d'affichage.

**Tech stack concernee :** `React`, `Vite`, `TypeScript`, `React Router`, `Express`, `MongoDB`, `Mongoose`, `Zod`, `Tailwind`, `Vitest`

---

## Task 1 - Auditer ce qui reste hardcode dans le `front`

**Fichiers a auditer :**
- `front/src/pages/home/HomePage.tsx`
- `front/src/components/marketing/*.tsx`
- `front/src/components/layout/*.tsx`
- `front/src/components/appointment/*.tsx`
- `front/src/lib/api/homeApi.ts`
- `front/src/features/appointment/constants/formOptions.ts`

- [ ] Lister toutes les zones encore codees en dur cote `front`.
- [ ] Separer:
  - contenu institutionnel a rendre dynamique
  - libelles purement techniques pouvant rester locaux temporairement
  - contenu derive d'une campagne active
- [ ] Identifier les composants critiques qui devront supporter `RTL` sans casse:
  - header
  - hero
  - cards d'impact
  - CTA
  - FAQ
  - page rendez-vous
- [ ] Produire une cartographie simple `contenu -> source future`.

**Checkpoint**

- inventaire complet des textes restants
- priorisation claire de ce qui sort du code pendant la phase 5

**Commit**

```bash
git add docs
git commit -m "docs: audit remaining hardcoded public content"
```

## Task 2 - Etendre le modele de contenu public cote `back`

**Fichiers :**
- Modifier : `back/src/modules/content/content.model.ts`
- Modifier : `back/src/modules/content/content.service.ts`
- Optionnel : `back/src/modules/content/content.controller.ts`
- Tester : `back/src/tests/public-content.test.ts`

- [ ] Faire evoluer le schema `site_content` pour supporter au minimum:
  - `hero`
  - `impact`
  - `eligibilityPreview`
  - `ctaBanner`
  - `process`
  - `support`
  - `footer`
- [ ] Garder la structure par sections metier, pas par cle atomique isolee.
- [ ] Ajouter un fallback de locale previsible:
  - si `ar` absent -> fallback `fr`
- [ ] Garantir que les payloads incomplets n'explosent pas le `front`.
- [ ] Conserver un contrat stable pour `GET /api/public/home-content`.

**Notes d'implementation**

- eviter les structures trop libres de type "blob sans conventions"
- preferer un objet versionne par section, lisible par l'equipe produit

**Checkpoint**

- le backend sait servir un contenu homepage plus riche
- le fallback `ar -> fr` fonctionne

**Commit**

```bash
git add back
git commit -m "feat: extend public content model for dynamic homepage sections"
```

## Task 3 - Structurer davantage les campagnes cote `back`

**Fichiers :**
- Modifier : `back/src/modules/campaigns/campaign.model.ts`
- Modifier : `back/src/modules/campaigns/campaign.service.ts`
- Modifier : `back/src/modules/campaigns/campaign.controller.ts`
- Tester : `back/src/tests/public-content.test.ts`

- [ ] Ajouter au modele campagne les champs utiles a l'experience publique:
  - `code`
  - `status`
  - `isPublished`
  - `isActive`
  - `startDate`
  - `endDate`
  - `localeContent.fr`
  - `localeContent.ar`
  - optionnel `badgeLabel`, `theme`, `priority`
- [ ] Definir une notion de campagne principale si plusieurs campagnes sont actives.
- [ ] Permettre au backend de renvoyer:
  - liste des campagnes actives
  - campagne principale pour la homepage
  - details d'une campagne par code si necessaire
- [ ] Garder une sortie JSON exploitable sans logique supplementaire cote `front`.

**Checkpoint**

- les campagnes ne sont plus juste un code rattache a un rendez-vous
- le backend sait piloter une campagne visible dans l'UI

**Commit**

```bash
git add back
git commit -m "feat: structure campaigns for public experience"
```

## Task 4 - Brancher les sections homepage dynamiques cote `front`

**Fichiers :**
- Modifier : `front/src/pages/home/HomePage.tsx`
- Modifier : `front/src/lib/api/homeApi.ts`
- Modifier : `front/src/features/home/types.ts`
- Modifier : `front/src/components/marketing/*.tsx`
- Tester : `front/src/pages/home/HomePage.test.tsx`

- [ ] Faire en sorte que les sections homepage lisent les nouvelles sections backend quand elles existent.
- [ ] Garder un fallback local limite si une section manque.
- [ ] Remplacer progressivement les textes fixes restants de:
  - hero
  - impact
  - bandeau CTA
  - support
  - footer si pertinent
- [ ] Garder le rendu stable si:
  - une campagne est absente
  - une section est incomplete
  - la locale demandee n'est pas totalement disponible
- [ ] Verifier que le design reste fidele au site de reference.

**Checkpoint**

- la homepage est majoritairement backend-driven
- le design n'a pas regresse
- le `front` degrade proprement en cas de contenu partiel

**Commit**

```bash
git add front
git commit -m "feat: connect homepage sections to dynamic content"
```

## Task 5 - Mettre en place la locale active et la direction `LTR/RTL`

**Fichiers :**
- Creer ou modifier : `front/src/i18n/locale.ts`
- Creer ou modifier : `front/src/i18n/direction.ts`
- Modifier : `front/src/app/layouts/PublicLayout.tsx`
- Modifier : `front/src/components/layout/AppHeader.tsx`
- Modifier : `front/src/components/layout/LanguageSwitcher.tsx`
- Verifier : composants `marketing` et `appointment`

- [ ] Centraliser la locale active du `front` dans un module clair.
- [ ] Centraliser le mapping `locale -> dir`.
- [ ] Propager `dir="ltr|rtl"` depuis le layout racine.
- [ ] Rendre le switch langue fonctionnel a l'echelle de l'app, pas seulement visuel.
- [ ] Corriger les composants qui cassent en `RTL`:
  - alignements
  - espacements
  - ordre des icones
  - sens des CTA inline
  - cards et accordions
- [ ] Verifier la page rendez-vous en `ar` avec les composants deja en place.

**Checkpoint**

- la locale active pilote vraiment l'affichage
- `RTL` ne casse pas l'interface principale

**Commit**

```bash
git add front
git commit -m "feat: add app-level locale and rtl handling"
```

## Task 6 - Rendre FAQ et campagnes pleinement localisees et resilientes

**Fichiers :**
- Modifier : `front/src/lib/api/faqApi.ts`
- Modifier : `front/src/lib/api/campaignApi.ts`
- Modifier : `front/src/components/marketing/FaqSection.tsx`
- Modifier : `front/src/pages/home/HomePage.tsx`
- Tester : `front/src/pages/home/HomePage.test.tsx`
- Tester : `back/src/tests/public-content.test.ts`

- [ ] S'assurer que `faq` et `campaigns/active` sont demandes avec la bonne locale.
- [ ] Gerer les cas:
  - `ar` complet
  - `ar` partiel
  - fallback `fr`
  - absence de campagne
- [ ] Verifier que l'affichage ne depend pas d'un ordre ou d'un champ fragile.
- [ ] Garder la section FAQ visible meme si une entree est incomplete.

**Checkpoint**

- FAQ et campagnes suivent la locale courante
- aucune erreur runtime si une traduction manque

**Commit**

```bash
git add front back
git commit -m "feat: localize faq and campaigns across front and back"
```

## Task 7 - Ajouter des seeds bilingues plus riches pour validation

**Fichiers :**
- Modifier : `back/src/scripts/seed-public-content.ts`
- Optionnel : `back/src/scripts/seed-arabic-content.ts`
- Modifier : `back/README.md`

- [ ] Etendre le seed public pour couvrir:
  - sections homepage enrichies
  - FAQ FR/AR
  - campagne active FR/AR
- [ ] Rester proche du ton et du design actuel pour eviter un deplacement inutile de l'UI.
- [ ] Rendre le seed idempotent.
- [ ] Rejouer le seed localement.
- [ ] Verifier les payloads reels de:
  - `GET /api/public/home-content?locale=fr`
  - `GET /api/public/home-content?locale=ar`
  - `GET /api/public/faq?locale=fr`
  - `GET /api/public/faq?locale=ar`
  - `GET /api/public/campaigns/active?locale=fr`
  - `GET /api/public/campaigns/active?locale=ar`

**Checkpoint**

- le jeu de donnees local permet de tester serieusement FR et AR
- la homepage peut etre verifiee sans contenu fictif trop pauvre

**Commit**

```bash
git add back
git commit -m "feat: enrich bilingual public content seed"
```

## Task 8 - Valider l'experience FR/AR de bout en bout

**Fichiers a verifier :**
- `front/src/pages/home/HomePage.tsx`
- `front/src/pages/appointment/AppointmentPage.tsx`
- `front/src/components/layout/*`
- `front/src/components/marketing/*`
- `docs/phases/phase-05-contenus-campagnes-et-bilingue.md`

- [ ] Verifier en browser la homepage en `fr`.
- [ ] Verifier en browser la homepage en `ar`.
- [ ] Verifier:
  - header
  - switch langue
  - hero
  - cards
  - FAQ
  - CTA
  - rendez-vous
- [ ] Corriger toute regression visuelle `RTL`.
- [ ] Documenter les ecarts restants si certains textes sont encore locaux.

**Checkpoint**

- le bilingue est fonctionnel
- la homepage et le parcours rendez-vous restent coherents en `FR/AR`

**Commit**

```bash
git add front docs
git commit -m "test: validate bilingual public experience"
```

## Task 9 - Stabiliser la documentation et le handoff de phase 5

**Fichiers :**
- Modifier : `docs/phases/phase-05-contenus-campagnes-et-bilingue.md`
- Modifier : `docs/phase-master-plan.md`
- Modifier : `front/README.md`
- Modifier : `back/README.md`

- [ ] Mettre a jour la documentation avec:
  - les vraies sources de contenu dynamiques
  - le fonctionnement `FR/AR`
  - la strategie `RTL`
  - les fallbacks encore presents
  - le seed bilingue
- [ ] Ajouter ce plan d'execution dans la liste des documents disponibles.
- [ ] Preciser ce qui reste pour la phase 6 admin.
- [ ] Rejouer la validation finale:

```bash
cd /Users/abdoufrigaa/Projects/doc\\ système/front && npm test && npm run build
cd /Users/abdoufrigaa/Projects/doc\\ système/back && npm test && npm run build
```

**Criteres de completion**

- contenu public majoritairement dynamique
- campagnes structurees
- `FR/AR` reellement pris en charge
- `RTL` stable sur les vues principales
- documentation alignee avec l'etat reel

**Commit**

```bash
git add front back docs
git commit -m "docs: finalize phase 5 content and bilingual handoff"
```
