import { apiRequest } from "@/lib/api/client";
import type {
  CampaignItem,
  HomeContentApiResponse,
  HomePageContent,
} from "@/features/home/types";

export const homeFallbackContent: HomePageContent = {
  hero: {
    campaignLabel: "#SolidaritéAlgérienneParLeSang",
    title: "Donner son sang, c'est sauver des vies",
    description:
      "Chaque don peut contribuer à sauver jusqu'à trois vies. Rejoignez le Centre de Transfusion Sanguine du CHU Mustapha Pacha et prenez rendez-vous en quelques clics.",
    ctaLabel: "Je donne maintenant",
  },
  impact: {
    sectionLabel: "Campagne permanente de sensibilisation",
    title: "Notre Impact",
    description:
      "Un don régulier soutient directement les besoins transfusionnels des établissements hospitaliers et des urgences vitales.",
    stats: [
      { label: "Donneurs mobilisés par jour", value: "135+" },
      { label: "Prise en charge et suivi coordonnés", value: "24h" },
      { label: "Procédure encadrée et sécurisée", value: "100%" },
    ],
  },
  eligibilityPreview: {
    sectionLabel: "Éligibilité",
    title: "Suis-je éligible au don ?",
    description:
      "Vérifiez votre éligibilité avant de prendre rendez-vous. En cas de doute, nos professionnels de santé sont là pour vous conseiller.",
    items: [
      {
        title: "Âge entre 18 et 65 ans",
        description: "Avoir l’âge requis pour donner dans de bonnes conditions.",
      },
      {
        title: "Poids minimum 50 kg",
        description: "Assurer un don sûr et compatible avec votre profil.",
      },
      {
        title: "Bonne santé générale",
        description: "Ne pas présenter de symptôme ou de contre-indication immédiate.",
      },
      {
        title: "Ne pas être à jeun",
        description: "Manger et s’hydrater avant de se présenter au centre.",
      },
    ],
  },
  ctaBanner: {
    title: "Réservez votre rendez-vous en quelques clics",
    description:
      "Lancez votre demande de rendez-vous et rejoignez une communauté de donneurs mobilisée pour les patients qui ont besoin d'une transfusion.",
    ctaLabel: "Prendre rendez-vous",
  },
  process: {
    sectionLabel: "Parcours de don",
    title: "Comment ça se passe ?",
    description:
      "Le parcours de don reste simple, encadré et rassurant à chaque étape.",
    items: [
      {
        title: "Avant le don",
        description: "Vérification de l’éligibilité, accueil et orientation médicale.",
      },
      {
        title: "Pendant le don",
        description: "Prélèvement sécurisé et accompagnement tout au long du geste.",
      },
      {
        title: "Après le don",
        description: "Temps de repos, collation et recommandations de récupération.",
      },
    ],
  },
  support: {
    label: "Vous avez encore une question ?",
    phone: "+213 560 038 317",
    email: "cts.chu.mustapha@gmail.com",
  },
};

function mapHomeContent(
  payload: HomeContentApiResponse,
  campaign?: CampaignItem | null,
): HomePageContent {
  return {
    hero: {
      campaignLabel:
        campaign?.title ??
        campaign?.badgeLabel ??
        payload.data.hero?.eyebrow ??
        homeFallbackContent.hero.campaignLabel,
      title: payload.data.hero?.title ?? homeFallbackContent.hero.title,
      description:
        payload.data.hero?.description ?? homeFallbackContent.hero.description,
      ctaLabel:
        payload.data.hero?.primaryCtaLabel ?? homeFallbackContent.hero.ctaLabel,
    },
    impact: {
      sectionLabel:
        payload.data.impact?.sectionLabel ?? homeFallbackContent.impact.sectionLabel,
      title: payload.data.impact?.title ?? homeFallbackContent.impact.title,
      description:
        payload.data.impact?.description ?? homeFallbackContent.impact.description,
      stats:
        payload.data.impact?.stats
          ?.filter(
            (item): item is { label: string; value: string } =>
              Boolean(item?.label) && Boolean(item?.value),
          ) ?? homeFallbackContent.impact.stats,
    },
    eligibilityPreview: {
      sectionLabel:
        payload.data.eligibilityPreview?.sectionLabel ??
        homeFallbackContent.eligibilityPreview.sectionLabel,
      title:
        payload.data.eligibilityPreview?.title ??
        homeFallbackContent.eligibilityPreview.title,
      description:
        payload.data.eligibilityPreview?.description ??
        homeFallbackContent.eligibilityPreview.description,
      items:
        payload.data.eligibilityPreview?.items
          ?.filter(
            (item): item is { title: string; description: string } =>
              Boolean(item?.title) && Boolean(item?.description),
          ) ?? homeFallbackContent.eligibilityPreview.items,
    },
    ctaBanner: {
      title: payload.data.ctaBanner?.title ?? homeFallbackContent.ctaBanner.title,
      description:
        payload.data.ctaBanner?.description ??
        homeFallbackContent.ctaBanner.description,
      ctaLabel:
        payload.data.ctaBanner?.ctaLabel ?? homeFallbackContent.ctaBanner.ctaLabel,
    },
    process: {
      sectionLabel:
        payload.data.process?.sectionLabel ?? homeFallbackContent.process.sectionLabel,
      title: payload.data.process?.title ?? homeFallbackContent.process.title,
      description:
        payload.data.process?.description ?? homeFallbackContent.process.description,
      items:
        payload.data.process?.items
          ?.filter(
            (item): item is { title: string; description: string } =>
              Boolean(item?.title) && Boolean(item?.description),
          ) ?? homeFallbackContent.process.items,
    },
    support: {
      label:
        payload.data.support?.label ?? homeFallbackContent.support.label,
      phone:
        payload.data.support?.phone ??
        payload.data.footer?.phone ??
        homeFallbackContent.support.phone,
      email:
        payload.data.footer?.email ?? homeFallbackContent.support.email,
    },
  };
}

export async function getHomeContent(
  locale: "fr" | "ar" = "fr",
  campaign?: CampaignItem | null,
): Promise<HomePageContent> {
  const payload = await apiRequest<HomeContentApiResponse>(
    `/api/public/home-content?locale=${locale}`,
  );

  return mapHomeContent(payload, campaign);
}
