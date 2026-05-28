# Phase 2 - Front public et parcours de rendez-vous

## 1. Objet de la phase

Cette phase transforme la documentation de cadrage en plan d'implementation concret pour le repo `front`.

L'objectif est de construire:

- l'interface publique fidele au site de reference
- le parcours de pre-eligibilite
- le formulaire de prise de rendez-vous
- la couche d'integration avec le backend

Cette phase ne couvre pas encore le back-office admin.

## 2. Resultat attendu

A la fin de la phase 2, le repo `front` doit permettre:

- d'afficher une homepage tres proche de la reference
- d'afficher une page de rendez-vous complete
- de gerer le formulaire avec validation front
- d'appeler l'API `back`
- d'afficher des retours de succes et d'erreur propres

## 3. Perimetre

### Inclus

- setup du repo `front`
- integration Tailwind + shadcn/ui
- systeme de layout public
- homepage
- page de rendez-vous
- i18n minimale FR/AR
- gestion de la pre-eligibilite
- soumission du formulaire
- etats `loading`, `error`, `success`

### Hors perimetre

- espace admin
- analytics avancees
- authentification
- edition dynamique des contenus depuis un CMS
- tests e2e complets

## 4. Stack frontend retenue

- `React`
- `Vite`
- `TypeScript`
- `React Router`
- `Tailwind CSS`
- `shadcn/ui`
- `blocks.so`
- `react-hook-form`
- `zod`

## 5. Livrables de la phase

1. repo `front` initialise
2. routing public en place
3. design system de base local
4. homepage implementee
5. page rendez-vous implementee
6. couche API frontend
7. validation formulaire
8. documentation frontend de prise en main

## 6. Structure de dossiers cible

```text
front/
  public/
    images/
    icons/
  src/
    app/
      layouts/
      providers/
      router/
    pages/
      home/
        HomePage.tsx
      appointment/
        AppointmentPage.tsx
      not-found/
        NotFoundPage.tsx
    components/
      layout/
        AppHeader.tsx
        AppFooter.tsx
        LanguageSwitcher.tsx
        PageContainer.tsx
        SectionShell.tsx
      marketing/
        HeroSection.tsx
        ImpactSection.tsx
        EligibilityPreviewSection.tsx
        CtaBannerSection.tsx
        ProcessSection.tsx
        FaqSection.tsx
      appointment/
        EligibilityGate.tsx
        AppointmentForm.tsx
        AppointmentFormSection.tsx
        BloodGroupSelector.tsx
        DonationTypeSelector.tsx
      ui/
    features/
      home/
      faq/
      eligibility/
      appointment/
        api/
        schema/
        hooks/
        mappers/
        constants/
    lib/
      api/
      config/
      constants/
      utils/
      formatters/
    content/
      fr/
      ar/
    i18n/
    styles/
    main.tsx
  docs/
```

## 7. Architecture fonctionnelle du front

## 7.1 Couche layout

Responsabilite:

- structure globale du site
- header sticky
- footer
- container width
- comportement FR/AR

Composants cibles:

- `AppHeader`
- `AppFooter`
- `LanguageSwitcher`
- `PageContainer`
- `SectionShell`

## 7.2 Couche pages

Responsabilite:

- assembler les sections
- connecter les features principales
- conserver les pages minces

Pages cibles:

- `HomePage`
- `AppointmentPage`
- `NotFoundPage`

## 7.3 Couche features

Responsabilite:

- logique metier frontend
- schemas formulaire
- appels API
- mapping des erreurs
- configuration de sections metier

## 7.4 Couche UI

Responsabilite:

- composants `shadcn/ui`
- primitives de formulaire
- boutons
- accordions
- cards

## 8. Pages a construire

## 8.1 Homepage

Sections a construire dans cet ordre:

1. Header
2. Hero
3. Bloc impact
4. Bloc eligibilite
5. Bandeau CTA
6. Bloc process
7. Bloc FAQ
8. Bloc support
9. Footer

### Exigences de fidelite

- hero en 2 colonnes desktop
- titre fort noir + rouge
- gros CTA rouge
- cartes statistiques avec medaillon icone
- cartes eligibilite vert/rouge
- timeline en 3 cartes
- accordions FAQ larges
- footer sombre institutionnel

## 8.2 Page rendez-vous

Sections a construire dans cet ordre:

1. Header
2. Hero de page
3. Gate de pre-eligibilite
4. Formulaire principal en sections numerotees
5. Footer

### Exigences de fidelite

- titre de page centre
- carte blanche de pre-eligibilite
- formulaire en grosses sections cartes
- grille de selection visuelle pour groupe sanguin et type de don
- bouton submit rouge centre

## 9. Composants frontend prioritaires

## 9.1 Composants layout

- `AppHeader`
- `AppFooter`
- `LanguageSwitcher`
- `PageContainer`
- `SectionShell`

## 9.2 Composants homepage

- `HeroSection`
- `ImpactSection`
- `ImpactCard`
- `EligibilityPreviewSection`
- `EligibilityListCard`
- `CtaBannerSection`
- `ProcessSection`
- `ProcessStepCard`
- `FaqSection`

## 9.3 Composants rendez-vous

- `EligibilityGate`
- `AppointmentForm`
- `AppointmentFormSection`
- `AppointmentTextField`
- `AppointmentSelectField`
- `BloodGroupSelector`
- `DonationTypeSelector`
- `ExistingDonorSection`
- `RemarksTextarea`
- `FormSubmitState`

## 10. Strategie i18n minimale

## 10.1 Objectif

Permettre une base FR/AR des la phase 2 sans exploser la complexite.

## 10.2 Recommandation

- garder les contenus dans `content/fr` et `content/ar`
- ajouter une couche `i18n` simple
- stocker la locale active dans le router, un context ou un state global simple
- prevoir `dir="rtl"` pour `ar`

## 10.3 Regle de dev

Les composants ne doivent pas hardcoder toutes leurs chaines.

## 11. Couche API frontend

## 11.1 Objectif

Decoupler les composants des appels HTTP directs.

## 11.2 Fichiers cibles

```text
src/lib/api/
  client.ts
  publicApi.ts
  appointmentApi.ts
  homeApi.ts
  faqApi.ts
```

## 11.3 Responsabilites

### `client.ts`

- base URL
- helper `get/post`
- parsing de reponse
- gestion des erreurs reseau

### `appointmentApi.ts`

- `getAppointmentFormMeta`
- `getAppointmentSlots`
- `createAppointmentRequest`

### `homeApi.ts`

- `getHomeContent`

### `faqApi.ts`

- `getFaqItems`

## 12. Validation formulaire

## 12.1 Strategie

Le formulaire doit etre gere avec:

- `react-hook-form`
- `zod`

## 12.2 Schema de validation front

Le schema doit couvrir:

- nom
- prenom
- date de naissance
- genre
- telephone
- email optionnel
- wilaya
- commune
- date de rendez-vous
- heure
- groupe sanguin
- type de don
- deja donneur
- date du dernier don conditionnelle
- checklist d'eligibilite
- remarques optionnelles

## 12.3 Mapping d'erreurs serveur

Le `front` doit etre capable de mapper:

- `VALIDATION_ERROR`
- `SLOT_UNAVAILABLE`
- erreurs generiques

## 13. Etats UX a prevoir

## 13.1 Chargement

- loading de la homepage si contenus backend
- loading du formulaire meta
- loading des slots
- loading de la soumission

## 13.2 Erreurs

- erreur de fetch homepage
- erreur de meta formulaire
- erreur de validation serveur
- erreur de creneau
- erreur serveur generique

## 13.3 Succes

- confirmation de demande envoyee
- reset ou verrou du formulaire apres succes

## 14. Responsive et accessibilite

## 14.1 Responsive

Exigences:

- mobile-first
- hero empile sur mobile
- cartes statistiques en colonne sur mobile
- formulaire a une colonne sur mobile
- grosses zones de clic

## 14.2 Accessibilite

Exigences minimales:

- labels explicites
- champs relies a leurs erreurs
- navigation clavier
- contraste suffisant
- accordions accessibles

## 15. Ordre d'implementation recommande

## Bloc A - Setup

1. initialiser Vite React TypeScript
2. installer Tailwind
3. installer shadcn/ui
4. installer React Router
5. installer react-hook-form + zod
6. configurer aliases

## Bloc B - Infrastructure front

1. poser le router
2. poser le layout global
3. poser le systeme de langue minimal
4. poser la couche API client

## Bloc C - Homepage

1. `AppHeader`
2. `HeroSection`
3. `ImpactSection`
4. `EligibilityPreviewSection`
5. `CtaBannerSection`
6. `ProcessSection`
7. `FaqSection`
8. `AppFooter`

## Bloc D - Page rendez-vous

1. hero de page
2. `EligibilityGate`
3. structure `AppointmentForm`
4. sections du formulaire
5. validation `zod`
6. branchement API
7. etats succes/erreur

## 16. Risques frontend principaux

### Risque 1 - Sur-utiliser les blocs sans controle

Effet:

- UI incoherente
- derive par rapport a la reference

Mitigation:

- utiliser `blocks.so` comme accelerateur, pas comme generateur aveugle

### Risque 2 - Page trop monolithique

Effet:

- maintenance difficile

Mitigation:

- decomposer tres tot les sections

### Risque 3 - i18n ajoutee trop tard

Effet:

- dette forte sur layout et contenu

Mitigation:

- poser le squelette FR/AR des le depart

## 17. Criteres d'acceptation de la phase 2

La phase 2 est complete si:

- le repo `front` est initialise proprement
- la homepage est tres proche de la reference
- la page rendez-vous est complete
- la pre-eligibilite est fonctionnelle
- la validation front est en place
- l'API `back` peut etre appelee via une couche dediee
- le responsive mobile est correct
- le code est structure par composants et features

## 18. Dependances de la phase

Cette phase depend de:

- la phase 1 complete
- le contrat API
- le modele de donnees

Mais elle peut commencer avant que le backend soit totalement fini, a condition de travailler avec mocks ou contrats stables.

## 19. Suite logique

Apres cette phase, les suites possibles sont:

1. Phase 3 detaillee pour `back`
2. execution reelle de la creation du repo `front`
3. prototypage du `front` avec mocks, puis branchement progressif sur `back`
