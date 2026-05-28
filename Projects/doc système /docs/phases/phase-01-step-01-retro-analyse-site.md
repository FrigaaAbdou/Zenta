# Phase 1 - Etape 1 - Retro-analyse du site de reference

## 1. Objet

Ce document transforme le site de reference `https://cts-chu-mustapha.com/fr` en informations exploitables par une equipe de developpement.

Le but n'est pas de commenter le site de maniere vague. Le but est de decrire:

- quelles pages existent
- quels blocs composent ces pages
- quels composants UI devront etre reconstruits
- quel est le parcours utilisateur principal
- quelles donnees sont affichees ou collectées
- quelles consequences cela a pour `front` et `back`

Ce document doit permettre a un developpeur de comprendre le site sans avoir besoin d'aller le re-lire tout de suite.

Document complementaire:

- `docs/phases/phase-01-step-01b-cartographie-ecrans.md`

## 2. Methode utilisee

La retro-analyse repose sur:

- l'observation de la page d'accueil `https://cts-chu-mustapha.com/fr`
- l'observation de la page de prise de rendez-vous `https://cts-chu-mustapha.com/contact`
- la lecture du HTML rendu pour identifier:
  - titres de sections
  - labels de formulaire
  - noms de champs
  - patterns de structure

## 3. Pages identifiees

## 3.1 Page d'accueil

URL:

- `https://cts-chu-mustapha.com/fr`

Role:

- page publique principale
- page d'information et de conversion
- point d'entree du parcours donneur

Objectif utilisateur:

- comprendre la mission du centre
- verifier rapidement son eligibilite
- consulter les informations utiles
- etre dirige vers la prise de rendez-vous

## 3.2 Page de prise de rendez-vous

URL:

- `https://cts-chu-mustapha.com/contact`

Role:

- page d'action principale
- formulaire de collecte des demandes de rendez-vous

Objectif utilisateur:

- confirmer son eligibilite
- renseigner ses informations personnelles
- choisir un rendez-vous
- soumettre sa demande

## 3.3 Variantes linguistiques observees

Le site expose au minimum:

- `fr`
- `ar`

Ce point a un impact direct:

- `front` doit prevoir i18n des la structure initiale
- le layout devra prevoir `LTR` et `RTL`
- les contenus ne doivent pas etre hardcodes partout dans les composants

## 4. Analyse structurelle de la page d'accueil

## 4.1 Header global

Elements observes:

- logo du centre
- switch de langue `FR` / `AR`
- titre institutionnel au centre
- bouton principal `Donner son sang`
- menu mobile avec bouton burger

Consequences:

- le header est un composant global reutilisable
- la gestion de langue fait partie du layout, pas d'une page isolee
- le CTA principal doit toujours rester visible

## 4.2 Hero principal

Le hero n'est pas un simple bloc texte. Il sert de premiere conversion.

Indices observes:

- grand bloc d'introduction
- animation de formes rouges floutees
- discours de campagne
- mise en avant du don de sang

Ce qu'il faut en retenir:

- hero visuel riche mais simple structurellement
- grande importance du rouge, du blanc et des formes douces
- tonalite institutionnelle, humaine, solidaire

Composants probables:

- `HeroSection`
- `HeroCTA`
- `HeroStats` ou sous-composant d'impact

## 4.3 Bloc impact / chiffres

Titres ou contenus observes:

- `Notre Impact`
- `135+`
- `24h`
- `100%`

Lecture fonctionnelle:

- bloc de reassurance
- donne des preuves sociales ou institutionnelles
- sert a credibiliser la campagne

Composants probables:

- `StatsSection`
- `StatCard`

## 4.4 Bloc eligibilite

Titres observes:

- `Suis-je éligible au don ?`
- `Conditions requises`

Lecture fonctionnelle:

- bloc essentiel du parcours
- il rassure l'utilisateur et elimine une partie des doutes avant la prise de rendez-vous

Ce bloc doit etre reproduit tres fidelement, car il cree la transition vers le formulaire.

Composants probables:

- `EligibilitySection`
- `EligibilityCard`
- `EligibilityChecklistPreview`

## 4.5 Bloc CTA de conversion

Texte observe:

- `Prêt(e) à sauver des vies ?`

Lecture fonctionnelle:

- CTA emotionnel
- redirige vers le parcours de rendez-vous
- transforme l'intention en action

Composants probables:

- `ConversionBanner`
- `PrimaryCTAButton`

## 4.6 Bloc deroulement du don

Titres observes:

- `Comment ça se passe ?`
- `Avant le don`
- `Pendant le don`
- `Après le don`

Lecture fonctionnelle:

- timeline ou sequence en 3 etapes
- sert a rendre le parcours medical plus concret et moins anxiogene

Composants probables:

- `DonationProcessSection`
- `ProcessStepCard`

## 4.7 Bloc FAQ

Titres observes:

- `Questions Fréquentes`
- `Pourquoi donner son sang ?`
- `Que se passe-t-il lorsque je donne mon sang ?`
- `Y a-t-il un danger à donner mon sang ?`
- `Qui peut donner son sang ?`
- `Qui ne peut pas donner son sang ?`
- `Comment vais-je me sentir après avoir donné mon sang ?`

Lecture fonctionnelle:

- FAQ structurante
- vraie matiere de contenu, pas juste decor
- forte candidate a etre servie depuis un contenu structure

Composants probables:

- `FaqSection`
- `FaqAccordion`
- `FaqItem`

## 4.8 Bloc institutionnel / footer

Titres observes:

- `Chaque don compte`
- `Centre de Transfusion Sanguine`
- `Contact`

Lecture fonctionnelle:

- footer de confiance
- rappel institutionnel
- point de contact et de credibilite

Composants probables:

- `Footer`
- `ContactSummary`

## 5. Analyse structurelle de la page de prise de rendez-vous

## 5.1 Header

Le header reprend la meme logique que la homepage:

- logo
- switch langue
- titre institutionnel
- CTA don

Consequence:

- un seul layout header pour tout le site public

## 5.2 Intro formulaire

Titres observes:

- `Formulaire de prise de rendez-vous`
- `Don de sang 🩸`
- `#SolidaritéAlgérienneParLeSang`

Lecture fonctionnelle:

- page de formulaire avec branding de campagne
- le formulaire n'est pas neutre, il est emotionnellement cadre

Composants probables:

- `AppointmentPageHero`
- `CampaignTagline`

## 5.3 Etape de pre-eligibilite

Titre observe:

- `Suis-je éligible au don ?`

Observation HTML importante:

- la page affiche d'abord une checklist d'eligibilite
- le formulaire principal n'apparait qu'apres validation
- la variable Alpine `showMainForm` controle l'affichage du formulaire principal

Cases observees:

- age entre 18 et 65 ans
- poids minimum
- bon etat de sante
- absence de contre-indication evidente

Lecture fonctionnelle:

- il y a deja une logique de gate avant le formulaire
- dans la future app, cette logique devra etre geree proprement en front et validee aussi en back si necessaire

Composants probables:

- `EligibilityGate`
- `EligibilityCheckboxList`
- `ContinueToFormButton`

## 5.4 Section informations personnelles

Titre observe:

- `Informations personnelles`

Champs identifies dans le HTML:

- `last_name`
- `first_name`
- `birth_date`
- `gender`
- `phone`
- `email`
- `wilaya`
- `commune`

Lecture fonctionnelle:

- bloc donneur de base
- necessite validation stricte
- `wilaya` et `commune` impliquent une relation de donnees ou un dataset de reference

Composants probables:

- `PersonalInfoSection`
- `TextField`
- `DateField`
- `RadioGroup`
- `WilayaSelect`
- `CommuneSelect`

## 5.5 Section rendez-vous

Titre observe:

- `Rendez-vous`

Champs identifies:

- `campaign_code`
- `appointment_date`
- `appointment_time`

Lecture fonctionnelle:

- le formulaire attend deja une dimension campagne
- la date et l'heure sont des champs centraux du domaine rendez-vous
- l'heure est deja geree comme une liste `select`

Composants probables:

- `AppointmentSection`
- `CampaignCodeField`
- `AppointmentDatePicker`
- `AppointmentTimeSelect`

## 5.6 Section groupe sanguin et type de don

Titres observes:

- `Type de don`

Champs identifies:

- `blood_group`
  - `A+`
  - `B+`
  - `O+`
  - `AB+`
  - `A-`
  - `B-`
  - `O-`
  - `AB-`
- `don_type`
  - `sang_total`
  - `plasma`
  - `plaquettes`

Lecture fonctionnelle:

- le groupe sanguin est collecte directement
- le type de don est deja normalise

Composants probables:

- `BloodGroupSelector`
- `DonationTypeSelector`

## 5.7 Section ancien donneur

Titres observes:

- `Déjà donneur`
- `Si oui, dernier don`

Champs identifies:

- `already_donor`
- `last_donation_date`

Lecture fonctionnelle:

- distinction nouveau / ancien donneur
- donnees utiles pour le modele `Donor`
- logique conditionnelle dans le formulaire

Composants probables:

- `ExistingDonorSection`
- `ConditionalDateField`

## 5.8 Section remarques

Titre observe:

- `Remarques ou besoins particuliers`

Champ identifie:

- `remarks`

Placeholder observe:

- `Accessibilité, peur des aiguilles, souhait d'être accompagné...`

Lecture fonctionnelle:

- bloc libre mais metierement utile
- peut couvrir accessibilite, anxiete, accompagnement

Composants probables:

- `RemarksTextarea`

## 5.9 Footer

Titres observes:

- `Centre de Transfusion Sanguine`
- `Contact`

Lecture fonctionnelle:

- coherence avec la homepage
- footer global reutilisable

## 6. Parcours utilisateur principal

Parcours principal observe:

1. l'utilisateur arrive sur la homepage
2. il lit le message principal et les preuves de credibilite
3. il consulte rapidement son eligibilite
4. il verifie le deroulement du don et la FAQ
5. il clique sur `Donner son sang`
6. il arrive sur la page de prise de rendez-vous
7. il valide sa pre-eligibilite
8. il remplit ses informations personnelles
9. il choisit date et heure
10. il choisit groupe sanguin et type de don
11. il precise s'il est deja donneur
12. il ajoute des remarques si besoin
13. il soumet sa demande

## 7. Composants UI recurrents a reconstruire

Liste de reference pour `front`:

- `AppHeader`
- `LanguageSwitcher`
- `PrimaryCTAButton`
- `HeroSection`
- `StatsSection`
- `StatCard`
- `EligibilitySection`
- `EligibilityGate`
- `ProcessTimeline`
- `ProcessStepCard`
- `FaqSection`
- `FaqAccordion`
- `ConversionBanner`
- `AppointmentPageHero`
- `AppointmentForm`
- `PersonalInfoSection`
- `AppointmentSection`
- `BloodGroupSelector`
- `DonationTypeSelector`
- `ExistingDonorSection`
- `RemarksTextarea`
- `AppFooter`

## 8. Donnees visibles et collectées

## 8.1 Donnees visibles sur la homepage

- titres de campagne
- chiffres d'impact
- criteres d'eligibilite
- etapes du don
- questions FAQ
- contact centre

## 8.2 Donnees collectees par le formulaire

### Identite

- nom
- prenom
- date de naissance
- sexe
- telephone
- email

### Localisation

- wilaya
- commune

### Rendez-vous

- code campagne
- date souhaitee
- heure souhaitee

### Profil sanguin

- groupe sanguin
- type de don

### Historique donneur

- deja donneur
- date du dernier don

### Informations libres

- remarques / besoins particuliers

## 8.3 Donnees derivees ou implicites

- locale active `fr` ou `ar`
- eligibilite preliminaire confirmee
- date de creation de la demande
- statut de la demande

## 9. Consequences directes pour le repo `front`

`front` devra:

- reconstruire fidèlement le layout public
- separer clairement pages publiques et formulaire
- structurer les sections de la homepage en composants distincts
- prevoir une vraie couche i18n
- gerer un formulaire conditionnel et valide
- exposer des etats `loading`, `error`, `success`
- prevoir des composants adaptables a `FR` et `AR`

## 10. Consequences directes pour le repo `back`

`back` devra:

- recevoir une demande de rendez-vous structuree
- valider tous les champs critiques
- stocker donneur et demande de rendez-vous
- prevoir une logique autour des campagnes
- preparer la gestion des listes de reference:
  - wilayas
  - communes
  - horaires
  - types de don
- prevoir des statuts de demande

## 11. Zones de fidelite forte a respecter

Les zones suivantes doivent rester tres proches du site de reference:

- header global
- hero de la homepage
- bloc impact
- bloc eligibilite
- timeline du don
- FAQ
- CTA principal
- structure du formulaire de rendez-vous

## 12. Zones ameliorables sans casser la reference

- meilleure organisation des composants
- meilleure validation du formulaire
- meilleur responsive
- meilleure accessibilite
- meilleure separation contenu / logique
- meilleure gestion du bilingue
- meilleure gestion de l'etat du formulaire

## 13. Conclusion

L'etape 1 confirme que le projet ne doit pas etre pense comme un simple site vitrine.

Le site de reference est deja un mini-produit centre sur:

- information
- reassurance
- eligibilite
- conversion
- prise de rendez-vous

La future implementation doit donc reproduire:

- la fidelite visuelle
- la clarte du parcours
- la logique de pre-eligibilite
- la collecte structuree des donnees

Tout en ameliorant:

- l'architecture technique
- la maintenabilite
- la structuration front/back
- la preparation du futur espace admin
