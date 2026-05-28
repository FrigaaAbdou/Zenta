export const SUPPORTED_LOCALES = ["fr", "ar"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
