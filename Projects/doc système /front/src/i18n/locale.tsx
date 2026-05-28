import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getDirectionFromLocale, type AppDirection, type AppLocale } from "./direction";

const LOCALE_STORAGE_KEY = "cts-app-locale";

type LocaleContextValue = {
  locale: AppLocale;
  direction: AppDirection;
  setLocale: (locale: AppLocale) => void;
};

const defaultLocaleContext: LocaleContextValue = {
  locale: "fr",
  direction: "ltr",
  setLocale: () => undefined,
};

const LocaleContext = createContext<LocaleContextValue>(defaultLocaleContext);

function getInitialLocale(): AppLocale {
  if (typeof window === "undefined") {
    return "fr";
  }

  const storage = window.localStorage;
  const storedLocale =
    storage && typeof storage.getItem === "function"
      ? storage.getItem(LOCALE_STORAGE_KEY)
      : null;

  return storedLocale === "ar" ? "ar" : "fr";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(getInitialLocale);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storage = window.localStorage;

      if (storage && typeof storage.setItem === "function") {
        storage.setItem(LOCALE_STORAGE_KEY, locale);
      }
    }

    document.documentElement.lang = locale;
    document.documentElement.dir = getDirectionFromLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      direction: getDirectionFromLocale(locale),
      setLocale,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
