import mongoose from "mongoose";

import { AppError } from "../../lib/errors/app-error.js";
import type { SupportedLocale } from "../../shared/constants/locales.js";
import { SiteContentModel } from "./content.model.js";

type HomeContentSection = {
  key: string;
  title: string;
};

type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  impact: {
    sectionLabel: string;
    title: string;
    description: string;
    stats: Array<{ label: string; value: string }>;
  };
  eligibilityPreview: {
    sectionLabel: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  ctaBanner: {
    title: string;
    description: string;
    ctaLabel: string;
  };
  process: {
    sectionLabel: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  sections: HomeContentSection[];
  support: {
    label: string;
    phone: string;
  };
  footer: {
    organization: string;
    institution: string;
    address: string;
    phone: string;
    email: string;
  };
};

type HomeContentPatch = {
  [K in keyof HomeContent]?: HomeContent[K] extends Array<infer Item>
    ? Item[]
    : HomeContent[K] extends object
      ? Partial<HomeContent[K]>
      : HomeContent[K];
};

export type AdminSiteContentItem = {
  id: string;
  key: string;
  localeContent: {
    fr: HomeContent;
    ar: HomeContent;
  };
};

const fallbackHomeContent: Record<SupportedLocale, HomeContent> = {
  fr: {
    hero: {
      eyebrow: "Centre de Transfusion Sanguine",
      title: "Donner son sang, c'est sauver des vies",
      description:
        "Chaque don peut sauver jusqu'à 3 vies. Rejoignez la mission solidaire du Centre de Transfusion Sanguine du CHU Mustapha.",
      primaryCtaLabel: "Je donne maintenant",
      secondaryCtaLabel: "Verifier mon eligibilite",
    },
    impact: {
      sectionLabel: "Chaque don compte",
      title: "Un geste simple qui soutient les urgences, la chirurgie et l'oncologie",
      description:
        "Le don de sang reste indispensable pour maintenir des reserves stables au CHU Mustapha et accompagner les patients qui en ont besoin chaque jour.",
      stats: [
        {
          label: "Vies soutenues par don",
          value: "3",
        },
        {
          label: "Besoin en collecte reguliere",
          value: "Quotidien",
        },
      ],
    },
    eligibilityPreview: {
      sectionLabel: "Verifier rapidement votre profil",
      title: "Les grands criteres avant de prendre rendez-vous",
      description:
        "Une verification simple permet de fluidifier l'accueil et de garantir un parcours de don plus serein.",
      items: [
        {
          title: "Age et poids conformes",
          description: "Avoir l'age requis et un poids suffisant pour donner.",
        },
        {
          title: "Bon etat general",
          description: "Ne pas presenter de symptomes ou de contre-indication immediate.",
        },
      ],
    },
    ctaBanner: {
      title: "Pret a passer a l'action ?",
      description:
        "Verifiez votre eligibilite puis choisissez un creneau adapte a votre disponibilite.",
      ctaLabel: "Prendre rendez-vous",
    },
    process: {
      sectionLabel: "Parcours de don",
      title: "Comment se deroule votre rendez-vous",
      description:
        "Le parcours est encadre par l'equipe du centre et pense pour rester simple, clair et securise.",
      items: [
        {
          title: "Verification prealable",
          description: "Vous confirmez votre eligibilite et vos informations essentielles.",
        },
        {
          title: "Choix du creneau",
          description: "Vous selectionnez la date et l'heure les plus adaptees.",
        },
        {
          title: "Accueil au centre",
          description: "L'equipe medicale vous prend en charge le jour du rendez-vous.",
        },
      ],
    },
    sections: [
      {
        key: "impact",
        title: "Pourquoi votre don compte",
      },
      {
        key: "eligibility",
        title: "Qui peut donner",
      },
      {
        key: "process",
        title: "Comment se deroule le don",
      },
    ],
    support: {
      label: "Besoin d'en savoir plus ?",
      phone: "+213560038317",
    },
    footer: {
      organization: "Centre de Transfusion Sanguine",
      institution: "CHU Mustapha Pacha",
      address: "Place du 1er Mai 1945, Sidi M'Hamed, Alger",
      phone: "+213560038317",
      email: "cts.chu.mustapha@gmail.com",
    },
  },
  ar: {
    hero: {
      eyebrow: "مركز حقن وتحاليل الدم",
      title: "التبرع بالدم ينقذ الارواح",
      description:
        "كل تبرع يمكن ان ينقذ حتى ثلاث ارواح. انضم الى مهمة التضامن في مركز نقل الدم بالمستشفى الجامعي مصطفى.",
      primaryCtaLabel: "اتبرع الان",
      secondaryCtaLabel: "تحقق من الاهلية",
    },
    sections: [
      {
        key: "impact",
        title: "لماذا تبرعك مهم",
      },
      {
        key: "eligibility",
        title: "من يمكنه التبرع",
      },
      {
        key: "process",
        title: "كيف تتم العملية",
      },
    ],
    impact: {
      sectionLabel: "كل تبرع له اثر",
      title: "خطوة بسيطة تدعم الاستعجالات والجراحة وعلاج المرضى",
      description:
        "التبرع بالدم ضروري للحفاظ على مخزون ثابت داخل المستشفى الجامعي مصطفى ومرافقة المرضى الذين يحتاجون اليه يوميا.",
      stats: [
        {
          label: "عدد الارواح التي يمكن دعمها",
          value: "3",
        },
        {
          label: "الحاجة الى جمع الدم",
          value: "يوميا",
        },
      ],
    },
    eligibilityPreview: {
      sectionLabel: "تحقق السريع من ملفك",
      title: "اهم المعايير قبل حجز الموعد",
      description:
        "التحقق السريع يساعد على تسهيل الاستقبال وضمان مسار تبرع اكثر سلاسة.",
      items: [
        {
          title: "العمر والوزن المناسبان",
          description: "توفر السن المطلوب والوزن الكافي للتبرع.",
        },
        {
          title: "حالة صحية جيدة",
          description: "عدم وجود اعراض او موانع فورية للتبرع.",
        },
      ],
    },
    ctaBanner: {
      title: "هل انت مستعد لاتخاذ الخطوة؟",
      description: "تحقق من الاهلية ثم اختر موعدا يناسب وقتك.",
      ctaLabel: "احجز موعدا",
    },
    process: {
      sectionLabel: "مسار التبرع",
      title: "كيف يتم موعد التبرع",
      description:
        "المسار مؤطر من طرف فريق المركز ومصمم ليبقى بسيطا وواضحا وآمنا.",
      items: [
        {
          title: "تحقق اولي",
          description: "تؤكد اهليتك ومعلوماتك الاساسية.",
        },
        {
          title: "اختيار الموعد",
          description: "تختار التاريخ والوقت المناسبين.",
        },
        {
          title: "الاستقبال في المركز",
          description: "يتكفل بك الفريق الطبي يوم الموعد.",
        },
      ],
    },
    support: {
      label: "هل تحتاج الى مزيد من المعلومات؟",
      phone: "+213560038317",
    },
    footer: {
      organization: "مركز نقل الدم",
      institution: "المستشفى الجامعي مصطفى باشا",
      address: "ساحة الاول من ماي 1945، سيدي امحمد، الجزائر",
      phone: "+213560038317",
      email: "cts.chu.mustapha@gmail.com",
    },
  },
};

function mergeHomeContent(
  fallback: HomeContent,
  override?: HomeContentPatch | null,
): HomeContent {
  if (!override) {
    return fallback;
  }

  return {
    ...fallback,
    ...override,
    hero: {
      ...fallback.hero,
      ...override.hero,
    },
    impact: {
      ...fallback.impact,
      ...override.impact,
      stats: override.impact?.stats ?? fallback.impact.stats,
    },
    eligibilityPreview: {
      ...fallback.eligibilityPreview,
      ...override.eligibilityPreview,
      items:
        override.eligibilityPreview?.items ?? fallback.eligibilityPreview.items,
    },
    ctaBanner: {
      ...fallback.ctaBanner,
      ...override.ctaBanner,
    },
    process: {
      ...fallback.process,
      ...override.process,
      items: override.process?.items ?? fallback.process.items,
    },
    sections: override.sections ?? fallback.sections,
    support: {
      ...fallback.support,
      ...override.support,
    },
    footer: {
      ...fallback.footer,
      ...override.footer,
    },
  };
}

function serializeAdminContent(document: {
  _id: unknown;
  key: string;
  localeContent?: Partial<Record<SupportedLocale, HomeContentPatch>>;
}): AdminSiteContentItem {
  return {
    id: String(document._id),
    key: document.key,
    localeContent: {
      fr: mergeHomeContent(fallbackHomeContent.fr, document.localeContent?.fr),
      ar: mergeHomeContent(fallbackHomeContent.ar, document.localeContent?.ar),
    },
  };
}

function createSiteContentNotFoundError() {
  return new AppError({
    statusCode: 404,
    code: "SITE_CONTENT_NOT_FOUND",
    message: "Site content not found.",
  });
}

export async function getHomeContent(locale: SupportedLocale): Promise<HomeContent> {
  if (mongoose.connection.readyState !== 1) {
    return fallbackHomeContent[locale];
  }

  const document = await SiteContentModel.findOne({ key: "home" }).lean();
  const localizedContent = document?.localeContent?.[locale];
  const frenchContent = document?.localeContent?.fr;

  if (localizedContent) {
    return mergeHomeContent(fallbackHomeContent[locale], localizedContent);
  }

  if (locale !== "fr" && frenchContent) {
    return mergeHomeContent(fallbackHomeContent.fr, frenchContent);
  }

  if (!localizedContent) {
    return fallbackHomeContent[locale];
  }

  return mergeHomeContent(fallbackHomeContent[locale], localizedContent);
}

export async function listAdminSiteContent() {
  const documents = await SiteContentModel.find({}).sort({ key: 1 }).lean();

  if (documents.length === 0) {
    return [
      {
        id: "home",
        key: "home",
        localeContent: {
          fr: fallbackHomeContent.fr,
          ar: fallbackHomeContent.ar,
        },
      },
    ];
  }

  return documents.map((document) =>
    serializeAdminContent(document as { _id: unknown; key: string; localeContent?: any }),
  );
}

export async function updateAdminSiteContentByKey(
  key: string,
  localeContent: Partial<Record<SupportedLocale, HomeContentPatch>>,
) {
  const document = await SiteContentModel.findOne({ key }).exec();

  if (!document) {
    throw createSiteContentNotFoundError();
  }

  const current = document.toObject() as {
    _id: unknown;
    key: string;
    localeContent?: Partial<Record<SupportedLocale, HomeContentPatch>>;
  };

  document.localeContent = {
    fr: {
      ...current.localeContent?.fr,
      ...localeContent.fr,
    },
    ar: {
      ...current.localeContent?.ar,
      ...localeContent.ar,
    },
  } as never;

  await document.save();

  return serializeAdminContent(document.toObject() as {
    _id: unknown;
    key: string;
    localeContent?: Partial<Record<SupportedLocale, HomeContentPatch>>;
  });
}
