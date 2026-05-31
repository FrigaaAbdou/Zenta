# Phase 6 - Back-office admin

Documents de reference de la phase :

- `docs/phases/phase-06-plan-execution-back-office-admin.md`
- `docs/phases/phase-06-task-01-admin-design-system.md`
- `docs/phases/phase-06-task-01-scope-etats-admin.md`
- `docs/phases/phase-06-extension-calendrier-creneaux-et-age.md`

## 1. Objet de la phase

Cette phase couvre la mise en place du back-office admin qui permet d'exploiter l'application en conditions proches de la production.

Objectifs :

- consulter les demandes de rendez-vous
- mettre a jour leur statut
- gerer les campagnes
- gerer les contenus publics structurants
- consulter des informations de pilotage simples

## 2. Statut d'execution

La phase 6 est executee.

Ce qui est livre :

- shell admin `front` sous `/admin`
- auth admin `back` sous `/api/admin/auth`
- roles `super_admin`, `manager`, `operator`
- dashboard admin connecte
- liste/detail/changement de statut des demandes
- gestion admin des campagnes
- gestion admin du contenu `home`
- seed local des comptes admin

Extension documentee apres cloture initiale :

- validation metier 18+ a renforcer sur le parcours public
- gestion admin des creneaux a ajouter
- page calendrier admin a construire

## 3. Perimetre livre

### Inclus

- auth admin JWT minimale
- routes admin frontend
- endpoints admin backend
- liste et detail des demandes
- mise a jour de statut
- dashboard de synthese
- gestion campagnes
- gestion de certains contenus publics

### Hors perimetre

- role matrix complexe
- workflow d'approbation editorial avance
- gestion multi-etablissements
- analytics poussees
- permissions fines par champ
- audit trail complet
- media manager

## 4. Positionnement du back-office

Le back-office est concu comme un outil de travail :

- sobre visuellement
- rapide a lire
- axe productivite
- coherent avec l'identite du produit public

Le pattern retenu :

- sidebar persistante
- topbar compacte
- KPI cards
- tables metier
- badges de statut
- actions contextuelles via dropdowns, dialogs et formulaires simples

## 5. Capacites fonctionnelles livrees

### 5.1 Gestion des demandes de rendez-vous

L'admin peut :

- voir la liste des demandes
- filtrer par statut
- filtrer par campagne
- rechercher
- paginer
- ouvrir le detail
- changer le statut

Statuts exploites :

- `pending`
- `confirmed`
- `rejected`
- `completed`
- `cancelled`

### 5.2 Gestion des campagnes

L'admin peut :

- lister les campagnes
- creer une campagne
- modifier une campagne
- regler publication / activation
- gerer FR/AR
- regler priorite, theme, badge et dates

### 5.3 Gestion des contenus publics

L'admin peut :

- charger le contenu `home`
- editer les blocs principaux
- travailler en FR/AR
- sauvegarder contre l'API admin

### 5.4 Pilotage simple

Le dashboard affiche :

- demandes en attente
- demandes du jour
- repartition par statut
- campagne principale
- activite recente

## 6. Architecture frontend admin livree

Routes admin :

- `/admin/login`
- `/admin`
- `/admin/appointments`
- `/admin/appointments/:id`
- `/admin/campaigns`
- `/admin/content`

Structure principale :

```text
front/src/
  features/
    admin-auth/
  components/
    admin/
      layout/
      dashboard/
      appointments/
      shared/
  pages/
    admin/
      login/
      dashboard/
      appointments/
      campaigns/
      content/
```

## 7. Architecture backend admin livree

Namespace API :

- `/api/admin`

Modules :

- `admin-auth`
- `admin-appointments`
- `admin-campaigns`
- `admin-content`

Endpoints principaux :

### Auth

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/logout`

### Appointments

- `GET /api/admin/appointments`
- `GET /api/admin/appointments/:id`
- `PATCH /api/admin/appointments/:id/status`

### Campaigns

- `GET /api/admin/campaigns`
- `POST /api/admin/campaigns`
- `PATCH /api/admin/campaigns/:id`

### Content

- `GET /api/admin/content`
- `PATCH /api/admin/content/:id`

## 8. Authentification admin V1

Solution retenue :

- login par email / mot de passe
- bearer JWT
- session restauree via `GET /api/admin/auth/me`
- logout stateless

Collection :

- `adminusers`

Roles :

- `super_admin`
- `manager`
- `operator`

## 9. Seed local admin

Commande :

- `npm run seed:admin`

Comptes de developpement :

- `super_admin@cts.local`
- `manager@cts.local`
- `operator@cts.local`

## 10. Verification de fin de phase

Points verifies :

- login admin
- protection des routes admin
- dashboard charge
- liste demandes charge
- detail demande charge
- changement de statut
- creation / edition campagne
- edition contenu `home`

## 11. Limites V1

- pas de refresh token
- pas de revocation de session
- pas d'audit log admin
- pas de media library
- pas de gestion avancee des slots
- pas de permissions fines par champ

## 12. Suite logique

La suite logique apres cette phase est :

- phase 7 de stabilisation et hardening
- deploiement public du backend
- observabilite et securite de production
- gestion campagnes
- edition contenu

### `operator`

- lecture demandes
- mise a jour de certains statuts

## 9. Domaine admin - demandes de rendez-vous

## 9.1 Liste

La liste admin doit afficher au minimum:

- nom / prenom
- telephone
- date demande
- date rendez-vous
- heure
- type de don
- statut
- campagne

## 9.2 Filtres recommandes

- statut
- date rendez-vous
- campagne
- recherche texte

## 9.3 Detail d'une demande

Le detail doit afficher:

- donnees du donneur
- donnees du rendez-vous
- checklist eligibilite
- remarques
- historique simple des changements si disponible

## 9.4 Changement de statut

Statuts:

- `pending`
- `confirmed`
- `rejected`
- `cancelled`
- `completed`

Le changement de statut doit:

- etre trace
- etre valide
- renvoyer l'objet mis a jour

Transitions V1 retenues:

- `pending -> confirmed`
- `pending -> rejected`
- `pending -> cancelled`
- `confirmed -> completed`
- `confirmed -> cancelled`

## 10. Domaine admin - campagnes

## 10.1 Liste campagnes

Affichage minimum:

- code
- titre
- statut
- debut
- fin

## 10.2 Formulaire campagne

Champs minimum:

- code
- titre FR
- titre AR
- description FR
- description AR
- statut
- dates
- CTA FR
- CTA AR

## 10.3 Regles

- code unique
- dates coherentes
- statut enumere

## 11. Domaine admin - contenus

## 11.1 Cible

Permettre une edition pragmatique des contenus sans CMS lourd.

## 11.2 Zones recommandees a gerer en premier

- hero homepage
- bloc impact
- bloc support
- footer
- labels CTA

## 11.3 Forme d'edition

Approche recommandee:

- edition par sections
- affichage de la locale
- bouton publier / de-publier

## 12. Dashboard admin minimal

## 12.1 Objectif

Donner une vue utile, pas un dashboard gadget.

## 12.2 Widgets minimums

- demandes en attente
- demandes aujourd'hui
- prochaine campagne active
- lien rapide vers la liste des demandes

## 13. UI/UX admin

## 13.1 Direction visuelle

Le back-office ne doit pas recopier le marketing public.

Il doit etre:

- sobre
- dense mais lisible
- orienté tableaux et formulaires
- rapide a utiliser

## 13.2 Composants cibles

- tableau
- filtres
- badges de statut
- formulaires admin
- panneaux de detail

## 13.3 Accessibilite minimale

- champs labels
- navigation clavier
- contraste correct
- tableaux lisibles

## 14. Validation et securite backend admin

## 14.1 Validation

Toutes les mutations admin doivent etre validees:

- payload campagne
- payload contenu
- payload changement statut

## 14.2 Securite

- routes admin protegees
- verification de session ou token
- verification role minimale
- journalisation des actions sensibles

## 14.3 Audit recommande

Actions a tracer:

- login
- changement de statut demande
- creation / modification campagne
- modification contenu

## 15. Ordre d'implementation recommande

## Bloc A - Auth admin

1. collection `admin_users`
2. login endpoint
3. middleware auth admin
4. page login admin

## Bloc B - Liste des demandes

1. endpoint liste appointments admin
2. page liste
3. filtres
4. badges statuts

## Bloc C - Detail demande

1. endpoint detail
2. page detail
3. affichage checklist et remarques

## Bloc D - Changement de statut

1. endpoint `PATCH status`
2. action UI
3. refresh local et feedback utilisateur

## Bloc E - Campagnes

1. endpoints campaigns admin
2. liste campagnes
3. formulaire campagne

## Bloc F - Contenus

1. endpoints content admin
2. page contenu
3. edition par section

## 16. Tests recommandes

## 16.1 Backend

- login admin valide
- acces refuse sans auth
- listing appointments retourne `200`
- changement statut retourne donnees a jour
- creation campagne invalide retourne `422`

## 16.2 Frontend

- login affiche erreur si identifiants faux
- liste appointments charge
- filtres modifient la liste
- changement statut remonte visuellement
- edition campagne fonctionne

## 17. Risques principaux

### Risque 1 - Admin trop ambitieux

Effet:

- ralentissement fort
- dette fonctionnelle

Mitigation:

- commencer par demandes + statuts + campagnes + contenu minimal

### Risque 2 - Mauvaise securisation

Effet:

- exposition d'actions sensibles

Mitigation:

- auth minimale correcte des le debut
- middleware admin obligatoire

### Risque 3 - Couplage fort public/admin

Effet:

- regressions

Mitigation:

- namespace clair
- composants admin separes

## 18. Criteres d'acceptation de la phase 6

La phase 6 est complete si:

- l'admin login existe
- les demandes sont listables et consultables
- les statuts sont modifiables
- les campagnes sont gerables
- certains contenus publics sont editables
- les routes admin sont protegees

## 19. Dependances de la phase

Cette phase depend de:

- noyau public stable
- modele de donnees stable
- backend public deja fonctionnel

## 20. Suite logique

Apres cette phase, les suites les plus utiles sont:

1. phase 7 detaillee pour stabilisation, tests, deploiement et observabilite
2. execution reelle des repos
3. ajout progressif de fonctions admin avancees
