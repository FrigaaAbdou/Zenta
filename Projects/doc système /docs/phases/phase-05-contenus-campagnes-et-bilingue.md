# Phase 5 - Contenus dynamiques, campagnes et bilingue avance

## 1. Objet de la phase

Cette phase prepare l'application a passer d'une base fonctionnelle a un produit plus souple, plus administrable et plus coherent editorialement.

L'objectif est de structurer:

- les contenus publics dynamiques
- la logique de campagnes
- le bilingue FR/AR de maniere serieuse
- la base necessaire pour alimenter plus tard un back-office

Cette phase reste orientee infrastructure produit et experience publique. Elle ne construit pas encore l'interface admin complete.

## 2. Resultat attendu

A la fin de la phase 5, l'application doit etre capable de:

- servir des contenus publics dynamiques depuis `back`
- afficher des campagnes actives ou ciblees
- gerer proprement les variantes FR/AR
- supporter `LTR` et `RTL`
- reduire fortement les textes hardcodes cote `front`

## 3. Perimetre

### Inclus

- modelisation du contenu dynamique public
- modelisation approfondie des campagnes
- strategie i18n avancee
- structure de contenu FR/AR
- conventions d'affichage `RTL`
- branchement `front` / `back` pour contenu et campagne

### Hors perimetre

- interface admin complete
- workflow d'approbation editorial
- permissions avancees
- analytics de campagne

## 4. Problemes que cette phase resout

Sans cette phase:

- beaucoup de texte reste code en dur
- les campagnes sont mal exploitables
- la langue arabe devient une dette technique
- les futures evolutions editoriales obligent des changements de code

Cette phase sert donc a transformer le noyau public en socle vraiment evolutif.

## 5. Domaine contenu public

## 5.1 Ce qui doit devenir dynamique

Les zones les plus pertinentes a sortir du code sont:

- hero homepage
- chiffres d'impact
- bloc eligibilite
- bandeau CTA
- timeline du don
- FAQ
- footer institutionnel
- message de support
- labels de campagne visibles

## 5.2 Ce qui peut rester statique plus longtemps

Peuvent rester statiques au depart si besoin:

- certains libelles de formulaire purement techniques
- certains messages de validation locale
- certains placeholders secondaires

## 5.3 Structure de contenu recommandee

Deux approches sont possibles:

1. contenu tres atomique par `key`
2. contenu semi-structure par `section`

Recommendation:

- garder un contenu structure par section pour la homepage
- garder la FAQ dans sa propre collection

Exemple:

- `home.hero`
- `home.impact`
- `home.eligibilityPreview`
- `home.process`
- `home.support`
- `footer.contact`

## 6. Domaine campagnes

## 6.1 Role produit

Les campagnes ne doivent pas etre reduites a un simple `campaignCode` dans un champ texte.

Elles servent a:

- contextualiser la communication
- personnaliser certains messages
- rattacher des demandes de rendez-vous
- mesurer ou filtrer plus tard

## 6.2 Capacites ciblees

Une campagne doit pouvoir porter:

- un `code`
- un titre FR/AR
- une description FR/AR
- un statut
- une periode d'activite
- un CTA localise
- potentiellement un theme visuel leger plus tard

## 6.3 Usages cote `front`

Le `front` peut exploiter la campagne pour:

- afficher un hashtag ou un message de contexte
- pre-remplir `campaignCode`
- afficher une bannière ou un badge de campagne
- changer un texte d'appel a l'action

## 6.4 Usages cote `back`

Le `back` doit:

- retourner les campagnes actives
- resoudre un code campagne
- associer une demande a une campagne

## 7. Bilingue avance

## 7.1 Objectif reel

Le bilingue n'est pas seulement une traduction.

Il implique:

- un contenu localise
- une direction `LTR/RTL`
- des ajustements de layout
- une coherence lexicale

## 7.2 Langues supportees

- `fr`
- `ar`

## 7.3 Regles `front`

Le `front` doit gerer:

- locale active
- mapping locale -> `dir`
- alignements compatibles RTL
- composants qui ne cassent pas avec l'arabe

## 7.4 Regles `back`

Le `back` doit:

- accepter une locale
- renvoyer le contenu localise
- avoir un fallback previsible

Fallback recommande:

- si `ar` absent pour un contenu, fallback `fr`
- mais avec journalisation ou trace de contenu manquant

## 8. Architecture frontend pour cette phase

## 8.1 Sources de contenu

Le `front` doit distinguer:

- contenu venant du backend
- contenu purement local temporaire

## 8.2 Structure recommandee

```text
front/src/
  content/
    fr/
      fallback-home.ts
      fallback-faq.ts
    ar/
      fallback-home.ts
      fallback-faq.ts
  i18n/
    locale.ts
    direction.ts
    translator.ts
```

## 8.3 Strategie d'affichage

Approche recommandee:

- tenter de charger le contenu backend
- fallback local si besoin seulement en dev ou mode degrade

## 8.4 Adaptation RTL

Verifier particulierement:

- header
- switch langue
- hero
- cartes stats
- CTA inline
- accordions FAQ
- formulaire et radios

## 9. Architecture backend pour cette phase

## 9.1 Collections utilisees

- `site_content`
- `faq_entries`
- `campaigns`

## 9.2 Services a renforcer

### `content.service.ts`

Doit pouvoir:

- charger le contenu par locale
- faire du fallback
- assembler le payload homepage

### `faq.service.ts`

Doit pouvoir:

- filtrer les FAQ publiees
- ordonner
- renvoyer la bonne locale

### `campaign.service.ts`

Doit pouvoir:

- retourner les campagnes actives
- identifier campagne principale
- retrouver une campagne par code

## 10. Validation navigateur Task 8

Validation effectuee en browser local sur:

- homepage `fr`
- homepage `ar`
- page rendez-vous `ar`

Zones explicitement verifiees:

- header
- switch langue
- hero
- cartes d'impact
- eligibilite
- CTA
- FAQ
- footer
- page rendez-vous

Corrections appliquees suite a cette validation:

- suppression des libelles francais residuels visibles sur la homepage arabe
- activation reelle de la locale app-level `fr/ar`
- propagation de `dir=ltr|rtl` depuis la racine
- adaptation du hero, de l'eligibilite, du CTA et du process en arabe
- preference d'un titre de campagne localise dans le hero au lieu d'un badge non localise

Ecarts restants non bloquants:

- une partie du contenu seed reste normalisee en ASCII cote backend, ce qui est acceptable pour la phase 5 mais pourra etre raffinee editorialement plus tard
- `badgeLabel` de campagne n'est pas encore modelise par locale; l'UI contourne cela en preferant le titre localise quand il est disponible

## 10. Endpoints a consolider dans cette phase

## 10.1 `GET /api/public/home`

Devient le vrai point d'entree dynamique de la homepage.

Doit renvoyer:

- contenu localise
- eventuelle campagne active utile

## 10.2 `GET /api/public/faq`

Doit servir des FAQ localisees et publiees.

## 10.3 `GET /api/public/campaigns/active`

Doit supporter:

- liste
- ou campagne principale selon la logique choisie

## 10.4 `GET /api/public/appointment-form-meta`

Doit renvoyer:

- labels localises
- listes de reference localisees si necessaire

## 11. Strategie editoriale recommandee

## 11.1 Regle de structure

Eviter de stocker un seul gros blob de page HTML.

Preferer:

- contenu par section
- champs clairs
- structures JSON predefinies

## 11.2 Regle de versionning

Au debut:

- contenus versionnes en base
- scripts seed possibles

Plus tard:

- edition via admin

## 11.3 Regle de qualite

Chaque contenu doit idealement avoir:

- `locale`
- `isPublished`
- `updatedAt`

## 12. Donnees de seed recommandees

## 12.1 Seeds homepage

Prevoir:

- contenu FR complet
- contenu AR complet ou presque complet

## 12.2 Seeds FAQ

Prevoir:

- les 6 questions visibles sur le site de reference
- categories coherentes
- ordre stable

## 12.3 Seeds campagnes

Prevoir:

- une campagne active
- une campagne archivee

## 13. Tests a prevoir

## 13.1 Tests backend

- contenu homepage `fr`
- contenu homepage `ar`
- fallback si locale manquante
- FAQ publiees uniquement
- campagnes actives seulement

## 13.2 Tests frontend

- affichage correct FR
- affichage correct AR
- application de `dir="rtl"`
- composants non casses en arabe

## 14. Risques principaux

### Risque 1 - RTL bricole trop tard

Effet:

- composants casses en arabe
- alignements incoherents

Mitigation:

- tester FR et AR dans les composants critiques des cette phase

### Risque 2 - contenu trop atomique

Effet:

- complexite excessive

Mitigation:

- structurer par sections metier plutot que par mot-cle isole

### Risque 3 - campagnes traitees comme simple texte

Effet:

- peu reutilisable

Mitigation:

- garder un vrai objet campagne avec code, statut, periode et contenu localise

## 15. Criteres d'acceptation de la phase 5

La phase 5 est complete si:

- la homepage peut etre alimentee par du contenu dynamique
- la FAQ est dynamique
- les campagnes sont structurees
- FR et AR sont traites proprement
- le `front` supporte `RTL`
- la base est prete pour une future edition admin

## 16. Dependances de la phase

Cette phase depend de:

- phase 2 `front`
- phase 3 `back`
- phase 4 integration full-stack

## 17. Suite logique

Apres cette phase, les suites les plus utiles sont:

1. phase 6 detaillee pour le back-office admin
2. execution reelle des repos
3. ajout d'outillage de seed et de tests de contenu

Plan d'execution associe:

- `docs/phases/phase-05-plan-execution-contenus-campagnes-bilingue.md`
