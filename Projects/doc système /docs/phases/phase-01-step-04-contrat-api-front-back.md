# Phase 1 - Etape 4 - Contrat API detaille entre `front` et `back`

## 1. Objet

Cette etape formalise l'interface HTTP entre le repo `front` et le repo `back`.

Le but est de figer:

- les endpoints publics utiles a la V1
- les payloads d'entree
- les reponses de succes
- les reponses d'erreur
- les conventions de statut HTTP
- les sequences d'appel attendues cote frontend

Ce document sert de reference contractuelle avant implementation.

## 2. Principes generaux du contrat API

## 2.1 Style d'API

- API REST JSON
- endpoints namespaces sous `/api/public`
- futurs endpoints admin sous `/api/admin`
- pas de rendu HTML par le backend

## 2.2 Format de reponse standard

### Reponse de succes

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

### Reponse d'erreur

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "string",
    "details": []
  }
}
```

## 2.3 Headers attendus

### Requete

- `Content-Type: application/json`
- `Accept: application/json`
- `Accept-Language: fr` ou `ar` recommande

### Reponse

- `Content-Type: application/json; charset=utf-8`

## 2.4 Conventions de statut HTTP

- `200` lecture OK
- `201` creation OK
- `400` requete invalide
- `404` ressource absente
- `409` conflit metier
- `422` validation metier/detail formulaire
- `500` erreur serveur

## 3. Endpoints publics V1

Les endpoints V1 minimaux recommandes sont:

1. `GET /api/public/home`
2. `GET /api/public/faq`
3. `GET /api/public/campaigns/active`
4. `GET /api/public/appointment-form-meta`
5. `POST /api/public/appointments`

## 4. Endpoint `GET /api/public/home`

## 4.1 Role

Fournir les contenus necessaires a la homepage.

## 4.2 Query params

- `locale=fr|ar` optionnel

Si absent:

- le backend peut utiliser `Accept-Language`
- sinon retomber sur `fr`

## 4.3 Reponse de succes

```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "Donner son sang, c'est sauver des vies",
      "description": "Chaque don peut sauver jusqu'à 3 vies.",
      "primaryCtaLabel": "Je donne maintenant",
      "primaryCtaHref": "/appointment",
      "secondaryBadge": "#SolidaritéAlgérienneParLeSang"
    },
    "impact": {
      "title": "Notre Impact",
      "items": [
        {
          "value": "135+",
          "label": "Donneurs par jour",
          "icon": "users"
        },
        {
          "value": "24h",
          "label": "Résultats médicaux",
          "icon": "clock"
        },
        {
          "value": "100%",
          "label": "Sécurisé",
          "icon": "heart"
        }
      ],
      "summary": "Notre centre accueille chaque jour plus de 135 donneurs généreux."
    },
    "eligibilityPreview": {
      "title": "Suis-je éligible au don ?",
      "description": "Vérifiez votre éligibilité avant de prendre rendez-vous.",
      "requirements": [
        "Âge entre 18 et 65 ans",
        "Poids minimum 50 kg",
        "Ne pas être à jeun",
        "Être en bonne santé"
      ],
      "contraIndications": [
        "Infection récente",
        "Anémie",
        "Grossesse ou allaitement",
        "Tatouage/piercing récent"
      ]
    },
    "ctaBanner": {
      "title": "Prêt(e) à sauver des vies ?",
      "description": "Réservez votre rendez-vous en quelques clics.",
      "buttonLabel": "Prendre rendez-vous",
      "buttonHref": "/appointment"
    },
    "processPreview": {
      "title": "Comment ça se passe ?",
      "steps": [
        {
          "number": 1,
          "title": "Avant le don",
          "items": [
            "Questionnaire médical",
            "Contrôle rapide"
          ]
        },
        {
          "number": 2,
          "title": "Pendant le don",
          "items": [
            "Seulement 10 minutes",
            "Matériel 100% stérile"
          ]
        },
        {
          "number": 3,
          "title": "Après le don",
          "items": [
            "Collation offerte",
            "15 minutes de repos"
          ]
        }
      ],
      "note": "Prévoyez environ 45 minutes pour votre visite complète"
    },
    "support": {
      "label": "Besoin d'en savoir plus ?",
      "phone": "+213560038317"
    },
    "footer": {
      "organization": "Centre de Transfusion Sanguine",
      "institution": "CHU Mustapha Pacha",
      "address": "Place du 1er Mai 1945, Sidi M'Hamed, Alger",
      "phone": "+213560038317",
      "email": "cts.chu.mustapha@gmail.com"
    }
  },
  "message": "Home content fetched successfully."
}
```

## 4.4 Usage cote `front`

Le `front` peut:

- hydrater la homepage
- conserver une fallback locale en cas de panne backend au debut si necessaire

## 5. Endpoint `GET /api/public/faq`

## 5.1 Role

Retourner la FAQ publique.

## 5.2 Query params

- `locale=fr|ar` optionnel
- `category` optionnel

## 5.3 Reponse de succes

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "66510001",
        "slug": "pourquoi-donner-son-sang",
        "question": "Pourquoi donner son sang ?",
        "answer": "Le sang est indispensable à de nombreux soins.",
        "category": "general",
        "order": 1
      }
    ]
  },
  "message": "FAQ fetched successfully."
}
```

## 6. Endpoint `GET /api/public/campaigns/active`

## 6.1 Role

Retourner la campagne active ou la liste des campagnes visibles.

## 6.2 Reponse de succes

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "66512001",
        "code": "SOLIDARITE-2026",
        "title": "Solidarité Algérienne par le Sang",
        "description": "Campagne nationale de sensibilisation au don.",
        "status": "active",
        "startDate": "2026-05-01T00:00:00.000Z",
        "endDate": "2026-06-30T00:00:00.000Z",
        "ctaLabel": "Prendre rendez-vous"
      }
    ]
  },
  "message": "Active campaigns fetched successfully."
}
```

## 6.3 Usage cote `front`

- afficher le hashtag ou le code campagne
- pre-remplir `campaignCode` si besoin
- contextualiser le hero ou la page appointment

## 7. Endpoint `GET /api/public/appointment-form-meta`

## 7.1 Role

Retourner les donnees de reference necessaires au formulaire.

## 7.2 Reponse de succes

```json
{
  "success": true,
  "data": {
    "locales": [
      "fr",
      "ar"
    ],
    "genders": [
      {
        "value": "male",
        "label": "Homme"
      },
      {
        "value": "female",
        "label": "Femme"
      }
    ],
    "bloodGroups": [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-"
    ],
    "donationTypes": [
      {
        "value": "whole_blood",
        "label": "Don de sang total"
      },
      {
        "value": "plasma",
        "label": "Don de plasma"
      },
      {
        "value": "platelets",
        "label": "Don de plaquettes"
      }
    ],
    "wilayas": [
      {
        "code": "16",
        "label": "Alger"
      }
    ],
    "communesByWilaya": {
      "16": [
        "Sidi M'Hamed",
        "Bab El Oued",
        "El Madania"
      ]
    },
    "eligibilityChecklistTemplate": [
      {
        "key": "ageConfirmed",
        "label": "Âge entre 18 et 65 ans"
      },
      {
        "key": "weightConfirmed",
        "label": "Poids minimum 50 kg"
      },
      {
        "key": "healthyConfirmed",
        "label": "Être en bonne santé"
      },
      {
        "key": "noContraIndicationConfirmed",
        "label": "Aucune contre-indication au don"
      }
    ]
  },
  "message": "Appointment form metadata fetched successfully."
}
```

## 7.3 Choix important pour la V1

Pour `appointmentTime`, deux options existent:

1. le renvoyer ici si les horaires sont quasi fixes
2. le renvoyer via un endpoint dependant de la date

Recommendation:

- garder `GET /api/public/appointment-form-meta` pour les meta stables
- utiliser un endpoint dedie pour les horaires dependants de la date

## 8. Endpoint `GET /api/public/appointment-slots`

## 8.1 Role

Retourner les horaires disponibles pour une date donnee.

## 8.2 Query params

- `date=YYYY-MM-DD` requis
- `campaignCode=string` optionnel

## 8.3 Reponse de succes

```json
{
  "success": true,
  "data": {
    "date": "2026-06-01",
    "slots": [
      {
        "value": "09:00",
        "label": "09:00",
        "isAvailable": true
      },
      {
        "value": "10:00",
        "label": "10:00",
        "isAvailable": true
      },
      {
        "value": "11:00",
        "label": "11:00",
        "isAvailable": false
      }
    ]
  },
  "message": "Appointment slots fetched successfully."
}
```

## 8.4 Pourquoi cet endpoint est utile

Le site de reference montre deja que l'heure depend de la date selectionnee.

Donc, meme si la V1 met en place une logique simple, il faut reserver cette interface proprement.

## 9. Endpoint `POST /api/public/appointments`

## 9.1 Role

Creer une demande de rendez-vous.

## 9.2 Payload attendu

```json
{
  "firstName": "Amine",
  "lastName": "Brahimi",
  "birthDate": "1994-06-10",
  "gender": "male",
  "phone": "+213560000000",
  "email": "amine@example.com",
  "wilayaCode": "16",
  "wilayaLabel": "Alger",
  "commune": "Sidi M'Hamed",
  "campaignCode": "SOLIDARITE-2026",
  "appointmentDate": "2026-06-01",
  "appointmentTime": "10:00",
  "bloodGroup": "O+",
  "donationType": "whole_blood",
  "isExistingDonor": true,
  "lastDonationDate": "2025-11-02",
  "eligibilityChecklist": {
    "ageConfirmed": true,
    "weightConfirmed": true,
    "healthyConfirmed": true,
    "noContraIndicationConfirmed": true
  },
  "remarks": "Souhaite être accompagné.",
  "locale": "fr"
}
```

## 9.3 Regles de validation minimales

- `firstName` requis
- `lastName` requis
- `birthDate` requise
- `phone` requis
- `wilayaCode` requis
- `commune` requise
- `appointmentDate` requise
- `appointmentTime` requis
- `bloodGroup` requis
- `donationType` requis
- `eligibilityChecklist` complet

## 9.4 Reponse de succes

Statut HTTP:

- `201`

Payload:

```json
{
  "success": true,
  "data": {
    "appointmentRequestId": "6650f9f2c10d4e5d2a3e0101",
    "status": "pending",
    "appointmentDate": "2026-06-01",
    "appointmentTime": "10:00"
  },
  "message": "Votre demande a bien été enregistrée."
}
```

## 9.5 Reponse d'erreur de validation

Statut HTTP:

- `422`

Payload:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le formulaire contient des erreurs.",
    "details": [
      {
        "field": "phone",
        "message": "Le numéro de téléphone est requis."
      },
      {
        "field": "appointmentDate",
        "message": "La date du rendez-vous est invalide."
      }
    ]
  }
}
```

## 9.6 Reponse de conflit metier

Statut HTTP:

- `409`

Exemple:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "Le créneau sélectionné n'est plus disponible.",
    "details": [
      {
        "field": "appointmentTime",
        "message": "Veuillez choisir un autre horaire."
      }
    ]
  }
}
```

## 9.7 Logique interne attendue cote `back`

Flux recommande:

1. valider le payload
2. normaliser les valeurs
3. retrouver ou creer `donor`
4. retrouver la `campaign` si `campaignCode`
5. verifier la disponibilite du creneau
6. creer `appointment_request`
7. renvoyer la confirmation

## 10. Endpoints admin reserves pour plus tard

Non implementes en V1 publique, mais a reserver dans la conception:

- `GET /api/admin/appointments`
- `GET /api/admin/appointments/:id`
- `PATCH /api/admin/appointments/:id/status`
- `GET /api/admin/campaigns`
- `POST /api/admin/campaigns`
- `PATCH /api/admin/campaigns/:id`
- `GET /api/admin/content`
- `PATCH /api/admin/content/:id`

## 11. Mapping des erreurs cote `front`

Le `front` doit traiter les familles d'erreurs suivantes:

### `400`

- payload incorrect ou incomplet

### `404`

- ressource demandee absente
- campaign code inconnu si regle stricte

### `409`

- creneau non disponible
- conflit metier equivalent

### `422`

- erreurs de champs a afficher dans le formulaire

### `500`

- erreur generique avec message de fallback

## 12. Strategie de gestion des messages utilisateur

## 12.1 Cote `back`

Le backend doit renvoyer:

- des codes stables
- des messages exploitables

## 12.2 Cote `front`

Le frontend peut:

- afficher le message serveur si present et fiable
- ou mapper `error.code` vers un message localise

Recommendation:

- conserver `error.code` comme source principale de logique
- ne pas dependre uniquement de `message`

## 13. Sequences d'appel cote `front`

## 13.1 Sequence homepage

1. `GET /api/public/home`
2. `GET /api/public/faq`
3. optionnel `GET /api/public/campaigns/active`

## 13.2 Sequence page rendez-vous

1. `GET /api/public/appointment-form-meta`
2. utilisateur choisit une date
3. `GET /api/public/appointment-slots?date=...`
4. utilisateur soumet
5. `POST /api/public/appointments`

## 14. Contrats de types recommandes cote `front`

Le repo `front` devrait definir des types derives du contrat API.

Exemples:

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
};
```

## 15. Contrats de validation recommandes cote `back`

Le repo `back` doit definir:

- schema validation requete
- type metier interne
- mapper sortie API

Cela evite de renvoyer directement des documents Mongoose bruts.

## 16. Risques si le contrat n'est pas fige

### Risque 1 - Divergence front/back

Effet:

- champs differents
- erreurs d'integration
- temps perdu

### Risque 2 - Mauvais traitement des erreurs

Effet:

- UX confuse
- messages incoherents

### Risque 3 - Couplage aux documents MongoDB

Effet:

- fuite de structure interne
- difficultes d'evolution

## 17. Criteres d'acceptation de l'etape 4

L'etape 4 est complete si:

- les endpoints publics V1 sont definis
- les payloads critiques sont ecrits
- les reponses de succes sont ecrites
- les erreurs principales sont ecrites
- les sequences d'appel cote `front` sont explicites
- un developpeur `front` et un developpeur `back` peuvent travailler en parallele sans ambiguite majeure

## 18. Suite logique

Les etapes les plus utiles apres ce contrat API sont:

1. finaliser la phase 1 avec un recap operationnel
2. rediger la phase 2 detaillee pour le repo `front`
3. ou commencer la creation reelle du repo `front` selon ce cadrage
