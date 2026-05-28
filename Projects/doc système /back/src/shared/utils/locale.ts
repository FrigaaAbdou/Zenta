import { SUPPORTED_LOCALES, type SupportedLocale } from "../constants/locales.js";

export function resolveLocale(value: unknown): SupportedLocale {
  if (typeof value === "string" && SUPPORTED_LOCALES.includes(value as SupportedLocale)) {
    return value as SupportedLocale;
  }

  return "fr";
}
