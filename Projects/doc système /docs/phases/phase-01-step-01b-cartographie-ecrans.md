# Phase 1 - Etape 1B - Cartographie d'ecrans fidele

## 1. Objet

Ce document complete la retro-analyse fonctionnelle par une lecture visuelle plus stricte des ecrans.

Le but est de limiter les erreurs de reinterpretation lors du developpement du `front`.

Ce document ne remplace pas la spec fonctionnelle. Il sert a:

- verrouiller la hierarchie visuelle
- decrire les patterns de spacing et de composition
- identifier les styles repetitifs
- clarifier les composants qui devront rester tres proches de la reference

## 2. Ecran 1 - Homepage, vue hero

## 2.1 Composition generale

La partie haute de la homepage suit une structure tres lisible:

- header sticky blanc
- hero 2 colonnes
- texte principal a gauche
- visuel/illustration a droite

Le hero occupe une grande hauteur et assume une forte presence editoriale.

## 2.2 Header

Structure observee:

- logo a gauche
- switch langue capsule `FR / AR`
- titre arabe centre
- bouton rouge `Donner son sang` a droite

Caracteristiques visuelles:

- fond blanc
- ombre tres legere
- bordure inferieure fine
- CTA rouge arrondi avec ombre douce
- logique tres institutionnelle, peu decorative

Implication de dev:

- il faut faire un `AppHeader` sticky
- ne pas surcharger en navigation
- conserver la lecture logo / langue / titre / CTA

## 2.3 Hero

Structure observee:

- tres grand titre sur plusieurs lignes
- alternance noir / rouge dans le wording
- paragraphe explicatif gris fonce
- CTA principal rouge
- micro-bloc de preuve sociale en dessous
- visuel de droite dans un grand conteneur pale

Caracteristiques visuelles:

- beaucoup d'espace blanc
- titres tres gros et tres gras
- rouge vif utilise comme accent de conversion
- carte visuelle de droite simple, pas un visuel photo-realisme

Implication de dev:

- prioriser une grille `2 cols` desktop, `1 col` mobile
- ne pas compresser verticalement le hero
- garder l'effet premium/institutionnel par l'espace

## 3. Ecran 2 - Homepage, bloc impact

## 3.1 Structure

Le bloc `Notre Impact` se compose de:

- un label de campagne sous le hero
- un titre centre
- trois cartes statistiques alignees
- un paragraphe de conclusion centre

## 3.2 Pattern de carte

Chaque carte suit le meme schema:

- grande carte blanche
- ombre douce
- coins arrondis
- icone ronde rouge qui flotte legerement en haut de carte
- valeur numerique forte
- libelle secondaire

Implication de dev:

- creer un composant `StatCard` unique
- garder l'icone en medaillon flottant
- ne pas utiliser une carte plate sans relief

## 4. Ecran 3 - Homepage, eligibilite + CTA

## 4.1 Structure

Le bloc d'eligibilite est organise ainsi:

- titre principal de section
- court texte introductif
- deux cartes cote a cote:
  - `Conditions requises`
  - `Contre-indications`
- grand bandeau CTA rouge en dessous

## 4.2 Pattern visuel des cartes d'eligibilite

Carte `Conditions requises`:

- fond vert tres pale
- bordure douce
- icone ronde verte
- liste verticale de points valides

Carte `Contre-indications`:

- fond rouge/rose tres pale
- bordure douce
- icone ronde rouge
- liste verticale de points negatifs

Implication de dev:

- le contraste vert / rouge est fondamental
- les cartes doivent rester symetriques
- le bloc CTA rouge doit suivre immediatement en dessous

## 4.3 Bandeau CTA

Caracteristiques:

- bandeau horizontal rouge vif
- texte blanc
- bouton blanc sur fond rouge
- logique "dernier push" avant transition

Implication de dev:

- ne pas transformer ce bloc en simple bouton isole
- conserver la forme bandeau + message + action

## 5. Ecran 4 - Homepage, timeline du don

## 5.1 Structure

Le bloc `Comment ça se passe ?` expose trois cartes:

- `Avant le don`
- `Pendant le don`
- `Après le don`

Chaque carte montre:

- un badge numerique rond
- un titre
- deux sous-items visuels

## 5.2 Pattern de composition

- les cartes sont blanches
- tres grands coins arrondis
- badge numerique rouge en haut
- sous-cartes interieures rose tres pale
- un encart note arrondi en dessous des trois cartes

Implication de dev:

- faire une vraie `ProcessTimelineSection`
- conserver la structure en cartes verticales, pas juste une liste
- garder le badge numerique visible et saillant

## 6. Ecran 5 - Homepage, FAQ et footer

## 6.1 FAQ

Structure observee:

- titre de section
- liste d'accordeons
- questions en boutons larges
- ligne d'aide/support sous les accordions

Implication de dev:

- utiliser `Accordion` shadcn comme base
- garder de grandes zones cliquables
- conserver un ton editorial rassurant sous la FAQ

## 6.2 Footer

Structure observee:

- fond sombre
- deux colonnes principales:
  - institution
  - contact
- ligne de copyright en bas

Implication de dev:

- footer simple mais dense
- ne pas sur-designer
- garder le contraste fort avec les sections claires precedentes

## 7. Ecran 6 - Page rendez-vous, vue initiale

## 7.1 Structure

Avant ouverture du formulaire principal:

- header identique a la homepage
- grand titre rouge centre
- sous-titre `Don de sang`
- hashtag de campagne
- carte blanche principale d'eligibilite

## 7.2 Pattern visuel

- fond legerement teinte rose
- carte blanche centrale tres large
- checkboxes visibles et confortables
- message d'accompagnement medical

Implication de dev:

- la pre-eligibilite est une etape visuelle a part entiere
- ne pas fondre cette logique directement dans le formulaire

## 8. Ecran 7 - Page rendez-vous, formulaire principal

## 8.1 Organisation macro

Le formulaire n'est pas un simple bloc continu. Il est organise en cartes numerotees:

1. `Informations personnelles`
2. `Rendez-vous`
3. `Type de don`
4. `Déjà donneur`
5. `Remarques ou besoins particuliers`

Chaque section est dans un grand conteneur blanc arrondi.

## 8.2 Informations personnelles

Pattern:

- grille a 2 colonnes desktop
- champs textes et selects avec hauteur confortable
- labels lisibles
- step badge pale numerote

Implication de dev:

- une `FormSectionCard` reutilisable est necessaire
- les champs doivent avoir un design uniforme

## 8.3 Section rendez-vous

Pattern:

- carte dediee
- `code campagne`
- `date`
- `heure`
- toujours en layout de grille confortable

Observation importante:

- `heure du rendez-vous` depend d'abord de `date`

Implication de dev:

- modeliser la dependance date -> heures disponibles
- prevoir etat disabled / placeholder clair

## 8.4 Section type de don

Pattern:

- grille de boutons radio stylises
- d'abord les groupes sanguins
- ensuite les types de don
- message explicatif en dessous

Implication de dev:

- utiliser des `radio cards` ou `toggle cards`
- ne pas rendre ce bloc comme de simples radios natives verticales

## 8.5 Section deja donneur

Pattern:

- section simple
- radios `oui/non`
- champ conditionnel si `oui`

Implication de dev:

- gerer le champ conditionnel proprement au niveau form state

## 8.6 Section remarques + submit

Pattern:

- grand textarea
- bouton submit rouge centre
- footer sombre immediatement apres

Implication de dev:

- terminer le flux par un CTA unique et central
- ne pas disperser plusieurs actions secondaires

## 9. Design tokens implicites a retenir

### Couleurs

- rouge principal fort pour CTA et badges
- rose pale / rouge tres clair pour fonds de sections
- vert pale pour confirmations positives
- blanc pour les cartes
- gris fonce pour la typographie secondaire
- bleu nuit / anthracite pour le footer

### Formes

- grands arrondis
- boutons capsules ou rectangles arrondis
- cartes a ombres tres douces

### Espacement

- beaucoup d'air entre sections
- cartes hautes plutot que compactes
- sections centrees dans une largeur maximum confortable

### Ton visuel

- institutionnel moderne
- propre
- rassurant
- sans surcharge

## 10. Contraintes de fidelite a appliquer pendant le dev

Les developpeurs `front` doivent considerer ces points comme quasi-non-negociables:

- structure hero 2 colonnes
- header blanc sticky avec switch langue et CTA rouge
- cartes statistiques a medaillon icone
- dualite verte / rouge dans le bloc eligibilite
- timeline en 3 cartes verticales
- FAQ en accordions larges
- formulaire en cartes numerotees separees
- selection du groupe sanguin et type de don via grille visuelle

## 11. Ce qu'il est permis d'ameliorer

- accessibilite clavier
- contraste et lisibilite de certains textes
- responsive mobile
- structure technique des composants
- validation, messages d'erreur et retours de succes
- gestion `FR/AR`

## 12. Conclusion

Cette cartographie confirme que la reference n'est pas seulement informative. Elle repose sur une vraie mise en scene de conversion:

- hero fort
- reassurance par preuves et eligibilite
- pedagogie du processus
- formulaire progressif et rassurant

Le `front` devra donc etre developpe comme une reconstruction rigoureuse de cette experience, pas comme une reinterpretation libre.
