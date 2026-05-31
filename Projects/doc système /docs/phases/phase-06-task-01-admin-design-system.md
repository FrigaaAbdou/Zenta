# Phase 6 - Task 1 - Admin design system V1

## 1. Objet

Ce document fige le design system du back-office admin V1 avant implementation.

Le but est d'eviter un admin construit "au fil de l'eau" avec:

- des pages heterogenes
- des composants incoherents
- un melange entre UI publique et UI operationnelle

Ce document est la reference UI a suivre pendant toute la phase 6.

## 2. Positionnement

Le back-office doit ressembler a un produit de travail moderne:

- lisible immediatement
- dense sans etre etouffant
- tres rapide a scanner
- sobre, stable, institutionnel

Il ne doit pas:

- recopier la hero section publique
- utiliser de grands aplats rouges
- empiler des cards partout
- donner une impression de prototype

## 3. Direction visuelle retenue

### 3.1 Ambiance

Le rendu cible est:

- propre
- lumineux
- professionnel
- medical/institutionnel contemporain
- orienté tableaux, filtres et actions

### 3.2 Palette

- `background`: blanc ou gris tres pale
- `surface`: blanc net
- `surface-muted`: gris tres leger
- `text-primary`: gris tres fonce
- `text-secondary`: gris neutre ou bleute
- `border`: gris clair
- `accent-primary`: `#e7000b`
- `success`: vert fonctionnel
- `warning`: ambre fonctionnel
- `danger`: rouge critique reserve aux erreurs/alertes

### 3.3 Regles couleur

Le rouge sert a:

- l'action primaire
- l'entree active de sidebar
- certains badges de statut
- certains points d'attention

Le rouge ne doit pas servir a:

- colorer tout le shell
- faire des fonds agressifs
- remplacer toute hiararchie visuelle

### 3.4 Typographie

La famille typographique doit rester coherente avec le front actuel.

Mais l'usage change:

- titres plus utilitaires
- chiffres KPI plus francs
- texte secondaire plus compact
- labels de filtres et d'etat tres lisibles

## 4. Architecture visuelle du shell admin

## 4.1 Shell global

Le shell admin V1 suit ce modele:

```text
+---------------------------------------------------------------+
| Sidebar fixe | Topbar                                         |
|              +------------------------------------------------+
|              | Header de page + actions                       |
|              +------------------------------------------------+
|              | KPI / filtres / tabs / contexte                |
|              +------------------------------------------------+
|              | Table, detail, panneaux d'edition              |
+---------------------------------------------------------------+
```

## 4.2 Sidebar

La sidebar est l'epine dorsale du produit.

Elle doit etre:

- persistante sur desktop
- transformee en `Sheet` sur petit ecran
- claire, courte, orientee workflow

Navigation V1:

- `Dashboard`
- `Demandes`
- `Campagnes`
- `Contenus`

Etat actif:

- marque par accent rouge discret
- fond ou bord tres leger
- jamais par un aplat rouge massif

## 4.3 Topbar

La topbar doit rester fine et utile.

Elements possibles:

- titre de contexte
- recherche admin
- avatar / nom du compte
- action logout

La topbar ne doit pas devenir une deuxieme navbar lourde.

## 4.4 Header de page

Chaque ecran principal doit avoir un `AdminPageHeader` uniforme:

- titre
- description courte
- actions principales a droite

Exemples:

- `Demandes de rendez-vous`
- `Campagnes`
- `Contenus publics`

## 5. Hierarchie des surfaces

## 5.1 Surfaces principales

- shell
- page body
- KPI cards
- table surface
- detail surface
- sheet d'edition
- dialog de confirmation

## 5.2 KPI cards

Les KPI cards servent uniquement a la synthese.

Elles doivent etre:

- peu nombreuses
- tres lisibles
- compactes
- visuellement stables

Le KPI n'est pas un element decoratif.

## 5.3 Table surface

La `Table` est la surface principale de l'admin demandes.

Regles:

- densite serieuse mais respirante
- colonnes stables
- badges de statut lisibles
- menu d'action de ligne discret

On ne transforme pas une vraie liste metier en grille de cards.

## 5.4 Detail surface

Le detail d'une demande doit pouvoir exister:

- en page dediee
- ou en panneau secondaire selon le besoin

Le detail doit montrer:

- donneur
- rendez-vous
- eligibilite
- remarques
- statut
- historique simple

## 5.5 Edition surface

L'edition campagne / contenu doit privilegier:

- `Sheet` pour edition contextuelle
- page dediee si le formulaire devient trop dense

Les gros `Dialog` centre ecran sont a eviter pour l'edition principale.

## 6. Composants `shadcn` retenus

## 6.1 Composants coeur a installer

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

## 6.2 Regles de composition

- listes metier: `Table`
- filtres: `Input`, `Select`, `Tabs` si necessaire
- statut: `Badge`
- confirmations: `Dialog`
- edition laterale: `Sheet`
- vide/chargement: `Alert`, `Skeleton`, empty state dedie

## 6.3 Composants metier a construire

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

## 7. Ecrans cibles et comportement visuel

## 7.1 Login admin

- centré
- sobre
- securisant
- sans storytelling marketing

## 7.2 Dashboard

- 3 a 4 KPI cards maximum
- un graphique simple
- une table courte ou liste recente
- un bloc campagne active

## 7.3 Demandes

- page la plus dense
- forte priorite a la table
- filtres visibles rapidement
- detail sans rupture brutale de contexte

## 7.4 Campagnes

- liste claire
- edition structurée
- etats de publication et activite tres visibles

## 7.5 Contenus

- edition par section
- `Tabs` FR/AR
- action publier / depublier claire

## 8. Responsive et `RTL`

## 8.1 Responsive

- desktop prioritaire
- tablette propre
- mobile toleré mais non premier cas d'usage

Sur mobile:

- sidebar en `Sheet`
- topbar plus compacte
- tables scrollables

## 8.2 `RTL`

L'admin doit respecter l'existant du projet:

- inversion de certaines alignements
- lecture correcte des labels
- sidebar et sheets compatibles
- tables verifiees si du contenu arabe est affiché

## 9. Ce qui est interdit pendant l'implementation

- rajouter des sections marketing
- remplacer les tableaux par des cards partout
- charger l'UI de widgets inutiles
- utiliser le rouge comme fond principal
- produire un admin dark par defaut
- improviser des composants hors systeme alors que `shadcn` couvre le besoin

## 10. Criteres de validation du design system

Le design system admin est valide si:

- le shell est clair et stable
- les surfaces principales sont distinctes
- les statuts et actions sont visibles sans agressivite visuelle
- la table reste la surface dominante des demandes
- les formulaires d'edition restent compactes et productifs
- l'admin parait deployable, pas demonstratif
