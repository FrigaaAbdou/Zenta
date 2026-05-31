# Phase 6 - Task 1 - Scope, roles et etats admin V1

## 1. Objet

Ce document fige le scope metier exact de la phase 6 avant implementation.

Le but est d'eviter:

- une phase admin trop ambitieuse
- des statuts mouvants
- des permissions implicites
- des endpoints ou ecrans inutiles en V1

## 2. Scope V1 inclus

Le back-office V1 inclut:

- `AdminLoginPage`
- `AdminDashboardPage`
- `AdminAppointmentsListPage`
- `AdminAppointmentDetailPage`
- `AdminCampaignsPage`
- `AdminContentPage`

Et cote API:

- auth admin minimale
- lecture session courante
- liste/detail des demandes
- changement de statut
- liste/creation/edition campagnes
- lecture/edition contenus publics principaux

## 3. Hors scope V1

Ne fait pas partie de la phase 6:

- reset password complet
- invitation email admin
- gestion multi-etablissements
- permissions fines par champ
- workflow editorial complexe
- analytics avancees
- audit complet par champ
- historique riche avec timeline complete

## 4. Roles admin V1

## 4.1 `super_admin`

Acces complet sur:

- auth
- demandes
- statuts
- campagnes
- contenus
- configuration admin future

## 4.2 `manager`

Acces sur:

- lecture et detail des demandes
- changement de statut
- gestion campagnes
- edition contenus

Pas d'acces a:

- administration systeme avancee
- gestion complete des autres comptes si non ajoutee explicitement plus tard

## 4.3 `operator`

Acces sur:

- lecture liste/detail demandes
- changement limite de certains statuts

Pas d'acces a:

- creation/edition campagnes
- edition contenus
- fonctions super_admin

## 5. Table permissions V1

| Action | super_admin | manager | operator |
|---|---|---|---|
| login admin | oui | oui | oui |
| voir dashboard | oui | oui | oui |
| voir liste demandes | oui | oui | oui |
| voir detail demande | oui | oui | oui |
| changer statut demande | oui | oui | limite |
| voir campagnes | oui | oui | non |
| creer campagne | oui | oui | non |
| modifier campagne | oui | oui | non |
| voir contenus | oui | oui | non |
| modifier contenus | oui | oui | non |

## 6. Etats de demande V1

Les statuts admin V1 sont figes a:

- `pending`
- `confirmed`
- `rejected`
- `completed`
- `cancelled`

## 7. Signification de chaque statut

### `pending`

Demande recue, pas encore traitee.

### `confirmed`

Demande validee par l'equipe. Le rendez-vous est considere comme accepte.

### `rejected`

Demande refusee ou invalidee par l'equipe.

### `completed`

Demande finalisee apres realisation effective du parcours cible.

### `cancelled`

Demande annulee apres creation, soit par contexte operationnel, soit par suivi humain.

## 8. Transitions autorisees

### Depuis `pending`

Transitions autorisees:

- `confirmed`
- `rejected`
- `cancelled`

### Depuis `confirmed`

Transitions autorisees:

- `completed`
- `cancelled`

### Depuis `rejected`

Transitions autorisees:

- aucune en V1

### Depuis `completed`

Transitions autorisees:

- aucune en V1

### Depuis `cancelled`

Transitions autorisees:

- aucune en V1

## 9. Restrictions par role sur les transitions

### `super_admin`

Peut executer toutes les transitions autorisees par le systeme.

### `manager`

Peut executer toutes les transitions autorisees par le systeme.

### `operator`

Peut executer seulement:

- `pending -> confirmed`
- `pending -> rejected`

Il ne peut pas:

- creer ou editer une campagne
- modifier le contenu
- marquer `completed`
- annuler une demande deja `confirmed`

## 10. Ecrans V1 a livrer

## 10.1 `AdminLoginPage`

Fonction:

- ouvrir une session admin

## 10.2 `AdminDashboardPage`

Fonction:

- fournir une lecture rapide des indicateurs utiles

## 10.3 `AdminAppointmentsListPage`

Fonction:

- lister, filtrer et rechercher les demandes

## 10.4 `AdminAppointmentDetailPage`

Fonction:

- comprendre une demande et changer son statut si autorise

## 10.5 `AdminCampaignsPage`

Fonction:

- lister, creer, editer et activer les campagnes

## 10.6 `AdminContentPage`

Fonction:

- editer les contenus publics structurants en `fr/ar`

## 11. Endpoints V1 attendus

### Auth

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/logout`

### Demandes

- `GET /api/admin/appointments`
- `GET /api/admin/appointments/:id`
- `PATCH /api/admin/appointments/:id/status`

### Campagnes

- `GET /api/admin/campaigns`
- `POST /api/admin/campaigns`
- `PATCH /api/admin/campaigns/:id`

### Contenus

- `GET /api/admin/content`
- `PATCH /api/admin/content/:id`

## 12. Donnees minimales attendues par ecran

### Liste demandes

- nom
- prenom
- telephone
- campagne
- date rendez-vous
- heure
- type de don
- statut

### Detail demande

- informations donneur
- informations rendez-vous
- checklist eligibilite
- remarques
- statut courant

### Campagnes

- code
- titres FR/AR
- statuts publication/activite
- dates
- priorite

### Contenus

- section
- contenu FR
- contenu AR
- etat publie / non publie

## 13. Critere de fermeture du Task 1

Le Task 1 est ferme si:

- les ecrans V1 sont figes
- les roles V1 sont figes
- les permissions V1 sont explicites
- les statuts V1 sont figes
- les transitions autorisees sont explicites
- le hors-scope V1 est ferme
