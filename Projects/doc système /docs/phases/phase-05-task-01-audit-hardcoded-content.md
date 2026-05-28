# Phase 5 - Task 1 - Audit du contenu encore hardcode

## 1. Objet

Ce document inventorie ce qui reste code en dur dans le repo `front` apres les phases 2, 3 et 4.

Le but est de preparer les tasks suivantes de la phase 5 en separant clairement :

- le contenu public qui doit devenir dynamique
- les contenus derives d'une campagne
- les libelles techniques qui peuvent rester locaux plus longtemps
- les composants a verifier en `RTL`

## 2. Resume executif

Etat actuel :

- la homepage lit deja une partie du contenu depuis `back`
- la FAQ est deja backend-driven quand l'API repond
- les campagnes actives sont deja backend-driven
- le formulaire de rendez-vous consomme deja certaines metadonnees backend

Mais il reste encore beaucoup de texte hardcode dans les composants UI.

Conclusion :

- la phase 5 doit surtout sortir du code les sections marketing et les textes de parcours public
- le formulaire peut garder une petite partie de ses messages techniques en local au debut

## 3. Cartographie par zone

## 3.1 Homepage

### Deja majoritairement dynamiques

- `HeroSection`
  - `campaignLabel`
  - `description`
  - `ctaLabel`
- `ImpactSection`
  - `sectionLabel`
  - `title`
  - `conclusion`
- `FaqSection`
  - `items`
  - `supportLabel`
  - `phone`
  - `email`

### Encore hardcodees dans les composants

#### [front/src/components/marketing/HeroSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/HeroSection.tsx)

- titre principal : `Donner son sang, c'est sauver des vies`
- ligne de reassurance : `Don volontaire, gratuit et strictement médicalisé.`
- cartes de preuve :
  - `Parcours sécurisé et encadré`
  - `Centre hospitalier de référence`
  - `Prise de rendez-vous rapide`
- panneau illustratif desktop :
  - `Donneurs aujourd'hui`
  - `Parcours sécurisé`
  - `Encadrement médical complet`
  - `Réponse rapide`
  - `Demande de rendez-vous simplifiée`

#### [front/src/components/marketing/ImpactSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/ImpactSection.tsx)

- statistiques :
  - `135+`
  - `Donneurs mobilisés par jour`
  - `24h`
  - `Prise en charge et suivi coordonnés`
  - `100%`
  - `Procédure encadrée et sécurisée`

#### [front/src/components/marketing/EligibilityPreviewSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/EligibilityPreviewSection.tsx)

- titre : `Suis-je éligible au don ?`
- paragraphe d'introduction
- bloc `Conditions requises`
- bloc `Contre-indications`
- liste complete des conditions :
  - `Âge entre 18 et 65 ans`
  - `Poids minimum 50 kg`
  - `Ne pas être à jeun`
  - `Être en bonne santé générale`
- liste complete des contre-indications :
  - `Infection ou fièvre récente`
  - `Anémie connue ou fatigue importante`
  - `Grossesse ou allaitement`
  - `Tatouage ou piercing récent`

#### [front/src/components/marketing/CtaBannerSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/CtaBannerSection.tsx)

- badge : `Prêt(e) à sauver des vies ?`
- titre : `Réservez votre rendez-vous en quelques clics`
- paragraphe complet
- bouton : `Prendre rendez-vous`

#### [front/src/components/marketing/ProcessSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/ProcessSection.tsx)

- titre : `Comment ça se passe ?`
- texte d'introduction
- les 3 etapes :
  - `Avant le don`
  - `Pendant le don`
  - `Après le don`
- tous les sous-points de chaque etape
- texte de conclusion

#### [front/src/components/marketing/FaqSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/FaqSection.tsx)

- titre de section : `Questions fréquentes`
- sous-titre
- paragraphe de support
- fallback FAQ complet local :
  - 5 questions / reponses

## 3.2 Header / Footer / layout

#### [front/src/components/layout/AppHeader.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/layout/AppHeader.tsx)

- nom d'institution :
  - `Centre d'hémobiologie`
  - `& de transfusion sanguine`
  - `CHU Mustapha`
- menu mobile :
  - `Menu`
  - `Navigation rapide`
  - `Accueil`
  - `Donner son sang`
- CTA desktop : `Donner son sang`

#### [front/src/components/layout/AppFooter.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/layout/AppFooter.tsx)

- a verifier et sortir vers contenu dynamique si encore local
- cette zone doit idealement etre pilotee par `footer` venant de `home-content`

#### [front/src/app/layouts/PublicLayout.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/app/layouts/PublicLayout.tsx)

- la locale est encore locale au layout
- pas encore de source d'etat globale de langue

## 3.3 Page rendez-vous

#### [front/src/components/appointment/EligibilityGate.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/appointment/EligibilityGate.tsx)

- titre : `Suis-je éligible au don ?`
- paragraphe d'introduction
- 4 labels de checklist
- bloc de note explicative
- bouton : `Prendre rendez-vous`

Remarque :

- ces textes peuvent etre derives du backend plus tard
- mais ils peuvent rester locaux un peu plus longtemps si on veut aller vite

#### [front/src/components/appointment/AppointmentForm.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/appointment/AppointmentForm.tsx)

Encore hardcode :

- labels des champs
- placeholders
- hints :
  - `Optionnel, si vous venez dans le cadre d'une campagne ciblée.`
  - `Choisissez d'abord une date.`
  - `Impossible de charger les créneaux.`
  - `Aucun créneau disponible pour cette date.`
- titres de sections :
  - `Informations personnelles`
  - `Rendez-vous`
  - `Type de don`
  - `Déjà donneur`
  - `Remarques ou besoins particuliers`
- texte de soumission et messages de succes/erreur UI

Deja dynamiques ou semi-dynamiques :

- campagnes
- wilayas
- communes
- groupes sanguins
- types de don
- slots

#### [front/src/features/appointment/constants/formOptions.ts](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/features/appointment/constants/formOptions.ts)

Ce fichier contient encore un gros fallback FR local :

- `bloodGroups`
- `donationTypes`
- `fallbackAppointmentMeta`
- `genders`
- `wilayas`
- `communesByWilaya`
- checklist eligibility

Conclusion :

- ce fichier doit rester comme fallback
- mais il ne doit plus etre traite comme source principale a la fin de la phase 5

## 4. Classement par priorite de dynamisation

## 4.1 Priorite haute

Doit devenir backend-driven pendant la phase 5 :

- hero homepage
- impact homepage
- support / footer institutionnel
- FAQ
- campagne active et ses labels
- bandeau CTA
- timeline du don
- bloc d'eligibilite homepage

## 4.2 Priorite moyenne

Peut devenir dynamique dans la phase 5 si le temps le permet :

- nom institutionnel du header
- libelles de navigation
- titres de sections du formulaire
- textes de notes institutionnelles dans le parcours rendez-vous

## 4.3 Priorite plus basse

Peut rester local temporairement :

- messages de validation purement techniques
- placeholders de formulaire
- labels internes de radio / checkbox techniques
- messages runtime de secours

## 5. Elements derives d'une campagne

Doivent pouvoir etre alimentes par une campagne active :

- hashtag ou label hero
- titre de campagne ou badge
- message de contexte dans la homepage
- CTA associe a la campagne
- preselection ou contextualisation du `campaignCode`

Etat actuel :

- le hero sait deja afficher un `campaignLabel`
- mais la campagne n'a pas encore une exploitation editoriale assez riche

## 6. Composants critiques a verifier en RTL

Doivent etre testes et probablement ajustes pendant la phase 5 :

- [front/src/components/layout/AppHeader.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/layout/AppHeader.tsx)
- [front/src/components/layout/LanguageSwitcher.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/layout/LanguageSwitcher.tsx)
- [front/src/components/marketing/HeroSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/HeroSection.tsx)
- [front/src/components/marketing/ImpactSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/ImpactSection.tsx)
- [front/src/components/marketing/EligibilityPreviewSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/EligibilityPreviewSection.tsx)
- [front/src/components/marketing/CtaBannerSection.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/marketing/FaqSection.tsx)
- [front/src/components/appointment/EligibilityGate.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/appointment/EligibilityGate.tsx)
- [front/src/components/appointment/AppointmentForm.tsx](/Users/abdoufrigaa/Projects/doc%20syste%CC%80me%20/front/src/components/appointment/AppointmentForm.tsx)

Points sensibles en `RTL` :

- alignement du header
- ordre des icones / textes inline
- sens des fleches CTA
- cartes avec icones a gauche
- radios et checkboxes
- accordions FAQ
- mise en page hero desktop

## 7. Mapping cible contenu -> source

| Zone | Source cible | Etat actuel |
| --- | --- | --- |
| Hero | `back` via `home-content` + campagne active | partiel |
| Impact | `back` via `home-content` | partiel |
| Eligibility preview | `back` via `home-content` | local |
| CTA banner | `back` via `home-content` | local |
| Process | `back` via `home-content` | local |
| FAQ | `back` via `faq` | deja branche, fallback local |
| Support/Footer | `back` via `home-content` | partiel |
| Form metadata | `back` via `appointment-form-meta` | deja branche, fallback local |
| Form labels UX | local ou i18n frontend | local |

## 8. Conclusion du Task 1

Le front est deja semi-integre, mais il reste encore un noyau important de contenu public code en dur.

La priorite de la phase 5 doit etre :

1. finir de rendre la homepage largement backend-driven
2. enrichir le modele de campagne
3. mettre en place la vraie gestion `FR/AR`
4. verifier `RTL`

## 9. Livrable suivant

Le task suivant logique est :

- extension du modele de contenu public cote `back`
- puis structuration plus serieuse des campagnes
