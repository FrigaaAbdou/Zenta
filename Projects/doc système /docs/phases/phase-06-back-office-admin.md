# Phase 6 - Back-office admin

## 1. Objet de la phase

Cette phase decrit la mise en place du back-office admin qui permettra d'exploiter l'application en conditions proches de la production.

L'objectif est de fournir un espace reserve a l'equipe du centre pour:

- consulter les demandes de rendez-vous
- mettre a jour leur statut
- gerer les campagnes
- gerer les contenus publics
- consulter des informations de pilotage simples

Cette phase arrive volontairement apres les phases publiques, afin que l'admin repose sur un noyau metier deja stable.

## 2. Resultat attendu

A la fin de la phase 6, l'application doit disposer:

- d'un espace admin separe du site public
- d'une authentification admin minimale
- d'une vue liste des demandes
- d'une vue detail de demande
- d'actions de changement de statut
- d'une gestion simple des campagnes
- d'une gestion simple des contenus publics

## 3. Perimetre

### Inclus

- auth admin minimale
- routes admin frontend
- endpoints admin backend
- liste et detail des demandes
- mise a jour de statut
- gestion campagnes
- gestion de certains contenus publics

### Hors perimetre

- role matrix complexe
- workflow d'approbation editorial avance
- gestion multi-etablissements
- analytics poussees
- permissions fines par champ

## 4. Positionnement du back-office

Le back-office ne doit pas etre pense comme un produit secondaire mal structure.

Il doit:

- prolonger proprement le modele metier deja etabli
- consommer les memes concepts que le public
- respecter une logique de securite separee

Il doit aussi rester pragmatique:

- utile vite
- sobre visuellement
- axe productivite plus que branding

## 5. Capacites fonctionnelles cibles

## 5.1 Gestion des demandes de rendez-vous

L'admin doit pouvoir:

- voir la liste des demandes
- filtrer par statut
- filtrer par date
- rechercher par nom ou telephone
- ouvrir le detail d'une demande
- changer le statut

## 5.2 Gestion des campagnes

L'admin doit pouvoir:

- lister les campagnes
- creer une campagne
- modifier une campagne
- activer / desactiver une campagne

## 5.3 Gestion des contenus publics

L'admin doit pouvoir:

- consulter les contenus structurants
- modifier les contenus principaux
- publier / de-publier un contenu

## 5.4 Pilotage simple

L'admin peut afficher des indicateurs simples:

- nombre de demandes en attente
- nombre de demandes par jour
- campagne active

## 6. Architecture frontend admin

## 6.1 Positionnement du repo

Deux options sont possibles:

1. admin dans le meme repo `front`
2. admin dans un repo separe

Recommendation:

- garder l'admin dans le meme repo `front` au depart
- le separer par namespace de routes et par layout

Pourquoi:

- plus simple a maintenir
- partage des primitives UI
- pas de duplication inutile

## 6.2 Routes admin recommandees

- `/admin/login`
- `/admin`
- `/admin/appointments`
- `/admin/appointments/:id`
- `/admin/campaigns`
- `/admin/campaigns/new`
- `/admin/campaigns/:id`
- `/admin/content`

## 6.3 Structure de dossiers frontend admin

```text
front/src/
  pages/
    admin/
      login/
      dashboard/
      appointments/
      campaigns/
      content/
  components/
    admin/
      layout/
      appointments/
      campaigns/
      content/
  features/
    admin-auth/
    admin-appointments/
    admin-campaigns/
    admin-content/
```

## 6.4 Composants frontend admin a prevoir

- `AdminLayout`
- `AdminSidebar`
- `AdminTopbar`
- `AppointmentTable`
- `AppointmentFilters`
- `AppointmentStatusBadge`
- `AppointmentDetailCard`
- `CampaignForm`
- `CampaignList`
- `ContentEditorPanel`

## 7. Architecture backend admin

## 7.1 Namespace API

Tous les endpoints admin doivent vivre sous:

- `/api/admin`

## 7.2 Modules backend concernes

Modules a etendre:

- `admin`
- `appointments`
- `campaigns`
- `content`

## 7.3 Endpoints admin prioritaires

### Auth

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`

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

## 8. Authentification admin minimale

## 8.1 Objectif

Empêcher tout acces public a l'espace de gestion.

## 8.2 Solution recommandee V1

Approche simple:

- login par email/mot de passe
- session HTTP securisee ou JWT httpOnly selon la strategie choisie

Recommendation pragmatique:

- session cookie ou token httpOnly simple

## 8.3 Collection `admin_users`

La collection doit couvrir:

- identite admin
- email
- hash mot de passe
- role
- actif / inactif

## 8.4 Roles minimaux recommandes

- `super_admin`
- `manager`
- `operator`

## 8.5 Permissions minimales par role

### `super_admin`

- acces complet

### `manager`

- gestion demandes
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
