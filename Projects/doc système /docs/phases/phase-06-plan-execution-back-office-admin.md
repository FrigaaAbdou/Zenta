# Phase 6 - Plan d'execution detaille du back-office admin

> **Pour les agents d'execution :** utiliser `superpowers:subagent-driven-development` (recommande) ou `superpowers:executing-plans`. Les etapes utilisent le format checkbox (`- [ ]`) pour suivi direct.

**Objectif :** transformer le projet public actuel en produit exploitable par une equipe operationnelle, via un back-office admin moderne, dense, lisible, rapide a utiliser et suffisamment solide pour un usage proche production.

**Positionnement produit :** le back-office n'est pas une annexe visuelle du site public. C'est un outil de travail. Il doit etre plus sobre, plus informationnel, plus rapide a lire et plus robuste dans ses etats. L'esthetique doit rester coherente avec l'identite du centre, mais la priorite n'est plus l'emotion du hero public. La priorite est la vitesse de prise d'information et d'action.

**Architecture retenue :**
- `front` garde l'admin dans le meme repo, sous le namespace `/admin`
- `back` expose un namespace `/api/admin`
- authentification admin minimale, protection par role
- shell admin distinct du shell public
- UI basee sur `shadcn/ui` et composee comme un vrai dashboard de production

**Contrainte design explicite :**
- admin moderne avec sidebar persistante
- tables, filtres, panneaux lateraux, badges d'etat, actions rapides
- surfaces claires, rouges uniquement comme accent, jamais comme fond principal
- impression de produit operationnel, pas de prototype

**Socle UI a utiliser cote `front` :**
- preset `shadcn`: `radix-nova`
- alias `@/components/ui`
- `rtl: true` deja supporte par le projet
- bibliotheque d'icones: `lucide-react`

---

## 1. Direction UI detaillee

### 1.1 Principe visuel global

Le back-office doit suivre une logique de dashboard premium mais retenu :

- fond principal blanc ou gris tres leger
- sidebar verticale stable, lisible, avec accent rouge discret sur l'entree active
- topbar fine avec recherche, contexte, profil admin
- contenu principal structure par grandes zones:
  - KPI cards
  - table centrale
  - rail secondaire ou panneau detail
- contrastes de lecture eleves
- pas de surcharge decorative
- rayon et ombres plus mesurés que sur le front public

### 1.2 Atmosphere

Le rendu doit evoquer :

- fiabilite
- organisation
- calme operationnel
- medical/institutionnel contemporain

Ce qu'il faut eviter :

- look startup trop flashy
- fond creme ou beige
- dark mode force
- usage massif du rouge en aplats
- grilles de cartes repetitives partout

### 1.3 Palette fonctionnelle

- `background`: blanc ou gris tres pale
- `surface`: blanc net
- `text primary`: gris tres fonce
- `text secondary`: gris bleute ou neutre
- `border`: gris clair
- `accent`: rouge `#e7000b`
- `success`: vert fonctionnel
- `warning`: ambre
- `danger`: rouge accentue, reserve aux statuts critiques

Le rouge doit servir a :

- signaler l'action primaire
- marquer l'entree active de sidebar
- porter certains badges critiques
- souligner les statuts importants

Il ne doit pas etre utilise comme couleur dominante de grandes surfaces.

### 1.4 Typographie

- meme famille que le front pour garder la coherence produit
- titres admin plus compacts et plus utilitaires
- labels de filtre et meta-informations plus petits mais tres lisibles
- tables avec corps de texte net, pas trop petit
- chiffres KPI avec poids fort et tracking propre

### 1.5 Layout de reference

Le shell admin doit suivre cette logique :

```text
+---------------------------------------------------------------+
| Sidebar fixe | Topbar contextuelle                            |
|              +------------------------------------------------+
|              | Header de page + actions                       |
|              +------------------------------------------------+
|              | KPI / filtres / vues                           |
|              +------------------------------------------------+
|              | Table, detail, formulaire ou editeur          |
+---------------------------------------------------------------+
```

### 1.6 Responsive

- desktop prioritaire a partir de `lg`
- tablette supportee proprement
- mobile admin utilisable mais moins prioritaire que le site public
- sur petit ecran :
  - sidebar en `Sheet`
  - topbar compacte
  - tables avec scroll horizontal ou vues detail accessibles

---

## 2. Information architecture admin

### 2.1 Navigation principale

La sidebar doit contenir :

- `Dashboard`
- `Demandes`
- `Campagnes`
- `Contenus`
- `Parametres` ou `Administration` uniquement si utile plus tard

### 2.2 Zones fonctionnelles

#### Dashboard

- KPI cards
- demandes en attente
- demandes du jour
- campagne active
- activite recente

#### Demandes

- liste
- filtres
- recherche
- detail
- changement de statut

#### Campagnes

- liste des campagnes
- etat active / inactive / publiee
- creation
- edition

#### Contenus

- liste des blocs structurants
- edition FR/AR
- publication / depublier

### 2.3 Navigation secondaire

Selon les pages, on peut utiliser :

- `Tabs` pour separer vues ou sections
- `Breadcrumb` pour le detail
- `DropdownMenu` pour actions contextuelles

---

## 3. Design system admin base sur `shadcn`

### 3.1 Composants `shadcn` a ajouter en priorite

Le plan suppose l'ajout ou l'usage de ces composants :

- `sidebar`
- `card`
- `table`
- `chart`
- `tabs`
- `dialog`
- `sheet`
- `input`
- `select`
- `dropdown-menu`
- `badge`
- `avatar`
- `separator`
- `skeleton`
- `textarea`
- `pagination`
- `alert`

### 3.2 Raison composant par composant

#### `Sidebar`

Pour le shell admin principal. C'est le pilier de l'experience.

#### `Card`

Pour KPI, syntheses, blocs de contexte, jamais pour tout encapsuler.

#### `Table`

Pour la liste des demandes. On ne transforme pas des donnees tabulaires en grille de cards.

#### `Chart`

Pour le dashboard minimal: volume journalier, repartition par statut, vue campagne si necessaire.

#### `Tabs`

Pour les details et les editeurs de contenus/campagnes.

#### `Dialog`

Pour confirmations critiques : suppression, changement d'etat irreversible.

#### `Sheet`

Pour les panneaux lateraux d'edition ou detail rapide.

#### `Input` + `Select`

Pour filtres, recherche, edition simple.

#### `DropdownMenu`

Pour actions de ligne dans les tables.

### 3.3 Regles de composition a respecter

- tables pour les listes metier
- sheets pour les details rapides ou edition laterale
- dialogs pour les confirmations, pas pour les gros formulaires
- cards pour la synthese, pas pour remplacer chaque ligne
- `Badge` pour statuts
- `Tabs` pour separer les sous-contextes d'un detail

### 3.4 Composants metier a construire par-dessus `shadcn`

- `AdminShell`
- `AdminSidebar`
- `AdminTopbar`
- `AdminPageHeader`
- `MetricCard`
- `StatusBadge`
- `FilterToolbar`
- `AppointmentTable`
- `AppointmentDetailPanel`
- `CampaignEditorSheet`
- `ContentEditorPanel`
- `EmptyAdminState`

---

## 4. Ecrans cibles de la phase 6

### 4.1 `AdminLoginPage`

But :

- page simple, nette, securisante
- pas un hero marketing

Structure :

- card de login centree
- logo / nom du centre
- champs email / mot de passe
- action primaire
- message erreur propre

### 4.2 `AdminDashboardPage`

But :

- donner une lecture immediate de la situation

Structure :

- header avec titre + contexte jour
- 3 a 4 KPI cards
- graphique simple
- liste courte des demandes recentes
- bloc campagne active

### 4.3 `AdminAppointmentsListPage`

But :

- page coeur de l'outil

Structure :

- page header
- `FilterToolbar`
- table principale
- badges de statut
- menu d'actions par ligne
- pagination

### 4.4 `AdminAppointmentDetailPage`

But :

- comprendre une demande et agir vite

Structure :

- breadcrumb
- resume en tete
- sections:
  - donneur
  - rendez-vous
  - eligibilite
  - remarques
  - historique de statut
- actions de changement de statut

### 4.5 `AdminCampaignsPage`

But :

- gerer les campagnes sans complexite inutile

Structure :

- liste des campagnes
- statut, priorite, dates
- bouton de creation
- edition dans un `Sheet` ou page dediee selon densite

### 4.6 `AdminContentPage`

But :

- editer le contenu public sans casser le contrat

Structure :

- liste des blocs editables
- vue par section
- `Tabs` FR/AR
- panneau d'edition
- action de publication

---

## 5. Strategie UX de production

### 5.1 Vitesse de scan

L'admin doit pouvoir repondre a ces questions en moins de quelques secondes :

- combien de demandes en attente ?
- quelles demandes demandent une action ?
- quelle campagne est active ?
- quel contenu est publie ?

### 5.2 Action sans friction

Pour les demandes :

- changement de statut en 1 ou 2 clics max
- detail accessible sans rupture brutale du contexte

Pour les campagnes et contenus :

- edition dans une surface maitrisée
- sauvegarde claire
- etat de publication visible

### 5.3 Etats vides et erreurs

Le back-office doit traiter proprement :

- zero demandes
- zero campagne active
- contenu manquant
- session expiree
- droits insuffisants
- erreur serveur

### 5.4 Accessibilite

- focus visibles
- contrastes suffisants
- labels clairs
- pas d'actions critiques ambiguës

---

## 6. Task 1 - Figer le design system admin et le scope V1

**Fichiers :**
- Modifier : `docs/phases/phase-06-back-office-admin.md`
- Creer : `docs/phases/phase-06-task-01-admin-design-system.md`
- Creer : `docs/phases/phase-06-task-01-scope-etats-admin.md`

- [ ] Figer les ecrans V1 inclus.
- [ ] Figer les statuts metier admin:
  - `pending`
  - `confirmed`
  - `rejected`
  - `completed`
  - `cancelled`
- [ ] Definir les transitions autorisees.
- [ ] Figer les roles:
  - `super_admin`
  - `manager`
  - `operator`
- [ ] Documenter la navigation sidebar.
- [ ] Documenter les tokens visuels admin.
- [ ] Documenter la hiararchie des surfaces:
  - shell
  - page
  - card KPI
  - table
  - sheet
  - dialog
- [ ] Documenter la liste des composants `shadcn` a installer.

**Checkpoint**

- direction UI admin figee
- scope metier admin V1 ferme

**Commit**

```bash
git add docs
git commit -m "docs: freeze admin design system and v1 scope"
```

## 7. Task 2 - Installer les primitives `shadcn` et construire le shell admin

**Fichiers :**
- Modifier : `front/components.json` si necessaire
- Ajouter : `front/src/components/ui/*`
- Creer : `front/src/app/layouts/AdminLayout.tsx`
- Creer : `front/src/components/admin/layout/AdminSidebar.tsx`
- Creer : `front/src/components/admin/layout/AdminTopbar.tsx`
- Creer : `front/src/components/admin/layout/AdminPageHeader.tsx`

- [ ] Ajouter les composants `shadcn` prioritaires:
  - `sidebar`
  - `card`
  - `table`
  - `chart`
  - `tabs`
  - `dialog`
  - `sheet`
  - `input`
  - `select`
  - `dropdown-menu`
  - `badge`
  - `avatar`
  - `separator`
  - `skeleton`
- [ ] Construire la sidebar admin desktop.
- [ ] Construire la sidebar mobile via `Sheet`.
- [ ] Construire le topbar admin.
- [ ] Construire le header de page standard.
- [ ] Ajouter et tester:
  - etat actif de navigation
  - hover
  - collapsed mobile
  - `rtl`

**Notes d'implementation**

- ne pas improviser une sidebar custom lourde si `shadcn` la couvre
- garder des espacements propres et denses
- le shell doit paraitre deployable des sa premiere version

**Checkpoint**

- shell admin complet
- composant layout reutilisable pour toute la phase

**Commit**

```bash
git add front
git commit -m "feat: build admin shell with shadcn primitives"
```

## 8. Task 3 - Ajouter l'auth admin cote `back`

**Fichiers :**
- Creer : `back/src/modules/admin-auth/admin-user.model.ts`
- Creer : `back/src/modules/admin-auth/admin-auth.schema.ts`
- Creer : `back/src/modules/admin-auth/admin-auth.service.ts`
- Creer : `back/src/modules/admin-auth/admin-auth.controller.ts`
- Creer : `back/src/modules/admin-auth/admin-auth.routes.ts`
- Creer : `back/src/modules/admin-auth/password.ts`
- Modifier : `back/.env.example`
- Modifier : `back/src/routes/index.ts`

- [ ] Ajouter le modele `admin_users`.
- [ ] Ajouter hash mot de passe + verification.
- [ ] Ajouter `POST /api/admin/auth/login`.
- [ ] Ajouter `GET /api/admin/auth/me`.
- [ ] Ajouter `POST /api/admin/auth/logout` si la strategie le demande.
- [ ] Retourner un payload session clair pour le `front`.

**Checkpoint**

- login admin fonctionnel
- session restaurable cote `front`

**Commit**

```bash
git add back
git commit -m "feat: add admin authentication backend"
```

## 9. Task 4 - Proteger les routes admin et gerer les roles

**Fichiers :**
- Creer : `back/src/middlewares/admin-auth.middleware.ts`
- Creer : `back/src/middlewares/admin-role.middleware.ts`
- Creer : `back/src/lib/auth/admin-token.ts`
- Tester : `back/src/tests/admin-auth.test.ts`

- [ ] Proteger `/api/admin/*`.
- [ ] Ajouter `requireAdminAuth`.
- [ ] Ajouter `requireAdminRole(...roles)`.
- [ ] Standardiser:
  - `401`
  - `403`
- [ ] Couvrir les cas role insuffisant / auth absente / auth valide.

**Checkpoint**

- toutes les routes admin sont protegees

**Commit**

```bash
git add back
git commit -m "feat: add admin route protection and roles"
```

## 10. Task 5 - Exposer la gestion admin des demandes

**Fichiers :**
- Creer : `back/src/modules/admin-appointments/admin-appointments.controller.ts`
- Creer : `back/src/modules/admin-appointments/admin-appointments.routes.ts`
- Creer : `back/src/modules/admin-appointments/admin-appointments.schema.ts`
- Modifier : `back/src/modules/appointments/appointment.service.ts`
- Tester : `back/src/tests/admin-appointments.test.ts`

- [ ] Implementer `GET /api/admin/appointments`.
- [ ] Ajouter filtres:
  - `status`
  - `dateFrom`
  - `dateTo`
  - `campaignCode`
  - `search`
- [ ] Ajouter pagination.
- [ ] Implementer `GET /api/admin/appointments/:id`.
- [ ] Implementer `PATCH /api/admin/appointments/:id/status`.
- [ ] Retourner les donnees necessaires a la table et au detail.

**Design impact**

- la structure backend doit servir une vraie `Table`
- ne pas obliger le `front` a recomposer des payloads complexes

**Checkpoint**

- le `front` peut construire une page demandes serieuse sans logique de couture

**Commit**

```bash
git add back
git commit -m "feat: add admin appointments management api"
```

## 11. Task 6 - Exposer la gestion admin des campagnes et contenus

**Fichiers :**
- Creer : `back/src/modules/admin-campaigns/*`
- Creer : `back/src/modules/admin-content/*`
- Modifier : `back/src/modules/campaigns/campaign.service.ts`
- Modifier : `back/src/modules/content/content.service.ts`
- Tester : `back/src/tests/admin-campaigns-content.test.ts`

- [ ] Ajouter:
  - `GET /api/admin/campaigns`
  - `POST /api/admin/campaigns`
  - `PATCH /api/admin/campaigns/:id`
- [ ] Ajouter:
  - `GET /api/admin/content`
  - `PATCH /api/admin/content/:id`
- [ ] Valider les payloads bilingues `fr/ar`.
- [ ] Garantir la compatibilite avec les endpoints publics existants.

**Checkpoint**

- campagnes et contenus peuvent etre pilotes depuis l'admin

**Commit**

```bash
git add back
git commit -m "feat: add admin campaigns and content api"
```

## 12. Task 7 - Connecter le login admin et le shell frontend

**Fichiers :**
- Creer : `front/src/pages/admin/login/AdminLoginPage.tsx`
- Creer : `front/src/components/admin/auth/AdminLoginForm.tsx`
- Creer : `front/src/lib/api/adminAuthApi.ts`
- Creer : `front/src/features/admin-auth/*`
- Modifier : `front/src/app/router/index.tsx`

- [ ] Ajouter les routes admin:
  - `/admin/login`
  - `/admin`
  - `/admin/appointments`
  - `/admin/campaigns`
  - `/admin/content`
- [ ] Connecter le login.
- [ ] Restaurer la session.
- [ ] Ajouter logout.
- [ ] Ajouter le guard frontend des routes admin.
- [ ] Gerer l'expiration de session.

**Design impact**

- la page de login doit paraitre institutionnelle et propre
- aucun glissement vers un ecran de dev brut

**Checkpoint**

- un admin peut entrer dans le shell protege

**Commit**

```bash
git add front
git commit -m "feat: connect admin auth and protected routes"
```

## 13. Task 8 - Construire le dashboard admin

**Fichiers :**
- Creer : `front/src/pages/admin/dashboard/AdminDashboardPage.tsx`
- Creer : `front/src/components/admin/dashboard/*`
- Creer : `front/src/lib/api/adminDashboardApi.ts`
- Tester : `front/src/pages/admin/dashboard/AdminDashboardPage.test.tsx`

- [ ] Construire 3 a 4 `MetricCard`.
- [ ] Ajouter un graphique simple avec `chart`.
- [ ] Ajouter une table courte des demandes recentes.
- [ ] Ajouter un bloc campagne active.
- [ ] Ajouter un rail activite recente si utile.

**Design detail obligatoire**

- les KPI cards doivent etre sobres, claires, sans look “marketing”
- le dashboard doit etre dense mais respirant
- la table recente doit ressembler a un vrai outil, pas a une demo

**Checkpoint**

- page dashboard utile des la premiere ouverture

**Commit**

```bash
git add front
git commit -m "feat: add admin dashboard overview"
```

## 14. Task 9 - Construire la page demandes admin

**Fichiers :**
- Creer : `front/src/pages/admin/appointments/AdminAppointmentsListPage.tsx`
- Creer : `front/src/pages/admin/appointments/AdminAppointmentDetailPage.tsx`
- Creer : `front/src/components/admin/appointments/*`
- Creer : `front/src/lib/api/adminAppointmentsApi.ts`
- Tester : `front/src/pages/admin/appointments/*.test.tsx`

- [ ] Construire `FilterToolbar`.
- [ ] Construire la `Table` des demandes.
- [ ] Ajouter badges d'etat.
- [ ] Ajouter menu d'actions de ligne.
- [ ] Construire la page detail.
- [ ] Permettre le changement de statut.
- [ ] Gerer:
  - etat vide
  - chargement
  - erreur
  - pagination

**Design detail obligatoire**

- la table est la surface principale
- detail soit en page dediee, soit via `Sheet` secondaire selon le besoin
- tout doit inspirer un usage quotidien confortable

**Checkpoint**

- un operateur peut traiter des demandes sans sortir du dashboard

**Commit**

```bash
git add front
git commit -m "feat: add admin appointments screens"
```

## 15. Task 10 - Construire la gestion campagnes et contenus

**Fichiers :**
- Creer : `front/src/pages/admin/campaigns/*`
- Creer : `front/src/pages/admin/content/*`
- Creer : `front/src/components/admin/campaigns/*`
- Creer : `front/src/components/admin/content/*`
- Creer : `front/src/lib/api/adminCampaignsApi.ts`
- Creer : `front/src/lib/api/adminContentApi.ts`
- Tester : `front/src/pages/admin/campaigns/*.test.tsx`
- Tester : `front/src/pages/admin/content/*.test.tsx`

- [ ] Construire la liste des campagnes.
- [ ] Ajouter creation / edition campagne.
- [ ] Afficher:
  - dates
  - publication
  - activation
  - priorite
- [ ] Construire la liste des contenus.
- [ ] Ajouter editeur FR/AR avec `Tabs`.
- [ ] Ajouter sauvegarde et publication.
- [ ] Gerer les cas contenu partiel.

**Design detail obligatoire**

- les formulaires doivent rester compacts
- l'edition bilingue doit etre claire et non anxiogene
- utiliser `Sheet` ou page detail selon la densite finale

**Checkpoint**

- campagnes et contenus sont reellement gerables sans Compass

**Commit**

```bash
git add front
git commit -m "feat: add admin campaigns and content screens"
```

## 16. Task 11 - Seed admin, QA finale, doc et handoff

**Fichiers :**
- Optionnel : `back/src/scripts/seed-admin.ts`
- Modifier : `back/README.md`
- Modifier : `front/README.md`
- Modifier : `docs/phase-master-plan.md`
- Modifier : `docs/phases/phase-06-back-office-admin.md`

- [ ] Ajouter un seed admin minimal:
  - `super_admin`
  - `manager`
  - `operator`
- [ ] Documenter la creation des comptes de dev.
- [ ] Rejouer:

```bash
cd /Users/abdoufrigaa/Projects/doc\ système/front && npm test && npm run build
cd /Users/abdoufrigaa/Projects/doc\ système/back && npm test && npm run build
```

- [ ] Verifier en navigateur:
  - login
  - dashboard
  - liste demandes
  - detail demande
  - changement de statut
  - liste campagnes
  - edition contenu FR/AR
- [ ] Mettre a jour la doc avec:
  - routes admin
  - auth
  - roles
  - limites V1
  - suite logique phase 7

**Criteres de completion**

- back-office admin protege disponible
- dashboard lisible et credible
- gestion demandes operationnelle
- gestion campagnes operationnelle
- gestion contenus operationnelle
- design admin coherent, moderne, deployable
- documentation alignee

**Commit**

```bash
git add front back docs
git commit -m "docs: finalize phase 6 admin handoff"
```

---

## 17. Resume executif de la phase 6

La phase 6 ne doit pas etre executee comme une simple extension CRUD.

Elle doit livrer :

- un shell admin de vrai produit
- une navigation laterale propre
- une table demandes forte et centrale
- des surfaces d'edition compactes
- une auth admin nette
- des endpoints admin directement exploitables

La bonne lecture strategique est :

1. figer le systeme UI admin
2. poser l'auth et la securite
3. livrer les endpoints admin
4. livrer le shell frontend
5. livrer les ecrans demandes
6. livrer campagnes et contenus
7. fermer avec seed, QA et handoff
