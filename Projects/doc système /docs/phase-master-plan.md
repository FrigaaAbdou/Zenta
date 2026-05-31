# Plan Directeur - Application Web CTS CHU Mustapha

## 1. Objet du document

Ce document sert de point d'entree unique pour toute personne qui doit comprendre, cadrer, concevoir ou developper l'application web inspiree du site de reference:

- Reference visuelle et fonctionnelle: `https://cts-chu-mustapha.com/fr`
- Stack cible frontend: `React + Vite + Tailwind + shadcn/ui + blocks.so`
- Stack cible backend: `Node.js + Express + MongoDB`
- Strategie depot: `2 repos separes`, un frontend et un backend

L'objectif n'est pas de produire un simple site vitrine. L'objectif est de reconstruire une application web plus propre, plus maintenable et plus exploitable, en restant tres fidele au design, au ton et aux parcours visibles sur le site de reference.

Ce document decrit:

- le contexte produit
- ce que fait le site actuel
- la cible fonctionnelle
- les principes de conception
- l'organisation des repos
- les conventions de travail
- le decoupage par phases

Un document separe detaille ensuite la phase 1.

Documents d'execution disponibles:

- `docs/phases/phase-02-plan-execution-front.md`
- `docs/phases/phase-03-plan-execution-back.md`
- `docs/phases/phase-04-plan-execution-full-stack.md`
- `docs/phases/phase-05-plan-execution-contenus-campagnes-bilingue.md`
- `docs/phases/phase-06-plan-execution-back-office-admin.md`

Etat d'execution actuellement atteint:

- phase 2 `front`: executee
- phase 3 `back`: executee
- phase 4 integration full-stack: executee avec validation locale, seed public, et limitation documentee sur l'automatisation du champ natif `input[type=date]` dans le navigateur integre
- phase 5 contenus, campagnes et bilingue: executee avec locale applicative `fr/ar`, support `rtl` sur les vues publiques principales, seed bilingue enrichi, et validation navigateur sur homepage et parcours rendez-vous
- phase 6 back-office admin: executee avec auth admin JWT, roles V1, dashboard, gestion des demandes, gestion des campagnes, gestion du contenu `home`, et seed admin local

## 2. Resume executif

Le site de reference combine aujourd'hui:

- une page publique de sensibilisation au don de sang
- des contenus d'information et d'eligibilite
- une page de prise de rendez-vous avec formulaire
- des appels a l'action pour encourager le don

La future application doit conserver cette experience publique, mais etre pensee comme une vraie application web:

- structure frontend propre
- API backend dediee
- persistence MongoDB
- base exploitable pour un futur back-office admin
- contenu bilingue et extensible
- logique metier plus robuste que celle visible sur le site actuel

## 3. Lecture du site de reference

### 3.1 Ce que l'on observe sur la page d'accueil

Le site `https://cts-chu-mustapha.com/fr` expose principalement:

- un hero principal avec slogan de campagne
- des indicateurs d'impact
- une section d'eligibilite au don
- une explication du deroulement du don
- une FAQ
- un appel a l'action vers la prise de rendez-vous
- les informations de contact du centre

### 3.2 Ce que l'on observe sur la page de rendez-vous

La page `https://cts-chu-mustapha.com/contact` joue en realite le role d'une page de prise de rendez-vous. Elle contient:

- un rappel des conditions d'eligibilite
- un formulaire en plusieurs sections
- des champs d'identite
- des choix de date et d'heure
- le type de don
- un statut "deja donneur"
- un espace de remarques

### 3.3 Ce que cela implique

Le site actuel est deja plus qu'une vitrine, mais il reste conceptuellement assemble autour d'un front public et d'un formulaire. La future application doit reprendre ce comportement et le structurer autour de domaines applicatifs clairs:

- contenu public
- parcours donneur
- rendez-vous
- campagnes
- eligibilite
- administration future

## 4. Vision produit cible

### 4.1 Finalite

L'application cible doit permettre au centre de transfusion:

- d'informer les donneurs
- de repondre aux questions frequentes
- de centraliser les demandes de rendez-vous
- de guider les donneurs selon des regles simples d'eligibilite
- de soutenir les campagnes de don
- de preparer l'ajout futur d'un back-office admin

### 4.2 Positionnement

Le produit doit etre compris comme:

- une application web institutionnelle
- orientee acquisition et conversion de donneurs
- avec un front public fiable
- et un coeur metier progressif autour du rendez-vous et des donneurs

### 4.3 Contraintes explicites a respecter

- rester visuellement tres fidele au site existant
- utiliser `React Vite` cote frontend
- utiliser `Node.js + Express + MongoDB` cote backend
- utiliser `shadcn/ui` et `blocks.so` pour accelerer la construction UI
- separer le frontend et le backend dans deux repos distincts
- traiter l'admin comme une phase ulterieure, pas comme point de depart

## 5. Architecture de depots recommandee

### 5.1 Repo frontend

Nom de travail suggere:

- `front`

Responsabilites:

- interface publique
- pages marketing/information
- parcours de prise de rendez-vous
- composants UI
- gestion du bilingue
- consommation de l'API backend
- SEO, accessibilite et responsive

Stack suggeree:

- `React 19`
- `Vite`
- `React Router`
- `Tailwind CSS`
- `shadcn/ui`
- `blocks.so`
- `react-hook-form` + `zod`
- client HTTP de type `fetch wrapper` ou `axios`

### 5.2 Repo backend

Nom de travail suggere:

- `back`

Responsabilites:

- API REST
- logique metier de rendez-vous
- persistence MongoDB
- validation serveur
- gestion des campagnes
- gestion du contenu dynamique si necessaire
- preparation de l'auth admin future

Stack suggeree:

- `Node.js`
- `Express`
- `MongoDB`
- `Mongoose`
- `Zod` ou `Joi` pour validation
- `dotenv`
- `helmet`, `cors`, `morgan` ou equivalent

## 6. Domaines fonctionnels de l'application

### 6.1 Domaine public

- accueil
- campagne de don
- eligibilite
- FAQ
- informations du centre
- contact
- CTA vers prise de rendez-vous

### 6.2 Domaine rendez-vous

- creation d'une demande
- collecte des informations personnelles
- collecte des contraintes medicales de base
- selection date/heure
- type de don
- remarques libres
- suivi du statut de la demande dans une future phase

### 6.3 Domaine donneur

- profil minimal du donneur
- historique simple des demandes
- distinction nouveau / ancien donneur
- frequence / dernier don

### 6.4 Domaine campagnes

- code campagne
- affichage des campagnes actives
- rattachement des rendez-vous a une campagne

### 6.5 Domaine contenu

- FAQ
- sections de contenu institutionnel
- textes multilingues
- CTA

### 6.6 Domaine admin futur

- gestion des demandes
- gestion des creneaux
- gestion du contenu
- gestion des campagnes
- statistiques

Etat actuel :

- ce domaine n'est plus futur au niveau V1
- un premier back-office admin est livre
- la gestion avancee des creneaux et les statistiques poussees restent pour la suite

## 7. Principes de design produit et UI

### 7.1 Fidelite a la reference

Le design ne doit pas partir dans une reinterpretation libre. Les developpeurs doivent conserver:

- le meme type de hero
- la meme hiararchie de sections
- la meme logique de carte, timeline, FAQ, CTA
- le meme ton institutionnel et rassurant
- la meme ambiance medicale et solidaire

### 7.2 Ce qui peut etre ameliore sans casser la fidelite

- grille responsive plus propre
- meilleure semantique HTML
- meilleure accessibilite
- composants plus coherents
- validation formulaire plus claire
- gestion plus robuste des etats de chargement et d'erreur
- internationalisation mieux structuree

### 7.3 Direction visuelle

- blanc / rouge / gris clair
- iconographie medicale simple
- cartes arrondies
- sections aeriennes
- ton humain, rassurant, direct
- priorite au mobile et au tactile

## 8. Principes de travail

### 8.1 Regles de cadrage

- on documente avant d'implementer
- chaque phase a son propre fichier Markdown
- chaque phase doit etre comprehensible isolee
- les dependances entre phases sont explicites

### 8.2 Regles de livraison

Chaque phase doit preciser:

- objectifs
- perimetre
- hors perimetre
- livrables
- architecture/files concernes
- exigences techniques
- API concernees
- criteres d'acceptation
- risques
- ordre d'execution recommande

### 8.3 Regles de qualite

- code lisible
- composants petits et responsablites claires
- validation front et back
- responsive reel
- accessibilite minimale
- structure prenable en main par un nouveau developpeur sans oral

## 9. Decoupage general par phases

## Phase 1 - Cadrage, retro-analyse, architecture et fondations

But:

- comprendre le site de reference
- figer la vision produit
- definir l'architecture des 2 repos
- documenter les modeles et contrats de base
- poser les conventions pour que l'implementation soit coherente

Livrable principal:

- documentation de cadrage et plans d'execution

Document detaille associe:

- `docs/phases/phase-01-cadrage-et-fondations.md`

## Phase 2 - Frontend public fidele a la reference

But:

- reconstruire la page d'accueil et les sections publiques principales
- etablir le design system local
- integrer la navigation, les blocs, la FAQ et les CTA

Livrables attendus:

- repo frontend initialise
- design system de base
- pages publiques fonctionnelles et responsives
- document detaille: `docs/phases/phase-02-front-public-et-rendez-vous.md`

## Phase 3 - Backend API et modele MongoDB

But:

- mettre en place l'API backend
- modeliser les collections principales
- exposer les endpoints necessaires au frontend

Livrables attendus:

- repo backend initialise
- connexion MongoDB
- schemas et routes de base
- document detaille: `docs/phases/phase-03-back-api-et-persistence.md`

## Phase 4 - Parcours de prise de rendez-vous complet

But:

- brancher le formulaire frontend sur l'API
- valider les donnees
- stocker les demandes de rendez-vous
- gerer les cas d'erreur et de confirmation

Livrables attendus:

- formulaire complet
- validation utilisateur
- persistence reelle
- messages de confirmation
- document detaille: `docs/phases/phase-04-integration-full-stack-rendez-vous.md`

## Phase 5 - Contenu dynamique, campagnes et bilingue structure

But:

- transformer les contenus actuellement statiques en contenus gerables
- structurer proprement FR/AR
- rattacher les campagnes a l'experience utilisateur

Livrables attendus:

- modeles campagne et contenu
- endpoints de lecture
- affichage dynamique cote frontend
- document detaille: `docs/phases/phase-05-contenus-campagnes-et-bilingue.md`
- plan d'execution: `docs/phases/phase-05-plan-execution-contenus-campagnes-bilingue.md`

## Phase 6 - Back-office admin

But:

- doter l'application d'un espace de gestion
- afficher et filtrer les demandes
- gerer les creneaux, campagnes, contenus

Livrables attendus:

- auth admin
- dashboard de base
- CRUD principaux
- document detaille: `docs/phases/phase-06-back-office-admin.md`
- plan d'execution: `docs/phases/phase-06-plan-execution-back-office-admin.md`
- extension creneaux/calendrier/age: `docs/phases/phase-06-extension-calendrier-creneaux-et-age.md`

## Phase 7 - Stabilisation, observabilite et deploiement

But:

- finaliser la qualite de production
- ajouter tests, securite, logs et pipelines
- preparer le deploiement des deux repos

Livrables attendus:

- plans d'environnement
- tests cibles
- checklists de mise en production
- document detaille: `docs/phases/phase-07-stabilisation-tests-observabilite-deploiement.md`

## 10. Artefacts documentaires attendus a terme

Pour que n'importe quel developpeur puisse reprendre le projet rapidement, le jeu documentaire cible doit inclure:

- un document maitre de contexte
- un document par phase
- un document d'architecture frontend
- un document d'architecture backend
- un document de modele de donnees MongoDB
- un document de contrat API
- un document de parcours utilisateur
- un backlog ou plan d'implementation detaille par phase

## 11. Decisions deja prises

- `2 repos` et non monorepo
- `frontend React Vite`
- `backend Node.js Express MongoDB`
- `shadcn/ui + blocks.so`
- `fidelite visuelle forte` au site de reference
- `admin en dernier`
- `documentation par phases en Markdown`

## 12. Questions laissees volontairement pour plus tard

Ces sujets sont importants mais ne bloquent pas la phase 1:

- mecanisme d'auth admin exact
- hebergement final des 2 repos
- envoi d'emails ou SMS
- moteur de gestion de disponibilites avance
- analytics detaillees
- CMS complet ou simple contenu versionne

## 13. Suite immediate

La suite directe est l'exploitation du document detaille de phase 1 afin de produire:

- les conventions de projet
- l'analyse fonctionnelle detaillee
- la proposition de structure des deux repos
- le modele de donnees initial
- les premiers contrats API et parcours utilisateurs
