# Phase 6 extension V2 - Jours off, plages horaires et pas de 15 minutes

## 1. Objectif

Cette extension repond a 4 limites concretes du calendrier admin actuel :

1. il est encore trop difficile de declarer des jours totalement off comme les jours feries
2. la saisie des regles hebdomadaires reste trop fine et trop manuelle
3. l'heure est geree par creneau unitaire, alors que le metier raisonne souvent en plages horaires
4. il manque une vraie logique de recurrence par jours selectionnes, notamment pour les week-ends

Le but n'est pas de remplacer toute la base calendrier deja construite.
Le but est d'ajouter une couche UX et metier beaucoup plus exploitable pour l'equipe du centre.

---

## 2. Probleme actuel

Aujourd'hui, l'admin peut :

- ajouter un creneau
- modifier un creneau
- fermer une journee
- reouvrir une journee
- editer des regles hebdomadaires ligne par ligne

Mais il ne peut pas encore faire proprement ces operations metier :

- dire "tous les vendredis sont fermes"
- dire "le samedi et le dimanche sont off"
- dire "le 1er novembre est ferie"
- dire "le lundi, ouvrir de 08:00 a 12:00 toutes les 15 minutes"
- dire "du mardi au jeudi, ouvrir de 13:00 a 16:30"

Consequence :

- trop de clics
- trop de micro-saisie
- risque d'erreur elevé
- faible lisibilite metier

---

## 3. Decision produit recommandee

Je recommande de faire evoluer le calendrier admin vers 3 notions tres explicites :

1. `Regles recurrentes`
2. `Exceptions de date`
3. `Generateur de creneaux par plage horaire`

### 3.1 Regles recurrentes

Une regle recurrente definit :

- un ou plusieurs jours de semaine
- une plage horaire
- un pas de generation
- une capacite par creneau
- un statut par defaut

Exemple :

- jours : lundi, mardi, mercredi
- plage : 08:00 -> 12:00
- pas : 15 min
- capacite : 3
- statut : open

Cette regle doit generer :

- 08:00
- 08:15
- 08:30
- 08:45
- ...
- 11:45

### 3.2 Exceptions de date

Une exception permet de casser la recurrence pour une date precise.

Exemples :

- `2026-11-01` : jour ferie, centre ferme
- `2026-12-08` : fermeture exceptionnelle
- `2026-07-14` : ouverture reduite
- `2026-06-20` : campagne speciale, horaires differents

### 3.3 Generateur de creneaux

On ne demande plus a l'admin de saisir chaque creneau un par un.
On lui demande une `plage`, puis le systeme genere automatiquement les horaires.

---

## 4. Nouveau modele metier recommande

## 4.1 Regle recurrente

Nouvelle notion recommandee :

- `slot_rule_templates`

Champs recommandes :

- `daysOfWeek: number[]`
- `startTime: string`
- `endTime: string`
- `intervalMinutes: 15 | 30 | 45 | 60`
- `capacity: number`
- `isActive: boolean`
- `defaultStatus: open | blocked | closed`
- `donationTypes?: string[]`
- `label?: string`

Exemple :

```json
{
  "daysOfWeek": [1, 2, 3, 4],
  "startTime": "08:00",
  "endTime": "12:00",
  "intervalMinutes": 15,
  "capacity": 3,
  "isActive": true,
  "defaultStatus": "open"
}
```

## 4.2 Exception de date

La collection d'override existe deja, mais il faut l'assumer comme vraie couche metier.

Cas a couvrir :

- fermeture totale d'une date
- reouverture partielle
- remplacement d'horaires
- blocage partiel

### Cas special : jour ferie

Deux options possibles :

1. `day_off_overrides`
2. reposer sur les overrides existants en marquant toute la date comme `closed`

Recommandation V1.5 :

- ne pas creer une nouvelle collection si ce n'est pas necessaire
- utiliser la logique existante d'override par date
- mais ajouter un type d'action admin clair :
  - `Marquer comme jour off`
  - `Marquer comme jour ferie`

Le comportement final est le meme :

- tous les creneaux publics du jour deviennent indisponibles

---

## 5. Regles de generation recommandees

## 5.1 Pas de 15 minutes

Regle obligatoire recommandee :

- toutes les heures saisies doivent etre normalisees sur le quart d'heure le plus proche

Exemples :

- `08:02` -> `08:00`
- `08:07` -> `08:15`
- `08:28` -> `08:30`
- `08:59` -> `09:00`

Recommandation UX :

- mieux vaut empecher la mauvaise saisie que la corriger silencieusement

Donc :

- soit on propose seulement des valeurs compatibles
- soit on normalise au blur avec message discret

La meilleure option ici est :

- `Select` ou `Combobox` d'heures deja arrondies
- generation basee sur listes valides

## 5.2 Plage horaire

Une plage horaire est definie par :

- `startTime`
- `endTime`
- `intervalMinutes`

Regles :

- `endTime` doit etre strictement apres `startTime`
- les horaires generes s'arretent avant `endTime`
- tous les points generes sont normalises

Exemple :

- debut `08:00`
- fin `10:00`
- pas `15`

Genere :

- `08:00`
- `08:15`
- `08:30`
- `08:45`
- `09:00`
- `09:15`
- `09:30`
- `09:45`

## 5.3 Week-ends et jours selectionnes

Au lieu d'un simple champ `weekday`, il faut permettre :

- selection d'un ou plusieurs jours
- raccourcis :
  - `Lun-Ven`
  - `Week-end`
  - `Tous les jours`

Representation interne :

- `daysOfWeek: number[]`

Convention :

- `0 = dimanche`
- `1 = lundi`
- `...`
- `6 = samedi`

---

## 6. UX admin recommandee

## 6.1 Page calendrier

Garder la page :

- `/admin/calendar`

Mais la faire evoluer avec 3 blocs :

1. `Vue calendrier`
2. `Regles recurrentes`
3. `Exceptions et jours off`

## 6.2 Bloc Regles recurrentes

Au lieu d'editer ligne par ligne des creneaux, proposer un vrai formulaire de regle :

- nom optionnel
- jours selectionnes
- heure de debut
- heure de fin
- intervalle
- capacite
- statut par defaut

Composants recommandes :

- `Card`
- `Sheet`
- `Select`
- `Input`
- `ToggleGroup` ou groupe de boutons
- `Checkbox`
- `Badge`
- `Table`

Ne pas recreer ces composants maison.

## 6.3 Bloc Jours off / jours feries

Ajouter un bloc dedie dans le panneau du jour ou dans un `Sheet` :

- bouton `Marquer comme jour off`
- bouton `Marquer comme jour ferie`
- champ `motif`
- affichage clair du statut du jour

Composants recommandes :

- `AlertDialog`
- `Dialog`
- `Textarea`
- `Badge`

## 6.4 Bloc Generation rapide

Ajouter une action :

- `Generer une plage`

Elle ouvre un `Sheet` ou `Dialog` avec :

- selection des jours
- debut
- fin
- pas
- capacite
- apercu des horaires generes

Puis :

- `Enregistrer la regle`

---

## 7. Composants existants a reutiliser

Je recommande de rester strictement sur des composants deja existants ou deja compatibles avec le projet :

- `Calendar`
- `Card`
- `Sheet`
- `Dialog`
- `AlertDialog`
- `Select`
- `Input`
- `Checkbox`
- `ToggleGroup`
- `Badge`
- `Table`
- `Tabs`
- `Popover`

Et pour les dates :

- `Calendar` shadcn deja present

Et pour les heures :

- liste preconstruite des horaires par quart d'heure
- pas de time picker maison complexe

---

## 8. Plan d'implementation recommande

## Task A - Refondre la notion de regle recurrente

Objectif :

- sortir du mode `weekday + time` unitaire

Travail :

- introduire `daysOfWeek[]`
- introduire `startTime`
- introduire `endTime`
- introduire `intervalMinutes`
- introduire une fonction de generation des horaires

Implementation livree :

- modele `AppointmentSlotTemplate` passe a :
  - `daysOfWeek[]`
  - `startTime`
  - `endTime`
  - `intervalMinutes`
  - `capacity`
  - `isActive`
- service de generation des horaires par plage :
  - `generateQuarterHourTimeRange(...)`
  - `expandRecurringSlotTemplate(...)`
- resolution des slots publics/admin alignee sur ce nouveau modele
- validation admin `PUT /api/admin/calendar/templates` alignee sur ce format
- UI admin `Regles hebdomadaires` alignee sur :
  - multi-selection des jours
  - heure de debut
  - heure de fin
  - intervalle
  - capacite
  - actif/inactif

Implementation livree :

- modele backend de regle recurrente passe de `weekday + time` a `daysOfWeek + startTime + endTime + intervalMinutes`
- generation des horaires recurrente cote service
- adaptation des endpoints admin `templates`
- adaptation du calendrier admin pour afficher et editer ce nouveau format

## Task B - Ajouter la gestion explicite des jours off

Objectif :

- fermer une date en une seule action claire

Travail :

- action admin `jour off`
- action admin `jour ferie`
- raison optionnelle
- rendu public immediatement indisponible

Implementation livree :

- fermeture de journee enrichie avec `closureType`
- valeurs supportees :
  - `generic`
  - `day_off`
  - `holiday`
- persistance de `closureType` sur les overrides de fermeture
- badge metier visible dans le detail du jour admin
- actions admin distinctes :
  - `Jour off`
  - `Jour ferie`
- le rendu public reste indisponible des qu'une journee est fermee

## Task C - Refaire l'editeur des regles hebdomadaires

Objectif :

- remplacer la saisie ligne par ligne par une UX metier

Travail :

- formulaire de plage horaire
- multi-selection des jours
- select d'intervalle
- preview des horaires generes

Implementation livree :

- edition des heures via `Select` sur quarts d'heure valides
- plus de saisie libre pour les heures de debut et fin
- multi-selection des jours conservee dans le `Sheet`
- previsualisation immediate des creneaux generes
- compteur du nombre de creneaux produits par la plage
- message d'erreur UX si la plage ne genere aucun creneau

## Task D - Ajouter des raccourcis de recurrence

Objectif :

- accelerer la saisie

Travail :

- `Lun-Ven`
- `Week-end`
- `Tous les jours`

Implementation livree :

- raccourcis visibles dans le `Sheet` des regles hebdomadaires
- preselection rapide des jours pour :
  - `Lun-Ven`
  - `Week-end`
  - `Tous les jours`
- conservation du mode manuel si l'admin veut affiner ensuite jour par jour

## Task E - QA metier

Cas a couvrir :

- generation 15 min correcte
- arrondi correct
- week-end correctement applique
- jour ferie invisible cote public
- priorite `exception date > regle recurrente`
- regle inactive non exposee publiquement

Verification couverte :

- generation 15 min verifiee dans le service de generation des plages
- UI admin bornee a des quarts d'heure valides
- preset `Week-end` verifie dans l'editeur des regles
- fermeture `holiday` verifiee cote public comme indisponible
- priorite `override > template` verifiee au merge
- regle inactive verifiee comme non exposee

---

## 9. Recommendation finale

La bonne logique pour ce projet est :

- l'admin raisonne en `plages horaires`
- le systeme genere les creneaux
- les `jours off / jours feries` sont des exceptions fortes
- les exceptions de date priment toujours sur les regles recurrentes

Donc si je devais fixer la prochaine vraie iteration calendrier, je la ferais comme ceci :

1. jours off / jours feries
2. regles recurrentes par plage horaire
3. pas de 15 minutes
4. multi-selection des jours
5. preview avant sauvegarde

C'est l'option la plus propre metierement, la plus simple pour l'equipe admin, et la plus coherente avec l'architecture deja en place.
