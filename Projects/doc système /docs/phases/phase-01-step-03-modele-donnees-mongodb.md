# Phase 1 - Etape 3 - Modele de donnees MongoDB detaille

## 1. Objet

Cette etape decrit la structure de donnees cible pour la V1 de l'application.

Le but est de fournir une base exploitable pour le repo `back`, avec:

- les collections principales
- les champs de chaque collection
- les types attendus
- les relations
- les index utiles
- les contraintes metier de base

Le modele vise la V1 publique + rendez-vous, tout en preparant les futures extensions admin.

## 2. Principes de modelisation

## 2.1 Modeliser la V1, preparer l'extension

Le modele ne doit pas etre surdimensionne. Mais il doit eviter de bloquer:

- l'ajout du back-office
- la gestion de statuts
- l'ajout de campagnes
- l'ajout de contenus dynamiques

## 2.2 Distinguer la personne et la demande

Le donneur et la demande de rendez-vous ne sont pas la meme chose.

La meme personne peut:

- faire plusieurs demandes
- participer a plusieurs campagnes
- redevenir active plus tard

Donc:

- `donor` porte l'identite
- `appointmentRequest` porte l'action de demande

## 2.3 Garder certaines donnees en snapshot

Pour des raisons de traçabilite, certains champs de rendez-vous doivent etre conserves aussi au moment de la demande, meme si un `donor` existe deja.

Exemple:

- groupe sanguin
- statut deja donneur
- date du dernier don
- remarques

## 3. Vue d'ensemble des collections

Collections recommandees pour la V1:

1. `donors`
2. `appointment_requests`
3. `campaigns`
4. `faq_entries`
5. `site_content`
6. `audit_logs` (facultatif V1 technique, recommande structurellement)

Collection reservee pour plus tard:

7. `admin_users`

## 4. Collection `donors`

## 4.1 Role

Representer une personne qui manifeste une intention de don via l'application.

## 4.2 Structure proposee

```json
{
  "_id": "ObjectId",
  "firstName": "string",
  "lastName": "string",
  "birthDate": "date",
  "gender": "male|female",
  "phone": "string",
  "email": "string|null",
  "wilayaCode": "string",
  "wilayaLabel": "string",
  "commune": "string",
  "bloodGroup": "A+|A-|B+|B-|AB+|AB-|O+|O-|unknown",
  "isExistingDonor": "boolean",
  "lastDonationDate": "date|null",
  "sourceLocale": "fr|ar",
  "notes": "string|null",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 4.3 Remarques de conception

- `wilayaCode` est preferable a un simple label libre
- `wilayaLabel` est garde pour faciliter l'affichage et l'historisation
- `bloodGroup` peut etre `unknown` si la strategie metier evolue plus tard
- `notes` doit rester limite en volume

## 4.4 Index recommandes

- index sur `phone`
- index sur `email`
- index compose sur `lastName + firstName + birthDate`
- index sur `createdAt`

## 4.5 Regle metier recommandee

Au moment de creation d'une demande:

- tenter de retrouver un `donor` existant par `phone`
- sinon creer un nouveau `donor`

Si la qualite des donnees l'exige plus tard:

- renforcer avec `phone + birthDate`

## 5. Collection `appointment_requests`

## 5.1 Role

Representer une demande de rendez-vous soumise depuis le site.

## 5.2 Structure proposee

```json
{
  "_id": "ObjectId",
  "donorId": "ObjectId",
  "campaignId": "ObjectId|null",
  "campaignCode": "string|null",
  "appointmentDate": "date",
  "appointmentTime": "string",
  "status": "pending|confirmed|rejected|cancelled|completed",
  "bloodGroup": "A+|A-|B+|B-|AB+|AB-|O+|O-",
  "donationType": "whole_blood|plasma|platelets",
  "isExistingDonor": "boolean",
  "lastDonationDate": "date|null",
  "eligibilityChecklist": {
    "ageConfirmed": "boolean",
    "weightConfirmed": "boolean",
    "healthyConfirmed": "boolean",
    "noContraIndicationConfirmed": "boolean"
  },
  "remarks": "string|null",
  "sourceLocale": "fr|ar",
  "submissionSource": "public_web",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 5.3 Pourquoi dupliquer certaines donnees du donneur

On garde sur `appointment_requests`:

- `bloodGroup`
- `isExistingDonor`
- `lastDonationDate`
- `remarks`

Parce que ces valeurs doivent refleter l'etat declare lors de la demande.

Sinon, une mise a jour ulterieure du `donor` pourrait fausser l'historique.

## 5.4 Index recommandes

- index sur `donorId`
- index sur `status`
- index compose sur `appointmentDate + appointmentTime`
- index sur `campaignId`
- index sur `createdAt`

## 5.5 Regles metier de base

- une demande creee depuis le public commence en `pending`
- `appointmentDate` doit etre une date future ou autorisee par la regle fonctionnelle
- `appointmentTime` doit correspondre a une plage valide
- `eligibilityChecklist` doit etre complet

## 6. Collection `campaigns`

## 6.1 Role

Representer une campagne de don ou un contexte de collecte.

## 6.2 Structure proposee

```json
{
  "_id": "ObjectId",
  "code": "string",
  "title": {
    "fr": "string",
    "ar": "string"
  },
  "description": {
    "fr": "string",
    "ar": "string"
  },
  "status": "draft|active|inactive|archived",
  "startDate": "date|null",
  "endDate": "date|null",
  "ctaLabel": {
    "fr": "string|null",
    "ar": "string|null"
  },
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 6.3 Index recommandes

- index unique sur `code`
- index sur `status`
- index sur `startDate`
- index sur `endDate`

## 6.4 Regles metier

- une seule campagne peut etre marquee principale si la logique produit le demande plus tard
- `code` doit etre exploitable dans le formulaire public

## 7. Collection `faq_entries`

## 7.1 Role

Stocker la FAQ publique.

## 7.2 Structure proposee

```json
{
  "_id": "ObjectId",
  "slug": "string",
  "question": {
    "fr": "string",
    "ar": "string"
  },
  "answer": {
    "fr": "string",
    "ar": "string"
  },
  "category": "general|eligibility|process|aftercare",
  "order": "number",
  "isPublished": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 7.3 Index recommandes

- index unique sur `slug`
- index compose sur `isPublished + order`
- index sur `category`

## 8. Collection `site_content`

## 8.1 Role

Stocker les contenus publics de sections qui ne meritent pas une collection metier specifique.

## 8.2 Structure proposee

```json
{
  "_id": "ObjectId",
  "key": "string",
  "section": "string",
  "locale": "fr|ar",
  "value": "mixed",
  "isPublished": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 8.3 Exemples de `key`

- `home.hero.title`
- `home.hero.description`
- `home.impact.summary`
- `home.cta.primaryLabel`
- `footer.about`

## 8.4 Usage recommande

Au debut, le front peut partir de contenus versionnes localement. Mais cette collection doit exister dans la conception pour la suite.

## 8.5 Index recommandes

- index unique sur `key + locale`
- index sur `section`
- index sur `isPublished`

## 9. Collection `audit_logs`

## 9.1 Role

Tracer les actions structurantes.

Cette collection peut etre introduite des la V1 technique ou un peu plus tard. Mais la structure doit etre pensee.

## 9.2 Structure proposee

```json
{
  "_id": "ObjectId",
  "actorType": "system|admin|public",
  "actorId": "string|null",
  "action": "string",
  "entityType": "appointment_request|donor|campaign|content",
  "entityId": "string|null",
  "metadata": "object",
  "createdAt": "date"
}
```

## 10. Collection future `admin_users`

## 10.1 Role

Representer les utilisateurs du futur back-office.

## 10.2 Structure de travail reservee

```json
{
  "_id": "ObjectId",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "super_admin|manager|operator",
  "isActive": "boolean",
  "lastLoginAt": "date|null",
  "createdAt": "date",
  "updatedAt": "date"
}
```

Cette collection n'est pas a activer tout de suite, mais elle influence les futurs endpoints admin.

## 11. Relations entre collections

## 11.1 Relation `donors` -> `appointment_requests`

- un `donor` peut avoir plusieurs `appointment_requests`
- un `appointment_request` appartient a un seul `donor`

Relation:

- `appointment_requests.donorId -> donors._id`

## 11.2 Relation `campaigns` -> `appointment_requests`

- une `campaign` peut etre associee a plusieurs `appointment_requests`
- une `appointment_request` peut etre liee a une seule `campaign` ou a aucune

Relation:

- `appointment_requests.campaignId -> campaigns._id`

## 12. Enumerations metier recommandees

## 12.1 Locales

- `fr`
- `ar`

## 12.2 Genres

- `male`
- `female`

## 12.3 Groupes sanguins

- `A+`
- `A-`
- `B+`
- `B-`
- `AB+`
- `AB-`
- `O+`
- `O-`
- `unknown` pour `donors` uniquement si utile

## 12.4 Types de don

- `whole_blood`
- `plasma`
- `platelets`

## 12.5 Statuts de demande

- `pending`
- `confirmed`
- `rejected`
- `cancelled`
- `completed`

## 12.6 Statuts de campagne

- `draft`
- `active`
- `inactive`
- `archived`

## 13. Regles de validation de donnees a prevoir

## 13.1 Donneur

- `firstName` requis
- `lastName` requis
- `birthDate` requise
- `phone` requis
- `wilayaCode` requis
- `commune` requise

## 13.2 Rendez-vous

- `appointmentDate` requise
- `appointmentTime` requise
- `bloodGroup` requis
- `donationType` requis
- `eligibilityChecklist` complet

## 13.3 Contenu

- `locale` requise
- `key` unique dans le scope de la locale

## 14. Decisions de persistence recommandees

## 14.1 Dates

Stocker en `Date` MongoDB:

- `birthDate`
- `appointmentDate`
- `lastDonationDate`
- `createdAt`
- `updatedAt`

`appointmentTime` reste une `string` de type `HH:mm` pour la V1 si les plages horaires ne sont pas encore modelisees comme objets distincts.

## 14.2 Wilaya / commune

Pour la V1:

- `wilayaCode` + `wilayaLabel`
- `commune` string

Plus tard, on pourra normaliser si necessaire avec des collections de reference.

## 14.3 Soft delete

Pas obligatoire en V1 publique.

Mais pour:

- `campaigns`
- `faq_entries`
- `site_content`

il vaut souvent mieux utiliser des statuts ou `isPublished` plutot qu'une suppression physique.

## 15. Structure Mongoose recommandee

Chaque module principal devrait exposer:

- `*.model.ts`
- `*.types.ts` si utile
- `*.schema.ts` de validation

Exemple pour appointments:

```text
modules/
  appointments/
    appointment.model.ts
    appointment.schema.ts
    appointment.types.ts
```

## 16. Exemples de documents

## 16.1 Exemple `donor`

```json
{
  "_id": "6650f9f2c10d4e5d2a3e0001",
  "firstName": "Amine",
  "lastName": "Brahimi",
  "birthDate": "1994-06-10T00:00:00.000Z",
  "gender": "male",
  "phone": "+213560000000",
  "email": "amine@example.com",
  "wilayaCode": "16",
  "wilayaLabel": "Alger",
  "commune": "Sidi M'Hamed",
  "bloodGroup": "O+",
  "isExistingDonor": true,
  "lastDonationDate": "2025-11-02T00:00:00.000Z",
  "sourceLocale": "fr",
  "notes": null,
  "createdAt": "2026-05-22T10:00:00.000Z",
  "updatedAt": "2026-05-22T10:00:00.000Z"
}
```

## 16.2 Exemple `appointment_request`

```json
{
  "_id": "6650f9f2c10d4e5d2a3e0101",
  "donorId": "6650f9f2c10d4e5d2a3e0001",
  "campaignId": null,
  "campaignCode": "SOLIDARITE-2026",
  "appointmentDate": "2026-06-01T00:00:00.000Z",
  "appointmentTime": "10:00",
  "status": "pending",
  "bloodGroup": "O+",
  "donationType": "whole_blood",
  "isExistingDonor": true,
  "lastDonationDate": "2025-11-02T00:00:00.000Z",
  "eligibilityChecklist": {
    "ageConfirmed": true,
    "weightConfirmed": true,
    "healthyConfirmed": true,
    "noContraIndicationConfirmed": true
  },
  "remarks": "Souhaite être accompagné.",
  "sourceLocale": "fr",
  "submissionSource": "public_web",
  "createdAt": "2026-05-22T10:10:00.000Z",
  "updatedAt": "2026-05-22T10:10:00.000Z"
}
```

## 17. Risques si le modele est mal pose

### Risque 1 - Fusion donneur / rendez-vous

Effet:

- historique difficile
- duplications sales
- evolution admin plus complexe

### Risque 2 - Pas de statuts explicites

Effet:

- confusion back-office
- logique floue
- bugs de workflow

### Risque 3 - Contenu public non structure

Effet:

- difficultes a faire evoluer le bilingue
- duplication front/back

## 18. Criteres d'acceptation de l'etape 3

L'etape 3 est complete si:

- les collections principales sont definies
- les champs critiques sont fixes
- les relations sont explicites
- les index importants sont identifies
- les enumerations metier sont clarifiees
- un developpeur `back` peut commencer les models Mongoose sans deviner les structures

## 19. Suite logique

La suite la plus utile est l'etape 4:

- contrat API detaille
- payloads
- responses
- erreurs
- sequences d'appel entre `front` et `back`
