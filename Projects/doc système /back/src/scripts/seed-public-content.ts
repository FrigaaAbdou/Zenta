import "dotenv/config";

import { connectToDatabase, disconnectFromDatabase } from "../config/db.js";
import { DonationCampaignModel } from "../modules/campaigns/campaign.model.js";
import { SiteContentModel } from "../modules/content/content.model.js";
import { FAQEntryModel } from "../modules/faq/faq.model.js";

const homeContent = {
  key: "home",
  localeContent: {
    fr: {
      hero: {
        eyebrow: "Centre de Transfusion Sanguine",
        title: "Donner son sang, c'est sauver des vies",
        description:
          "Chaque don peut sauver jusqu'a 3 vies. Rejoignez la mission solidaire du Centre de Transfusion Sanguine du CHU Mustapha et prenez rendez-vous en quelques clics.",
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
            label: "Collecte active",
            value: "7j/7",
          },
          {
            label: "Parcours encadre",
            value: "100%",
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
            title: "Age entre 18 et 65 ans",
            description: "Le donneur doit se situer dans la tranche d'age medicalement autorisee.",
          },
          {
            title: "Poids minimum 50 kg",
            description: "Le poids minimum garantit un prelevement securise et adapte.",
          },
          {
            title: "Bonne sante generale",
            description: "L'absence de symptomes ou de maladie recente facilite la prise en charge.",
          },
          {
            title: "Ne pas etre a jeun",
            description: "Une bonne hydratation et un repas leger sont recommandes avant la venue.",
          },
        ],
      },
      ctaBanner: {
        title: "Passez a l'action des aujourd'hui",
        description:
          "Verifiez votre eligibilite, choisissez un creneau disponible et aidez le centre a stabiliser les reserves pour les patients.",
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
            description: "Vous confirmez votre eligibilite et vos informations essentielles avant la validation de la demande.",
          },
          {
            title: "Choix du creneau",
            description: "Vous selectionnez la date et l'heure les plus adaptees a votre disponibilite.",
          },
          {
            title: "Accueil au centre",
            description: "L'equipe medicale vous prend en charge le jour du rendez-vous et vous accompagne jusqu'a la fin du parcours.",
          },
        ],
      },
      sections: [
        { key: "impact", title: "Pourquoi votre don compte" },
        { key: "eligibility", title: "Qui peut donner" },
        { key: "process", title: "Comment se deroule le don" },
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
          "كل تبرع يمكن ان ينقذ حتى ثلاث ارواح. انضم الى مهمة التضامن في مركز نقل الدم بالمستشفى الجامعي مصطفى واحجز موعدك بسهولة.",
        primaryCtaLabel: "اتبرع الان",
        secondaryCtaLabel: "تحقق من الاهلية",
      },
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
            label: "استمرار الجمع",
            value: "7/7",
          },
          {
            label: "مسار مؤطر",
            value: "100%",
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
            title: "العمر بين 18 و65 سنة",
            description: "يجب ان يكون المتبرع ضمن الفئة العمرية المسموح بها طبيا.",
          },
          {
            title: "الوزن الادنى 50 كلغ",
            description: "الوزن المناسب يساعد على ضمان تبرع آمن ومتكيف مع الملف الصحي.",
          },
          {
            title: "حالة صحية جيدة",
            description: "غياب الاعراض او المرض الحديث يسهل استقبال المتبرع.",
          },
          {
            title: "عدم الحضور على معدة فارغة",
            description: "ينصح بشرب الماء وتناول وجبة خفيفة قبل الحضور.",
          },
        ],
      },
      ctaBanner: {
        title: "اتخذ الخطوة اليوم",
        description:
          "تحقق من الاهلية واختر موعدا متاحا وساهم في استقرار مخزون الدم لفائدة المرضى.",
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
            description: "تؤكد اهليتك ومعلوماتك الاساسية قبل تثبيت الطلب.",
          },
          {
            title: "اختيار الموعد",
            description: "تختار التاريخ والوقت المناسبين حسب توفر المواعيد.",
          },
          {
            title: "الاستقبال في المركز",
            description: "يتكفل بك الفريق الطبي يوم الموعد ويرافقك حتى نهاية المسار.",
          },
        ],
      },
      sections: [
        { key: "impact", title: "لماذا تبرعك مهم" },
        { key: "eligibility", title: "من يمكنه التبرع" },
        { key: "process", title: "كيف تتم العملية" },
      ],
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
  },
} as const;

const faqEntries = [
  {
    slug: "eligibilite-age-poids",
    category: "eligibility",
    order: 1,
    isPublished: true,
    localeContent: {
      fr: {
        question: "Qui peut donner son sang ?",
        answer:
          "Toute personne en bonne sante, agee de 18 a 65 ans et pesant au moins 50 kg peut generalement donner son sang.",
      },
      ar: {
        question: "من يمكنه التبرع بالدم؟",
        answer:
          "يمكن عادة لكل شخص يتمتع بصحة جيدة ويتراوح عمره بين 18 و65 سنة ويزن 50 كلغ على الاقل ان يتبرع بالدم.",
      },
    },
  },
  {
    slug: "frequence-don",
    category: "general",
    order: 2,
    isPublished: true,
    localeContent: {
      fr: {
        question: "A quelle frequence peut-on donner ?",
        answer:
          "Un homme peut donner jusqu'a 4 fois par an et une femme jusqu'a 3 fois, sous reserve de l'avis medical et du delai entre deux dons.",
      },
      ar: {
        question: "كم مرة يمكن التبرع؟",
        answer:
          "يمكن للرجل التبرع حتى 4 مرات في السنة وللمرأة حتى 3 مرات، حسب الراي الطبي واحترام المدة بين التبرعين.",
      },
    },
  },
  {
    slug: "duree-rendez-vous",
    category: "process",
    order: 3,
    isPublished: true,
    localeContent: {
      fr: {
        question: "Combien de temps dure un don ?",
        answer:
          "Le parcours complet dure en moyenne entre 30 et 45 minutes, incluant l'accueil, l'entretien medical, le prelevement et le repos.",
      },
      ar: {
        question: "كم يستغرق التبرع؟",
        answer:
          "تستغرق العملية الكاملة في المتوسط بين 30 و45 دقيقة، وتشمل الاستقبال والفحص الطبي وسحب الدم وفترة الراحة.",
      },
    },
  },
  {
    slug: "securite-don",
    category: "safety",
    order: 4,
    isPublished: true,
    localeContent: {
      fr: {
        question: "Le don de sang est-il securise ?",
        answer:
          "Oui. Le prelevement est realise avec du materiel sterile a usage unique, sous supervision d'une equipe medicale qualifiee.",
      },
      ar: {
        question: "هل التبرع بالدم آمن؟",
        answer:
          "نعم. يتم سحب الدم باستعمال معدات معقمة للاستعمال الواحد وتحت إشراف فريق طبي مؤهل.",
      },
    },
  },
  {
    slug: "prise-rendez-vous-ligne",
    category: "appointment",
    order: 5,
    isPublished: true,
    localeContent: {
      fr: {
        question: "Puis-je prendre rendez-vous en ligne ?",
        answer:
          "Oui. La demande de rendez-vous se fait directement depuis l'application, apres verification rapide de votre eligibilite.",
      },
      ar: {
        question: "هل يمكنني طلب موعد عبر الانترنت؟",
        answer:
          "نعم. يمكن ارسال طلب الموعد مباشرة من التطبيق بعد التحقق السريع من الاهلية.",
      },
    },
  },
] as const;

const activeCampaigns = [
  {
    code: "SOLIDARITE-2026",
    status: "published",
    isPublished: true,
    isActive: true,
    priority: 90,
    badgeLabel: "Urgence estivale",
    theme: "emergency",
    startDate: null,
    endDate: null,
    localeContent: {
      fr: {
        title: "Campagne de solidarite estivale",
        description:
          "Participez a notre campagne prioritaire et aidez-nous a maintenir un stock de sang stable pour les urgences et les blocs operatoires.",
        ctaLabel: "Participer a la campagne",
      },
      ar: {
        title: "حملة التضامن الصيفية",
        description:
          "شارك في حملتنا ذات الاولوية وساعدنا على الحفاظ على مخزون دم مستقر لفائدة الاستعجالات وعمليات الجراحة.",
        ctaLabel: "المشاركة في الحملة",
      },
    },
  },
  {
    code: "JEUNES-DONNEURS-2026",
    status: "published",
    isPublished: true,
    isActive: true,
    priority: 60,
    badgeLabel: "Collecte campus",
    theme: "community",
    startDate: null,
    endDate: null,
    localeContent: {
      fr: {
        title: "Mobilisation jeunes donneurs",
        description:
          "Une campagne de sensibilisation orientee vers les jeunes donneurs pour encourager le don regulier et les premieres prises de rendez-vous.",
        ctaLabel: "Decouvrir la campagne",
      },
      ar: {
        title: "حملة تعبئة المتبرعين الشباب",
        description:
          "حملة توعوية موجهة للشباب لتشجيع التبرع المنتظم واول طلبات المواعيد.",
        ctaLabel: "اكتشف الحملة",
      },
    },
  },
] as const;

async function seedPublicContent() {
  await connectToDatabase();

  await SiteContentModel.updateOne(
    { key: homeContent.key },
    { $set: homeContent },
    { upsert: true },
  );

  for (const entry of faqEntries) {
    await FAQEntryModel.updateOne(
      { slug: entry.slug },
      { $set: entry },
      { upsert: true },
    );
  }

  for (const campaign of activeCampaigns) {
    await DonationCampaignModel.updateOne(
      { code: campaign.code },
      { $set: campaign },
      { upsert: true },
    );
  }

  console.log("Seeded public content, bilingual FAQ entries, and active campaigns.");
}

seedPublicContent()
  .catch((error: unknown) => {
    console.error("Failed to seed public content", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabase();
  });
