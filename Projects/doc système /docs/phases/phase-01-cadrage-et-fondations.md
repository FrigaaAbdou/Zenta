# Phase 1 - Cadrage, Retro-analyse et Fondations

## 1. Objet de la phase

Cette phase ne sert pas a coder l'application finale. Elle sert a eliminer l'ambiguite avant implementation.

Le but est de produire une base de travail assez riche pour qu'un developpeur puisse:

- comprendre le site de reference
- comprendre la cible produit
- savoir comment decouper frontend et backend
- savoir quels domaines metier existent
- savoir quelles donnees seront stockees
- savoir quelles API seront exposees
- savoir dans quel ordre construire la suite

Si cette phase est bien executee, le reste du projet devient plus mecanique et beaucoup moins risqué.

## 2. Resultat attendu a la fin de la phase

A la fin de la phase 1, l'equipe doit disposer d'un socle documentaire permettant de lancer la phase 2 sans re-debattre des fondements.

Concretement, on veut sortir avec:

- une lecture claire du site de reference
- une cartographie des pages et parcours
- une architecture cible pour `front` et `back`
- une premiere version du modele de donnees MongoDB
- une premiere version des contrats API utiles au front
- une definition des conventions techniques et documentaires
- un decoupage clair des prochaines phases

Documents issus des premieres etapes:

- `docs/phases/phase-01-step-01-retro-analyse-site.md`
- `docs/phases/phase-01-step-01b-cartographie-ecrans.md`
- `docs/phases/phase-01-step-02-architecture-front-back.md`
- `docs/phases/phase-01-step-03-modele-donnees-mongodb.md`
- `docs/phases/phase-01-step-04-contrat-api-front-back.md`

## 3. Perimetre de la phase

### Inclus

- analyse fonctionnelle du site actuel
- analyse de la structure visuelle et des composants repetitifs
- definition de l'application cible
- definition des responsabilites du frontend
- definition des responsabilites du backend
- definition des domaines metier
- ebauche du schema de donnees
- ebauche du contrat API
- definition des conventions de dossiers et de nommage
- definition des risques structurants

### Hors perimetre

- implementation UI finale
- creation reelle des deux repos
- integration MongoDB operationnelle
- back-office admin
- tests automatises complets
- deploiement

## 4. Analyse du site de reference

## 4.1 Pages identifiees

### Page d'accueil

URL:

- `https://cts-chu-mustapha.com/fr`

Sections observees:

- hero principal
- chiffres/impact
- eligibilite
- deroulement du don
- FAQ
- CTA de campagne
- footer/contact

### Page de prise de rendez-vous

URL:

- `https://cts-chu-mustapha.com/contact`

Sections observees:

- rappel d'eligibilite
- formulaire multi-sections
- identite
- rendez-vous
- type de don
- historique donneur
- remarques

## 4.2 Parcours utilisateur observe

Parcours public principal actuel:

1. l'utilisateur arrive sur la page d'accueil
2. il comprend la mission et la promesse
3. il verifie rapidement s'il est eligible
4. il consulte le processus ou la FAQ
5. il clique sur le CTA de rendez-vous
6. il remplit le formulaire de demande

## 4.3 Forces du site actuel

- message clair
- CTA visibles
- bon ton institutionnel
- sections faciles a comprendre
- parcours direct vers l'action

## 4.4 Faiblesses ou limites probables

- separation front / logique metier peu visible
- formulaire probablement peu structure en profondeur
- extensibilite admin inconnue
- contenu et logique probablement couples
- validation et persistance a verifier
- bilingue a structurer plus proprement dans la nouvelle version

## 5. Cible fonctionnelle de la V1 applicative

La V1 cible doit etre comprise comme un noyau exploitable et extensible.

Elle doit couvrir:

- l'experience publique
- le rendez-vous donneur
- la persistence des demandes
- la base des contenus et campagnes

Elle ne doit pas encore chercher a tout faire.

### Capacites attendues en V1

- afficher une homepage fidele
- permettre a l'utilisateur de comprendre l'eligibilite
- afficher FAQ et informations centre
- proposer un formulaire de rendez-vous complet
- transmettre le formulaire au backend
- stocker la demande en base
- prevoir les structures de campagne et de contenu

## 6. Architecture cible de la phase

## 6.1 Repo frontend - `front`

Objectif:

- porter tout ce que l'utilisateur voit et utilise cote public

Responsabilites:

- routes publiques
- composants visuels
- sections fideles au site
- formulaire de rendez-vous
- validations front
- etats de chargement, succes, erreur
- couche d'appel API
- i18n FR/AR

Structure suggeree:

```text
front/
  src/
    app/
    pages/
    components/
      marketing/
      appointment/
      layout/
      ui/
    features/
      home/
      faq/
      eligibility/
      appointment/
      campaigns/
    lib/
      api/
      config/
      utils/
    content/
    i18n/
    hooks/
    styles/
  public/
  docs/
```

## 6.2 Repo backend - `back`

Objectif:

- fournir les API et la logique metier

Responsabilites:

- endpoints REST
- validation serveur
- modeles MongoDB
- logique rendez-vous
- gestion campagne
- lecture eventuelle de contenus dynamiques
- base preparatoire pour auth admin

Structure suggeree:

```text
back/
  src/
    config/
    server/
    modules/
      appointments/
      donors/
      campaigns/
      content/
      eligibility/
      admin/
    middlewares/
    lib/
    db/
    validation/
    utils/
  docs/
```

## 7. Domaines metier a figer en phase 1

## 7.1 Donor

But:

- representer la personne qui souhaite donner

Champs probables:

- `firstName`
- `lastName`
- `birthDate`
- `gender`
- `phone`
- `email`
- `wilaya`
- `commune`
- `bloodType`
- `isExistingDonor`
- `lastDonationDate`
- `notes`

## 7.2 AppointmentRequest

But:

- representer la demande de rendez-vous soumise depuis le site

Champs probables:

- `donorId` ou snapshot donneur
- `campaignCode`
- `appointmentDate`
- `appointmentTime`
- `donationType`
- `eligibilityChecklist`
- `status`
- `sourceLocale`
- `createdAt`

Statuts probables:

- `pending`
- `confirmed`
- `rejected`
- `cancelled`
- `completed`

## 7.3 Campaign

But:

- rattacher les prises de rendez-vous a une campagne active ou a un code de communication

Champs probables:

- `code`
- `title`
- `description`
- `status`
- `startDate`
- `endDate`
- `ctaLabel`

## 7.4 FAQEntry

But:

- alimenter la FAQ depuis une source structurée

Champs probables:

- `slug`
- `question.fr`
- `question.ar`
- `answer.fr`
- `answer.ar`
- `category`
- `order`
- `isPublished`

## 7.5 SiteContent

But:

- permettre de versionner ou piloter les contenus recurrentiels

Champs probables:

- `key`
- `locale`
- `value`
- `section`
- `updatedAt`

## 8. Contrat API initial a definir dans cette phase

La phase 1 ne code pas l'API, mais elle doit figer l'intention.

## 8.1 Endpoints frontend/public

### Recuperer le contenu public

- `GET /api/public/home`
- `GET /api/public/faq`
- `GET /api/public/campaigns/active`

### Recuperer les references de formulaire

- `GET /api/public/appointment-form-meta`

Retour attendu:

- liste des wilayas
- communes eventuelles
- types de don
- groupes sanguins
- plages horaires disponibles ou placeholder

### Soumettre une demande de rendez-vous

- `POST /api/public/appointments`

Payload attendu:

```json
{
  "firstName": "string",
  "lastName": "string",
  "birthDate": "YYYY-MM-DD",
  "gender": "male|female",
  "phone": "string",
  "email": "string|null",
  "wilaya": "string",
  "commune": "string",
  "campaignCode": "string|null",
  "appointmentDate": "YYYY-MM-DD",
  "appointmentTime": "HH:mm",
  "bloodType": "A+|A-|B+|B-|AB+|AB-|O+|O-",
  "donationType": "whole_blood|plasma|platelets",
  "isExistingDonor": true,
  "lastDonationDate": "YYYY-MM-DD|null",
  "eligibilityChecklist": {
    "ageConfirmed": true,
    "weightConfirmed": true,
    "healthyConfirmed": true,
    "noContraIndicationConfirmed": true
  },
  "notes": "string|null",
  "locale": "fr"
}
```

Reponse de succes attendue:

```json
{
  "success": true,
  "appointmentRequestId": "string",
  "status": "pending",
  "message": "Votre demande a bien ete enregistree."
}
```

## 8.2 Endpoints admin futurs a prefigurer

- `GET /api/admin/appointments`
- `PATCH /api/admin/appointments/:id/status`
- `GET /api/admin/campaigns`
- `POST /api/admin/campaigns`
- `PATCH /api/admin/content/:key`

Ces endpoints ne sont pas a implementer en phase 1, mais ils influencent la structure.

## 9. Exigences UX et UI a figer en phase 1

### Homepage

- hero tres proche de la reference
- CTA primaire vers rendez-vous
- chiffres d'impact
- carte eligibilite
- timeline "comment ca se passe"
- FAQ accordion
- footer institutionnel

### Formulaire

- structure en etapes visuelles ou sections numerotees
- labels clairs
- erreurs explicites
- comportement mobile propre
- confirmation explicite a la soumission

### Bilingue

- contenus FR/AR pensés des le debut
- gestion future du RTL
- ne pas hardcoder toutes les chaines dans les composants

## 10. Exigences techniques a produire ou figer en phase 1

### Frontend

- convention de routing
- convention de nommage des composants
- structure `feature-first` legere ou hybride
- gestion des appels API
- gestion des erreurs utilisateur
- choix du systeme de formulaires

### Backend

- convention de modules Express
- convention de validation
- convention d'erreurs HTTP
- convention de mapping `request -> validation -> service -> model -> response`

### Documentation

- un fichier `.md` par phase
- chaque fichier doit etre actionnable seul
- chaque decision importante doit avoir un rationnel

## 11. Livrables documentaires concrets de la phase 1

La phase 1 doit produire ou confirmer les artefacts suivants:

1. `docs/phase-master-plan.md`
2. `docs/phases/phase-01-cadrage-et-fondations.md`
3. futur document d'architecture frontend
4. futur document d'architecture backend
5. futur document modele MongoDB
6. futur document contrat API

## 12. Risques a reduire pendant cette phase

### Risque 1 - Copier le visuel sans structurer le produit

Impact:

- frontend joli mais base faible pour evolutions

Reduction:

- documentation des domaines metier
- separation claire front/back

### Risque 2 - Surconcevoir trop tot

Impact:

- ralentissement inutile

Reduction:

- garder une V1 centree sur homepage + rendez-vous + persistence

### Risque 3 - Bilingue ajoute trop tard

Impact:

- dette technique UI/UX

Reduction:

- penser la structure des contenus des la phase 1

### Risque 4 - Admin pris en compte trop tard structurellement

Impact:

- API publique difficile a faire evoluer

Reduction:

- prefigurer modules et statuts des maintenant, sans developper l'admin

## 13. Criteres d'acceptation de la phase 1

La phase 1 est consideree complete si:

- le site de reference est decrit correctement
- les 2 repos sont clairement delimites
- les domaines metier sont identifies
- la premiere version des modeles de donnees existe sur le plan documentaire
- le contrat API public initial est decrit
- les phases suivantes sont ordonnees
- un developpeur tiers peut lire les documents et demarrer la phase 2 sans briefing oral

## 14. Ordre d'execution recommande apres cette phase

1. initialiser le repo frontend
2. poser le design system local et les composants de base
3. reconstruire la homepage
4. initialiser le repo backend
5. implementer les schemas et l'endpoint de prise de rendez-vous
6. brancher le formulaire

## 15. Notes d'implementation futures

Quelques decisions probables a confirmer en phase suivante:

- `React Hook Form + Zod` cote frontend
- `Mongoose + Zod/Joi` cote backend
- structure de contenu JSON locale avant CMS complet
- configuration FR puis extension AR

## 16. Conclusion

Cette phase doit etre lue comme un verrou documentaire. Elle ne livre pas encore le produit, mais elle doit reduire le flou au minimum.

La qualite de cette phase conditionne directement:

- la vitesse des phases suivantes
- la reprise par d'autres developpeurs
- la coherence entre frontend et backend
- la fidelite du clone applicatif par rapport au site de reference
