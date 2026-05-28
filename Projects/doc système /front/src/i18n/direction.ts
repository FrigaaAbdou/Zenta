export type AppLocale = "fr" | "ar";
export type AppDirection = "ltr" | "rtl";

export function getDirectionFromLocale(locale: AppLocale): AppDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isRtlLocale(locale: AppLocale) {
  return getDirectionFromLocale(locale) === "rtl";
}
