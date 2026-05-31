# Phase 6 extension - Age 18+, calendrier admin et gestion des creneaux

## 1. Objectif

Cette extension complete la phase 6 admin avec 3 besoins metier tres concrets :

1. verifier automatiquement que le donneur a au moins 18 ans dans le formulaire public
2. permettre a l'equipe admin de definir, ouvrir, fermer et ajuster les creneaux de rendez-vous
3. ajouter une vraie page calendrier dans l'admin pour piloter visuellement les disponibilites et les demandes

Le but n'est pas de refaire toute la reservation. Le but est de faire evoluer l'existant vers une logique de production plus credible pour un centre de transfusion.

---

## 2. Constat sur l'etat actuel

### 2.1 Formulaire public

Aujourd'hui :

- `birthDate` est bien collecte dans le formulaire
- il existe une checklist d'eligibilite avec `ageConfirmed`
- le frontend et le backend ne font pas encore de controle metier strict a partir de la date de naissance

Consequence :

- un utilisateur peut cocher `ageConfirmed`
- mais rien ne garantit encore systematiquement qu'il a bien 18 ans ou plus au sens metier

### 2.2 Creneaux

Aujourd'hui :

- `GET /api/public/appointment-slots` renvoie une liste semi-statique
- tous les slots sont retournes comme disponibles
- l'admin ne peut pas encore :
  - ajouter des plages horaires
  - fermer un jour
  - reduire la capacite
  - bloquer un creneau
  - gerer des exceptions

### 2.3 Admin

Aujourd'hui :

- l'admin gere les demandes, campagnes, contenus
- il n'existe pas encore de page calendrier metier pour les rendez-vous

---

## 3. Decision produit recommandee

Je recommande une V1 de calendrier admin simple, solide et cohérente avec les composants deja en place.

### 3.1 Ce qu'on ne fait pas en V1

- pas de drag and drop complexe
- pas de planning medical multi-ressources
- pas de full scheduler hospitalier
- pas de recreation maison d'un gros composant calendrier

### 3.2 Ce qu'on fait en V1

- une page admin `Calendrier`
- une vue mois principale
- clic sur un jour => panneau lateral detail
- dans ce panneau :
  - liste des creneaux du jour
  - capacite par creneau
  - nombre de reservations
  - disponibilite restante
  - actions d'ouverture, fermeture, blocage, ajout, edition
- un systeme de regles simples :
  - modele hebdomadaire
  - exceptions par date
  - fermeture totale d'une date

Cette approche est beaucoup plus adaptee a la logique metier du projet qu'un calendrier generique tres lourd.

---

## 4. Regle metier pour l'age

## 4.1 Regle recommandee

Le formulaire doit refuser la soumission si le donneur a moins de 18 ans a la date du jour.

Regle V1 recommandee :

- `age >= 18` obligatoire
- le message d'erreur doit etre clair
- la validation doit exister :
  - en frontend pour le retour immediat
  - en backend pour la verite metier

Option metier future :

- ajouter aussi une borne haute si le centre le demande, par exemple `<= 65 ans`
- pour l'instant, comme ta demande cible le minimum 18 ans, la V1 peut se limiter a ce seuil

## 4.2 UX recommandee

Dans les informations personnelles :

- champ `Date de naissance`
- au blur ou a la soumission :
  - si moins de 18 ans, erreur inline
  - si date invalide, erreur inline

Message recommande :

- `Vous devez avoir au moins 18 ans pour faire une demande de rendez-vous.`

## 4.3 Implementation recommandee

### Frontend

Modifier :

- `front/src/features/appointment/schema/appointmentFormSchema.ts`

A ajouter :

- une fonction utilitaire `getAgeFromBirthDate(...)`
- une `superRefine(...)` qui refuse les dates < 18 ans

### Backend

Modifier :

- `back/src/modules/appointments/appointment.schema.ts`

A ajouter :

- la meme regle en validation metier
- idealement une fonction partagee de calcul d'age ou au minimum une logique equivalente cote serveur

### Tests

Ajouter :

- un test frontend schema
- un test backend schema
- un test HTTP qui verifie qu'un mineur recoit `422`

---

## 5. Logique metier recommandee pour les creneaux

## 5.1 Modele mental

Il faut separer 3 niveaux :

1. `Modele hebdomadaire`
2. `Exceptions par date`
3. `Reservations effectives`

### 1. Modele hebdomadaire

Exemple :

- lundi : 08:00, 08:30, 09:00, 09:30, 10:00
- mardi : 08:00, 08:30, 09:00
- mercredi : ferme

### 2. Exceptions par date

Exemple :

- `2026-06-10` : ferme exceptionnellement
- `2026-06-12` : ouverture speciale 14:00 - 17:00
- `2026-06-15` : capacite reduite

### 3. Reservations effectives

Exemple :

- slot `09:00` capacite `4`
- `3` demandes confirmees
- reste `1`

Cette separation est la plus saine pour le projet.

## 5.2 Ce qu'un creneau doit porter

Pour chaque creneau, il faut au minimum :

- date
- heure
- capacite max
- nombre reserve
- statut
- source

Statuts utiles :

- `open`
- `full`
- `blocked`
- `closed`

`source` utile pour savoir si le slot vient :

- du modele hebdomadaire
- d'une exception manuelle

## 5.3 Regles metier recommandees

- un slot `closed` n'apparait pas comme reservable
- un slot `blocked` existe encore en admin mais pas cote public
- un slot `full` est visible cote admin mais indisponible cote public
- le public ne voit que les slots `open` avec disponibilite restante

---

## 6. Page calendrier admin recommandee

## 6.1 Position dans la navigation

Ajouter une entree admin :

- `Calendrier`

Modifier :

- `front/src/components/admin/layout/AdminSidebar.tsx`

## 6.2 Route

Ajouter :

- `/admin/calendar`

Pages recommandees :

- `front/src/pages/admin/calendar/AdminCalendarPage.tsx`

## 6.3 Structure de page recommandee

### Colonne principale

- calendrier mensuel
- chaque jour affiche :
  - nombre de rendez-vous
  - nombre de slots ouverts
  - indicateur visuel de charge

### Panneau lateral droit

Quand un jour est selectionne :

- date choisie
- statut du jour
- liste des creneaux
- bouton `Ajouter un creneau`
- bouton `Fermer la journee`
- bouton `Appliquer le modele hebdomadaire`

### Zone d'actions

Selon le creneau :

- ouvrir
- bloquer
- fermer
- editer l'heure
- editer la capacite
- supprimer une exception

---

## 7. Composants a reutiliser

Il faut rester dans une logique `shadcn` et composants existants, pas reconstruire un calendrier maison trop complexe.

## 7.1 Composants recommandes

- `Calendar` : selection et vue mois
- `Card` : resume, stats, panneaux
- `Sheet` : edition rapide d'un jour ou d'un creneau
- `Dialog` / `AlertDialog` : confirmations critiques
- `Tabs` : vue `Jour`, `Regles`, `Exceptions`
- `Table` : liste des creneaux du jour
- `Badge` : statuts `ouvert`, `complet`, `bloque`, `ferme`
- `Select` : capacite, statut, modele
- `Popover` : edition simple
- `Input` : heure, capacite
- `Switch` : activer / desactiver
- `Separator`
- `Skeleton`

## 7.2 Composants a eviter pour la V1

- gros scheduler drag and drop recode a la main
- timeline maison multi-colonnes
- interactions complexes non necessaires au centre

---

## 8. Design UX recommande pour la page calendrier

## 8.1 Lecture rapide

Le calendrier doit permettre a l'operateur de comprendre en 3 secondes :

- quels jours sont fermes
- quels jours sont presque pleins
- quels jours ont encore de la disponibilite

## 8.2 Codage visuel recommande

- jour normal : neutre
- jour charge : amber
- jour complet : red
- jour ferme : slate
- jour selectionne : outline net + fond leger

## 8.3 Densite

Ne pas charger chaque case avec trop de texte.

Dans la case calendrier :

- numero du jour
- `x RDV`
- `y slots`

Le detail doit vivre dans le panneau lateral, pas dans la cellule.

---

## 9. Donnees a ajouter cote back

## 9.1 Nouvelles collections recommandees

### `slot_templates`

But :

- stocker le modele hebdomadaire

Champs recommandes :

- `weekday`
- `startTime`
- `endTime`
- `capacity`
- `isActive`
- `donationTypes`

### `slot_overrides`

But :

- exceptions par date

Champs recommandes :

- `date`
- `time`
- `capacity`
- `status`
- `reason`
- `campaignCode?`

### Option alternative plus simple

Si on veut aller vite en V1 :

- une seule collection `appointment_slots`
- un document par `date + time`
- avec generation initiale depuis un seed ou un script admin

Cette alternative marche, mais elle est moins elegante si on veut une vraie logique de recurrence.

## 9.2 Recommandation

Je recommande :

- V1.1 simple : `appointment_slots` materialises
- V1.2 propre : `slot_templates + slot_overrides`

Pour ton projet, si l'objectif est d'aller vite mais proprement, on peut directement partir sur :

- `slot_templates`
- `slot_overrides`

et calculer les slots affiches a partir de ces deux sources plus les reservations.

---

## 10. Endpoints recommandes

## 10.1 Public

### `GET /api/public/appointment-slots`

Doit evoluer pour :

- calculer la vraie disponibilite
- filtrer les slots fermes / bloques
- retourner la capacite restante

Payload recommande :

```json
{
  "data": {
    "date": "2026-06-15",
    "slots": [
      {
        "value": "08:00",
        "label": "08:00",
        "isAvailable": true,
        "remainingCapacity": 2,
        "status": "open"
      }
    ]
  }
}
```

## 10.2 Admin calendrier

### `GET /api/admin/calendar/month?month=2026-06`

Retourne :

- resume par jour
- nombre de rendez-vous
- nombre de slots ouverts
- charge

### `GET /api/admin/calendar/day?date=2026-06-15`

Retourne :

- detail de la journee
- liste des creneaux
- capacites
- reservations

### `POST /api/admin/calendar/slots`

Creer un slot manuel.

### `PATCH /api/admin/calendar/slots/:id`

Modifier heure, capacite, statut.

### `POST /api/admin/calendar/day/close`

Fermer toute une journee.

### `POST /api/admin/calendar/day/reopen`

Reouvrir une journee.

### `PUT /api/admin/calendar/templates`

Modifier le modele hebdomadaire.

---

## 11. Plan d'execution recommande

## Task 1 - Validation 18+ de bout en bout

Objectif :

- rendre la regle d'age fiable et bloquante

Travail :

- ajouter validation frontend
- ajouter validation backend
- ajouter messages UX
- ajouter tests

Livrables :

- schema `front` mis a jour
- schema `back` mis a jour
- tests unitaires et HTTP

Statut :

- execute

Implementation livree :

- validation frontend sur `birthDate`
- validation backend sur `birthDate`
- message bloquant si le donneur a moins de 18 ans
- tests frontend schema + formulaire
- tests backend schema + HTTP

## Task 2 - Refactor du moteur de slots

Objectif :

- sortir du modele purement statique

Travail :

- introduire la notion de capacite
- introduire la notion de statut
- calculer disponibilite restante

Livrables :

- service slots metier
- endpoint public enrichi
- seeds de test

Statut :

- execute

Implementation livree :

- capacite par creneau introduite dans le moteur actuel
- calcul de `reservedCount` et `remainingCapacity`
- statuts `open` / `full` exposes par l'API publique
- protection de la creation d'un rendez-vous si le creneau est plein

## Task 3 - Structures de persistence des creneaux

Objectif :

- donner une base adminifiable aux horaires

Travail :

- creer `slot_templates`
- creer `slot_overrides`
- indexer `date + time`

Livrables :

- models Mongoose
- tests modele/service

Statut :

- execute

Implementation livree :

- collection `appointment_slot_templates`
- collection `appointment_slot_overrides`
- indexes `weekday + time` et `date + time`
- service de resolution `template + override`
- fallback sur les templates par defaut si la base n'est pas encore remplie

## Task 4 - Endpoints admin calendrier

Objectif :

- permettre a l'admin de lire et modifier les disponibilites

Travail :

- endpoints mois
- endpoints jour
- create/update slot
- close/reopen day
- update templates

Livrables :

- routes admin calendrier
- validation Zod
- tests API

Statut :

- execute

Implementation livree :

- routes admin `month`, `day`, `slots`, `day/close`, `day/reopen`, `templates`
- validation Zod pour queries et payloads
- droits lecture `operator+`
- droits ecriture `manager+`

## Task 5 - Page admin `Calendrier`

Objectif :

- apporter une vraie interface metier exploitable

Travail :

- ajouter route `/admin/calendar`
- ajouter item sidebar
- construire vue mois
- panneau lateral detail du jour

Livrables :

- page calendrier admin
- composants reutilisables
- etats loading/empty/error

Statut :

- execute

Implementation livree :

- route `front` `/admin/calendar`
- entree `Calendrier` dans la sidebar admin
- vue mois avec composant `Calendar`
- detail du jour avec resume et table des creneaux
- lecture des regles hebdomadaires existantes
- etats `loading`, `empty`, `error`

## Task 6 - Edition des creneaux

Objectif :

- permettre la gestion fine des horaires

Travail :

- dialog ou sheet `Ajouter un creneau`
- dialog ou sheet `Modifier un creneau`
- confirmation pour fermeture / blocage

Livrables :

- CRUD minimal creneaux
- confirmations critiques

Statut :

- execute

Implementation livree :

- ajout de creneau depuis la page calendrier
- edition d'un creneau ou d'une exception existante
- fermeture de journee avec confirmation
- reouverture de journee avec confirmation
- confirmation complementaire pour les statuts sensibles `blocked` et `closed`

## Task 7 - Regles hebdomadaires

Objectif :

- eviter la saisie manuelle jour par jour

Travail :

- editer les horaires type par jour de semaine
- appliquer a venir

Livrables :

- ecran ou onglet `Modeles hebdomadaires`
- persistance

Implementation livree :

- bouton `Modifier les regles` dans la carte `Regles hebdomadaires`
- `Sheet` d'edition des regles recurrentes
- ajout et suppression de lignes de regles
- edition du jour, de l'heure, de la capacite et de l'etat actif/inactif
- sauvegarde groupee via `PUT /api/admin/calendar/templates`
- rechargement des vues calendrier apres enregistrement

## Task 8 - QA metier

Objectif :

- verifier que la logique tient en vrai

Cas a tester :

- mineur refuse
- adulte accepte
- slot complet invisible cote public
- jour ferme invisible cote public
- changement admin refleche sur le formulaire public
- exception date prioritaire sur modele hebdomadaire

Verification couverte :

- mineur refuse en validation `front` et HTTP `back`
- adulte accepte via creation de demande `201`
- slot plein retourne `isAvailable: false` et conflit `409` a la reservation
- slots `blocked` et `closed` non selectionnables cote public
- les reponses de l'API admin/public pilotent bien les options visibles dans le formulaire
- la priorite `exception date > modele hebdomadaire` reste couverte par le merge service

## Suite recommandee

Pour la prochaine iteration metier du calendrier admin, voir :

- `docs/phases/phase-06-extension-calendrier-v2-plages-feries.md`

Cette suite couvre :

- jours off et jours feries
- plages horaires
- pas de 15 minutes
- multi-selection des jours
- UX admin plus adaptee au metier

---

## 12. Proposition concrete pour la page admin calendrier

## 12.1 Sidebar

Ajouter :

- `Calendrier`

Icône recommandee :

- `CalendarDays`

## 12.2 Header de page

- titre : `Calendrier des rendez-vous`
- sous-titre : `Pilotage des disponibilites et des demandes`
- actions :
  - `Ajouter un creneau`
  - `Fermer une journee`

## 12.3 Corps de page

### Bloc gauche

- `Card`
- composant `Calendar`

### Bloc droit

- `Card`
- date selectionnee
- stats du jour
- table des creneaux

### Bloc bas ou onglet secondaire

- `Tabs`
  - `Jour`
  - `Modele hebdomadaire`
  - `Exceptions`

---

## 13. Pourquoi cette solution est la bonne pour ce projet

Parce qu'elle respecte la logique metier reelle :

- un centre a besoin de piloter des disponibilites
- pas seulement d'avoir une liste d'heures codées en dur

Parce qu'elle respecte aussi ton contexte technique :

- reutilisation de composants existants
- compatibilite avec l'admin deja en place
- complexite controlee

Parce qu'elle prepare une vraie production :

- regles claires
- administration des horaires
- calcul de disponibilite fiable
- meilleur controle du parcours rendez-vous

---

## 14. Recommandation finale

Je recommande de faire cette extension dans cet ordre :

1. validation 18+ frontend + backend
2. refonte metier des slots
3. endpoints admin calendrier
4. page admin `Calendrier`
5. regles hebdomadaires

C'est l'ordre le plus propre, parce qu'il renforce d'abord la validite du parcours public, puis donne enfin a l'equipe admin le moyen de gerer les horaires au lieu de subir une liste statique.
